const { iterative_deepening_table } = require('wasm-chess-algorithms');

function chooseMove(fen, options, _lastResult) {
  const move = iterative_deepening_table(fen, BigInt(options.seed), BigInt(options.time));
  console.log(move);

  return {
    mov: move,
  };
}
module.exports = {
  chooseMove,
};
