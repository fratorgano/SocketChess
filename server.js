const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// making public folder available, contains html, scripts, css, images
app.use(express.static(__dirname + "/public"));
// making chessboardjs files available
app.use(
  express.static(__dirname + "/node_modules/@chrisoakman/chessboardjs/dist/")
);
// making chess.js files available
app.use(express.static(__dirname + "/node_modules/chess.js/"));

// answering / get requests with index.html
app.get("/", (_req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// if a client is trying to join a room that exists, the client will get che chess-page.html otherwise it will get be redirected to /
app.get("/chess", (req, res) => {
  if (rooms.find((room) => room.name === req.query.roomName)) {
    res.sendFile(__dirname + "/public/chess-page.html");
  } else {
    res.redirect("/");
  }
});

// keeping track of all the rooms
var rooms = [];

// handle user connection to server through socket
io.on("connection", (socket) => {
  //console.log("user connected");
  socket.emit("room_list", rooms);

  // preparing variables to store roomName and userName
  var roomNameSocket = "";
  var userNameSocket = "";

  // handling create_room event
  socket.on("create_room", (name) => {
    //check if rooms contains a room with name name
    if (rooms.find((room) => room.name === name)) {
      //if room already exists, don't create a new room
      console.log("room already exists:", name);
      return;
    }
    console.log("creating room:", name);
    // create a new room and add it to rooms array
    rooms.push({
      name: name,
      white: {},
      black: {},
      spectators: [],
      fen: "",
      restart: "",
      switch: "",
    });
  });

  // handling join_room event
  socket.on("join_room", (name, userName) => {
    console.log(userName, "is joining room", name);

    // find room the user want to join
    var room = rooms.find((room) => room.name === name);
    if (room) {
      // if room exists, socket joins room
      socket.join(name);
      if (Object.keys(room.white).length === 0) {
        //if room.white is empty, user is white
        room.white.id = socket.id;
        room.white.name = userName;
        socket.emit("side", "w");
      } else if (Object.keys(room.black).length === 0) {
        // if room.black is empty, user is black
        room.black.id = socket.id;
        room.black.name = userName;
        socket.emit("side", "b");
      } else {
        // if room is full, user is spectator
        room.spectators.push({ name: userName, id: socket.id });
        socket.emit("side", "s");
      }
      roomNameSocket = room.name;
      userNameSocket = userName;
    }
    // sending room_status event to all members of this room
    io.to(room.name).emit("room_status", room);

    // update everyone's room list
    io.emit("room_list", rooms);
  });

  // handling move event
  socket.on("move", (source, target, game) => {
    // find correct room
    var room = rooms.find((room) => room.name === roomNameSocket);

    // update game status
    room.fen = game;
    // share game status update with all members of this room
    socket.to(roomNameSocket).emit("move", source, target);

    // sending room_status event to all members of this room
    io.to(room.name).emit("room_status", room);
  });

  // handling restart_request event
  socket.on("restart_request", () => {
    // find correct room
    var room = rooms.find((room) => room.name === roomNameSocket);
    if (socket.id === room.white.id) {
      //if both parties agree to restart, restart game
      if (room.restart == "b") {
        console.log("restart granted by white");
        // notify users of game restart
        socket.to(roomNameSocket).emit("restart_game");
        // set game status to starting position
        room.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        // remove restart value
        room.restart = "";
        // share updated room status with all members of this room
        io.to(room.name).emit("room_status", room);
      } else {
        console.log("white asked for restart");
        room.restart = "w";
        io.to(room.black.id).emit("restart_request");
      }
    }
    //same as above but from black side
    if (socket.id === room.black.id) {
      if (room.restart == "w") {
        console.log("restart granted by black");
        socket.to(roomNameSocket).emit("restart_game");
        room.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        room.restart = "";
        io.to(room.name).emit("room_status", room);
      } else {
        console.log("black asked for restart");
        room.restart = "b";
        io.to(room.white.id).emit("restart_request");
      }
    }
  });

  // same as restart_request but for switching sides
  socket.on("switch_request", () => {
    console.log("switch request");
    var room = rooms.find((room) => room.name === roomNameSocket);
    if (socket.id === room.white.id) {
      room.switch = "w";
      io.to(room.black.id).emit("switch_request");
    }
    if (socket.id === room.black.id) {
      room.switch = "b";
      io.to(room.white.id).emit("switch_request");
    }
    io.to(room.name).emit("room_status", room);
  });

  socket.on("switch_grant", () => {
    var room = rooms.find((room) => room.name === roomNameSocket);
    if (
      (room.switch == "w" && socket.id == room.black.id) ||
      (room.switch == "b" && socket.id == room.white.id)
    ) {
      console.log("switching sides");
      room.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      var white = room.white;
      room.white = room.black;
      room.black = white;
      room.switch = "";
      io.to(room.white.id).emit("side", "w");
      io.to(room.black.id).emit("side", "b");
      io.to(room.name).emit("room_status", room);
    }
  });

  // handling user disconnection
  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (roomNameSocket) {
      // find correct room
      var room = rooms.find((room) => room.name === roomNameSocket);
      if (room.white.id === socket.id) {
        // if user is white, remove from white spot
        console.log(
          userNameSocket,
          "removed as white player from room",
          roomNameSocket
        );
        room.white = {};
      } else if (room.black.id === socket.id) {
        // if user is black, remove from black spot
        console.log(
          userNameSocket,
          "removed as black player from room",
          roomNameSocket
        );
        room.black = {};
      } else {
        // if user is spectator, remove from spectators list
        console.log(
          userNameSocket,
          "removed as spectator player from room",
          roomNameSocket
        );
        room.spectators = room.spectators.filter(
          (spectator) => spectator.id !== socket.id
        );
      }
      // send updated room information to all members of this room
      io.to(room.name).emit("room_status", room);

      // if room is empty, remove it from rooms list
      if (
        Object.keys(room.white).length === 0 &&
        Object.keys(room.black).length === 0 &&
        room.spectators.length === 0
      ) {
        console.log("room removed:", roomNameSocket);
        rooms.splice(rooms.indexOf(room), 1);
        //update everyone's room list
        io.emit("room_list", rooms);
      }
    }
  });
});

// start server
server.listen(3001, () => {
  console.log("listening on *:" + server.address().port);
});
