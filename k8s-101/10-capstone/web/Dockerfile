# ---- build stage: compile the React app ----
FROM node:20-alpine AS build
WORKDIR /app

# Cache npm install based on manifests only
COPY package.json ./
RUN npm install --no-audit --no-fund

COPY vite.config.js ./
COPY index.html ./
COPY src ./src

RUN npm run build
# Output is in /app/dist

# ---- runtime stage: nginx serves the static bundle ----
FROM nginx:1.27-alpine AS runtime

# Replace nginx's default server config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static bundle
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine's default CMD keeps nginx in the foreground correctly.
