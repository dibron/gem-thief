import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function LobbyScreen() {
    const { roomCode, players, isHost, send, readyCount, leaveGame } = useGame();
    const [rolled, setRolled] = useState(null);
    const [rolling, setRolling] = useState(false);

    const handleRoll = () => {
        setRolling(true);
        setTimeout(() => {
            const val = Math.floor(Math.random() * 6) + 1;
            setRolled(val);
            setRolling(false);
            send({ action: "ROLL_DICE", roomId: roomCode, roll: val });
        }, 900);
    };

    const allHere = players.length >= 4;

    return (
        <div style={s.page}>
            <div style={s.topBar}>
                <span style={s.code}>{roomCode}</span>
                {isHost && <span style={s.hostBadge}>HOST</span>}
            </div>

            <h2 style={s.heading}>The Safehouse</h2>
            <p style={s.sub}>Crew ({players.length}/4)</p>

            <div style={s.playerList}>
                {players.map(p => {
                    const ready = readyCount.readyPlayers.includes(p.name);
                    return (
                        <div key={p.id} style={s.playerRow}>
                            <span>
                                {p.isHost ? '\u{1F451} ' : '\u{1F464} '}{p.name}
                            </span>
                            <span style={{ ...s.badge, background: ready ? '#22c55e' : 'rgba(255,255,255,0.1)', color: ready ? '#fff' : '#9ca3af' }}>
                                {ready ? '✓ Ready' : 'Waiting'}
                            </span>
                        </div>
                    );
                })}
                {[...Array(Math.max(0, 4 - players.length))].map((_, i) => (
                    <div key={`empty-${i}`} style={{ ...s.playerRow, opacity: 0.3 }}>
                        <span> Empty slot</span>
                    </div>
                ))}
            </div>

            <div style={s.actionArea}>
                {!allHere ? (
                    <div style={s.waitBox}>
                        <div style={{ fontSize: '1.6rem', animation: 'pulse 2s infinite' }}>&#x23F3;</div>
                        <p>Waiting for {4 - players.length} more...</p>
                    </div>
                ) : rolled == null ? (
                    <button onClick={handleRoll} disabled={rolling} style={rolling ? s.btnRolling : s.btnRoll}>
                        <span style={rolling ? { animation: 'shake 0.3s infinite' } : {}}>
                            {rolling ? '\u{1F3B2}' : '\u{1F3B2}'} {rolling ? 'Rolling...' : 'Roll Dice to Ready Up!'}
                        </span>
                    </button>
                ) : (
                    <div style={s.rolledBox}>
                        <div style={s.diceResult}>{DICE_FACES[rolled]}</div>
                        <p style={s.rollText}>You rolled <strong>{rolled}</strong></p>
                        <p style={s.rollHint}>You'll wake up in Phase {rolled}</p>
                        <div style={s.waitingBar}>
                            <div style={{ ...s.waitingFill, width: `${(readyCount.count / readyCount.total) * 100}%` }} />
                        </div>
                        <p style={s.waitingSub}>{readyCount.count}/{readyCount.total} ready</p>
                    </div>
                )}
            </div>

            <button onClick={leaveGame} style={s.btnLeave}>Leave Room</button>
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #0f0a1a 0%, #1a1025 100%)' },
    topBar: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' },
    code: { background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '3px', color: '#c084fc' },
    hostBadge: { background: '#f59e0b', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 },
    heading: { fontSize: '1.6rem', fontWeight: 700, color: '#f0e6ff', margin: '0 0 4px' },
    sub: { color: '#9ca3af', fontSize: '0.9rem', margin: '0 0 16px' },
    playerList: { width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' },
    playerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '1rem' },
    badge: { fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', fontWeight: 700 },
    actionArea: { width: '100%', maxWidth: '380px', marginBottom: '16px' },
    waitBox: { textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', color: '#9ca3af' },
    btnRoll: { width: '100%', padding: '18px', fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: '#000', boxShadow: '0 6px 20px rgba(245,158,11,0.4)', animation: 'glow 2s infinite' },
    btnRolling: { width: '100%', padding: '18px', fontSize: '1.2rem', fontWeight: 700, borderRadius: '12px', border: 'none', background: '#52525b', color: '#a1a1aa', cursor: 'wait' },
    rolledBox: { textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' },
    diceResult: { fontSize: '4rem', margin: '0 0 8px', animation: 'fadeIn 0.5s' },
    rollText: { fontSize: '1.1rem', color: '#f0e6ff', margin: '0 0 4px' },
    rollHint: { fontSize: '0.85rem', color: '#f59e0b', margin: '0 0 16px', fontWeight: 600 },
    waitingBar: { height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' },
    waitingFill: { height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '3px', transition: 'width 0.3s' },
    waitingSub: { color: '#9ca3af', fontSize: '0.85rem' },
    btnLeave: { padding: '10px 24px', fontSize: '0.85rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '8px', marginTop: 'auto', marginBottom: '24px' },
};
