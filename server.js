const e = require("cors");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + "/public"));
app.use(
  express.static(__dirname + "/node_modules/@chrisoakman/chessboardjs/dist/")
);
app.use(express.static(__dirname + "/node_modules/chess.js/"));

app.get("/", (_req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/chess", (req, res) => {
  if (rooms.find((room) => room.name === req.query.roomName)) {
    res.sendFile(__dirname + "/public/chess-page.html");
  } else {
    res.redirect("/");
  }
});

var rooms = [];

io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("room_list", rooms);
  var roomNameSocket = "";
  var userNameSocket = "";

  socket.on("create_room", (name) => {
    //check if rooms contains a room with name name
    if (rooms.find((room) => room.name === name)) {
      console.log("room already exists:", name);
      return;
    }
    console.log("creating room:", name);
    rooms.push({
      name: name,
      white: {},
      black: {},
      spectators: [],
      fen: "",
    });
  });

  socket.on("join_room", (name, userName) => {
    console.log(userName, "is joining room", name);
    var room = rooms.find((room) => room.name === name);
    if (room) {
      socket.join(name);
      if (Object.keys(room.white).length === 0) {
        room.white.id = socket.id;
        room.white.name = userName;
        socket.emit("side", "w");
      } else if (Object.keys(room.black).length === 0) {
        room.black.id = socket.id;
        room.black.name = userName;
        socket.emit("side", "b");
      } else {
        room.spectators.push({ name: userName, id: socket.id });
        socket.emit("side", "s");
      }
      roomNameSocket = room.name;
      userNameSocket = userName;
    }
    io.to(room.name).emit("room_status", room);

    //update everyone's room list
    io.emit("room_list", rooms);
  });

  socket.on("move", (source, target, game) => {
    var room = rooms.find((room) => room.name === roomNameSocket);
    room.fen = game;
    socket.to(roomNameSocket).emit("move", source, target);
    io.to(room.name).emit("room_status", room);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    if (roomNameSocket) {
      var room = rooms.find((room) => room.name === roomNameSocket);
      if (room.white.id === socket.id) {
        console.log(
          userNameSocket,
          "removed as white player from room",
          roomNameSocket
        );
        room.white = {};
      } else if (room.black.id === socket.id) {
        console.log(
          userNameSocket,
          "removed as black player from room",
          roomNameSocket
        );
        room.black = {};
      } else {
        console.log(
          userNameSocket,
          "removed as spectator player from room",
          roomNameSocket
        );
        room.spectators = room.spectators.filter(
          (spectator) => spectator.id !== socket.id
        );
      }
      io.to(room.name).emit("room_status", room);

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

  /* io.emit("connection");

  if (userList.length == 1) {
    socket.emit("side", "w");
  } else if (userList.length == 2) {
    socket.emit("side", "b");
  } else {
    socket.emit("side", "s");
  }

  socket.emit("game_status", gameStatus);

  

  socket.on("disconnect", () => {
    console.log("user disconnected");
    userList.splice(userList.indexOf(socket.id), 1);
  }); */
});

server.listen(3001, () => {
  console.log("listening on *:" + server.address().port);
});
