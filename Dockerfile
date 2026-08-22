# syntax=docker/dockerfile:1

# --- build ---------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Dependencies first, so every deploy that does not touch the lockfile reuses this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite bakes env values into the bundle at BUILD time, not at runtime. That is why this is a
# build argument and not an `environment:` entry in compose.yaml.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# An empty VITE_API_URL builds fine and then sends every API call to the page's own origin --
# the failure shows up only in the browser, on the deployed site. Fail here instead.
RUN test -n "$VITE_API_URL" || { echo "VITE_API_URL build arg is empty"; exit 1; }

# `npm run build` is build-only + type-check: a type error fails the deploy instead of shipping.
RUN npm run build

# --- serve ---------------------------------------------------------------
FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
