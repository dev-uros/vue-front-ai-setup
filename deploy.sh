#!/usr/bin/env bash
#
# One-command deploy of this SPA to the server that already runs Traefik and the API.
#
#   ./deploy.sh              build and release the configured branch (first run also clones)
#   ./deploy.sh --ref <sha>  release an exact commit or tag -- this is also how you roll back
#   ./deploy.sh --local      build the image and serve it on http://localhost:8080, no server
#   ./deploy.sh --status     what is running on the server, and which commit it is
#   ./deploy.sh --logs       tail the container's logs
#
# Configuration lives in `deploy.env` (copy `deploy.env.example`). The server holds no
# configuration of its own: this script writes /opt/web/.env from deploy.env on every run.

set -euo pipefail

cd "$(dirname "$0")"

CONFIG_FILE=${DEPLOY_CONFIG:-deploy.env}
case $CONFIG_FILE in /*) ;; *) CONFIG_FILE=./$CONFIG_FILE ;; esac
ASSUME_YES=0
COMMAND=deploy
REF_OVERRIDE=

# --- output ---------------------------------------------------------------

if [ -t 1 ]; then
  BOLD=$(printf '\033[1m'); RED=$(printf '\033[31m'); GREEN=$(printf '\033[32m')
  YELLOW=$(printf '\033[33m'); DIM=$(printf '\033[2m'); RESET=$(printf '\033[0m')
else
  BOLD=; RED=; GREEN=; YELLOW=; DIM=; RESET=
fi

step() { printf '\n%s==>%s %s%s%s\n' "$GREEN" "$RESET" "$BOLD" "$*" "$RESET"; }
info() { printf '    %s\n' "$*"; }
dim()  { printf '    %s%s%s\n' "$DIM" "$*" "$RESET"; }
warn() { printf '%s !! %s%s\n' "$YELLOW" "$*" "$RESET" >&2; }
die()  { printf '%s !! %s%s\n' "$RED" "$*" "$RESET" >&2; exit 1; }

usage() { sed -n '3,13p' "$0" | sed 's/^# \{0,1\}//'; }

# --- arguments ------------------------------------------------------------

while [ $# -gt 0 ]; do
  case $1 in
    --local)   COMMAND=local ;;
    --status)  COMMAND=status ;;
    --logs)    COMMAND=logs ;;
    --ref)     shift; [ $# -gt 0 ] || die '--ref needs a commit, tag or branch'; REF_OVERRIDE=$1 ;;
    -y|--yes)  ASSUME_YES=1 ;;
    -h|--help) usage; exit 0 ;;
    *)         die "unknown argument: $1 (try --help)" ;;
  esac
  shift
done

# --- configuration --------------------------------------------------------

[ -f "$CONFIG_FILE" ] || die "$CONFIG_FILE is missing. Start from the example:
       cp deploy.env.example $CONFIG_FILE"

# shellcheck disable=SC1090
set -a; . "$CONFIG_FILE"; set +a

: "${DEPLOY_PATH:=/opt/web}"
: "${GIT_BRANCH:=main}"
: "${GIT_REPO:=$(git config --get remote.origin.url 2>/dev/null || true)}"

REF=${REF_OVERRIDE:-$GIT_BRANCH}

require() {
  local name=$1
  [ -n "${!name:-}" ] || die "$name is not set in $CONFIG_FILE"
}

require APP_DOMAIN
require VITE_API_URL

case $VITE_API_URL in
  *localhost*|*127.0.0.1*) die "VITE_API_URL points at localhost ($VITE_API_URL). It is baked into
       the bundle at build time, so every visitor's browser would call their own machine." ;;
  https://*) ;;
  *) warn "VITE_API_URL is not https ($VITE_API_URL) -- the page is served over https, so the
       browser will block the calls as mixed content." ;;
esac

case $VITE_API_URL in
  */api|*/api/) ;;
  *) warn "VITE_API_URL does not end in /api. src/lib/axios.ts appends endpoints straight onto
       it, so it needs the full base including the /api path." ;;
esac

case $APP_DOMAIN in
  http*|*/) die "APP_DOMAIN must be a bare hostname -- no scheme, no trailing slash (app.tvoj-domen.rs)" ;;
esac

confirm() {
  [ "$ASSUME_YES" = 1 ] && return 0
  [ -t 0 ] || die "$1 (re-run with --yes to accept non-interactively)"
  printf '%s%s%s [y/N] ' "$YELLOW" "$1" "$RESET" >&2
  local answer; read -r answer
  case $answer in [yY]*) return 0 ;; *) die 'aborted' ;; esac
}

# --- local image check ----------------------------------------------------

if [ "$COMMAND" = local ]; then
  step "Building the image locally (VITE_API_URL=$VITE_API_URL)"
  docker build --build-arg "VITE_API_URL=$VITE_API_URL" -t web:local .

  step 'Serving on http://localhost:8080 -- Ctrl-C to stop'
  info 'Check all three, they are the three things that break on the server:'
  dim  '  1. the page loads'
  dim  "  2. open a deep route directly (/users/1) and refresh -- must not 404"
  dim  "  3. in the Network tab the API calls go to $VITE_API_URL"
  docker run --rm -p 8080:80 web:local
  exit 0
fi

# --- everything below needs the server ------------------------------------

require DEPLOY_HOST

remote() {
  # shellcheck disable=SC2029
  ssh -o ConnectTimeout=10 "$DEPLOY_HOST" "$@"
}

if [ "$COMMAND" = logs ]; then
  exec ssh -t "$DEPLOY_HOST" "cd $DEPLOY_PATH && docker compose logs -f --tail=200"
fi

if [ "$COMMAND" = status ]; then
  step "Status on $DEPLOY_HOST:$DEPLOY_PATH"
  remote "cd $DEPLOY_PATH && git --no-pager log -1 --format='commit  %h  %s  (%an, %ar)' && echo && docker compose ps"
  step "Answer from https://$APP_DOMAIN"
  curl -sS -o /dev/null -w '    HTTP %{http_code}   TLS %{ssl_verify_result} (0 = valid)   %{time_total}s\n' \
    "https://$APP_DOMAIN/" || warn 'the domain did not answer'
  exit 0
fi

# --- deploy ---------------------------------------------------------------

step 'Pre-flight'

[ -n "$GIT_REPO" ] || die 'GIT_REPO is not set and this checkout has no origin remote'

git rev-parse --git-dir >/dev/null 2>&1 || die 'not a git checkout'

if [ -z "$REF_OVERRIDE" ]; then
  # The server pulls from the remote, so anything still sitting on this machine is not going out.
  if [ -n "$(git status --porcelain)" ]; then
    warn 'the working tree has uncommitted changes -- they are NOT part of this deploy'
  fi

  git ls-remote --exit-code --heads origin "$GIT_BRANCH" >/dev/null 2>&1 \
    || die "origin has no branch $GIT_BRANCH"

  remote_head=$(git ls-remote origin "refs/heads/$GIT_BRANCH" | cut -f1)
  local_head=$(git rev-parse "$GIT_BRANCH" 2>/dev/null || true)

  if [ -n "$local_head" ] && [ "$local_head" != "$remote_head" ]; then
    if git merge-base --is-ancestor "$remote_head" "$local_head" 2>/dev/null; then
      warn "local $GIT_BRANCH is ahead of origin -- push first, or the server deploys the older commit"
      confirm 'Deploy the commit that is on origin anyway?'
    else
      warn "local $GIT_BRANCH and origin have diverged"
    fi
  fi
fi

info "host    $DEPLOY_HOST:$DEPLOY_PATH"
info "ref     $REF"
info "domain  https://$APP_DOMAIN"
info "api     $VITE_API_URL"

remote true || die "cannot ssh to $DEPLOY_HOST"

step 'Building and releasing on the server'

# Values cross the wire as shell-quoted assignments; the script itself is a quoted heredoc, so
# nothing in it is expanded here.
ssh -o ConnectTimeout=10 "$DEPLOY_HOST" \
  "DEPLOY_PATH=$(printf '%q' "$DEPLOY_PATH") \
   GIT_REPO=$(printf '%q' "$GIT_REPO") \
   GIT_REF=$(printf '%q' "$REF") \
   APP_DOMAIN=$(printf '%q' "$APP_DOMAIN") \
   VITE_API_URL=$(printf '%q' "$VITE_API_URL") \
   bash -s" <<'REMOTE'
set -euo pipefail

say() { printf '    %s\n' "$*"; }

command -v docker >/dev/null || { echo "docker is not installed on this server" >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "the docker compose plugin is missing" >&2; exit 1; }

# external: true means "find it", not "create it". If it is missing the backend deploy has not
# been done, and creating one here would give the frontend a network Traefik does not watch.
docker network inspect edge >/dev/null 2>&1 \
  || { echo "the 'edge' docker network does not exist -- ask whoever runs the backend" >&2; exit 1; }

if [ ! -d "$DEPLOY_PATH/.git" ]; then
  say "first deploy: cloning into $DEPLOY_PATH"
  if [ ! -d "$DEPLOY_PATH" ]; then
    # `sudo -n` so a password prompt fails fast instead of hanging on a stdin that is busy
    # feeding this script. Needed once, for the directory only; nothing after this wants root.
    mkdir -p "$DEPLOY_PATH" 2>/dev/null \
      || sudo -n mkdir -p "$DEPLOY_PATH" 2>/dev/null \
      || { echo "cannot create $DEPLOY_PATH. Run this once on the server, then deploy again:
       sudo mkdir -p $DEPLOY_PATH && sudo chown \$USER:\$USER $DEPLOY_PATH" >&2; exit 1; }
    [ -w "$DEPLOY_PATH" ] || sudo -n chown "$(id -u):$(id -g)" "$DEPLOY_PATH"
  fi
  [ -z "$(ls -A "$DEPLOY_PATH")" ] || { echo "$DEPLOY_PATH exists, is not empty and is not a git checkout" >&2; exit 1; }
  git clone --quiet "$GIT_REPO" "$DEPLOY_PATH"
fi

cd "$DEPLOY_PATH"

git fetch --quiet --prune --tags origin
target=$(git rev-parse --verify --quiet "origin/$GIT_REF^{commit}" \
  || git rev-parse --verify --quiet "$GIT_REF^{commit}") \
  || { echo "no such ref on the server: $GIT_REF" >&2; exit 1; }

# Detached on purpose: this checkout tracks a deployed commit, it is not a place anyone works.
git checkout --quiet --force --detach "$target"
git clean --quiet -fd   # leftovers from an older commit; ignored files such as .env survive

say "commit  $(git --no-pager log -1 --format='%h %s')"

# The server keeps no configuration of its own -- this is rewritten from deploy.env every run.
umask 077
cat > .env <<ENV
# Generated by deploy.sh. Edit deploy.env in the repo instead; this file is overwritten.
APP_DOMAIN=$APP_DOMAIN
VITE_API_URL=$VITE_API_URL
ENV

docker compose up -d --build
docker image prune -f >/dev/null
# The build cache grows with every build and nothing else ever trims it. 5 GB keeps the layers a
# rebuild reuses (node_modules, the base images). --reserved-space is Docker 28+; older daemons
# only know the former name of the same flag.
docker builder prune -f --reserved-space 5gb >/dev/null 2>&1 \
  || docker builder prune -f --keep-storage 5gb >/dev/null 2>&1 || true

container=$(docker compose ps -q web)
say "waiting for the container to report healthy"
for _ in $(seq 1 60); do
  status=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container")
  case $status in
    healthy|running) say "container: $status"; break ;;
    unhealthy|exited|dead) docker compose logs --tail=50 web; echo "container is $status" >&2; exit 1 ;;
  esac
  sleep 2
done
[ "${status:-}" = healthy ] || [ "${status:-}" = running ] \
  || { echo "container did not become healthy in time (last state: ${status:-unknown})" >&2; exit 1; }
REMOTE

step "Checking https://$APP_DOMAIN from here"

# On a first deploy Traefik still has to obtain the certificate, which takes 30-60 seconds.
code=000
for attempt in $(seq 1 30); do
  code=$(curl -sS -o /dev/null -m 10 -w '%{http_code}' "https://$APP_DOMAIN/healthz" 2>/dev/null || echo 000)
  case $code in
    200) break ;;
    404) dim "attempt $attempt: 404 -- Traefik has not picked up the router yet" ;;
    502) dim "attempt $attempt: 502 -- Traefik cannot reach the container yet" ;;
    000) dim "attempt $attempt: no answer yet (DNS, or the certificate is still being issued)" ;;
    *)   dim "attempt $attempt: HTTP $code" ;;
  esac
  sleep 4
done

if [ "$code" != 200 ]; then
  warn "https://$APP_DOMAIN answers HTTP $code, not 200"
  info 'The container is up, so the problem is between Traefik and it. In order of likelihood:'
  dim  '  404  a typo in a traefik label -- labels never report an error, they just make no route'
  dim  '  502  traefik.docker.network: edge missing, or the port in the label is not 80'
  dim  '  000  DNS for the domain does not point at this server, or the certificate is not issued yet'
  dim  "  logs: cd /opt/api && make edge-logs   (on $DEPLOY_HOST)"
  exit 1
fi

index_code=$(curl -sS -o /dev/null -m 10 -w '%{http_code}' "https://$APP_DOMAIN/" || echo 000)
deep_code=$(curl -sS -o /dev/null -m 10 -w '%{http_code}' "https://$APP_DOMAIN/auth/login" || echo 000)

step 'Deployed'
info "index        HTTP $index_code"
info "deep route   HTTP $deep_code   (/auth/login -- 200 means try_files works)"
info "url          https://$APP_DOMAIN"

[ "$deep_code" = 200 ] || warn 'a deep route does not return 200 -- check try_files in nginx.conf'
