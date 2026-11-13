FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
RUN apk add --no-cache bash dos2unix
ENV GRADLE_OPTS="-Dorg.gradle.jvmargs='-Xmx512m -XX:+HeapDumpOnOutOfMemoryError'"
COPY gradlew* .
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN dos2unix gradlew && chmod +x gradlew
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && chown -R appuser:appgroup /app
COPY --from=builder --chown=appuser:appgroup /app/build/libs/*.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
