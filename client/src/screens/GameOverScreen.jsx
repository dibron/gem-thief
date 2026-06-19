import React from 'react';
import { useGame } from '../context/GameContext';

export default function GameOverScreen() {
    const { gameResult, send, roomCode, isHost, leaveGame, playerName } = useGame();

    if (!gameResult) return null;

    const { eliminated, thiefName, thiefCaught, gemStolen, sleepyheadsWin, votes } = gameResult;
    const iAmThief = playerName === thiefName;
    const iWon = (iAmThief && !sleepyheadsWin) || (!iAmThief && sleepyheadsWin);

    const handleRestart = () => send({ action: "RESTART", roomId: roomCode });

    return (
        <div style={s.page}>
            <div style={{ fontSize: '4rem', animation: 'pulse 2s infinite' }}>
                {iWon ? '\u{1F389}' : '\u{1F614}'}
            </div>

            <h1 style={{ ...s.title, color: iWon ? '#4ade80' : '#ef4444' }}>
                {iWon ? 'You Win!' : 'You Lose!'}
            </h1>

            <div style={s.resultCard}>
                <div style={s.resultRow}>
                    <span style={s.label}>Winner</span>
                    <span style={{ color: sleepyheadsWin ? '#60a5fa' : '#ef4444', fontWeight: 700 }}>
                        {sleepyheadsWin ? '\u{1F634} Sleepyheads' : '\u{1F977} The Thief'}
                    </span>
                </div>

                <div style={s.divider} />

                <div style={s.resultRow}>
                    <span style={s.label}>The thief was</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>{thiefName}</span>
                </div>

                <div style={s.resultRow}>
                    <span style={s.label}>Eliminated</span>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>{eliminated}</span>
                </div>

                <div style={s.resultRow}>
                    <span style={s.label}>Gem status</span>
                    <span style={{ color: gemStolen ? '#ef4444' : '#4ade80', fontWeight: 700 }}>
                        {gemStolen ? 'Stolen!' : 'Safe'}
                    </span>
                </div>

                <div style={s.resultRow}>
                    <span style={s.label}>Thief caught?</span>
                    <span style={{ color: thiefCaught ? '#4ade80' : '#ef4444', fontWeight: 700 }}>
                        {thiefCaught ? 'Yes!' : 'No!'}
                    </span>
                </div>

                <div style={s.divider} />

                <h4 style={s.votesTitle}>Votes</h4>
                {votes && Object.entries(votes).map(([voter, target]) => (
                    <div key={voter} style={s.voteRow}>
                        <span>{voter}</span>
                        <span style={{ color: '#9ca3af' }}>&rarr;</span>
                        <span style={{ color: target === thiefName ? '#4ade80' : '#fca5a5', fontWeight: 600 }}>{target}</span>
                    </div>
                ))}
            </div>

            <div style={s.btnRow}>
                {isHost && (
                    <button onClick={handleRestart} style={s.btnRestart}>
                        &#x1F504; Play Again
                    </button>
                )}
                <button onClick={leaveGame} style={s.btnLeave}>Leave</button>
            </div>

            {!isHost && <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '8px' }}>Waiting for host to restart...</p>}
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #0f0a1a 0%, #1a1025 100%)' },
    title: { fontSize: '2.2rem', fontWeight: 800, margin: '8px 0 20px' },
    resultCard: { width: '100%', maxWidth: '380px', padding: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' },
    resultRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '1rem' },
    label: { color: '#9ca3af' },
    divider: { height: '1px', background: 'rgba(255,255,255,0.08)', margin: '8px 0' },
    votesTitle: { color: '#e0d6f0', fontWeight: 700, margin: '8px 0', textAlign: 'center' },
    voteRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.95rem', color: '#e0d6f0' },
    btnRow: { display: 'flex', gap: '12px', marginTop: '24px' },
    btnRestart: { padding: '14px 28px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', color: 'white', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' },
    btnLeave: { padding: '14px 28px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px', border: '2px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#ef4444' },
};
