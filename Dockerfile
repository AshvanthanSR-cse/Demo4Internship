FROM node:20
LABEL version=1.0
LABEL author="Ashvanthan"
LABEL project="Demo4-app"

WORKDIR /demo4app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY frontend/ ./frontend
EXPOSE 5000
CMD ["node", "server.js"]


