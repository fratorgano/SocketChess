// getting values from get request
var params = new URLSearchParams(window.location.search);
var roomName = params.get("roomName");
var userName = params.get("userName");

// preparing variables
var board = null;
var game = new Chess();
var whiteSquareGrey = "#a9a9a9";
var blackSquareGrey = "#696969";
var socket = io();
var side;
var turn = game.turn();
var lastFen = "";
var finished = false;

var topParagraph = document.getElementById("top");

// setting board config
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

// initializing board with config
board = Chessboard("myBoard", config);

// joining socket room
socket.emit("join_room", roomName, userName);

// updating page based on room status
socket.on("room_status", function (room) {
  // update board
  if (room.fen !== null) {
    game.load(room.fen);
    board.position(room.fen);
  }
  // clearing flag for game over
  finished = false;

  // creating elements to display
  var h1 = document.createElement("h1");
  var h2White = document.createElement("h2");
  var h2Black = document.createElement("h2");
  var h2Vs = document.createElement("h2");
  var h3 = document.createElement("h3");
  var restartButton = document.createElement("button");
  var switchSidesButton = document.createElement("button");
  var showLastMoveButton = document.createElement("button");

  // settings ids
  restartButton.id = "restartButton";
  switchSidesButton.id = "switchSidesButton";
  showLastMoveButton.id = "showLastMoveButton";
  h2White.id = "h2White";
  h2Black.id = "h2Black";

  // setting player's names
  var whiteName = room.white.name ? room.white.name : "Waiting for Player";
  var blackName = room.black.name ? room.black.name : "Waiting for Player";

  // settings restartButton status
  if (room.restart == "") {
    restartButton.classList.remove("background-colored");
  } else {
    restartButton.classList.add("background-colored");
  }

  // creating logic for restart button
  restartButton.textContent = "Restart game";
  restartButton.onclick = function () {
    if (!room.restart) {
      console.log("requesting restart");
      socket.emit("restart_request");
    }else if (room.restart != side) {
      console.log("granting restart");
      socket.emit("restart_grant");
    }
  };

  // creating logic for switchSides button
  switchSidesButton.textContent = "Switch sides";
  if (room.switch == "") {
    switchSidesButton.classList.remove("background-colored");
  } else {
    switchSidesButton.classList.add("background-colored");
  }
  switchSidesButton.onclick = function () {
    if (!room.switch) {
      console.log("requesting switch");
      socket.emit("switch_request");
    }else if (room.switch != side) {
      console.log("granting switch");
      socket.emit("switch_grant");
    }
  };

  // creating logic for showLastMove button
  showLastMoveButton.textContent = "Show last move";
  showLastMoveButton.onclick = function () {
    console.log(lastFen==game.fen());
    if (game.validate_fen(lastFen)) {
      // console.log("last fen validated");
      if (showLastMoveButton.classList.contains("background-colored")) {
        showLastMoveButton.classList.remove("background-colored");
        board.position(game.fen());
        // console.log("used game.fen()");
      } else {
        showLastMoveButton.classList.add("background-colored");
        board.position(lastFen);
        // console.log("used lastFen");
      }
    }
  };

  // setting buttons inside h1
  // if you are a spectator, you can't switch sides or restart the game
  if (side !== "s") {
    h1.appendChild(restartButton);
    h1.appendChild(switchSidesButton);
  }
  h1.appendChild(showLastMoveButton);

  // setting h2 texts
  h2White.textContent = `${whiteName}`;
  h2Black.textContent = `${blackName}`;
  h2Vs.textContent = ` vs `;

  // setting h2 color based on game turn
  if (game.turn() === "w") {
    h2White.classList.add("colored");
    h2Black.classList.remove("colored");
  } else {
    h2Black.classList.add("colored");
    h2White.classList.remove("colored");
  }

  h3.textContent = `Spectators: ${room.spectators.length}`;

  // clearing top paragraph
  topParagraph.textContent = "";

  // appending elements to top paragraph
  topParagraph.appendChild(h1);
  topParagraph.appendChild(h2White);
  topParagraph.appendChild(h2Vs);
  topParagraph.appendChild(h2Black);
  topParagraph.appendChild(h3);
});

// setting side based on server assignment
socket.on("side", function (sideServer) {
  //console.log("side: " + sideServer);
  side = sideServer;
  if (side == "b") {
    board.orientation("black");
  } else {
    board.orientation("white");
  }
});

socket.on('update_board', (fen) => {
  // update board
  updateBoard(fen)
})

// create string with reason why game is over
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

// removes colored squares
function removeGreySquares() {
  $("#myBoard .square-55d63").css("background", "");
}

// add color to a square
function greySquare(square) {
  //console.log(square);
  var $square = $("#myBoard .square-" + square);

  var background = whiteSquareGrey;
  if ($square.hasClass("black-3c85d")) {
    background = blackSquareGrey;
  }

  $square.css("background", background);
}

// handle when the player picks a piece up
function onDragStart(_source, piece) {
  // reset showLastMoveButton
  showLastMoveButton.classList.remove("background-colored");

  // do not pick up pieces if it's not your turn
  if (game.turn() !== side) {
    //console.log("not your turn");
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

//handle when a player drops a piece
function onDrop(source, target) {
  // remove the colored squares that show possible moves
  removeGreySquares();

  lastFen = game.fen();

  // see if the move is legal
  const move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  updateBoard(game.fen());

  // illegal move
  if (move === null) return "snapback";

  // notify server about move
  socket.emit("move", move.san);
}

// handle mouse over a square by showing possible moves
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

// if mouse leaves a square, remove the possible moves highlight
function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

// handle multiple pieces moves like castling, en passant, pawn promotion
function onSnapEnd() {
  board.position(game.fen());
}

// update page after a move is made
function updateBoard(fen) {
  // update board
  // console.log("updateBoard");
  if(fen != game.fen()) {
    // console.log('saving fen');
    lastFen = game.fen();

    game.load(fen);
    board.position(fen);
  }

  // setting h2 color based on game turn
  const h2White = document.getElementById("h2White");
  const h2Black = document.getElementById("h2Black");
  if (game.turn() === "w") {
    // get h2 with id h2White
    h2White.classList.add("colored");
    h2Black.classList.remove("colored");
  } else {
    h2Black.classList.add("colored");
    h2White.classList.remove("colored");
  }
  
  //check if game is finished, if so, show reason
  if (game.game_over() && !finished) {
    alert(reasonGameOver());
    finished = true;
  }
}
