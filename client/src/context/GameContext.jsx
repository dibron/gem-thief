import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const GameContext = createContext();
export function useGame() { return useContext(GameContext); }

function saveSession(roomCode, playerName, isHost) {
    sessionStorage.setItem('vault-session', JSON.stringify({ roomCode, playerName, isHost }));
}
function loadSession() {
    try { return JSON.parse(sessionStorage.getItem('vault-session')); } catch { return null; }
}
function clearSession() { sessionStorage.removeItem('vault-session'); }

export function GameProvider({ children }) {
    const [screen, setScreen] = useState('home');
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState([]);
    const [lobbyInfo, setLobbyInfo] = useState({ min: 4, max: 8, phaseCount: 6 });
    const [readyCount, setReadyCount] = useState({ count: 0, total: 4, readyPlayers: [] });
    const [isPaused, setIsPaused] = useState(false);
    const [voteCount, setVoteCount] = useState({ count: 0, total: 4 });
    const [gameResult, setGameResult] = useState(null);
    const [followerData, setFollowerData] = useState(null);
    const [insiderData, setInsiderData] = useState(null);

    const [nightData, setNightData] = useState({
        phase: 0, totalPhases: 6, myRole: '', myDice: 0,
        isAwake: false, awakeWithMe: [], canPeek: false,
        gemStatus: '', conmanName: '', peekResult: ''
    });

    const socketRef = useRef(null);
    const intentionalClose = useRef(false);

    const handleMsg = useCallback((event) => {
        const d = JSON.parse(event.data);

        switch (d.type) {
            case 'LOBBY_UPDATE':
                setPlayers(d.players.map((name, i) => ({ id: i, name, isHost: name === d.hostName })));
                setLobbyInfo({ min: d.minPlayers || 4, max: d.maxPlayers || 8, phaseCount: d.phaseCount || 6 });
                setScreen(prev => prev === 'home' ? 'lobby' : prev);
                break;

            case 'SETUP_PHASE':
                setNightData(prev => ({ ...prev, myRole: d.myRole }));
                break;

            case 'DICE_ROLLED':
                setNightData(prev => ({ ...prev, myDice: d.myDice }));
                break;

            case 'READY_COUNT':
                setReadyCount({ count: d.count, total: d.total, readyPlayers: d.readyPlayers || [] });
                break;

            case 'GAME_START':
                setScreen('night');
                break;

            case 'NIGHT_UPDATE':
                setNightData(prev => ({
                    ...prev, phase: d.phase, totalPhases: d.totalPhases || prev.totalPhases, isAwake: d.isAwake,
                    awakeWithMe: d.awakeWithMe || [], canPeek: d.canPeek || false,
                    gemStatus: d.gemStatus || '', conmanName: d.conmanName || '',
                    peekResult: ''
                }));
                break;

            case 'PEEK_RESULT':
                setNightData(prev => ({ ...prev, peekResult: d.message, canPeek: false }));
                break;

            case 'PAUSE_UPDATE':
                setIsPaused(d.paused);
                break;

            case 'FOLLOWER_PHASE':
                setFollowerData({ candidates: d.candidates, required: d.requiredFollowers });
                setScreen('follower');
                break;

            case 'FOLLOWER_WAIT':
                setScreen('follower_wait');
                break;

            case 'FOLLOWERS_CHOSEN':
                setFollowerData(prev => ({ ...prev, chosen: d.followers }));
                break;

            case 'YOU_ARE_INSIDER':
                setInsiderData({ conmanName: d.conmanName, otherInsiders: d.otherInsiders });
                setNightData(prev => ({ ...prev, myRole: 'INSIDER' }));
                break;

            case 'DAY_PHASE':
                if (d.myRole) setNightData(prev => ({ ...prev, myRole: d.myRole }));
                setScreen('vote');
                break;

            case 'VOTE_COUNT':
                setVoteCount({ count: d.count, total: d.total });
                break;

            case 'GAME_OVER':
                setGameResult(d);
                setScreen('gameover');
                break;

            case 'GAME_RESTART':
                setScreen('lobby');
                setNightData({ phase: 0, totalPhases: 6, myRole: '', myDice: 0, isAwake: false, awakeWithMe: [], canPeek: false, gemStatus: '', conmanName: '', peekResult: '' });
                setReadyCount({ count: 0, total: 4, readyPlayers: [] });
                setVoteCount({ count: 0, total: 4 });
                setGameResult(null);
                setFollowerData(null);
                setInsiderData(null);
                setIsPaused(false);
                break;

            case 'PLAYER_LEFT': break;
            case 'ERROR':
                clearSession();
                alert(d.message);
                break;
            default: break;
        }
    }, []);

    const connectAndJoin = useCallback((roomId, name, host) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: "JOIN", roomId, name }));
            return;
        }
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }

        intentionalClose.current = false;
        const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/game`;
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
            ws.send(JSON.stringify({ action: "JOIN", roomId, name }));
            saveSession(roomId, name, host);
        };
        ws.onmessage = handleMsg;
        ws.onclose = () => {
            socketRef.current = null;
            if (!intentionalClose.current) {
                setScreen('home');
            }
        };
        socketRef.current = ws;
    }, [handleMsg]);

    const send = useCallback((payload) => {
        if (socketRef.current?.readyState === WebSocket.OPEN)
            socketRef.current.send(JSON.stringify(payload));
    }, []);

    const leaveGame = useCallback(() => {
        intentionalClose.current = true;
        clearSession();
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
        setScreen('home'); setPlayers([]); setRoomCode(''); setPlayerName('');
        setIsHost(false); setGameResult(null); setFollowerData(null); setInsiderData(null);
    }, []);

    // Auto-reconnect on mount
    useEffect(() => {
        const saved = loadSession();
        if (saved && saved.roomCode && saved.playerName) {
            setPlayerName(saved.playerName);
            setRoomCode(saved.roomCode);
            setIsHost(saved.isHost);
            connectAndJoin(saved.roomCode, saved.playerName, saved.isHost);
        }
        return () => { if (socketRef.current) socketRef.current.close(); };
    }, []);

    return <GameContext.Provider value={{
        screen, playerName, setPlayerName, roomCode, setRoomCode,
        isHost, setIsHost, players, lobbyInfo, connectAndJoin, send,
        readyCount, nightData, isPaused, voteCount, gameResult,
        followerData, insiderData, leaveGame
    }}>{children}</GameContext.Provider>;
}
