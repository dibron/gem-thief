import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// --- VAULT CRACKER MINI-GAME ---
function VaultCracker() {
    const [angle, setAngle] = useState(0);
    const [taps, setTaps] = useState(0);
    const [combo, setCombo] = useState(0);
    const [bestCombo, setBestCombo] = useState(0);
    const [sparks, setSparks] = useState([]);
    const [targetZone, setTargetZone] = useState(randomZone());
    const [cracked, setCracked] = useState(0);
    const lastTap = useRef(0);
    const sparkId = useRef(0);

    function randomZone() {
        return Math.floor(Math.random() * 12) * 30;
    }

    const isInZone = useCallback((a) => {
        const diff = Math.abs(((a % 360) + 360) % 360 - targetZone);
        return diff < 30 || diff > 330;
    }, [targetZone]);

    const handleTap = () => {
        const now = Date.now();
        const speed = now - lastTap.current < 200 ? 25 : now - lastTap.current < 400 ? 18 : 12;
        lastTap.current = now;

        const newAngle = angle + speed;
        setAngle(newAngle);
        setTaps(t => t + 1);

        if (isInZone(newAngle)) {
            const newCombo = combo + 1;
            setCombo(newCombo);
            if (newCombo > bestCombo) setBestCombo(newCombo);
            if (newCombo % 5 === 0) {
                setCracked(c => c + 1);
                setTargetZone(randomZone());
            }
        } else {
            setCombo(0);
        }

        const id = sparkId.current++;
        const sparkAngle = (newAngle % 360) * (Math.PI / 180);
        const r = 58;
        setSparks(prev => [...prev.slice(-6), {
            id, x: 80 + Math.cos(sparkAngle - Math.PI/2) * r,
            y: 80 + Math.sin(sparkAngle - Math.PI/2) * r
        }]);
        setTimeout(() => setSparks(prev => prev.filter(s => s.id !== id)), 400);
    };

    const dialAngle = angle % 360;
    const zoneStart = (targetZone - 15) * (Math.PI / 180) - Math.PI/2;
    const zoneEnd = (targetZone + 15) * (Math.PI / 180) - Math.PI/2;

    return (
        <div style={g.box}>
            <p style={g.label}>&#x1F513; VAULT CRACKER</p>
            <div style={g.gameArea}>
                <svg width="160" height="160" viewBox="0 0 160 160" onClick={handleTap} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    {/* Outer ring */}
                    <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
                    {/* Target zone arc */}
                    <path d={`M ${80 + 70*Math.cos(zoneStart)} ${80 + 70*Math.sin(zoneStart)} A 70 70 0 0 1 ${80 + 70*Math.cos(zoneEnd)} ${80 + 70*Math.sin(zoneEnd)}`}
                        fill="none" stroke={combo > 0 ? '#4ade80' : 'rgba(234,179,8,0.4)'} strokeWidth="8" strokeLinecap="round"/>
                    {/* Inner circle */}
                    <circle cx="80" cy="80" r="44" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                    {/* Dial notches */}
                    {[...Array(12)].map((_, i) => {
                        const a = (i * 30) * (Math.PI / 180) - Math.PI/2;
                        return <line key={i} x1={80+54*Math.cos(a)} y1={80+54*Math.sin(a)}
                            x2={80+62*Math.cos(a)} y2={80+62*Math.sin(a)}
                            stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>;
                    })}
                    {/* Rotating pointer */}
                    {(() => {
                        const a = dialAngle * (Math.PI / 180) - Math.PI/2;
                        return <line x1="80" y1="80" x2={80+58*Math.cos(a)} y2={80+58*Math.sin(a)}
                            stroke={combo > 0 ? '#4ade80' : '#eab308'} strokeWidth="3" strokeLinecap="round"
                            style={{ transition: 'all 0.08s', filter: combo > 3 ? 'drop-shadow(0 0 6px #4ade80)' : 'none' }}/>;
                    })()}
                    {/* Center dot */}
                    <circle cx="80" cy="80" r="6" fill={combo > 0 ? '#4ade80' : '#eab308'}
                        style={{ filter: combo > 3 ? 'drop-shadow(0 0 8px #4ade80)' : 'none' }}/>
                    {/* Center text */}
                    <text x="80" y="108" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="monospace">{taps}</text>
                    {/* Sparks */}
                    {sparks.map(sp => (
                        <circle key={sp.id} cx={sp.x} cy={sp.y} r="3"
                            fill={combo > 0 ? '#4ade80' : '#eab308'} opacity="0.8">
                            <animate attributeName="r" from="3" to="8" dur="0.4s" fill="freeze"/>
                            <animate attributeName="opacity" from="0.8" to="0" dur="0.4s" fill="freeze"/>
                        </circle>
                    ))}
                </svg>

                <div style={g.stats}>
                    <div style={g.stat}>
                        <span style={g.statVal}>{combo}</span>
                        <span style={g.statKey}>combo</span>
                    </div>
                    <div style={g.stat}>
                        <span style={{ ...g.statVal, color: '#eab308' }}>{cracked}</span>
                        <span style={g.statKey}>cracked</span>
                    </div>
                    <div style={g.stat}>
                        <span style={g.statVal}>{bestCombo}</span>
                        <span style={g.statKey}>best</span>
                    </div>
                </div>
            </div>
            <p style={g.hint}>Tap the dial &bull; Hit the gold zone for combos &bull; 5 combo = crack</p>
        </div>
    );
}

const g = {
    box: { width: '100%', maxWidth: '400px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginBottom: '12px' },
    label: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#6b7280', margin: '0 0 8px' },
    gameArea: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' },
    stats: { display: 'flex', flexDirection: 'column', gap: '8px' },
    stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statVal: { fontSize: '1.4rem', fontWeight: 800, color: '#4ade80', fontFamily: 'monospace' },
    statKey: { fontSize: '0.65rem', color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase' },
    hint: { fontSize: '0.7rem', color: '#4b5563', marginTop: '8px' },
};

// --- MAIN LOBBY SCREEN ---
export default function LobbyScreen() {
    const { roomCode, players, isHost, send, readyCount, lobbyInfo, leaveGame } = useGame();
    const [rolled, setRolled] = useState(null);
    const [rolling, setRolling] = useState(false);

    const phaseCount = lobbyInfo.phaseCount || 6;

    const handleRoll = () => {
        setRolling(true);
        setTimeout(() => {
            const val = Math.floor(Math.random() * phaseCount) + 1;
            setRolled(val);
            setRolling(false);
            send({ action: "ROLL_DICE", roomId: roomCode, roll: val });
        }, 900);
    };

    const setPhases = (count) => {
        send({ action: "SET_PHASES", roomId: roomCode, count });
    };

    const canStart = players.length >= lobbyInfo.min;
    const isWaiting = !canStart || rolled != null;

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

            {isWaiting && <VaultCracker />}

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
    phaseSelector: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', background: 'rgba(234,179,8,0.04)', borderRadius: '12px', border: '1px solid rgba(234,179,8,0.12)', marginBottom: '12px' },
    phaseInfo: { width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', marginBottom: '12px' },
    phaseLabel: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#6b7280' },
    phaseControls: { display: 'flex', alignItems: 'center', gap: '16px' },
    phaseBtn: { width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)', color: '#eab308', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
    phaseValue: { fontSize: '2rem', fontWeight: 800, color: '#eab308', fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' },
    phaseHint: { fontSize: '0.7rem', color: '#4b5563' },
    btnLeave: { padding: '10px 24px', fontSize: '0.8rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', marginTop: 'auto', marginBottom: '24px' },
};
