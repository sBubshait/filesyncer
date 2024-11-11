FROM node:20.17-alpine

WORKDIR /usr/src/app

COPY package*.json ./

COPY src/db/prisma* src/db/schema.prisma ./src/db/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
