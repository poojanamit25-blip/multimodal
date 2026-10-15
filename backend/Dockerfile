# ===================================================
# Multi-stage Dockerfile for KODEXIS Backend (Render & Cloud Deployments)
# ===================================================

# 1. Build Stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# 2. Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as non-root user for security
RUN addgroup -S kodexis && adduser -S kodexis -G kodexis
COPY --from=build /app/target/*.jar app.jar

# Ensure persistent data folder exists with correct permissions for H2
RUN mkdir -p /app/data && chown -R kodexis:kodexis /app
USER kodexis

# Expose default port (Render will override via $PORT env var)
EXPOSE 8080
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
