const workerpool = require('workerpool');

const random = require('./algorithms/random');
const negamax = require('./algorithms/negamax');
const negamaxAB = require('./algorithms/negamax_a_b');
const negamaxABTable = require('./algorithms/negamax_a_b_table');
const negamaxABQuiescent = require('./algorithms/negamax_a_b_quiescent');
const iterativeDeepening = require('./algorithms/iterative_deepening');
const iterativeDeepeningTable = require('./algorithms/iterative_deepening_table');
const iterativeDeepeningOrder = require('./algorithms/iterative_deepening_order');

workerpool.worker({
  random: random.chooseMove,
  negamax: negamax.chooseMove,
  negamax_a_b: negamaxAB.chooseMove,
  negamax_a_b_table: negamaxABTable.chooseMove,
  negamax_a_b_quiescent: negamaxABQuiescent.chooseMove,
  iterative_deepening: iterativeDeepening.chooseMove,
  iterative_deepening_table: iterativeDeepeningTable.chooseMove,
  iterative_deepening_order: iterativeDeepeningOrder.chooseMove,
});
