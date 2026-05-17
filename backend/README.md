# Smart Pillow — Backend API

Backend REST API pentru proiectul **Smart Pillow**, o pernă inteligentă care monitorizează postura utilizatorului în timp real. Construit cu **Node.js + Express** și conectat la **MongoDB** prin Mongoose.

---

## Tech Stack

| Componentă | Tehnologie |
|---|---|
| Runtime | Node.js |
| Framework | Express.js ^4.21.0 |
| Bază de date | MongoDB (via Mongoose ^8.7.0) |
| Variabile de mediu | dotenv ^16.4.5 |
| CORS | cors ^2.8.5 |
| Dev server | nodemon ^3.1.7 |

---

## Structura proiectului

```
backend/
├── config/
│   └── database.js         # Conexiunea la MongoDB
├── models/
│   ├── ActivationCode.js   # Schema coduri de activare
│   └── SensorData.js       # Schema date senzori
├── routes/
│   ├── codes.js            # Generare & validare coduri
│   ├── dashboard.js        # Date agregat pentru dashboard
│   └── sensorData.js       # Salvare & citire date senzori
├── .env.example
├── package.json
├── .env
├── package-lock.json
└── server.js               # Entry point
```

---

## Instalare & Configurare

### 1. Clonează repo-ul și instalează dependențele

```bash
cd backend
npm install
```

### 2. Configurează variabilele de mediu

Copiază fișierul `.env.example` și completează-l:

```bash
cp .env.example .env
```

Conținut `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/smart-pillow
PORT=3000
```

### 3. Pornește serverul

```bash
# Producție
npm start

# Development (cu auto-restart)
npm run dev
```

Serverul rulează pe `http://localhost:3000`.

---

## Modele MongoDB

### `ActivationCode`

Fiecare pernă fizică are un cod unic de activare generat de server.

| Câmp | Tip | Detalii |
|---|---|---|
| `code` | String | Unic, indexat (ex: `SP-AB3X7K`) |
| `pillowSize` | String (enum) | `S`, `M`, `L`, `XL` |
| `isActivated` | Boolean | Default `false` |
| `activatedAt` | Date | Setat la prima validare |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

Codul este generat automat în formatul `SP-XXXXXX` folosind caracterele `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (fără caractere ambigue).

---

### `SensorData`

Stochează fiecare citire a senzorilor de presiune din pernă.

| Câmp | Tip | Detalii |
|---|---|---|
| `activationCode` | String | Referință la codul pernei, indexat |
| `sensors.fl` | Number | Senzor față-stânga |
| `sensors.fr` | Number | Senzor față-dreapta |
| `sensors.bl` | Number | Senzor spate-stânga |
| `sensors.br` | Number | Senzor spate-dreapta |
| `weight` | Number | Greutatea detectată (kg) |
| `posture` | String (enum) | `correct`, `attention`, `wrong` |
| `score` | Number | Scor postură 0–100 |
| `timestamp` | Date | Auto, indexat |

Index compus: `{ activationCode: 1, timestamp: -1 }` pentru interogări rapide per dispozitiv.

---

## Endpoint-uri API

### Coduri de Activare — `/api/codes`

#### `POST /api/codes/generate`
Generează un cod nou de activare pentru o pernă.

**Body:**
```json
{ "pillowSize": "M" }
```

**Răspuns (201):**
```json
{
  "success": true,
  "code": "SP-AB3X7K",
  "message": "Activation code generated for pillow size M"
}
```

---

#### `POST /api/codes/validate`
Validează un cod la prima utilizare și îl marchează ca activat.

**Body:**
```json
{ "code": "SP-AB3X7K" }
```

**Răspuns (200):**
```json
{
  "success": true,
  "code": "SP-AB3X7K",
  "pillowSize": "M",
  "message": "Code validated successfully. Welcome to your dashboard!"
}
```

---

### Dashboard — `/api/dashboard`

#### `GET /api/dashboard/:code`
Returnează statistici agregate pentru o pernă, pe baza codului de activare.

**Răspuns (200):**
```json
{
  "success": true,
  "data": {
    "currentPosture": { ... },
    "dailyChart": [ { "hour": "08:00", "correct": 80, "attention": 15, "wrong": 5 } ],
    "timeDistribution": { "correct": 70, "attention": 20, "wrong": 10 },
    "dailyScore": 75,
    "quickStats": {
      "totalTime": "2h 30m",
      "correctTime": "1h 45m",
      "attentionTime": "30m",
      "wrongTime": "15m"
    },
    "weeklyHistory": [ { "date": "2025-01-01", "day": "M", "score": 72 } ],
    "pillowSize": "M"
  }
}
```

---

### Comunicare Arduino — `/api/data`, `/api/status`, `/api/cmd`, `/api/command`

Aceste endpoint-uri gestionează comunicarea în timp real cu dispozitivul Arduino integrat în pernă.

#### `POST /api/data?code=SP-XXXXX`
Arduino trimite datele senzorilor periodic. Serverul actualizează starea în memorie și salvează în MongoDB.

**Body (trimis de Arduino):**
```json
{
  "posture": "good",
  "kg": 72.5,
  "F": 24.1, "S": 25.3, "L": 25.0, "R": 25.6,
  "buzzer": false,
  "calibrated": true,
  "weight_ref": 72.0,
  "state_duration": 120,
  "confidence": 0.95
}
```

Postura Arduino (`good` / `bad`) este mapată la schema internă (`correct` / `wrong`).

---

#### `GET /api/status/:code`
Returnează starea curentă a pernei (online dacă a trimis date în ultimele 45 de secunde).

**Răspuns:**
```json
{
  "online": true,
  "posture": "correct",
  "kg": 72.5,
  "buzzer": false,
  "calibrated": true,
  "history": [ ... ]
}
```

---

#### `POST /api/cmd/:code`
Trimite o comandă către Arduino (preluată la următorul poll).

**Comenzi disponibile:** `set_weight`, `calibrate`, `buzzer_on`, `buzzer_off`, `reset_calibration`

**Body:**
```json
{ "cmd": "set_weight", "value": 75 }
```

---

#### `GET /api/command?code=SP-XXXXX`
Arduino face poll pentru a prelua comanda pending.

---

#### `GET /api/health`
Health check simplu al serverului.

**Răspuns:**
```json
{ "status": "ok", "timestamp": "2025-01-01T12:00:00.000Z" }
```

---

## Algoritmul de Scor Postură

Scorul se calculează pe baza distribuției presiunii pe cei 4 senzori. Distribuția ideală este egală (25% fiecare).

```
deviation = |fl - 25| + |fr - 25| + |bl - 25| + |br - 25|
score = max(0, round(100 - (deviation / 150) * 100))
```

| Scor | Postură |
|---|---|
| ≥ 70 | `correct` |
| 40 – 69 | `attention` |
| < 40 | `wrong` |

---

## CORS

Serverul acceptă cereri de la următoarele origini (configurabile în `server.js`):

- `http://localhost:4200` (Angular dev)
- `http://localhost:4000`
- `http://192.168.0.102:4200`
- `http://192.168.0.106:4200`

---
