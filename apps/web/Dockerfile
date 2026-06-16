FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm install

FROM deps AS build
COPY apps/web apps/web
WORKDIR /app/apps/web
RUN npm run build

FROM node:22-alpine
WORKDIR /app/apps/web
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/.next .next
COPY --from=build /app/apps/web/package.json package.json
COPY --from=build /app/apps/web/public public
EXPOSE 3000
CMD ["npm", "run", "start"]
