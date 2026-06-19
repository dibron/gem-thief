FROM node:20-slim AS frontend
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM eclipse-temurin:17-jdk AS backend
WORKDIR /app
COPY . .
COPY --from=frontend /app/client/dist/ src/main/resources/static/
RUN chmod +x mvnw && ./mvnw package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
