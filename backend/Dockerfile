# Gunakan Node.js resmi sebagai base image
FROM node:20-alpine

# Atur working directory
WORKDIR /app/backend

# Copy package.json dan package-lock.json
COPY package*.json ./

# Instal dependensi
RUN npm install

# Copy seluruh kode aplikasi
COPY . .

# Perintah yang dijalankan saat container start
CMD ["npm", "start"]