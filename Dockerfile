# Stage 1
FROM node as build-step
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run buildProd

# Stage 2
FROM nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-step /app/dist/accountant-client /usr/share/nginx/html