const seedrandom = require('seedrandom');
const { Chess } = require('chess.js');
const { random_move } = require('wasm-chess-algorithms');

function chooseMove(fen, options, _lastResult) {
  /* const rng = seedrandom(options.seed);
  const game = new Chess(fen);
  const moves = game.moves();
  const move = moves[Math.floor(rng() * moves.length)]; */
  const move = random_move(fen, BigInt(options.seed));
  console.log(move);
  return {
    mov: move,
  };
}
module.exports = {
  chooseMove,
};
chooseMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', { seed: '123456789' });
