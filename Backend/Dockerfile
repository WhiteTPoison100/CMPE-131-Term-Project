# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /workspace

# Copy pom first so dependency layer is cached independently of source changes
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the fat JAR produced by spring-boot-maven-plugin
COPY --from=build /workspace/target/tournament-management-1.0.0.jar app.jar

# Firebase service-account JSON baked in as the default.
# Override the path at runtime via the FIREBASE_SERVICE_ACCOUNT_PATH env var,
# or set it to an empty string to disable Firebase auth entirely (demo-only mode).
COPY firebase-service-account.json firebase-service-account.json

EXPOSE 8080

# Always activate the 'prod' profile so application-prod.yml is loaded
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
