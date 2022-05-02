const seedrandom = require('seedrandom');
const { Chess } = require('chess.js');

function chooseMove(fen, options) {
  const rng = seedrandom(options.seed);
  const game = new Chess(fen);
  const moves = game.moves();
  const move = moves[Math.floor(rng() * moves.length)];
  return move;
}
module.exports = {
  chooseMove,
};
