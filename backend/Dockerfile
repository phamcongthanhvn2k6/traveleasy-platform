FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
RUN apk add --no-cache bash dos2unix
COPY gradlew* .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN dos2unix gradlew && chmod +x gradlew
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
