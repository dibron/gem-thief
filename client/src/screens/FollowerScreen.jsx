import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export default function FollowerScreen() {
    const { screen, nightData, followerData, insiderData, send, roomCode } = useGame();
    const isConman = nightData.myRole === 'CONMAN';
    const [selected, setSelected] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
        return () => clearInterval(t);
    }, []);

    const toggle = (name) => {
        if (submitted) return;
        const max = followerData?.required || 1;
        if (selected.includes(name)) {
            setSelected(selected.filter(n => n !== name));
        } else if (selected.length < max) {
            setSelected([...selected, name]);
        }
    };

    const handleSubmit = () => {
        if (selected.length === 0) return;
        setSubmitted(true);
        send({ action: "CHOOSE_FOLLOWERS", roomId: roomCode, followers: selected });
    };

    // CONMAN VIEW — picking insiders
    if (isConman && followerData && !submitted) {
        return (
            <div style={s.page}>
                <div style={{ fontSize: '2.5rem' }}>&#x1F3AD;</div>
                <h1 style={s.title}>Recruit Insiders</h1>
                <p style={s.sub}>
                    Choose <strong style={{ color: '#ef4444' }}>{followerData.required}</strong> guard{followerData.required > 1 ? 's' : ''} to turn to your side.
                    They'll know who you are — and you'll know them.
                </p>
                <p style={s.timerText}>{timer}s before auto-pick</p>

                <div style={s.candidateList}>
                    {followerData.candidates.map(name => {
                        const isSel = selected.includes(name);
                        return (
                            <button key={name} onClick={() => toggle(name)}
                                style={{ ...s.candidateBtn, ...(isSel ? s.candidateSel : {}) }}>
                                {isSel ? '\u{2705} ' : '\u{1F6E1}\u{FE0F} '}{name}
                            </button>
                        );
                    })}
                </div>

                <button onClick={handleSubmit} disabled={selected.length === 0}
                    style={selected.length > 0 ? s.btnConfirm : s.btnDisabled}>
                    Recruit {selected.length}/{followerData.required}
                </button>
            </div>
        );
    }

    // CONMAN — submitted, waiting
    if (isConman && submitted) {
        return (
            <div style={s.page}>
                <div style={{ fontSize: '2.5rem' }}>&#x1F3AD;</div>
                <h2 style={s.title}>Insiders Recruited</h2>
                <p style={s.sub}>Your team is in place. Interrogation begins shortly...</p>
                {followerData?.chosen && (
                    <div style={s.chosenList}>
                        {followerData.chosen.map(n => <div key={n} style={s.chosenRow}>&#x1F91D; {n}</div>)}
                    </div>
                )}
            </div>
        );
    }

    // NEWLY REVEALED INSIDER
    if (insiderData) {
        return (
            <div style={s.page}>
                <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s infinite' }}>&#x1F91D;</div>
                <h1 style={{ ...s.title, color: '#f97316' }}>You're an Insider</h1>
                <p style={s.sub}>
                    The conman <strong style={{ color: '#ef4444' }}>{insiderData.conmanName}</strong> recruited you.
                    You win if the conman survives the vote.
                </p>
                {insiderData.otherInsiders.length > 0 && (
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        Other insider{insiderData.otherInsiders.length > 1 ? 's' : ''}: <strong>{insiderData.otherInsiders.join(', ')}</strong>
                    </p>
                )}
                <p style={s.timerText}>Interrogation begins soon...</p>
            </div>
        );
    }

    // REGULAR GUARD — waiting
    return (
        <div style={s.page}>
            <div style={{ fontSize: '2.5rem', animation: 'pulse 2s infinite' }}>&#x1F4A4;</div>
            <h2 style={s.title}>Between Shifts</h2>
            <p style={s.sub}>Something is happening in the shadows...</p>
            <p style={s.timerText}>Interrogation begins soon</p>
        </div>
    );
}

const s = {
    page: { display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding: '24px', background: 'linear-gradient(180deg, #0d0510 0%, #1a0e2e 100%)', justifyContent: 'center' },
    title: { fontSize: '1.8rem', fontWeight: 800, color: '#c8d6e5', margin: '10px 0 6px' },
    sub: { color: '#9ca3af', fontSize: '0.95rem', textAlign: 'center', maxWidth: '340px', margin: '0 0 12px', lineHeight: '1.5' },
    timerText: { color: '#4b5563', fontSize: '0.85rem', fontFamily: 'monospace' },
    candidateList: { width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '8px', margin: '16px 0' },
    candidateBtn: { padding: '14px 16px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px', border: '2px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#c8d6e5', textAlign: 'left' },
    candidateSel: { border: '2px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5' },
    btnConfirm: { padding: '15px 32px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #b91c1c, #dc2626)', color: '#fff', boxShadow: '0 4px 16px rgba(239,68,68,0.3)', marginTop: '8px' },
    btnDisabled: { padding: '15px 32px', fontSize: '1.05rem', fontWeight: 700, borderRadius: '10px', border: 'none', background: '#374151', color: '#6b7280', marginTop: '8px' },
    chosenList: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' },
    chosenRow: { padding: '10px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', color: '#fca5a5', fontWeight: 600 },
};
