import React from 'react';

// status: "SAFE" | "STOLEN_NOW" | "MISSING"
export default function DiamondPedestal({ status, conmanName, playerName }) {
    const isSafe = status === 'SAFE';
    const isStolenNow = status === 'STOLEN_NOW';
    const isMissing = status === 'MISSING';
    const iAmThief = conmanName === playerName;

    return (
        <div style={s.wrapper}>
            <svg viewBox="0 0 260 220" width="260" height="220" xmlns="http://www.w3.org/2000/svg">
                {/* Background glow */}
                {isSafe && (
                    <circle cx="130" cy="80" r="70" fill="url(#safeGlow)" opacity="0.6">
                        <animate attributeName="r" values="65;75;65" dur="3s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
                    </circle>
                )}
                {isStolenNow && (
                    <circle cx="130" cy="80" r="80" fill="url(#dangerGlow)" opacity="0.5">
                        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="0.5s" repeatCount="indefinite"/>
                    </circle>
                )}

                {/* Glass case (dome) */}
                <ellipse cx="130" cy="155" rx="65" ry="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <path d="M65,155 Q65,50 130,40 Q195,50 195,155" fill="none"
                    stroke={isSafe ? 'rgba(74,222,128,0.15)' : isStolenNow ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.06)'}
                    strokeWidth="1.5" strokeDasharray={isMissing ? '4,4' : 'none'}/>

                {/* Pedestal */}
                <rect x="100" y="140" width="60" height="12" rx="3"
                    fill={isSafe ? '#1a2332' : '#1a1a1a'}
                    stroke={isSafe ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth="1"/>
                <rect x="108" y="148" width="44" height="20" rx="2"
                    fill={isSafe ? '#111827' : '#111'}
                    stroke={isSafe ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)'}
                    strokeWidth="1"/>
                <rect x="95" y="166" width="70" height="8" rx="2"
                    fill={isSafe ? '#0f1923' : '#0a0a0a'}
                    stroke={isSafe ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}
                    strokeWidth="1"/>

                {/* DIAMOND — only if safe */}
                {isSafe && (
                    <g>
                        {/* Diamond body */}
                        <polygon points="130,65 148,95 130,138 112,95"
                            fill="url(#diamondFill)" stroke="rgba(147,197,253,0.6)" strokeWidth="1.5">
                            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
                        </polygon>
                        {/* Top facets */}
                        <polygon points="130,65 148,95 130,100" fill="rgba(191,219,254,0.2)"/>
                        <polygon points="130,65 112,95 130,100" fill="rgba(147,197,253,0.15)"/>
                        {/* Shine */}
                        <polygon points="120,78 126,72 132,85 124,88" fill="rgba(255,255,255,0.25)">
                            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="2.5s" repeatCount="indefinite"/>
                        </polygon>
                        {/* Sparkles */}
                        <circle cx="150" cy="75" r="2" fill="#bfdbfe" opacity="0.6">
                            <animate attributeName="opacity" values="0;0.8;0" dur="1.8s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="108" cy="88" r="1.5" fill="#93c5fd" opacity="0.4">
                            <animate attributeName="opacity" values="0;0.6;0" dur="2.2s" begin="0.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="142" cy="110" r="1.5" fill="#bfdbfe" opacity="0.3">
                            <animate attributeName="opacity" values="0;0.7;0" dur="2s" begin="1s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                )}

                {/* STOLEN NOW — shattered glass + alarm */}
                {isStolenNow && (
                    <g>
                        {/* Crack lines */}
                        <line x1="130" y1="80" x2="155" y2="55" stroke="#ef4444" strokeWidth="2" opacity="0.7"/>
                        <line x1="130" y1="80" x2="100" y2="60" stroke="#ef4444" strokeWidth="1.5" opacity="0.5"/>
                        <line x1="130" y1="80" x2="160" y2="100" stroke="#ef4444" strokeWidth="1.5" opacity="0.6"/>
                        <line x1="130" y1="80" x2="110" y2="110" stroke="#ef4444" strokeWidth="1" opacity="0.4"/>
                        {/* Shards */}
                        <polygon points="125,85 135,75 140,90" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth="1"/>
                        <polygon points="118,70 128,65 122,80" fill="rgba(239,68,68,0.1)" stroke="rgba(239,68,68,0.2)" strokeWidth="1"/>
                        {/* Alarm rings */}
                        <circle cx="130" cy="90" r="25" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.3">
                            <animate attributeName="r" values="20;45;20" dur="1s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="130" cy="90" r="15" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4">
                            <animate attributeName="r" values="10;35;10" dur="1s" begin="0.3s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.4;0;0.4" dur="1s" begin="0.3s" repeatCount="indefinite"/>
                        </circle>
                        {/* "!" icon */}
                        <text x="130" y="98" textAnchor="middle" fontSize="28" fontWeight="900" fill="#ef4444" opacity="0.9">!</text>
                    </g>
                )}

                {/* MISSING — empty + dust */}
                {isMissing && (
                    <g>
                        {/* Ghost outline of where diamond was */}
                        <polygon points="130,75 143,95 130,128 117,95"
                            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3"/>
                        {/* Dust particles */}
                        <circle cx="120" cy="130" r="1.5" fill="rgba(255,255,255,0.08)">
                            <animate attributeName="cy" values="130;120;130" dur="4s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="140" cy="125" r="1" fill="rgba(255,255,255,0.06)">
                            <animate attributeName="cy" values="125;115;125" dur="3.5s" begin="0.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="130" cy="128" r="1" fill="rgba(255,255,255,0.05)">
                            <animate attributeName="cy" values="128;118;128" dur="5s" begin="1s" repeatCount="indefinite"/>
                        </circle>
                        {/* "?" */}
                        <text x="130" y="105" textAnchor="middle" fontSize="22" fontWeight="700" fill="rgba(255,255,255,0.1)">?</text>
                    </g>
                )}

                {/* Gradient defs */}
                <defs>
                    <radialGradient id="safeGlow" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#4ade80" stopOpacity="0"/>
                    </radialGradient>
                    <radialGradient id="dangerGlow" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                    </radialGradient>
                    <linearGradient id="diamondFill" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#93c5fd"/>
                        <stop offset="50%" stopColor="#bfdbfe"/>
                        <stop offset="100%" stopColor="#60a5fa"/>
                    </linearGradient>
                </defs>
            </svg>

            {/* Status text below */}
            <div style={{
                ...s.statusText,
                color: isSafe ? '#4ade80' : isStolenNow ? '#ef4444' : '#4b5563'
            }}>
                {isSafe && 'DIAMOND SECURE'}
                {isStolenNow && (iAmThief ? 'YOU GRABBED THE DIAMOND!' : `${conmanName} STOLE THE DIAMOND!`)}
                {isMissing && 'THE VAULT IS EMPTY'}
            </div>
        </div>
    );
}

const s = {
    wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' },
    statusText: { fontSize: '0.85rem', fontWeight: 800, letterSpacing: '2px', marginTop: '2px', textAlign: 'center' },
};
