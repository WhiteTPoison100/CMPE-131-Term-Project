# Tournament Management System (Backend)

Spring Boot **REST** API for local CLI testing (curl, HTTPie, Postman). Roles: **TO** (Tournament Organizer) and **VIEWER**. Authentication is **JWT** (Bearer token).

## Prerequisites

- **JDK 17**
- **Maven 3.9+**
- **MySQL 8.x** running locally
- Create database (optional — JDBC URL can create it): `tournament_db`

## MySQL setup

1. Start MySQL.
2. Create a user/password or use `root` as in `application.yml`.
3. Update `src/main/resources/application.yml` if your credentials differ:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tournament_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: root
    password: root
```

**Schema:** JPA `ddl-auto: update` creates/updates tables on startup.

## Run the application

```bash
mvn spring-boot:run
```

Base URL: `http://localhost:8080`

## Seeded users (startup)

| Username   | Password   | Role   |
|-----------|------------|--------|
| organizer | organizer123 | TO (Tournament Organizer) |
| viewer    | viewer123      | VIEWER |

## Assumptions (implementation)

1. **Bracket size:** Double-elimination generation supports **2, 4, or 8** participants only. Count must be a **power of 2** (no byes in this version).
2. **No bracket reset:** One grand-final match; no automatic “bracket reset” if the losers-bracket player wins the GF.
3. **Scores:** Ties are rejected; you must pick a winner (`score1 != score2`).
4. **Participants after bracket:** Once a bracket exists, participants cannot be added or removed (prevents inconsistent graphs).
5. **JWT:** Secret is in `application.yml` — change it for anything beyond local class demos.

---

## REST API overview

| Method | Path | Role |
|--------|------|------|
| POST | `/api/auth/login` | Public |
| GET | `/api/tournaments` | JWT (TO or VIEWER) |
| GET | `/api/tournaments/{id}` | JWT |
| POST | `/api/tournaments` | TO |
| PUT | `/api/tournaments/{id}` | TO |
| DELETE | `/api/tournaments/{id}` | TO |
| GET | `/api/tournaments/{tournamentId}/participants` | JWT |
| POST | `/api/tournaments/{tournamentId}/participants` | TO |
| DELETE | `/api/tournaments/{tournamentId}/participants/{participantId}` | TO |
| GET | `/api/tournaments/{tournamentId}/bracket` | JWT |
| POST | `/api/tournaments/{tournamentId}/bracket/generate` | TO |
| GET | `/api/tournaments/{tournamentId}/matches` | JWT |
| GET | `/api/matches/{matchId}` | JWT |
| POST | `/api/matches/{matchId}/score` | TO |

---

## Example JSON

### Login (request)

```json
{
  "username": "organizer",
  "password": "organizer123"
}
```

### Login (response)

```json
{
  "token": "<JWT>",
  "username": "organizer",
  "role": "TO"
}
```

Use header: `Authorization: Bearer <JWT>`

### Create tournament (request)

```json
{
  "name": "Spring 2026 LAN",
  "gameTitle": "Rocket League",
  "description": "Campus double-elimination demo.",
  "format": "DOUBLE_ELIMINATION",
  "maxParticipants": 8,
  "status": "UPCOMING"
}
```

### Create tournament (response)

```json
{
  "id": 1,
  "name": "Spring 2026 LAN",
  "gameTitle": "Rocket League",
  "description": "Campus double-elimination demo.",
  "format": "DOUBLE_ELIMINATION",
  "maxParticipants": 8,
  "status": "UPCOMING",
  "createdByUsername": "organizer",
  "createdAt": "2026-04-05T12:00:00Z"
}
```

### Add participant (request)

```json
{
  "gamerTag": "TeamAlpha",
  "email": "alpha@example.com",
  "seedNumber": 1
}
```

### Submit score (request)

```json
{
  "score1": 3,
  "score2": 1
}
```

### Error (example)

```json
{
  "error": "Tournament not found: 99"
}
```

---

## ER-style model (tables)

- **users** — `id`, `username`, `password` (BCrypt), `role` (`TO` | `VIEWER`).
- **tournaments** — `id`, `name`, `game_title`, `description`, `format`, `max_participants`, `status`, `created_by_user_id` → users, `created_at`.
- **participants** — `id`, `gamer_tag`, `email`, `seed_number`, `tournament_id` → tournaments.
- **brackets** — `id`, `tournament_id` (unique), `created_at` — one bracket row per tournament.
- **matches** — `id`, `round_number`, `bracket_type` (`WINNERS` | `LOSERS` | `GRAND_FINAL`), `player1_id` / `player2_id` → participants, `score1` / `score2`, `winner_id`, `loser_id`, `status`, `next_match_winner_id` / `next_match_loser_id` (self-FK), `winner_goes_to_slot` / `loser_goes_to_slot` (1 or 2), `tournament_id`, `bracket_id`.

Relationships: one tournament has many participants and many matches; one bracket belongs to one tournament; matches reference the next match for winner/loser paths.

---

## curl walkthrough (4 players)

Set variables (bash or Git Bash on Windows):

```bash
export API=http://localhost:8080
export TOKEN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"organizer","password":"organizer123"}' | jq -r .token)
```

**Windows PowerShell** (no `jq`):

```powershell
$API = "http://localhost:8080"
$r = Invoke-RestMethod -Method POST -Uri "$API/api/auth/login" `
  -ContentType "application/json" `
  -Body '{"username":"organizer","password":"organizer123"}'
$TOKEN = $r.token
$H = @{ Authorization = "Bearer $TOKEN"; "Content-Type" = "application/json" }
```

### 1) Login

```bash
curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"organizer","password":"organizer123"}'
```

### 2) Create tournament

```bash
curl -s -X POST "$API/api/tournaments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Cup","gameTitle":"Chess","description":"4-player double elim","format":"DOUBLE_ELIMINATION","maxParticipants":4,"status":"UPCOMING"}'
```

Save `id` as `TID` (e.g. `1`).

### 3) List tournaments

```bash
curl -s "$API/api/tournaments" -H "Authorization: Bearer $TOKEN"
```

### 4) Add four participants

```bash
TID=1
for body in '{"gamerTag":"A","seedNumber":1}' '{"gamerTag":"B","seedNumber":2}' '{"gamerTag":"C","seedNumber":3}' '{"gamerTag":"D","seedNumber":4}'; do
  curl -s -X POST "$API/api/tournaments/$TID/participants" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$body"
done
```

### 5) Generate bracket

```bash
curl -s -X POST "$API/api/tournaments/$TID/bracket/generate" -H "Authorization: Bearer $TOKEN"
```

### 6) List matches

```bash
curl -s "$API/api/tournaments/$TID/matches" -H "Authorization: Bearer $TOKEN"
```

### 7) Submit scores (repeat for each `READY` match)

Pick `matchId` values from the list. Example:

```bash
MID=1
curl -s -X POST "$API/api/matches/$MID/score" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"score1":1,"score2":0}'
```

Continue until the **grand final** is completed — the tournament status becomes `COMPLETED`.

### Viewer login

```bash
curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"viewer","password":"viewer123"}'
```

Use that token for GETs; organizer POSTs (create tournament, score, etc.) should return **403** for the viewer.

---

## Project layout

- `controller` — REST endpoints  
- `service` — business rules, bracket generation, scoring  
- `repository` — Spring Data JPA  
- `entity` — JPA models  
- `dto` — request/response payloads  
- `security` — JWT + filter  
- `config` — Security, seed data  
- `exception` — global error handling  
- `util` — double-elimination factory  

---

## License / course use

Built for a **Software Engineering I** style project: keep changes small, read the comments in `DoubleEliminationBracketFactory` and `MatchService` for bracket and scoring flow.
