// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var params = new URLSearchParams(window.location.search);
var roomName = params.get("roomName");
var userName = params.get("userName");

var board = null;
var game = new Chess();
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var socket = io();
var side;
var turn = game.turn();

var topParagraph = document.getElementById("top");
var bottomParagraph = document.getElementById("bottom");

socket.emit("join_room", roomName, userName);

socket.on("room_status", function (room) {
  console.log("room_status: " + room);
  var h1 = document.createElement("h1");
  var h2 = document.createElement("h2");
  var h3 = document.createElement("h3");
  var whiteName = room.white.name ? room.white.name : "Waiting for Player";
  var blackName = room.black.name ? room.black.name : "Waiting for Player";
  h1.textContent = `${room.name}`;
  h2.textContent = `${whiteName} vs ${blackName}`;
  h3.textContent = `Spectators: ${room.spectators.length}`;
  topParagraph.textContent = "";
  topParagraph.appendChild(h1);
  topParagraph.appendChild(h2);
  topParagraph.appendChild(h3);
  if (room.fen !== null) {
    game.load(room.fen);
    board.position(room.fen);
  }
});

socket.on("side", function (sideServer) {
  console.log("side: " + sideServer);
  side = sideServer;
  if (side == "b") {
    board.orientation("black");
  } else {
    board.orientation("white");
  }
});

socket.on("move", function (source, target) {
  console.log("move: " + source + " " + target);

  game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  board.position(game.fen());

  if (game.game_over()) {
    alert(reasonGameOver());
  }
});

function reasonGameOver() {
  if (game.in_checkmate()) {
    if (game.turn() === "w") {
      return "Black Wins!";
    } else {
      return "White Wins!";
    }
  }
  if (game.in_draw()) {
    return "Draw!";
  }
  if (game.in_threefold_repetition()) {
    return "Threefold repetition!";
  }
  if (game.in_stalemate()) {
    return "Stalemate!";
  }
  if (game.in_insufficient_material()) {
    return "Insufficient material!";
  }
}

function findCheck() {
  if (game.in_check()) {
    return findCheckKing();
  }
}

function findCheckKing() {
  var kingPosition;
  game.board().forEach(function (row, rowIndex) {
    row.forEach(function (square, squareIndex) {
      if (square !== null && square.type === "k" && square.color === side) {
        kingPosition = `${String.fromCharCode(97 + squareIndex)}${
          8 - rowIndex
        }`;
      }
    });
  });
  return kingPosition;
}

socket.on("fen", function (fenString) {
  console.log("fenString: " + fenString);
  if (fenString !== null) {
    game.load(fenString);
    board.position(fenString);
  }
});

function removeGreySquares() {
  $("#myBoard .square-55d63").css("background", "");
}

function greySquare(square) {
  //console.log(square);
  var $square = $("#myBoard .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

function onDragStart(source, piece) {
  // do not pick up pieces if it's not your turn
  if (game.turn() !== side) {
    console.log("not your turn");
    return false;
  }

  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // or if it's not that side's turn
  if (
    (game.turn() === "w" && piece.search(/^b/) !== -1) ||
    (game.turn() === "b" && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";

  socket.emit("move", source, target, game.fen());

  if (game.game_over()) {
    alert(reasonGameOver());
  }
}

function onMouseoverSquare(square, piece) {
  // do not show moves if you are not playing
  if (side == "s") return false;

  // do not show moves if the piece isn't yours
  if (piece == false) return false;

  // do not show moves if you aren't the side whose turn it is
  if (piece.charAt(0) != side) return false;

  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function onSnapEnd() {
  board.position(game.fen());
}

var config = {
  draggable: true,
  position: "start",
  pieceTheme: "images/pieces/{piece}.png",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
};
board = Chessboard("myBoard", config);
