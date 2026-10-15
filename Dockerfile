# ===================================================
# KODEXIS Backend - Root Dockerfile for Render Deployments
# ===================================================

FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache Maven dependencies
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B || true

# Copy source and package JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S kodexis && adduser -S kodexis -G kodexis
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/data && chown -R kodexis:kodexis /app
USER kodexis

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
