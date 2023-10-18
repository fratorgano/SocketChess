const { negamax_a_b_move } = require('wasm-chess-algorithms');

function chooseMove(fen, options, _lastResult) {
  /*  const rng = seedrandom(options.seed);
  const evalFun = chooseEval(options.evaluatorString);
  const { depth } = options;

  const move = rootnegamax(fen, rng, evalFun, depth); */
  console.log(options);
  const move = negamax_a_b_move(fen, BigInt(options.seed), BigInt(options.depth));
  console.log(move);

  return {
    mov: move,
  };
}
module.exports = {
  chooseMove,
};
/* console.time('oldFunc');
// oldfunc();
console.log(
  chooseMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', { seed: '123456789', evaluatorString: '', depth: 4 }));

console.timeEnd('oldFunc'); */
