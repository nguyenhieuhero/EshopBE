FROM node:18
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npx prisma generate
EXPOSE 3000

CMD ["npm","start"]