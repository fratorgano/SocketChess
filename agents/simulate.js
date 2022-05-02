const { Chess } = require('chess.js');
const seedrandom = require('seedrandom');

const randomAlgo = require('./algorithms/random');
const negamaxAlgo = require('./algorithms/negamax');

function simulateGame(algo1, algo2, algorithmOptions) {
  const game = new Chess();
  while (!game.game_over()) {
    if (game.turn() === 'w') {
      const move = algo1.chooseMove(game.fen(), algorithmOptions);
      game.move(move);
    } else {
      const move = algo2.chooseMove(game.fen(), algorithmOptions);
      game.move(move);
    }
  }

  if (game.in_checkmate()) {
    return {
      winner: game.turn() === 'w' ? 'b' : 'w',
      score: game.turn() === 'w' ? -1 : 1,
      reason: 'checkmate',
    };
  }
  if (game.in_stalemate()) {
    return {
      winner: null,
      score: 0,
      reason: 'stalemate',
    };
  }
  if (game.in_threefold_repetition()) {
    return {
      winner: null,
      score: 0,
      reason: 'threefold repetition',
    };
  }
  if (game.in_insufficient_material()) {
    return {
      winner: null,
      score: 0,
      reason: 'insufficient material',
    };
  }
  if (game.in_fifty_moves()) {
    return {
      winner: null,
      score: 0,
      reason: 'fifty moves',
    };
  }
}

function simulate(algo1, algo2, algorithmOptions, iterations = 100) {
  const { seed } = algorithmOptions;
  const rng = seedrandom(seed);
  const results = [];
  for (let i = 0; i < iterations; i += 1) {
    algorithmOptions.seed = rng();
    const result = simulateGame(algo1, algo2, algorithmOptions);
    results.push(result);
  }
  return results;
}

const results = simulate(randomAlgo, negamaxAlgo, { seed: 'seed', depth: 2, eval: '' }, 10);
// pretty print results
for (let index = 0; index < results.length; index += 1) {
  const game = results[index];
  console.log(`${index}: ${game.score} - ${game.reason}`);
}
