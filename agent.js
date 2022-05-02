const { io } = require('socket.io-client');
const { Chess } = require('chess.js');

const name = 'agent';
const roomName = 'Fra';
let side = 'w';

const socket = io('https://chess.fratorgano.me');
socket.emit('join_room', roomName, name);
console.log('Connected to server');

socket.on('side', (sideServer) => {
  // console.log("side: " + sideServer);
  side = sideServer;
});

socket.on('update_board', (fen) => {
  const game = new Chess(fen);
  if (game.game_over()) {
    console.log('Game over');
    return;
  }
  if (game.turn() === side) {
    console.log('its my turn');
    const moves = game.moves();
    const move = moves[Math.floor(Math.random() * moves.length)];
    console.log(move);
    game.move(move);
    socket.emit('move', move);
  }
});

socket.on('restart_request', () => {
  // if player requested to restart, agree to restart
  console.log('got a restart request, granting it');
  socket.emit('restart_request');
});

socket.on('switch_request', () => {
  // if player requested to switch, agree to switch
  console.log('got a switch request, granting it');
  socket.emit('switch_grant');
});

socket.onAny((event, ...args) => {
  console.log(`got ${event} event:`, ...args);
});
