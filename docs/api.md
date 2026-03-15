# TeamPulse API Documentation

Base URL: `http://localhost:3001`

## Authentication

All `/api/*` routes require an `Authorization` header:

```
Authorization: Bearer <API_KEY>
```

Default development key: `tp_dev_secret_key_change_me`

## Endpoints

### Health Check

#### `GET /health`

No authentication required.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 123
}
```

---

### Teams

#### `GET /api/teams`

List all teams.

**Response:** `Team[]`

#### `GET /api/teams/:id`

Get a team by ID.

**Response:** `Team`

#### `POST /api/teams`

Create a new team.

**Request Body:**
```json
{
  "name": "Engineering",
  "slug": "engineering",
  "lead": "Alice Chen",
  "members": 8
}
```

**Response:** `201 Created` with `Team`

#### `PUT /api/teams/:id`

Update an existing team.

**Request Body:** Partial `Team` fields

**Response:** `Team`

#### `DELETE /api/teams/:id`

Delete a team.

**Response:** `204 No Content`

---

### Standups

#### `GET /api/standups`

List standups. Supports query filters:
- `?teamId=<id>` — Filter by team
- `?date=YYYY-MM-DD` — Filter by date

**Response:** `Standup[]`

#### `GET /api/standups/:id`

Get a standup by ID.

**Response:** `Standup`

#### `POST /api/standups`

Submit a new standup.

**Request Body:**
```json
{
  "teamId": "uuid",
  "author": "Alice Chen",
  "date": "2024-01-15",
  "yesterday": "Worked on API refactoring",
  "today": "Continue with tests",
  "blockers": "",
  "mood": 4
}
```

**Response:** `201 Created` with `Standup`

#### `PUT /api/standups/:id`

Update a standup.

**Request Body:** Partial `Standup` fields

**Response:** `Standup`

#### `DELETE /api/standups/:id`

Delete a standup.

**Response:** `204 No Content`

---

### Metrics

#### `GET /api/metrics`

Get health metrics for all teams.

**Response:** `TeamMetric[]`

#### `GET /api/metrics/:teamId`

Get health metrics for a single team.

**Response:** `TeamMetric`

#### `GET /api/metrics/:teamId/history`

Get 30-day mood trend for a team.

**Response:**
```json
[
  { "date": "2024-01-01", "avgMood": 3.5, "count": 4 },
  { "date": "2024-01-02", "avgMood": 4.0, "count": 3 }
]
```

---

## Data Models

### Team

| Field     | Type   | Description          |
|-----------|--------|----------------------|
| id        | string | UUID                 |
| name      | string | Team name            |
| slug      | string | URL-friendly name    |
| lead      | string | Team lead name       |
| members   | number | Member count         |
| createdAt | string | ISO 8601 timestamp   |
| updatedAt | string | ISO 8601 timestamp   |

### Standup

| Field     | Type   | Description              |
|-----------|--------|--------------------------|
| id        | string | UUID                     |
| teamId    | string | Associated team ID       |
| author    | string | Person who submitted     |
| date      | string | Standup date (YYYY-MM-DD)|
| yesterday | string | What was done yesterday  |
| today     | string | Plan for today           |
| blockers  | string | Current blockers         |
| mood      | number | 1-5 mood rating          |
| createdAt | string | ISO 8601 timestamp       |

### TeamMetric

| Field        | Type   | Description                    |
|--------------|--------|--------------------------------|
| teamId       | string | Team ID                        |
| teamName     | string | Team name                      |
| avgMood      | number | Average mood (last 2 weeks)    |
| standupRate  | number | Standup completion % (0-100)   |
| blockerCount | number | Number of reported blockers    |
| trend        | string | "up", "down", or "stable"      |
