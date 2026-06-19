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

    return (
        <div style={s.page}>
            <div style={{ fontSize: '3rem' }}>&#x2600;&#xFE0F;</div>
            <h1 style={s.title}>Day Phase</h1>
            <p style={s.subtitle}>The night is over. Time to decide who the thief is!</p>

            <div style={s.infoBox}>
                <p>The gem is <strong style={{ color: nightData.gemStatus === 'SAFE' ? '#4ade80' : '#ef4444' }}>
                    {nightData.gemStatus === 'SAFE' ? 'SAFE' : 'STOLEN'}
                </strong></p>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '4px' }}>
                    You were <strong style={{ color: nightData.myRole === 'THIEF' ? '#ef4444' : '#60a5fa' }}>{nightData.myRole}</strong>
                    {' '} | Woke in Phase {nightData.myDice}
                </p>
            </div>

            {!voted ? (
                <div style={s.voteArea}>
                    <h3 style={s.voteTitle}>Vote to eliminate:</h3>
                    {others.map(p => (
                        <button key={p.name} onClick={() => handleVote(p.name)} style={s.btnVote}>
                            &#x1F5F3;&#xFE0F; {p.name}
                        </button>
                    ))}
                </div>
            ) : (
                <div style={s.waitArea}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>&#x2705;</div>
                    <p style={{ color: '#e0d6f0', fontWeight: 600 }}>You voted for <strong style={{ color: '#c084fc' }}>{votedFor}</strong></p>
                    <div style={s.progressBar}>
                        <div style={{ ...s.progressFill, width: `${(voteCount.count / voteCount.total) * 100}%` }} />
                    </div>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        {voteCount.count}/{voteCount.total} votes in
                    </p>
                </div>
            )}
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #1a1025 0%, #1e1b2e 100%)' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#fbbf24', margin: '8px 0 4px' },
    subtitle: { color: '#9ca3af', fontSize: '0.95rem', margin: '0 0 20px', textAlign: 'center' },
    infoBox: { width: '100%', maxWidth: '380px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', marginBottom: '20px', color: '#e0d6f0' },
    voteArea: { width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' },
    voteTitle: { color: '#e0d6f0', fontWeight: 700, margin: '0 0 8px', textAlign: 'center' },
    btnVote: { padding: '16px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: '2px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', transition: 'all 0.2s' },
    waitArea: { width: '100%', maxWidth: '380px', textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' },
    progressBar: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', margin: '12px 0 8px' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #a855f7)', borderRadius: '3px', transition: 'width 0.3s' },
};
