const { Chess } = require('chess.js');

// Alan Turing weights
const kingWeight = 10_000;
const queenWeight = 1_000;
const rookWeight = 500;
const bishopWeight = 350;
const knightWeight = 300;
const pawnWeight = 100;

function materialEval(fen) {
  let whiteMaterial = 0;
  let blackMaterial = 0;
  const whoToMove = fen.split(' ')[1] === 'w' ? 1 : -1;

  // keep only piece placement fen part
  const fenPart = fen.split(' ')[0];

  // const whiteKing = fenPart.split('K').length - 1;
  const whiteQueen = fenPart.split('Q').length - 1;
  const whiteRooks = fenPart.split('R').length - 1;
  const whiteBishops = fenPart.split('B').length - 1;
  const whiteKnights = fenPart.split('N').length - 1;
  const whitePawns = fenPart.split('P').length - 1;

  // const blackKing = fenPart.split('k').length - 1;
  const blackQueen = fenPart.split('q').length - 1;
  const blackRooks = fenPart.split('r').length - 1;
  const blackBishops = fenPart.split('b').length - 1;
  const blackKnights = fenPart.split('n').length - 1;
  const blackPawns = fenPart.split('p').length - 1;

  // whiteMaterial += whiteKing * kingWeight;
  whiteMaterial += whiteQueen * queenWeight;
  whiteMaterial += whiteRooks * rookWeight;
  whiteMaterial += whiteBishops * bishopWeight;
  whiteMaterial += whiteKnights * knightWeight;
  whiteMaterial += whitePawns * pawnWeight;

  // blackMaterial += blackKing * kingWeight;
  blackMaterial += blackQueen * queenWeight;
  blackMaterial += blackRooks * rookWeight;
  blackMaterial += blackBishops * bishopWeight;
  blackMaterial += blackKnights * knightWeight;
  blackMaterial += blackPawns * pawnWeight;

  return (whiteMaterial - blackMaterial) * whoToMove;
}

function mobilityEval(fen) {
  const game = new Chess(fen);
  const whoToMove = game.turn() === 'w' ? 1 : -1;
  const moves = game.moves();
  return moves.length * whoToMove;
}

function materialMobilityEval(fen) {
  return materialEval(fen) + mobilityEval(fen);
}

function chooseEval(evalName) {
  switch (evalName) {
    case 'material':
      return materialEval;
    case 'material_mobility':
      return materialMobilityEval;
    default:
      return materialEval;
  }
}

module.exports = {
  chooseEval,
};
