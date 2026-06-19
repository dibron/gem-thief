import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function LobbyScreen() {
    const { roomCode, players, isHost, send, readyCount, lobbyInfo, leaveGame, nightData } = useGame();
    const [readyClicked, setReadyClicked] = useState(false);

    const phaseCount = lobbyInfo.phaseCount || 6;
    const myDice = nightData.myDice;
    const rolled = myDice > 0;

    const handleRoll = () => {
        setReadyClicked(true);
        send({ action: "ROLL_DICE", roomId: roomCode });
    };

    const setPhases = (count) => {
        send({ action: "SET_PHASES", roomId: roomCode, count });
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

            {isHost && readyCount.count === 0 && (
                <div style={s.phaseSelector}>
                    <span style={s.phaseLabel}>PATROL SHIFTS</span>
                    <div style={s.phaseControls}>
                        <button onClick={() => setPhases(phaseCount - 1)} disabled={phaseCount <= 2} style={s.phaseBtn}>&#x2212;</button>
                        <span style={s.phaseValue}>{phaseCount}</span>
                        <button onClick={() => setPhases(phaseCount + 1)} disabled={phaseCount >= 10} style={s.phaseBtn}>+</button>
                    </div>
                    <span style={s.phaseHint}>Dice rolls 1-{phaseCount} &bull; {phaseCount * 10}s night</span>
                </div>
            )}

            {!isHost && readyCount.count === 0 && (
                <div style={s.phaseInfo}>
                    <span style={s.phaseLabel}>PATROL SHIFTS: <strong style={{ color: '#eab308' }}>{phaseCount}</strong></span>
                    <span style={s.phaseHint}>Dice rolls 1-{phaseCount} &bull; {phaseCount * 10}s night</span>
                </div>
            )}

            <div style={s.actionArea}>
                {!canStart ? (
                    <div style={s.waitBox}>
                        <div style={{ fontSize: '1.5rem', animation: 'pulse 2s infinite' }}>&#x1F6A8;</div>
                        <p>Need {lobbyInfo.min - players.length} more guard{lobbyInfo.min - players.length !== 1 ? 's' : ''} to secure the vault</p>
                    </div>
                ) : !readyClicked ? (
                    <button onClick={handleRoll} style={s.btnRoll}>
                        <span>{'\u{1F3B2} Roll for Patrol Shift'}</span>
                    </button>
                ) : !rolled ? (
                    <div style={s.rolledBox}>
                        <div style={{ ...s.diceResult, animation: 'shake 0.4s infinite' }}>{'\u{1F3B2}'}</div>
                        <p style={s.rollText}>Waiting for all guards to ready up...</p>
                        <div style={s.bar}>
                            <div style={{ ...s.barFill, width: `${(readyCount.count / readyCount.total) * 100}%` }} />
                        </div>
                        <p style={s.barLabel}>{readyCount.count}/{readyCount.total} ready</p>
                    </div>
                ) : (
                    <div style={s.rolledBox}>
                        <div style={s.diceResult}>{DICE_FACES[myDice] || myDice}</div>
                        <p style={s.rollText}>Shift <strong>{myDice}</strong> assigned</p>
                        <p style={s.rollHint}>You'll patrol during Shift {myDice}</p>
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
    rolledBox: { textAlign: 'center', padding: '24px', background: 'rgba(234,179,8,0.05)', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.15)' },
    diceResult: { fontSize: '4rem', margin: '0 0 6px', animation: 'fadeIn 0.5s' },
    rollText: { fontSize: '1.1rem', color: '#fef3c7', margin: '0 0 2px' },
    rollHint: { fontSize: '0.85rem', color: '#eab308', margin: '0 0 14px', fontWeight: 600 },
    bar: { height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' },
    barFill: { height: '100%', background: 'linear-gradient(90deg, #16a34a, #4ade80)', borderRadius: '3px', transition: 'width 0.3s' },
    barLabel: { color: '#6b7280', fontSize: '0.8rem' },
    phaseSelector: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', background: 'rgba(234,179,8,0.04)', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.12)', marginBottom: '12px' },
    phaseInfo: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '12px' },
    phaseLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#6b7280' },
    phaseControls: { display: 'flex', alignItems: 'center', gap: '16px' },
    phaseBtn: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)', color: '#eab308', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
    phaseValue: { fontSize: '2rem', fontWeight: 800, color: '#eab308', fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' },
    phaseHint: { fontSize: '0.7rem', color: '#4b5563' },
    btnLeave: { padding: '10px 24px', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', marginTop: 'auto', marginBottom: '24px' },
};
