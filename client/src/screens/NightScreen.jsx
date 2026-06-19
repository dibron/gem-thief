import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function NightScreen() {
    const { nightData, send, roomCode, players, playerName, isHost, isPaused } = useGame();
    const { phase, myRole, myDice, isAwake, awakeWithMe, canPeek, gemStatus, conmanName, peekResult } = nightData;
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => { if (phase > 0) setTimeLeft(10); }, [phase]);
    useEffect(() => {
        if (phase === 0 || isPaused) return;
        const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
        return () => clearInterval(t);
    }, [phase, isPaused]);

    const togglePause = () => send({ action: "TOGGLE_PAUSE", roomId: roomCode });
    const roleColor = myRole === 'CONMAN' ? '#ef4444' : '#3b82f6';
    const roleLabel = myRole === 'CONMAN' ? '\u{1F3AD} Conman' : '\u{1F6E1}\u{FE0F} Guard';

    if (phase === 0) {
        return (
            <div style={s.page('#080b14')}>
                <div style={{ fontSize: '3rem', animation: 'pulse 2s infinite' }}>&#x1F303;</div>
                <h1 style={s.mainTitle}>Lights Out</h1>
                <p style={{ color: '#6b7280' }}>First patrol shift begins shortly...</p>
                <div style={s.infoChip}>
                    <span>You are: <strong style={{ color: roleColor }}>{roleLabel}</strong></span>
                    <span>&bull;</span>
                    <span>Shift: <strong style={{ color: '#eab308' }}>{myDice}</strong></span>
                </div>
                {isHost && <button onClick={togglePause} style={s.btnPause}>{isPaused ? '\u{25B6} Resume' : '\u{23F8} Pause'}</button>}
            </div>
        );
    }

    // SLEEPING
    if (!isAwake) {
        return (
            <div style={s.page('#060810')}>
                <div style={s.shiftBar}>
                    <span style={s.shiftLabel}>Shift {phase}/6</span>
                    <span style={{ ...s.timer, color: timeLeft <= 3 ? '#ef4444' : '#4b5563' }}>{timeLeft}s</span>
                </div>
                {isPaused && <div style={s.pauseBanner}>PAUSED</div>}
                <div style={s.sleepCard}>
                    <div style={{ fontSize: '3.5rem' }}>&#x1F4A4;</div>
                    <h2 style={{ color: '#9ca3af', margin: '8px 0 4px' }}>Off Duty</h2>
                    <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>Stay in the break room...</p>
                    <div style={s.miniInfo}>
                        <span style={{ color: roleColor }}>{roleLabel}</span>
                        <span>Your shift: <strong>{myDice}</strong></span>
                    </div>
                </div>
                {isHost && <button onClick={togglePause} style={s.btnPause}>{isPaused ? '\u{25B6} Resume' : '\u{23F8} Pause'}</button>}
            </div>
        );
    }

    // AWAKE — ON PATROL
    return (
        <div style={s.page('#0d1117')}>
            <div style={s.shiftBar}>
                <span style={s.shiftLabel}>Shift {phase}/6</span>
                <span style={{ ...s.timer, color: timeLeft <= 3 ? '#ef4444' : '#eab308' }}>{timeLeft}s</span>
            </div>
            {isPaused && <div style={s.pauseBanner}>PAUSED</div>}

            <div style={s.wakeCard}>
                <div style={{ fontSize: '2rem' }}>&#x1F6A8;</div>
                <h2 style={{ color: '#fef3c7', margin: '4px 0 8px' }}>On Patrol!</h2>

                <div style={s.section}>
                    <h4 style={s.secTitle}>&#x1F48E; DIAMOND STATUS</h4>
                    {gemStatus === 'SAFE' && <p style={{ color: '#4ade80', fontWeight: 700 }}>Diamond secure in the vault.</p>}
                    {gemStatus === 'MISSING' && <p style={{ color: '#6b7280', fontWeight: 700 }}>The vault is empty — diamond is gone!</p>}
                    {gemStatus === 'STOLEN_NOW' && (
                        <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>
                            {conmanName === playerName
                                ? '\u{1F3AD} You grabbed the diamond!'
                                : `\u{1F6A8} ${conmanName} just took the diamond!`}
                        </p>
                    )}
                </div>

                <div style={s.section}>
                    <h4 style={s.secTitle}>&#x1F441;&#xFE0F; GUARDS ON PATROL</h4>
                    {awakeWithMe.length === 0
                        ? <p style={{ color: '#6b7280' }}>The corridor is empty. You're alone.</p>
                        : awakeWithMe.map(n => <div key={n} style={s.guardRow}>&#x1F6E1;&#xFE0F; {n}</div>)}
                </div>

                {canPeek && (
                    <div style={s.section}>
                        <h4 style={{ ...s.secTitle, color: '#eab308' }}>&#x1F50D; CHECK SCHEDULE</h4>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '8px' }}>You're alone — peek at someone's patrol shift.</p>
                        <div style={s.peekGrid}>
                            {players.filter(p => p.name !== playerName).map(t => (
                                <button key={t.name} onClick={() => send({ action: "PEEK", roomId: roomCode, targetName: t.name })} style={s.btnPeek}>
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {peekResult && <div style={s.peekResult}>&#x1F4CB; {peekResult}</div>}
            </div>

            {isHost && <button onClick={togglePause} style={s.btnPause}>{isPaused ? '\u{25B6} Resume' : '\u{23F8} Pause'}</button>}
        </div>
    );
}

const s = {
    page: (bg) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: bg, transition: 'background 0.4s' }),
    shiftBar: { display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px', marginBottom: '10px' },
    shiftLabel: { fontWeight: 700, fontSize: '1.1rem', color: '#c8d6e5' },
    timer: { fontWeight: 700, fontSize: '1.3rem', fontFamily: 'monospace' },
    mainTitle: { fontSize: '2rem', fontWeight: 800, color: '#c8d6e5', margin: '8px 0' },
    infoChip: { display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '20px', fontSize: '0.9rem', marginTop: '14px', color: '#9ca3af' },
    pauseBanner: { background: '#ef4444', color: '#fff', padding: '6px 20px', borderRadius: '6px', fontWeight: 800, marginBottom: '8px', fontSize: '0.9rem', letterSpacing: '2px' },
    sleepCard: { width: '100%', maxWidth: '400px', textAlign: 'center', padding: '32px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', marginTop: '8px' },
    miniInfo: { display: 'flex', justifyContent: 'space-around', marginTop: '16px', fontSize: '0.85rem', color: '#6b7280' },
    wakeCard: { width: '100%', maxWidth: '400px', textAlign: 'center', padding: '24px', background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '16px', marginTop: '8px' },
    section: { margin: '14px 0', textAlign: 'left' },
    secTitle: { fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', margin: '0 0 6px', letterSpacing: '1.5px' },
    guardRow: { padding: '3px 0', fontSize: '0.95rem', color: '#fef3c7' },
    peekGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    btnPeek: { padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #92400e, #b45309)', color: '#fef3c7', fontWeight: 700, fontSize: '0.85rem' },
    peekResult: { marginTop: '12px', padding: '10px 14px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '10px', color: '#eab308', fontWeight: 600, fontSize: '0.95rem' },
    btnPause: { marginTop: '20px', padding: '10px 24px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#9ca3af', fontWeight: 700, fontSize: '0.9rem' },
};
