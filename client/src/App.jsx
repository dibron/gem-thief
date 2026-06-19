import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import NightScreen from './screens/NightScreen';
import FollowerScreen from './screens/FollowerScreen';
import VoteScreen from './screens/VoteScreen';
import GameOverScreen from './screens/GameOverScreen';

function Router() {
    const { screen } = useGame();
    return (
        <>
            {screen === 'home' && <HomeScreen />}
            {screen === 'lobby' && <LobbyScreen />}
            {screen === 'night' && <NightScreen />}
            {(screen === 'follower' || screen === 'follower_wait') && <FollowerScreen />}
            {screen === 'vote' && <VoteScreen />}
            {screen === 'gameover' && <GameOverScreen />}
        </>
    );
}

export default function App() {
    return <GameProvider><Router /></GameProvider>;
}
