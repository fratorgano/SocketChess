// const seedrandom = require('seedrandom');
// const { Chess } = require('chess.js');
const { negamax_move } = require('wasm-chess-algorithms');

// const { chooseEval } = require('./evaluate');

/* function negamax(fen, rng, evalFun, depth, alpha, beta, prevMoves) {
  const game = new Chess(fen);
  if (depth === 0 || game.game_over()) {
    return {
      score: evalFun(fen),
      moves: prevMoves,
    };
  }

  const moves = game.moves();
  let alphaV = alpha;
  let max = -Infinity;
  let bestMoves = [];
  for (let i = 0; i < moves.length; i += 1) {
    const m = moves[i];
    game.move(m);
    const best = negamax(game.fen(), rng, evalFun, depth - 1, -beta, -alphaV, prevMoves.concat(m));
    best.score = -best.score;
    game.undo();
    if (best.score > max) {
      max = best.score;
      bestMoves = best.moves;
    }
    if (best.score > alphaV) {
      alphaV = best.score;
    }
    if (alphaV >= beta) {
      break;
    }
  }
  return {
    score: max,
    moves: bestMoves,
  };
}

function rootnegamax(fen, rng, evalFun, depth = 3) {
  const game = new Chess(fen);
  const moves = game.moves();
  let max = -Infinity;
  let bestMoves = [];
  const movesScores = [];
  for (let i = 0; i < moves.length; i += 1) {
    const m = moves[i];
    game.move(m);
    const best = negamax(game.fen(), rng, evalFun, depth - 1, -Infinity, -max, [m]);
    best.score = -best.score;
    game.undo();
    movesScores.push(best);
    if (best.score > max) {
      max = best.score;
      bestMoves = [m];
    } else if (best.score === max) {
      bestMoves.push(m);
    }
  }
  // pretty print movesScores
  // console.log(movesScores.map(({ moves, score }) => `${moves}: ${score}`).join('\n'));
  // console.log(bestMoves);
  // console.log(max);
  return bestMoves[Math.floor(rng() * bestMoves.length)];
} */

function chooseMove(fen, options, _lastResult) {
  /*  const rng = seedrandom(options.seed);
  const evalFun = chooseEval(options.evaluatorString);
  const { depth } = options;

  const move = rootnegamax(fen, rng, evalFun, depth); */
  console.log(options);
  const move = negamax_move(fen, BigInt(options.seed), BigInt(options.depth));
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
console.log(chooseMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', { seed: '123456789', evaluatorString: '', depth: 4 }));

console.timeEnd('oldFunc'); */
