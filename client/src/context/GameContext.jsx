import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const GameContext = createContext();
export function useGame() { return useContext(GameContext); }

export function GameProvider({ children }) {
    const [screen, setScreen] = useState('home');
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState([]);
    const [lobbyInfo, setLobbyInfo] = useState({ min: 5, max: 8 });
    const [readyCount, setReadyCount] = useState({ count: 0, total: 5, readyPlayers: [] });
    const [isPaused, setIsPaused] = useState(false);
    const [voteCount, setVoteCount] = useState({ count: 0, total: 5 });
    const [gameResult, setGameResult] = useState(null);
    const [followerData, setFollowerData] = useState(null);
    const [insiderData, setInsiderData] = useState(null);

    const [nightData, setNightData] = useState({
        phase: 0, myRole: '', myDice: 0,
        isAwake: false, awakeWithMe: [], canPeek: false,
        gemStatus: '', conmanName: '', peekResult: ''
    });

    const socketRef = useRef(null);

    const handleMsg = useCallback((event) => {
        const d = JSON.parse(event.data);

        switch (d.type) {
            case 'LOBBY_UPDATE':
                setPlayers(d.players.map((name, i) => ({ id: i, name, isHost: name === d.hostName })));
                setLobbyInfo({ min: d.minPlayers || 5, max: d.maxPlayers || 8 });
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
                    ...prev, phase: d.phase, isAwake: d.isAwake,
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
                setNightData({ phase: 0, myRole: '', myDice: 0, isAwake: false, awakeWithMe: [], canPeek: false, gemStatus: '', conmanName: '', peekResult: '' });
                setReadyCount({ count: 0, total: 5, readyPlayers: [] });
                setVoteCount({ count: 0, total: 5 });
                setGameResult(null);
                setFollowerData(null);
                setInsiderData(null);
                setIsPaused(false);
                break;

            case 'PLAYER_LEFT': break;
            case 'ERROR': alert(d.message); break;
            default: break;
        }
    }, []);

    const connectWebSocket = useCallback((onOpen) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) { onOpen(socketRef.current); return; }
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = import.meta.env.VITE_API_URL || window.location.host;
        const ws = new WebSocket(`${wsProto}//${wsHost}/ws/game`);
        ws.onopen = () => onOpen(ws);
        ws.onmessage = handleMsg;
        ws.onclose = () => { socketRef.current = null; setScreen('home'); };
        socketRef.current = ws;
    }, [handleMsg]);

    const send = useCallback((payload) => {
        if (socketRef.current?.readyState === WebSocket.OPEN)
            socketRef.current.send(JSON.stringify(payload));
    }, []);

    const leaveGame = useCallback(() => {
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
        setScreen('home'); setPlayers([]); setRoomCode(''); setPlayerName('');
        setIsHost(false); setGameResult(null); setFollowerData(null); setInsiderData(null);
    }, []);

    useEffect(() => () => { if (socketRef.current) socketRef.current.close(); }, []);

    return <GameContext.Provider value={{
        screen, playerName, setPlayerName, roomCode, setRoomCode,
        isHost, setIsHost, players, lobbyInfo, connectWebSocket, send,
        readyCount, nightData, isPaused, voteCount, gameResult,
        followerData, insiderData, leaveGame
    }}>{children}</GameContext.Provider>;
}
