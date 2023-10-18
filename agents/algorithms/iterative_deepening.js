const { iterative_deepening } = require('wasm-chess-algorithms');

function chooseMove(fen, options, _lastResult) {
  const move = iterative_deepening(fen, BigInt(options.seed), BigInt(options.time));
  console.log(move);

  return {
    mov: move,
  };
}
module.exports = {
  chooseMove,
};
