const WebSocket = require('ws');

const PORT = process.env.PORT || 3001;
const wss = new WebSocket.Server({ port: PORT });
const queue = [];

function matchPlayers() {
  while (queue.length >= 2) {
    const player1 = queue.shift();
    const player2 = queue.shift();
    const matchId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    [player1, player2].forEach((ws, idx) => {
      ws.send(JSON.stringify({ type: 'match_found', matchId, position: idx }));
    });
  }
}

wss.on('connection', ws => {
  console.log('Cliente conectado');

  ws.on('message', msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }
    if (data.type === 'join') {
      queue.push(ws);
      ws.send(JSON.stringify({ type: 'waiting' }));
      matchPlayers();
    }
  });

  ws.on('close', () => {
    const idx = queue.indexOf(ws);
    if (idx !== -1) queue.splice(idx, 1);
    console.log('Cliente desconectado');
  });
});

console.log(`Servidor de matchmaking escutando na porta ${PORT}`);
