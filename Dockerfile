FROM node:20 AS build
WORKDIR /src
COPY package*.json ./
RUN npm pkg set scripts.prepare='true' && npm install
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm pkg set scripts.prepare='true' && npm ci --only=production
COPY --from=build /src/dist /app/dist
EXPOSE 3333
CMD [ "npm", "run", "prod" ]
