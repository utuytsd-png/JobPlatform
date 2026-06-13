FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY backend/gradlew gradlew
COPY backend/gradle gradle
COPY backend/build.gradle.kts build.gradle.kts
COPY backend/settings.gradle.kts settings.gradle.kts
COPY backend/src src
RUN chmod +x gradlew && ./gradlew bootJar --no-daemon


FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
