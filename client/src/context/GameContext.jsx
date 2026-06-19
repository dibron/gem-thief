import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const GameContext = createContext();
export function useGame() { return useContext(GameContext); }

export function GameProvider({ children }) {
    const [screen, setScreen] = useState('home');
    const [playerName, setPlayerName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [isHost, setIsHost] = useState(false);
    const [players, setPlayers] = useState([]);
    const [readyCount, setReadyCount] = useState({ count: 0, total: 4, readyPlayers: [] });
    const [isPaused, setIsPaused] = useState(false);
    const [voteCount, setVoteCount] = useState({ count: 0, total: 4 });
    const [gameResult, setGameResult] = useState(null);

    const [nightData, setNightData] = useState({
        phase: 0, myRole: '', myDice: 0,
        isAwake: false, awakeWithMe: [], canPeek: false,
        gemStatus: '', thiefName: '', peekResult: ''
    });

    const socketRef = useRef(null);

    const handleMsg = useCallback((event) => {
        const d = JSON.parse(event.data);

        switch (d.type) {
            case 'LOBBY_UPDATE':
                setPlayers(d.players.map((name, i) => ({ id: i, name, isHost: name === d.hostName })));
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
                    gemStatus: d.gemStatus || '', thiefName: d.thiefName || '',
                    peekResult: ''
                }));
                break;

            case 'PEEK_RESULT':
                setNightData(prev => ({ ...prev, peekResult: d.message, canPeek: false }));
                break;

            case 'PAUSE_UPDATE':
                setIsPaused(d.paused);
                break;

            case 'DAY_PHASE':
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
                setNightData({ phase: 0, myRole: '', myDice: 0, isAwake: false, awakeWithMe: [], canPeek: false, gemStatus: '', thiefName: '', peekResult: '' });
                setReadyCount({ count: 0, total: 4, readyPlayers: [] });
                setVoteCount({ count: 0, total: 4 });
                setGameResult(null);
                setIsPaused(false);
                break;

            case 'PLAYER_LEFT':
                break;

            case 'ERROR':
                alert(d.message);
                break;

            default: break;
        }
    }, []);

    const connectWebSocket = useCallback((onOpen) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            onOpen(socketRef.current);
            return;
        }
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }

        const ws = new WebSocket("ws://localhost:8080/ws/game");
        ws.onopen = () => onOpen(ws);
        ws.onmessage = handleMsg;
        ws.onclose = () => {
            socketRef.current = null;
            setScreen('home');
        };
        socketRef.current = ws;
    }, [handleMsg]);

    const send = useCallback((payload) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(payload));
        }
    }, []);

    const leaveGame = useCallback(() => {
        if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
        setScreen('home');
        setPlayers([]);
        setRoomCode('');
        setPlayerName('');
        setIsHost(false);
        setGameResult(null);
    }, []);

    useEffect(() => () => { if (socketRef.current) socketRef.current.close(); }, []);

    const value = {
        screen, setScreen, playerName, setPlayerName, roomCode, setRoomCode,
        isHost, setIsHost, players, connectWebSocket, send,
        readyCount, nightData, isPaused, voteCount, gameResult, leaveGame
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
