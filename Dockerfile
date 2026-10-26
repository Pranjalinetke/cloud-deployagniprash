# Node.js 20 ka lightweight image download karega
FROM node:20-slim

# Working directory set karega
WORKDIR /usr/src/app

# Dependencies ki list copy karega
COPY package*.json ./

# Sabhi npm packages install karega
RUN npm install --production

# Tera poora bot code copy karega
COPY . .

# Bot run karne ki command
CMD ["npm", "start"]
