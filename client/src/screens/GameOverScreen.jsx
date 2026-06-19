import React from 'react';
import { useGame } from '../context/GameContext';

export default function GameOverScreen() {
    const { gameResult, send, roomCode, isHost, leaveGame, playerName, nightData } = useGame();
    if (!gameResult) return null;

    const { eliminated, conmanName, followers, conmanCaught, gemStolen, guardsWin, votes } = gameResult;
    const myRole = nightData.myRole;
    const iAmConman = playerName === conmanName;
    const iAmInsider = (followers || []).includes(playerName);
    const iWon = (guardsWin && !iAmConman && !iAmInsider) || (!guardsWin && (iAmConman || iAmInsider));

    const handleRestart = () => send({ action: "RESTART", roomId: roomCode });

    return (
        <div style={s.page}>
            <div style={{ fontSize: '4rem', animation: 'pulse 2s infinite' }}>
                {iWon ? '\u{1F3C6}' : '\u{1F6A8}'}
            </div>

            <h1 style={{ ...s.title, color: iWon ? '#4ade80' : '#ef4444' }}>
                {iWon ? 'Mission Accomplished' : 'Mission Failed'}
            </h1>
            <p style={s.subtitle}>
                {guardsWin ? 'The guards caught the conman!' : 'The conman got away with it!'}
            </p>

            <div style={s.resultCard}>
                <Row label="Winner" value={guardsWin ? '\u{1F6E1}\u{FE0F} Guards' : '\u{1F3AD} Conman Team'}
                    color={guardsWin ? '#3b82f6' : '#ef4444'} />
                <div style={s.divider} />
                <Row label="The Conman" value={conmanName} color="#ef4444" />
                <Row label="Insider(s)" value={(followers || []).join(', ') || 'none'} color="#f97316" />
                <Row label="Detained" value={eliminated} color="#eab308" />
                <Row label="Diamond" value={gemStolen ? 'Stolen' : 'Secure'} color={gemStolen ? '#ef4444' : '#4ade80'} />
                <Row label="Conman caught?" value={conmanCaught ? 'Yes' : 'No'} color={conmanCaught ? '#4ade80' : '#ef4444'} />

                <div style={s.divider} />
                <h4 style={s.votesTitle}>Votes</h4>
                {votes && Object.entries(votes).map(([voter, target]) => (
                    <div key={voter} style={s.voteRow}>
                        <span>{voter}</span>
                        <span style={{ color: '#4b5563' }}>&rarr;</span>
                        <span style={{ color: target === conmanName ? '#4ade80' : '#fca5a5', fontWeight: 600 }}>{target}</span>
                    </div>
                ))}
            </div>

            <div style={s.btnRow}>
                {isHost && <button onClick={handleRestart} style={s.btnRestart}>&#x1F504; New Heist</button>}
                <button onClick={leaveGame} style={s.btnLeave}>Leave</button>
            </div>
            {!isHost && <p style={{ color: '#4b5563', fontSize: '0.8rem', marginTop: '8px' }}>Waiting for lead guard to start new heist...</p>}
        </div>
    );
}

function Row({ label, value, color }) {
    return (
        <div style={s.row}>
            <span style={{ color: '#6b7280' }}>{label}</span>
            <span style={{ color, fontWeight: 700 }}>{value}</span>
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #080b14 0%, #0d1117 100%)' },
    title: { fontSize: '2rem', fontWeight: 800, margin: '8px 0 4px' },
    subtitle: { color: '#6b7280', fontSize: '0.95rem', marginBottom: '20px' },
    resultCard: { width: '100%', maxWidth: '400px', padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' },
    row: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.95rem' },
    divider: { height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' },
    votesTitle: { color: '#c8d6e5', fontWeight: 700, margin: '6px 0', textAlign: 'center', fontSize: '0.9rem' },
    voteRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '0.9rem', color: '#c8d6e5' },
    btnRow: { display: 'flex', gap: '12px', marginTop: '24px' },
    btnRestart: { padding: '14px 28px', fontSize: '1rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #b45309, #d97706)', color: '#000', boxShadow: '0 4px 14px rgba(234,179,8,0.3)' },
    btnLeave: { padding: '14px 28px', fontSize: '0.95rem', fontWeight: 600, borderRadius: '10px', border: '2px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444' },
};
