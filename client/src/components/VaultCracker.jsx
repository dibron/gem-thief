import React, { useState, useRef, useCallback } from 'react';

const COLORS = ['#ef4444', '#f59e0b', '#4ade80', '#3b82f6', '#a855f7', '#ec4899'];

export default function VaultCracker() {
    const [count, setCount] = useState(0);
    const [pops, setPops] = useState([]);
    const [shakeClass, setShakeClass] = useState(false);
    const popId = useRef(0);
    const btnRef = useRef(null);

    const getTier = (n) => {
        if (n >= 200) return { label: 'VAULT LORD', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', ring: 'rgba(245,158,11,0.4)' };
        if (n >= 100) return { label: 'MASTER CRACKER', color: '#a855f7', bg: 'rgba(168,85,247,0.1)', ring: 'rgba(168,85,247,0.4)' };
        if (n >= 50) return { label: 'SAFE BREAKER', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', ring: 'rgba(59,130,246,0.4)' };
        if (n >= 20) return { label: 'LOCK PICKER', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', ring: 'rgba(74,222,128,0.3)' };
        if (n >= 5) return { label: 'APPRENTICE', color: '#9ca3af', bg: 'rgba(255,255,255,0.04)', ring: 'rgba(255,255,255,0.1)' };
        return { label: 'TAP TO START', color: '#4b5563', bg: 'rgba(255,255,255,0.02)', ring: 'rgba(255,255,255,0.06)' };
    };

    const handleTap = useCallback((e) => {
        const newCount = count + 1;
        setCount(newCount);

        setShakeClass(true);
        setTimeout(() => setShakeClass(false), 80);

        const rect = btnRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const id = popId.current++;
            const color = COLORS[id % COLORS.length];
            const angle = Math.random() * 360;
            const dist = 30 + Math.random() * 40;
            setPops(prev => [...prev.slice(-8), { id, x, y, color, angle, dist, text: `+1` }]);
            setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 600);
        }
    }, [count]);

    const tier = getTier(count);
    const progress = count < 5 ? count / 5 : count < 20 ? (count - 5) / 15 : count < 50 ? (count - 20) / 30 : count < 100 ? (count - 50) / 50 : count < 200 ? (count - 100) / 100 : 1;
    const size = Math.min(1.15, 1 + count * 0.0008);

    return (
        <div style={s.box}>
            <p style={s.label}>&#x1F4A3; TAP FRENZY</p>

            <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                    ref={btnRef}
                    onClick={handleTap}
                    style={{
                        ...s.tapBtn,
                        background: tier.bg,
                        boxShadow: `0 0 ${Math.min(30, count / 3)}px ${tier.ring}`,
                        transform: `scale(${shakeClass ? size * 0.92 : size})`,
                        borderColor: tier.ring,
                    }}
                >
                    <span style={{ ...s.countNum, color: tier.color }}>{count}</span>
                    <span style={s.tierLabel}>{tier.label}</span>
                </button>

                {pops.map(p => {
                    const tx = Math.cos(p.angle * Math.PI / 180) * p.dist;
                    const ty = Math.sin(p.angle * Math.PI / 180) * p.dist - 20;
                    return (
                        <span key={p.id} style={{
                            position: 'absolute', left: p.x, top: p.y, pointerEvents: 'none',
                            color: p.color, fontWeight: 800, fontSize: '0.9rem',
                            animation: `popFly 0.6s ease-out forwards`,
                            '--tx': `${tx}px`, '--ty': `${ty}px`,
                        }}>
                            {p.text}
                        </span>
                    );
                })}
            </div>

            <div style={s.progressOuter}>
                <div style={{ ...s.progressInner, width: `${progress * 100}%`, background: tier.color }} />
            </div>
            <p style={s.hint}>Next rank at {count < 5 ? 5 : count < 20 ? 20 : count < 50 ? 50 : count < 100 ? 100 : count < 200 ? 200 : '???'}</p>

            <style>{`
                @keyframes popFly {
                    0% { opacity: 1; transform: translate(0, 0) scale(1); }
                    100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.5); }
                }
            `}</style>
        </div>
    );
}

const s = {
    box: { width: '100%', maxWidth: '400px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', marginTop: '12px' },
    label: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '2px', color: '#6b7280', margin: '0 0 12px' },
    tapBtn: { width: '140px', height: '140px', borderRadius: '50%', border: '3px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.08s, box-shadow 0.2s', userSelect: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none' },
    countNum: { fontSize: '2.4rem', fontWeight: 900, fontFamily: 'monospace', lineHeight: 1 },
    tierLabel: { fontSize: '0.55rem', fontWeight: 700, letterSpacing: '1.5px', color: '#6b7280', marginTop: '4px' },
    progressOuter: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', margin: '12px 0 6px', maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto' },
    progressInner: { height: '100%', borderRadius: '2px', transition: 'width 0.15s, background 0.3s' },
    hint: { fontSize: '0.65rem', color: '#374151', margin: 0 },
};
