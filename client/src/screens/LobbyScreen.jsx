import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function LobbyScreen() {
    const { roomCode, players, isHost, send, readyCount, lobbyInfo, leaveGame } = useGame();
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

    const canStart = players.length >= lobbyInfo.min;

    return (
        <div style={s.page}>
            <div style={s.topBar}>
                <span style={s.vaultCode}>{roomCode}</span>
                {isHost && <span style={s.hostTag}>LEAD GUARD</span>}
            </div>

            <h2 style={s.heading}>&#x1F3E6; Vault Security</h2>
            <p style={s.sub}>Guards on duty ({players.length}/{lobbyInfo.max})</p>

            <div style={s.playerList}>
                {players.map(p => {
                    const ready = readyCount.readyPlayers.includes(p.name);
                    return (
                        <div key={p.id} style={s.playerRow}>
                            <span>{p.isHost ? '\u{1F396}\u{FE0F} ' : '\u{1F6E1}\u{FE0F} '}{p.name}</span>
                            <span style={{ ...s.badge, background: ready ? '#16a34a' : 'rgba(255,255,255,0.06)', color: ready ? '#fff' : '#6b7280' }}>
                                {ready ? '✓ On Shift' : 'Standby'}
                            </span>
                        </div>
                    );
                })}
                {[...Array(Math.max(0, lobbyInfo.min - players.length))].map((_, i) => (
                    <div key={`e${i}`} style={{ ...s.playerRow, opacity: 0.2 }}>
                        <span>&#x1F47B; Waiting for guard...</span>
                    </div>
                ))}
            </div>

            <div style={s.actionArea}>
                {!canStart ? (
                    <div style={s.waitBox}>
                        <div style={{ fontSize: '1.5rem', animation: 'pulse 2s infinite' }}>&#x1F6A8;</div>
                        <p>Need {lobbyInfo.min - players.length} more guard{lobbyInfo.min - players.length !== 1 ? 's' : ''} to secure the vault</p>
                    </div>
                ) : rolled == null ? (
                    <button onClick={handleRoll} disabled={rolling} style={rolling ? s.btnRolling : s.btnRoll}>
                        <span style={rolling ? { animation: 'shake 0.3s infinite', display: 'inline-block' } : {}}>
                            {rolling ? '\u{1F3B2} Assigning...' : '\u{1F3B2} Roll for Patrol Shift'}
                        </span>
                    </button>
                ) : (
                    <div style={s.rolledBox}>
                        <div style={s.diceResult}>{DICE_FACES[rolled]}</div>
                        <p style={s.rollText}>Shift <strong>{rolled}</strong> assigned</p>
                        <p style={s.rollHint}>You'll patrol during Shift {rolled}</p>
                        <div style={s.bar}>
                            <div style={{ ...s.barFill, width: `${(readyCount.count / readyCount.total) * 100}%` }} />
                        </div>
                        <p style={s.barLabel}>{readyCount.count}/{readyCount.total} guards assigned</p>
                    </div>
                )}
            </div>

            <button onClick={leaveGame} style={s.btnLeave}>Abandon Post</button>
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #080b14 0%, #0d1117 100%)' },
    topBar: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' },
    vaultCode: { background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.3)', padding: '6px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '4px', color: '#eab308', fontFamily: 'monospace' },
    hostTag: { background: '#b45309', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' },
    heading: { fontSize: '1.5rem', fontWeight: 700, color: '#fef3c7', margin: '0 0 4px' },
    sub: { color: '#6b7280', fontSize: '0.9rem', margin: '0 0 16px' },
    playerList: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '16px' },
    playerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' },
    badge: { fontSize: '0.7rem', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.5px' },
    actionArea: { width: '100%', maxWidth: '400px', marginBottom: '16px' },
    waitBox: { textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', color: '#6b7280' },
    btnRoll: { width: '100%', padding: '18px', fontSize: '1.15rem', fontWeight: 700, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #b45309, #d97706, #eab308)', color: '#000', boxShadow: '0 6px 24px rgba(234,179,8,0.35)', animation: 'glow 2s infinite' },
    btnRolling: { width: '100%', padding: '18px', fontSize: '1.15rem', fontWeight: 700, borderRadius: '12px', border: 'none', background: '#374151', color: '#9ca3af', cursor: 'wait' },
    rolledBox: { textAlign: 'center', padding: '24px', background: 'rgba(234,179,8,0.05)', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.15)' },
    diceResult: { fontSize: '4rem', margin: '0 0 6px', animation: 'fadeIn 0.5s' },
    rollText: { fontSize: '1.1rem', color: '#fef3c7', margin: '0 0 2px' },
    rollHint: { fontSize: '0.85rem', color: '#eab308', margin: '0 0 14px', fontWeight: 600 },
    bar: { height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' },
    barFill: { height: '100%', background: 'linear-gradient(90deg, #16a34a, #4ade80)', borderRadius: '3px', transition: 'width 0.3s' },
    barLabel: { color: '#6b7280', fontSize: '0.8rem' },
    btnLeave: { padding: '10px 24px', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', marginTop: 'auto', marginBottom: '24px' },
};
