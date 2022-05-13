const { iterative_deepening_order } = require('wasm-chess-algorithms');

function chooseMove(fen, options, _lastResult) {
  const move = iterative_deepening_order(fen, BigInt(1), BigInt(options.time));
  console.log(move);

  return {
    mov: move,
  };
}
module.exports = {
  chooseMove,
};
