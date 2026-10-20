FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY gradlew* .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN if [ -f gradlew ]; then chmod +x gradlew; fi
COPY src src
RUN if [ -f gradlew ]; then ./gradlew bootJar --no-daemon -x test; else echo "Build local jar"; fi

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
