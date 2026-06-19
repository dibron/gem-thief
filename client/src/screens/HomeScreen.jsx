import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function HomeScreen() {
    const { setPlayerName, setRoomCode, setIsHost, connectWebSocket } = useGame();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [loading, setLoading] = useState(false);

    const doJoin = (roomId, nameVal, host) => {
        setPlayerName(nameVal);
        setRoomCode(roomId);
        setIsHost(host);
        connectWebSocket((ws) => {
            ws.send(JSON.stringify({ action: "JOIN", roomId, name: nameVal }));
        });
    };

    const handleCreate = async () => {
        if (!name.trim()) return alert("Enter your name!");
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/room/create", { method: 'POST' });
            const roomId = await res.text();
            doJoin(roomId, name.trim(), true);
        } catch {
            alert("Could not connect to server.");
            setLoading(false);
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Enter your name!");
        if (!code.trim() || code.trim().length < 4) return alert("Enter a valid 4-letter code!");
        setLoading(true);
        doJoin(code.toUpperCase(), name.trim(), false);
    };

    return (
        <div style={s.page}>
            <div style={s.gem}>&#x1F48E;</div>
            <h1 style={s.title}>Gem Thief</h1>
            <p style={s.subtitle}>One thief. One gem. Trust nobody.</p>

            <div style={s.card}>
                <input
                    type="text" placeholder="Your name..." value={name}
                    onChange={e => setName(e.target.value)} disabled={loading}
                    style={s.input} maxLength={16} autoFocus
                />

                {!joining ? (
                    <div style={s.col}>
                        <button onClick={handleCreate} disabled={loading} style={s.btnPrimary}>
                            {loading ? '...' : 'Create Room'}
                        </button>
                        <button onClick={() => setJoining(true)} disabled={loading} style={s.btnSecondary}>
                            Join Room
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleJoin} style={s.col}>
                        <input
                            type="text" placeholder="Room code" value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            maxLength={4} style={s.input} disabled={loading}
                        />
                        <button type="submit" disabled={loading} style={s.btnPrimary}>
                            {loading ? '...' : 'Join'}
                        </button>
                        <button type="button" onClick={() => setJoining(false)} style={s.btnGhost}>Back</button>
                    </form>
                )}
            </div>
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(135deg, #0f0a1a 0%, #1a0e2e 100%)' },
    gem: { fontSize: '4rem', animation: 'pulse 2s infinite', marginBottom: '8px' },
    title: { fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #c084fc, #f0abfc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 4px' },
    subtitle: { color: '#9ca3af', fontSize: '1rem', marginBottom: '32px' },
    card: { width: '100%', maxWidth: '360px', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px' },
    input: { width: '100%', padding: '14px 16px', fontSize: '1rem', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#e0d6f0', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
    col: { display: 'flex', flexDirection: 'column', gap: '10px' },
    btnPrimary: { padding: '14px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', color: 'white', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' },
    btnSecondary: { padding: '14px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px', border: '2px solid rgba(139,92,246,0.4)', background: 'transparent', color: '#c084fc' },
    btnGhost: { padding: '10px', fontSize: '0.9rem', background: 'transparent', border: 'none', color: '#9ca3af', textDecoration: 'underline' },
};
