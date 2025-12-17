import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

function normalizeTitle(title) {
  if (!title) return "(unknown track)";
  return title
    .replace(/^Watched\s+/i, "")
    .replace(/^Listened\s+to\s+/i, "")
    .trim();
}

function safeDate(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getArtist(entry) {
  const name = entry?.subtitles?.[0]?.name;
  if (!name) return "(unknown artist)";
  return name.replace(/\s*-\s*Topic$/i, "").trim();
}

function keyMonth(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function sortTop(map, limit = 20) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function sortBottom(map, limit = 20) {
  return [...map.entries()]
  .sort((a, b) => a[1]- b[1])
  .slice(0, limit)
  .map(([name, count]) => ({ name, count}));
}

function recapFromEntries(entries) {
  const playsByArtist = new Map();
  const playsByTrack = new Map();
  const playsByMonth = new Map();
  const playsByHour = Array.from({ length: 24 }, () => 0);
  const playsByWeekday = Array.from({ length: 7 }, () => 0); // 0=Sun
  const playsByDay = new Map(); // YYYY-MM-DD

  let minDate = null;
  let maxDate = null;

  let firstPlay = null;
  let lastPlay = null;

  let total = 0;

  for (const e of entries) {
    const d = safeDate(e?.time);
    if (!d) continue;

    // Keep only YouTube Music entries; remove this if you want everything
    if (e?.header && String(e.header).toLowerCase() !== "youtube music") continue;

    const artist = getArtist(e);
    const title = normalizeTitle(e?.title);
    const trackKey = `${artist} — ${title}`;

    total++;

    if (!minDate || d < minDate) minDate = d;
    if (!maxDate || d > maxDate) maxDate = d;

    if (!firstPlay || d < new Date(firstPlay.date)) {
      firstPlay = { date: d.toISOString(), artist, title, titleUrl: e?.titleUrl || null };
    }
    if (!lastPlay || d > new Date(lastPlay.date)) {
      lastPlay = { date: d.toISOString(), artist, title, titleUrl: e?.titleUrl || null };
    }

    playsByArtist.set(artist, (playsByArtist.get(artist) || 0) + 1);
    playsByTrack.set(trackKey, (playsByTrack.get(trackKey) || 0) + 1);

    const mKey = keyMonth(d);
    playsByMonth.set(mKey, (playsByMonth.get(mKey) || 0) + 1);

    const hour = d.getUTCHours();
    playsByHour[hour]++;

    const wd = d.getUTCDay();
    playsByWeekday[wd]++;

    const dayKey = d.toISOString().slice(0, 10);
    playsByDay.set(dayKey, (playsByDay.get(dayKey) || 0) + 1);
  }

  let mostActiveDay = null;
  for (const [day, count] of playsByDay.entries()) {
    if (!mostActiveDay || count > mostActiveDay.count) mostActiveDay = { day, count };
  }

  const monthly = [...playsByMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, count }));

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekday = playsByWeekday.map((count, i) => ({ day: weekdayNames[i], count }));
  const hourly = playsByHour.map((count, hour) => ({ hour, count }));


  return {
    totalPlays: total,
    dateRange: {
      from: minDate ? minDate.toISOString() : null,
      to: maxDate ? maxDate.toISOString() : null,
    },
    topArtists: sortTop(playsByArtist, 25),
    bottomArtists: sortBottom(playsByArtist, 25),
    topTracks: sortTop(playsByTrack, 25),
    bottomTracks: sortBottom(playsByTrack, 25),
    monthly,
    weekday,
    hourly,
    mostActiveDay,
    firstPlay,
    lastPlay,
  };
}

// IMPORTANT: app.get must be OUTSIDE recapFromEntries()
app.get("/api/recap", (req, res) => {
  try {
    const filePath = path.resolve(process.cwd(), "data", "music-history.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);

    const entries = Array.isArray(parsed) ? parsed : [parsed];
    const recap = recapFromEntries(entries);

    res.json(recap);
  } catch (err) {
    res.status(500).json({
      error: "Failed to load/parse data/music-history.json",
      details: String(err?.message || err),
    });
  }
});

const port = process.env.PORT || 5174;
app.listen(port, () => {
  console.log(`Recap API listening on http://localhost:${port}`);
});
