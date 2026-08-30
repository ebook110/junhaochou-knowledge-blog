FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
ARG BUILD_REVISION=local
LABEL org.opencontainers.image.title="JunhaoChou Knowledge Blog" \
      org.opencontainers.image.revision="${BUILD_REVISION}"
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O - http://127.0.0.1/healthz/ | grep -q "healthy" || exit 1
