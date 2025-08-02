import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
const socket = io('https://game-8p6d.onrender.com/');

function App() {
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [players, setPlayers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [currentFloor, setCurrentFloor] = useState(4);
    const [alive, setAlive] = useState(true);
    const [result, setResult] = useState(null);
    const [winner, setWinner] = useState(null);
    // WebRTC refs
    const localStream = useRef();
    const peerConnections = useRef({});

    useEffect(() => {
        socket.on('updatePlayers', setPlayers);
        socket.on('gameStarted', () => setGameStarted(true));
        socket.on('playerResult', ({ playerId: pid, result, currentFloor }) => {
            if (pid === playerId) {
                setResult(result);
                setCurrentFloor(currentFloor);
                if (result === 'lava') setAlive(false);
            }
        });
        socket.on('gameEnd', ({ winner }) => setWinner(winner));
        // WebRTC signal handler
        socket.on('webrtc', handleWebRTCSignal);
        return () => {
            socket.off('updatePlayers');
            socket.off('gameStarted');
            socket.off('playerResult');
            socket.off('gameEnd');
            socket.off('webrtc');
        };
    }, [playerId]);

    function joinRoom() {
        socket.emit('joinRoom', { roomId, playerName });
    }

    function chooseHole(index) {
        socket.emit('chooseHole', { roomId, playerId, holeIndex: index });
    }

    // WebRTC İşlemleri (basit örnek)
    async function startVoiceChat() {
        localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Her oyuncu için ayrı peer connection kur
        players.forEach(p => {
            if (p.id !== playerId && !peerConnections.current[p.id]) {
                // WebRTC peer connection kodları burada
            }
        });
    }
    function handleWebRTCSignal(data) {
        // WebRTC sinyal işleme burada
    }

    return (
        <div>
            {!gameStarted ? (
                <div>
                    <input placeholder="Oda ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
                    <input placeholder="İsim" value={playerName} onChange={e => setPlayerName(e.target.value)} />
                    <button onClick={joinRoom}>Odaya Katıl</button>
                    <div>Oyuncular: {players.map(p => p.name).join(', ')}</div>
                </div>
            ) : alive ? (
                <div>
                    <h3>{currentFloor}. Kattasın</h3>
                    <button onClick={() => chooseHole(0)}>Delik 1</button>
                    <button onClick={() => chooseHole(1)}>Delik 2</button>
                    {result && <div>{result === 'lava' ? 'Lava Düştün! Kaybettin.' : 'Güvenli geçtin!'}</div>}
                    <button onClick={startVoiceChat}>Sesli Sohbet Başlat</button>
                </div>
            ) : (
                <div>
                    <h2>Kaybettin!</h2>
                </div>
            )}
            {winner && <h2>Kazanan: {winner.name}</h2>}
        </div>
    );
}

export default App;
