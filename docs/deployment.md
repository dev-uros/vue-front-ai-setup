# Deploy

SPA se na serveru servira kao statika iz malog nginx kontejnera. Ispred njega stoji Traefik koji
već radi na tom serveru (postavio ga je backend deploy) i koji rutira po domenu i radi HTTPS.

```
                    internet :443
                          │
                ┌─────────▼─────────┐
                │      Traefik      │   već postoji, ne diramo ga
                └──┬─────────────┬──┘
                   │             │
        app.tvoj-domen.rs   api.tvoj-domen.rs
        ┌──────────────┐    ┌──────────────┐
        │ nginx (dist) │    │   Laravel    │
        │  ovaj repo   │    │  drugi repo  │
        └──────────────┘    └──────────────┘
```

Ceo deploy je jedna komanda:

```sh
npm run deploy
```

Detalji infrastrukture su u [`docs/frontend-infra.md`](../../laravel-back-ai-setup/docs/frontend-infra.md)
u backend repou; ovde je ono što je specifično za ovaj projekat.

---

## Šta je u repou

| Fajl | Čemu služi |
| --- | --- |
| `Dockerfile` | dvofazni build: `node:22-alpine` radi `npm ci` + `npm run build`, `nginx:1.29-alpine` servira `dist/` |
| `nginx.conf` | SPA fallback (`try_files`), keširanje asseta, `/healthz` |
| `compose.yaml` | jedan servis `web`, bez portova, na `edge` mreži, sa Traefik labelama |
| `.dockerignore` | šta ne ide u build kontekst |
| `deploy.sh` | ceo deploy — provere, build na serveru, verifikacija |
| `deploy.env.example` | šablon za `deploy.env` (tvoja kopija, gitignorovana) |

Ništa od ovoga se ne edituje na serveru. Server drži samo klon repoa i `.env` koji mu `deploy.sh`
upiše na svakom deployu — jedini izvor istine za konfiguraciju je `deploy.env` na tvojoj mašini.

---

## Preduslovi (jednom, pre prvog deploya)

Traži od onoga ko drži server da potvrdi:

- [ ] **DNS** — `app.tvoj-domen.rs` A zapis pokazuje na IP servera
- [ ] **`edge` mreža postoji** — `docker network ls | grep edge` (pravi je backend deploy)
- [ ] **SSH pristup**, korisnik u `docker` grupi
- [ ] **Backend zna tvoj origin** — `FRONTEND_URL=https://app.tvoj-domen.rs`, tačno tako, bez kose
      crte na kraju, pa restart API-ja

Poslednja stavka je jedina koja traži koordinaciju: bez nje browser odbija svaki poziv sa CORS
greškom, iako je i frontend i backend gore.

Prvi deploy pravi `/opt/web` sam. Ako `sudo` na serveru traži lozinku, napravi ga ručno jednom —
skripta ne može da odgovori na prompt jer joj je stdin zauzet samom skriptom:

```sh
sudo mkdir -p /opt/web && sudo chown $USER:$USER /opt/web
```

Kod sebe:

```sh
cp deploy.env.example deploy.env
```

i popuni:

```ini
DEPLOY_HOST=deploy@server.tvoj-domen.rs   # bilo šta što `ssh <ovo>` prihvata
DEPLOY_PATH=/opt/web
APP_DOMAIN=app.tvoj-domen.rs              # go hostname: bez šeme, bez / na kraju
VITE_API_URL=https://api.tvoj-domen.rs/api
GIT_REPO=https://github.com/dev-uros/vue-front-ai-setup.git
GIT_BRANCH=main
```

Dve stvari koje se najčešće promaše:

- **`VITE_API_URL` mora da sadrži i `/api`.** `src/lib/axios.ts` je uzima kao `baseURL` i lepi
  putanje direktno na nju (`/auth/login`), bez ičega između.
- **`APP_DOMAIN` je samo hostname**, jer ulazi u Traefik labelu ``Host(`…`)``.

`deploy.env` je u `.gitignore` — nije tajna, ali je po okruženju.

---

## Deploy

```sh
npm run deploy
```

Ista komanda i za prvi put i za svaki sledeći. Šta radi, redom:

1. **Provere kod tebe** — da li `deploy.env` ima sve, da li `VITE_API_URL` slučajno pokazuje na
   `localhost` (to je greška koja se vidi tek u browseru, na produkciji), da li si zaboravio da
   `push`-uješ. Server povlači iz gita, pa ono što je ostalo na tvojoj mašini ne ide nigde.
2. **Na serveru** — `git clone` prvi put, posle `fetch` + checkout tačnog commita; upiše `.env`;
   `docker compose up -d --build`; `docker image prune -f`; build keš se skraćuje na 5 GB (inače
   raste sa svakim buildom); čeka da kontejner javi `healthy`.
3. **Verifikacija spolja** — poziva `https://app.tvoj-domen.rs/healthz` dok ne odgovori 200
   (prvi put Traefik vadi sertifikat, to traje 30-60 sekundi), pa još proveri da duboka ruta
   `/auth/login` vraća 200, a ne 404.

Ako bilo koji od tih koraka padne, skripta staje sa greškom i objašnjenjem — ne javlja uspeh.

Traje koliko i `npm run build` plus par sekundi. Nema migracija i nema stanja: jedino što može da
pukne je build. Pri recreate-u kontejnera postoji 2-3 sekunde u kojima Traefik vraća 404.

### Ostale komande

```sh
npm run deploy -- --local     # build image-a i serviranje na localhost:8080, bez servera
npm run deploy -- --status    # šta je gore, koji commit, i šta domen odgovara
npm run deploy -- --logs      # tail logova kontejnera
npm run deploy -- --ref <sha> # deploy tačnog commita ili taga — ovo je i rollback
npm run deploy -- --yes       # bez pitanja (za CI)
```

`--` je npm-ov razdelnik; direktno `./deploy.sh --status` radi isto.

### Provera lokalno, pre nego što išta pošalješ

```sh
npm run deploy -- --local
```

Build sa istim `VITE_API_URL` kao na produkciji, pa `http://localhost:8080`. Tri stvari:

- [ ] stranica se učitava
- [ ] otvoriš duboku rutu direktno (`/users/1`) i **refreshuješ** — mora 200, ne 404
- [ ] u Network tabu API pozivi idu na `https://api.tvoj-domen.rs/api`, ne na `localhost`

Treća je najčešća greška i znači da `VITE_API_URL` nije stigla do builda. Vite peče env vrednosti
u bundle u **build** vremenu — zato je to `ARG` u `Dockerfile`-u, a ne `environment:` u compose-u.
Menjanje `VITE_API_URL` traži nov build, ne restart.

### Rollback

```sh
npm run deploy -- --ref 819cc74
```

Server checkout-uje taj commit i rebuild-uje. Nema stanja koje bi trebalo vratiti unazad; kad je
gotovo, `npm run deploy` te vraća na vrh grane.

---

## Šta se gde odlučuje

**Nema tajni u `VITE_` promenljivama.** Sve što počinje sa `VITE_` završi u bundle-u koji svako
otvori u browseru i pročita. Adrese i feature flagovi — može. Ključevi i tokeni — nikad. Ovaj
projekat ima tačno jednu takvu promenljivu i to je adresa API-ja.

**Nema `ports:` u compose-u.** Objavljen port zaobilazi Traefik, a time i HTTPS i security
headere. Jedini ulaz je kroz proxy. `/healthz` je zato dostupan samo unutar kontejnera i kroz
domen.

**Ne dodajemo svoj Traefik i ne pravimo `edge` mrežu.** `external: true` znači "nađi je". Ako je
nema, backend deploy nije odrađen — `deploy.sh` to prijavi i stane.

**Kompresija je Traefikova** (`compress@file` u labelama), pa je nema u `nginx.conf`.
Security headeri isto (`security-headers@file`).

**`index.html` se ne kešira, assets se keširaju godinu dana.** Vite u ime svakog asseta ubacuje
hash, pa se sadržaj pod istim imenom nikad ne menja. `index.html` je jedini fajl koji se menja pod
istim imenom i zato ide sa `no-cache` — inače korisnik posle deploya dobije staru stranicu koja
traži assete kojih više nema.

**Type-check je deo image builda.** `npm run build` je `build-only` + `type-check`, pa greška u
tipovima obori deploy umesto da ode na produkciju.

---

## Rute koje backend očekuje

Emailovi koje backend šalje vode tačno na ove dve putanje na tvom domenu:

| Ruta | Šalje na |
| --- | --- |
| `/auth/activate-account?email=…&token=…` | `POST /api/auth/activate-account` |
| `/auth/reset-password?email=…&token=…` | `POST /api/auth/reset-password` |

Obe postoje u `src/features/auth/routes.ts` i ne smeju se preimenovati — linkovi koji su već u
nečijem inboxu ne mogu da se poprave. Rade zahvaljujući `try_files` fallback-u u `nginx.conf`:
na disku nema takvog fajla, nginx vraća `index.html`, router u browseru odlučuje dalje.

---

## Kad nešto ne radi

| Vidiš | Uzrok |
| --- | --- |
| 404 na tvom domenu | tipfeler u Traefik labeli — labele ne prijavljuju grešku, samo ne naprave rutu |
| 502 | fali `traefik.docker.network: edge`, kontejner nije na `edge` mreži, ili port u labeli nije 80 |
| refresh na dubljoj ruti → 404 | `try_files` u `nginx.conf` |
| CORS greška u konzoli | backendov `FRONTEND_URL` se ne poklapa sa origin-om, tačno, bez `/` na kraju |
| API pozivi idu na `localhost` | `VITE_API_URL` nije stigla u build — `deploy.sh` ovo hvata unapred |
| 404 na svaki API poziv, ali domen radi | `VITE_API_URL` bez `/api` na kraju |
| sertifikat nevažeći | DNS ne pokazuje na server, ili nije propagirao |
| stara stranica posle deploya | keširan `index.html` — vidi `location = /index.html` |
| `edge network does not exist` | backend deploy nije odrađen na tom serveru |
| build padne na `type-check` | prava greška u kodu; `npm run type-check` lokalno daje isto |

Dijagnostika:

```sh
npm run deploy -- --status          # commit, stanje kontejnera, odgovor domena
npm run deploy -- --logs            # nginx access/error logovi
ssh <server> "cd /opt/api && make edge-logs"   # Traefik — za 404 i 502
```

Logovi kontejnera se skupljaju automatski i vide se u Grafani (`https://logs.tvoj-domen.rs`) pod
`{service="web"}`.

Frontend greške nose `X-Request-Id` (`ApiError.requestId` iz `src/lib/axios.ts`) — backend loguje
pod istim id-jem, pa se sa njim nađe tačan zahtev.
