import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchRecap, type Recap } from "./api";
import "./App.css";

import { Cell } from "recharts";

const PALETTE = [
  "#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444",
  "#14b8a6", "#eab308", "#6366f1", "#ec4899", "#84cc16",
];

function EllipsisTick(props: any) {
  const { x, y, payload } = props;
  const full = String(payload?.value ?? "");
  const max = 22;
  const shown = full.length > max ? full.slice(0, max - 1) + "…" : full;

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{full}</title>
      <text x={0} y={0} dy={4} textAnchor="end">
        {shown}
      </text>
    </g>
  );
}



function formatDate(iso: string | null) {
if (!iso) return "—";
const d = new Date(iso);
return isNaN(d.getTime()) ? iso : d.toLocaleString();
}


function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="card-title">{props.title}</h2>
      <div>{props.children}</div>
    </section>
  );
}



export default function App() {
const [data, setData] = useState<Recap | null>(null);
const [error, setError] = useState<string | null>(null);


useEffect(() => {
fetchRecap()
.then(setData)
.catch((e) => setError(String(e)));
}, []);


const topArtists = useMemo(() => data?.topArtists ?? [], [data]);
const bottomArtists = useMemo(() => data?.bottomArtists ?? [], [data]);
const topTracks = useMemo(() => data?.topTracks ?? [], [data]);
const bottomTracks = useMemo(() => data?.bottomTracks ?? [], [data]);
const monthly = useMemo(() => data?.monthly ?? [], [data]);
const hourly = useMemo(() => data?.hourly ?? [], [data]);


if (error) {
return (
<main className="container">
<h1>YouTube Music Recap</h1>
<p className="error">{error}</p>
<p>
Make sure you have <code>data/music-history.json</code> at the project root
and that the backend is running.
</p>
</main>
);
}


if (!data) {
return (
<main className="container">
<h1>YouTube Music Recap</h1>
<p>Loading…</p>
</main>
);
}return (
  <main className="container">
  <header className="header">
  <h1>YouTube Music Recap</h1>
  <p className="muted">
  {data.totalPlays.toLocaleString()} plays • {formatDate(data.dateRange.from)} → {formatDate(data.dateRange.to)}
  </p>
  </header>
  
  
  <div className="grid">
  <Card title="Top Artists">
  <div className="chart">
<ResponsiveContainer width="100%" height={Math.max(320, topArtists.length * 28)}>

  <BarChart
    data={topArtists}
    layout="vertical"
    margin={{ left: 24, right: 24, top: 12, bottom: 12 }}
  >
    <XAxis type="number" />
    <YAxis
      type="category"
      dataKey="name"
      width={220}
      tick={<EllipsisTick />}
      interval={0}          // <- IMPORTANT: do not skip labels
    />
    <Tooltip />
    <Bar dataKey="count">
      {topArtists.map((_, i) => (
        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>
  </div>
  </Card>

   <Card title="Bottom Artists">
  <ol className="ranked">
    {bottomArtists.map((a) => (
      <li key={a.name} className="ranked-item">
        <span className="ranked-name">{a.name}</span>
      </li>
    ))}
  </ol>
</Card>
  
  
  <Card title="Plays by month">
  <div className="chart">
  <ResponsiveContainer width="100%" height={360}>
  <BarChart data={monthly} margin={{ left: 16, right: 16 }}>
  <XAxis dataKey="month" hide={false} tick={{ fontSize: 12 }} interval={0} angle={-35} textAnchor="end" height={70} />
  <YAxis />
  <Tooltip />
  <Bar dataKey="count" />
  </BarChart>
  </ResponsiveContainer>
  </div>
  </Card>
  
  </div>
  <Card title="Top 25 Songs">
  <div className="chart">
    <ResponsiveContainer
      width="100%"
      height={Math.max(320, topTracks.length * 28)}
    >
      <BarChart
        data={topTracks}
        layout="vertical"
        margin={{ left: 24, right: 24, top: 12, bottom: 12 }}
      >
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="name"
          width={260}
          tick={<EllipsisTick />}
          interval={0}
        />
        <Tooltip />
        <Bar dataKey="count">
          {topTracks.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</Card>

 <Card title="Bottom Songs">
  <ol className="ranked">
    {bottomTracks.map((t) => (
      <li key={t.name} className="ranked-item">
        <span className="ranked-name">{t.name}</span>
      </li>
    ))}
  </ol>
</Card>
  
  
  <footer className="footer muted">
  <p>All processing happens locally on your machine.</p>
  </footer>
  </main>
  );
  }