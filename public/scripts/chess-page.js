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

var topParagraph = document.getElementById("top");

// joining socket room
socket.emit("join_room", roomName, userName);

// updating page based on room status
socket.on("room_status", function (room) {
  // update board
  if (room.fen !== null) {
    game.load(room.fen);
    board.position(room.fen);
  }
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
    if (room.restart !== "") {
      console.log("requesting game restart");
      socket.emit("restart_request");
    } else {
      socket.emit("restart_request");
      restartButton.classList.add("background-colored");
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
    console.log(room.switch, side);
    if (
      (room.switch == "b" && side == "w") ||
      (room.switch == "w" && side == "b")
    ) {
      socket.emit("switch_grant");
      switchSidesButton.classList.remove("background-colored");
    } else {
      socket.emit("switch_request");
      switchSidesButton.classList.add("background-colored");
    }
  };

  // creating logic for showLastMove button
  showLastMoveButton.textContent = "Show last move";
  showLastMoveButton.onclick = function () {
    if (game.validate_fen(lastFen)) {
      if (showLastMoveButton.classList.contains("background-colored")) {
        showLastMoveButton.classList.remove("background-colored");
        board.position(game.fen());
      } else {
        showLastMoveButton.classList.add("background-colored");
        board.position(lastFen);
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

// updating board based on the move made
socket.on("move", function (source, target) {
  //console.log("move: " + source + " " + target);

  //saving last fen to show last move
  lastFen = game.fen();

  //move
  game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // update board
  board.position(game.fen());

  //check if game is finished, if so, show reason
  if (game.game_over()) {
    alert(reasonGameOver());
  }
});

// handle restart_request from the other player
socket.on("restart_request", function () {
  //console.log("restart_request");
  // update restartButton to show that there has been a request
  var button = document.getElementById("restartButton");
  button.classList.add("background-colored");
});

// handle switch_request from the other player
socket.on("switch_request", function () {
  // update switchSidesButton to show that there has been a request
  var button = document.getElementById("switchSidesButton");
  button.classList.add("background-colored");
});

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
  // save last fen to show last move
  lastFen = game.fen();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: "q", // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) return "snapback";

  // notify server about move
  socket.emit("move", source, target, game.fen());

  //check if game is finished, if so, show reason
  if (game.game_over()) {
    alert(reasonGameOver());
  }
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
