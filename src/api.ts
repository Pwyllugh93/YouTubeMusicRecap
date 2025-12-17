export type Recap = {
    totalPlays: number;
    dateRange: { from: string | null; to: string | null };
    topArtists: { name: string; count: number }[];
    bottomArtists: { name: string; count: number }[];
    topTracks: { name: string; count: number }[];
    bottomTracks: {name: string; count: number}[];
    monthly: { month: string; count: number }[];
    weekday: { day: string; count: number }[];
    hourly: { hour: number; count: number }[];
    mostActiveDay: { day: string; count: number } | null;
    firstPlay: { date: string; artist: string; title: string; titleUrl: string | null } | null;
    lastPlay: { date: string; artist: string; title: string; titleUrl: string | null } | null;
    };
    
    
    export async function fetchRecap(): Promise<Recap> {
    const res = await fetch("http://localhost:5174/api/recap");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
    }