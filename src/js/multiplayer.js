let socket;

function connect() {
  socket = new WebSocket('ws://localhost:3001');

  socket.addEventListener('open', () => {
    console.log('Conectado ao servidor de matchmaking');
    socket.send(JSON.stringify({ type: 'join' }));
  });

  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.type === 'waiting') {
      console.log('Aguardando outro jogador...');
    } else if (data.type === 'match_found') {
      console.log(
        `Partida encontrada (ID: ${data.matchId}). Jogador #${
          data.position + 1
        }`
      );
    }
  });

  socket.addEventListener('close', () => {
    console.log('Conexão com matchmaking encerrada');
  });
}

document.getElementById('btnFindMatch').addEventListener('click', () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    connect();
  } else {
    socket.send(JSON.stringify({ type: 'join' }));
  }
});
