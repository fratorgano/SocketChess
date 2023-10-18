const { negamax_a_b_quiescent } = require('wasm-chess-algorithms');

function chooseMove(fen, options, _lastResult) {
  console.log(options);
  const move = negamax_a_b_quiescent(fen, BigInt(options.seed), BigInt(options.depth));
  console.log(move);

  return {
    mov: move,
  };
}
module.exports = {
  chooseMove,
};
