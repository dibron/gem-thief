import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function HomeScreen() {
    const { setPlayerName, setRoomCode, setIsHost, connectWebSocket } = useGame();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [loading, setLoading] = useState(false);

    const doJoin = (roomId, nameVal, host) => {
        setPlayerName(nameVal); setRoomCode(roomId); setIsHost(host);
        connectWebSocket((ws) => {
            ws.send(JSON.stringify({ action: "JOIN", roomId, name: nameVal }));
        });
    };

    const handleCreate = async () => {
        if (!name.trim()) return alert("Enter your codename!");
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL ? `https://${import.meta.env.VITE_API_URL}` : '';
            const res = await fetch(`${apiBase}/api/room/create`, { method: 'POST' });
            doJoin(await res.text(), name.trim(), true);
        } catch { alert("Cannot reach the server."); setLoading(false); }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Enter your codename!");
        if (code.trim().length < 4) return alert("Enter a valid 4-letter vault code!");
        setLoading(true);
        doJoin(code.toUpperCase(), name.trim(), false);
    };

    return (
        <div style={s.page}>
            <div style={s.icon}>&#x1F3E6;</div>
            <h1 style={s.title}>THE VAULT</h1>
            <p style={s.tagline}>One conman among the guards. One diamond. One chance.</p>

            <div style={s.card}>
                <label style={s.label}>CODENAME</label>
                <input type="text" placeholder="Agent name..." value={name}
                    onChange={e => setName(e.target.value)} disabled={loading}
                    style={s.input} maxLength={16} autoFocus />

                {!joining ? (
                    <div style={s.col}>
                        <button onClick={handleCreate} disabled={loading} style={s.btnGold}>
                            {loading ? 'Connecting...' : '\u{1F512} Open New Vault'}
                        </button>
                        <button onClick={() => setJoining(true)} disabled={loading} style={s.btnOutline}>
                            Join Existing Vault
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleJoin} style={s.col}>
                        <label style={s.label}>VAULT CODE</label>
                        <input type="text" placeholder="4-letter code" value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            maxLength={4} style={s.input} disabled={loading} />
                        <button type="submit" disabled={loading} style={s.btnGold}>
                            {loading ? 'Connecting...' : '\u{1F510} Breach Vault'}
                        </button>
                        <button type="button" onClick={() => setJoining(false)} style={s.btnGhost}>Back</button>
                    </form>
                )}
            </div>

            <p style={s.footer}>5-8 players &bull; ~5 min per round</p>
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #080b14 0%, #0d1117 50%, #131820 100%)' },
    icon: { fontSize: '3.5rem', marginBottom: '4px' },
    title: { fontSize: '2.6rem', fontWeight: 900, letterSpacing: '6px', background: 'linear-gradient(135deg, #eab308, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 6px' },
    tagline: { color: '#6b7280', fontSize: '0.95rem', marginBottom: '32px', textAlign: 'center' },
    card: { width: '100%', maxWidth: '380px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '16px', padding: '28px' },
    label: { display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#6b7280', marginBottom: '6px' },
    input: { width: '100%', padding: '14px 16px', fontSize: '1rem', borderRadius: '10px', border: '2px solid rgba(234,179,8,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fef3c7', outline: 'none', marginBottom: '14px', boxSizing: 'border-box', fontFamily: 'monospace' },
    col: { display: 'flex', flexDirection: 'column', gap: '10px' },
    btnGold: { padding: '15px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #b45309, #d97706, #eab308)', color: '#000', boxShadow: '0 4px 16px rgba(234,179,8,0.3)' },
    btnOutline: { padding: '14px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px', border: '2px solid rgba(234,179,8,0.3)', background: 'transparent', color: '#eab308' },
    btnGhost: { padding: '10px', fontSize: '0.9rem', background: 'transparent', border: 'none', color: '#6b7280', textDecoration: 'underline' },
    footer: { color: '#374151', fontSize: '0.8rem', marginTop: '24px' },
};
