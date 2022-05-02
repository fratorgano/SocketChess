const workerpool = require('workerpool');

const random = require('./algorithms/random');
const negamax = require('./algorithms/negamax');

workerpool.worker({
  random: random.chooseMove,
  negamax: negamax.chooseMove,
});
