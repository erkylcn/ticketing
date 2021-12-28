FROM node:17.0.1-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --only=prod
COPY ./ ./

CMD ["npm","start"]