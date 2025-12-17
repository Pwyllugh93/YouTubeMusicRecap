# YouTube Music Recap (Local App)

A **local-first YouTube Music recap dashboard** built with **React + Node.js**.  
It analyzes your **Google Takeout YouTube Music watch history JSON** and generates
a visual recap similar to Spotify Wrapped — without uploading your data anywhere.

All processing happens **entirely on your machine**.

---

## Features

### Listening overview

- Total plays
- Date range (first → last play)

### Charts

- **Top Artists** (bar chart)
- **Top Songs** (bar chart)
- **Plays by Month** (bar chart)

### Lists

- **Bottom Artists** (least-played)
- **Bottom Songs** (least-played)

### Design

- Responsive dashboard layout
- Cards automatically align side-by-side on large screens
- Clean, modern UI
- Handles large JSON files efficiently

---

## Tech Stack

### Frontend

- React (Vite)
- TypeScript
- Recharts
- CSS Grid (responsive layout)

### Backend

- Node.js
- Express
- Reads JSON directly from disk (no browser memory issues)

---

## Project Structure

ytm-recap/
├─ data/
│ └─ music-history.json # your Google Takeout file
├─ server/
│ └─ index.js # Express backend
├─ src/
│ ├─ api.ts # API + types
│ ├─ App.tsx # dashboard UI
│ ├─ App.css # styling
│ └─ main.tsx
├─ index.css # global styles (important!)
├─ package.json
└─ README.md

---

## Getting Your Data

1. Go to **Google Takeout**
2. Select **YouTube and YouTube Music**
3. Export **watch history**
4. Locate the YouTube Music history JSON
5. Place it here:
   data/music-history.json

The file is usually an **array of objects**.

---

## Installation

### Requirements

- Node.js (18+ recommended)
- npm

### Install dependencies

```bash
npm install
```

### Running the App

Development mode (frontend + backend together)

```bash
npm run dev
```

This starts:

Frontend: http://localhost:5173

Backend API: http://localhost:5174/api/recap

### Important Setup Note (Vite default fix)

Make sure src/index.css does NOT restrict width.

Your index.css should contain:

#root {
width: 100%;
margin: 0;
padding: 0;
}

body {
margin: 0;
}

If this is missing, the dashboard will not expand to full width.

#### What the Backend computes (with a few redundancies)

From your history file, the backend derives:

- Total play count
- Date range
- Top artists
- Top songs
- Bottom artists
- Bottom songs
- Monthly listening counts
- Hourly and weekday distributions (optional extensions)

All aggregation is done server-side to handle large files efficiently.

#### Notes on Accuracy

YouTube Takeout does not include track durations.

“Plays” are inferred from watch history entries.

Bottom artists/songs typically represent items played only once.

#### License

MIT
