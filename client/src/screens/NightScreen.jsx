import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function NightScreen() {
    const { nightData, send, roomCode, players, playerName, isHost, isPaused } = useGame();
    const { phase, myRole, myDice, isAwake, awakeWithMe, canPeek, gemStatus, thiefName, peekResult } = nightData;
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => { if (phase > 0) setTimeLeft(10); }, [phase]);
    useEffect(() => {
        if (phase === 0 || isPaused) return;
        const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
        return () => clearInterval(t);
    }, [phase, isPaused]);

    const togglePause = () => send({ action: "TOGGLE_PAUSE", roomId: roomCode });

    if (phase === 0) {
        return (
            <div style={s.page('#0f0a1a')}>
                <div style={{ fontSize: '3rem', animation: 'pulse 2s infinite' }}>&#x1F319;</div>
                <h1 style={s.title}>Night Falls...</h1>
                <p style={{ color: '#9ca3af' }}>Phase 1 begins shortly</p>
                <p style={s.roleHint}>You are: <strong style={{ color: myRole === 'THIEF' ? '#ef4444' : '#60a5fa' }}>{myRole}</strong></p>
                <p style={s.diceHint}>Your dice: <strong>{myDice}</strong> — you wake in Phase {myDice}</p>
                {isHost && <button onClick={togglePause} style={s.btnPause}>{isPaused ? '▶ Resume' : '⏸ Pause'}</button>}
            </div>
        );
    }

    // SLEEPING
    if (!isAwake) {
        return (
            <div style={s.page('#0a0a18')}>
                <div style={s.phaseBar}>
                    <span style={s.phaseNum}>Phase {phase}/6</span>
                    <span style={{ ...s.timer, color: timeLeft <= 3 ? '#ef4444' : '#9ca3af' }}>{timeLeft}s</span>
                </div>
                {isPaused && <div style={s.pauseBanner}>PAUSED</div>}
                <div style={s.sleepCard}>
                    <div style={{ fontSize: '4rem' }}>&#x1F634;</div>
                    <h2 style={{ color: '#e0d6f0', margin: '8px 0 4px' }}>You're Asleep</h2>
                    <p style={{ color: '#6b7280' }}>Keep your eyes closed...</p>
                    <div style={s.miniInfo}>
                        <span>Role: <strong style={{ color: myRole === 'THIEF' ? '#ef4444' : '#60a5fa' }}>{myRole}</strong></span>
                        <span>You wake in Phase <strong>{myDice}</strong></span>
                    </div>
                </div>
                {isHost && <button onClick={togglePause} style={s.btnPause}>{isPaused ? '▶ Resume' : '⏸ Pause'}</button>}
            </div>
        );
    }

    // AWAKE
    return (
        <div style={s.page('#1a1400')}>
            <div style={s.phaseBar}>
                <span style={s.phaseNum}>Phase {phase}/6</span>
                <span style={{ ...s.timer, color: timeLeft <= 3 ? '#ef4444' : '#fbbf24' }}>{timeLeft}s</span>
            </div>
            {isPaused && <div style={s.pauseBanner}>PAUSED</div>}

            <div style={s.wakeCard}>
                <div style={{ fontSize: '2rem' }}>&#x1F440;</div>
                <h2 style={{ color: '#fef3c7', margin: '4px 0 8px' }}>You Woke Up!</h2>

                {/* GEM STATUS */}
                <div style={s.section}>
                    <h4 style={s.sectionTitle}>&#x1F48E; Gem Status</h4>
                    {gemStatus === 'SAFE' && <p style={{ color: '#4ade80', fontWeight: 700 }}>The gem is safe.</p>}
                    {gemStatus === 'MISSING' && <p style={{ color: '#9ca3af', fontWeight: 700 }}>The gem is already gone!</p>}
                    {gemStatus === 'STOLEN_NOW' && (
                        <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>
                            {thiefName === playerName ? '\u{1F977} You stole the gem!' : `\u{1F6A8} ${thiefName} stole the gem!`}
                        </p>
                    )}
                </div>

                {/* WITNESSES */}
                <div style={s.section}>
                    <h4 style={s.sectionTitle}>&#x1F440; Who's awake?</h4>
                    {awakeWithMe.length === 0
                        ? <p style={{ color: '#9ca3af' }}>You're completely alone.</p>
                        : awakeWithMe.map(n => <div key={n} style={s.witnessRow}>&#x1F464; {n}</div>)
                    }
                </div>

                {/* PEEK */}
                {canPeek && (
                    <div style={s.section}>
                        <h4 style={{ ...s.sectionTitle, color: '#f59e0b' }}>&#x1F50D; Peek at someone's dice!</h4>
                        <div style={s.peekRow}>
                            {players.filter(p => p.name !== playerName).map(t => (
                                <button key={t.name} onClick={() => send({ action: "PEEK", roomId: roomCode, targetName: t.name })} style={s.btnPeek}>
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {peekResult && (
                    <div style={s.peekResult}>&#x1F4A1; {peekResult}</div>
                )}
            </div>

            {isHost && <button onClick={togglePause} style={s.btnPause}>{isPaused ? '▶ Resume' : '⏸ Pause'}</button>}
        </div>
    );
}

const s = {
    page: (bg) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: bg, transition: 'background 0.4s' }),
    phaseBar: { display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '380px', marginBottom: '12px' },
    phaseNum: { fontWeight: 700, fontSize: '1.1rem', color: '#e0d6f0' },
    timer: { fontWeight: 700, fontSize: '1.3rem', fontFamily: 'monospace' },
    title: { fontSize: '2rem', fontWeight: 800, color: '#e0d6f0', margin: '8px 0' },
    roleHint: { color: '#9ca3af', margin: '12px 0 4px', fontSize: '1.05rem' },
    diceHint: { color: '#f59e0b', fontSize: '0.95rem' },
    pauseBanner: { background: '#ef4444', color: '#fff', padding: '6px 20px', borderRadius: '6px', fontWeight: 800, marginBottom: '8px' },
    sleepCard: { width: '100%', maxWidth: '380px', textAlign: 'center', padding: '32px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', marginTop: '8px' },
    miniInfo: { display: 'flex', justifyContent: 'space-around', marginTop: '16px', fontSize: '0.85rem', color: '#9ca3af' },
    wakeCard: { width: '100%', maxWidth: '380px', textAlign: 'center', padding: '24px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '16px', marginTop: '8px' },
    section: { margin: '14px 0', textAlign: 'left' },
    sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#d1d5db', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    witnessRow: { padding: '4px 0', fontSize: '1rem', color: '#fef3c7' },
    peekRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    btnPeek: { padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#000', fontWeight: 700, fontSize: '0.9rem' },
    peekResult: { marginTop: '12px', padding: '10px 16px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', color: '#c084fc', fontWeight: 600 },
    btnPause: { marginTop: '20px', padding: '10px 24px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e0d6f0', fontWeight: 700, fontSize: '0.95rem' },
};
