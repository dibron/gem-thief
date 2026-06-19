import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function VoteScreen() {
    const { players, playerName, send, roomCode, voteCount, nightData } = useGame();
    const [voted, setVoted] = useState(false);
    const [votedFor, setVotedFor] = useState(null);

    const handleVote = (targetName) => {
        if (voted) return;
        setVoted(true);
        setVotedFor(targetName);
        send({ action: "VOTE", roomId: roomCode, targetName });
    };

    const others = players.filter(p => p.name !== playerName);
    const roleColor = nightData.myRole === 'CONMAN' ? '#ef4444' : nightData.myRole === 'INSIDER' ? '#f97316' : '#3b82f6';
    const roleLabel = nightData.myRole === 'CONMAN' ? 'Conman' : nightData.myRole === 'INSIDER' ? 'Insider' : 'Guard';

    return (
        <div style={s.page}>
            <div style={{ fontSize: '2.5rem' }}>&#x2696;&#xFE0F;</div>
            <h1 style={s.title}>Interrogation</h1>
            <p style={s.sub}>The night shift is over. Who do you think breached the vault?</p>

            <div style={s.infoBox}>
                <p>Diamond: <strong style={{ color: nightData.gemStatus === 'SAFE' ? '#4ade80' : '#ef4444' }}>
                    {nightData.gemStatus === 'SAFE' ? 'SECURE' : 'STOLEN'}
                </strong></p>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>
                    You: <strong style={{ color: roleColor }}>{roleLabel}</strong> &bull; Shift {nightData.myDice}
                </p>
            </div>

            {!voted ? (
                <div style={s.voteArea}>
                    <h3 style={s.voteLabel}>Vote to detain:</h3>
                    {others.map(p => (
                        <button key={p.name} onClick={() => handleVote(p.name)} style={s.btnVote}>
                            &#x1F6E1;&#xFE0F; {p.name}
                        </button>
                    ))}
                </div>
            ) : (
                <div style={s.waitArea}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>&#x2705;</div>
                    <p style={{ color: '#c8d6e5', fontWeight: 600 }}>
                        You voted to detain <strong style={{ color: '#eab308' }}>{votedFor}</strong>
                    </p>
                    <div style={s.bar}>
                        <div style={{ ...s.barFill, width: `${(voteCount.count / voteCount.total) * 100}%` }} />
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{voteCount.count}/{voteCount.total} votes cast</p>
                </div>
            )}
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #0d1117 0%, #131820 100%)' },
    title: { fontSize: '1.8rem', fontWeight: 800, color: '#eab308', margin: '8px 0 4px' },
    sub: { color: '#6b7280', fontSize: '0.9rem', margin: '0 0 20px', textAlign: 'center' },
    infoBox: { width: '100%', maxWidth: '400px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '20px', color: '#c8d6e5' },
    voteArea: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' },
    voteLabel: { color: '#c8d6e5', fontWeight: 700, margin: '0 0 6px', textAlign: 'center', fontSize: '1rem' },
    btnVote: { padding: '15px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', border: '2px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#fca5a5', textAlign: 'left' },
    waitArea: { width: '100%', maxWidth: '400px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' },
    bar: { height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', margin: '12px 0 8px' },
    barFill: { height: '100%', background: 'linear-gradient(90deg, #eab308, #f59e0b)', borderRadius: '3px', transition: 'width 0.3s' },
};
