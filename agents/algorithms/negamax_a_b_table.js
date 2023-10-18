const { negamax_a_b_table_move } = require('wasm-chess-algorithms');

function chooseMove(fen, options, lastResult) {
  console.log(options);
  const result = negamax_a_b_table_move(fen, BigInt(options.seed), BigInt(options.depth), lastResult);
  console.log(result.mov);
  // console.log(result.table.table);

  return result;
}
module.exports = {
  chooseMove,
};
