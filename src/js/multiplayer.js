let socket;

function connect() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  const socketUrl = `${protocol}://${location.hostname}:3001`;
  socket = new WebSocket(socketUrl);

  socket.addEventListener('open', () => {
    console.log('Conectado ao servidor de matchmaking');
    socket.send(JSON.stringify({ type: 'join' }));
  });

  socket.addEventListener('error', () => {
    console.error('Não foi possível conectar ao servidor de matchmaking');
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
