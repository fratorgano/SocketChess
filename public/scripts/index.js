// getting elements from html
var roomNameInput = document.getElementById("roomName");
var createRoomButton = document.getElementById("createRoomButton");

// opening socket
var socket = io();

// handle room_list event by creating a table with joinable rooms
socket.on("room_list", (roomListServer) => {
  // removing old rows
  document.getElementById("rows").textContent = "";

  // for each room add a row to the table
  for (var i = 0; i < roomListServer.length; i++) {
    //get the room
    var room = roomListServer[i];

    // create a new row with room name, white player name,
    // black player name, spectators number and join button
    var roomRow = document.createElement("tr");
    var roomName = document.createElement("td");
    roomName.innerText = room.name;
    var roomWhite = document.createElement("td");
    roomWhite.innerText = room.white.name ? room.white.name : "";
    var roomBlack = document.createElement("td");
    roomBlack.innerText = room.black.name ? room.black.name : "";
    var roomSpecators = document.createElement("td");
    roomSpecators.innerText = room.spectators.length;

    // creating join room button
    var roomButton = document.createElement("td");
    var roomJoinButton = document.createElement("button");
    roomJoinButton.textContent = "Join";
    roomJoinButton.addEventListener("click", function () {
      joinRoom(room.name);
    });

    // adding button to its cell
    roomButton.appendChild(roomJoinButton);

    // adding elements to row
    roomRow.appendChild(roomName);
    roomRow.appendChild(roomWhite);
    roomRow.appendChild(roomBlack);
    roomRow.appendChild(roomSpecators);
    roomRow.appendChild(roomButton);

    // adding row to table
    document.getElementById("rows").appendChild(roomRow);
    //roomList.appendChild(roomItem);
  }
});

// if the user doesn't have a name and a room name, can't create a room
function createRoom() {
  if (
    document.getElementById("userName").checkValidity() &&
    document.getElementById("roomName").checkValidity()
  ) {
    //console.log("creating room: ", roomNameInput.value);
    // notify the server about new room
    socket.emit("create_room", roomNameInput.value);
  }
}

// the user needs a name to join a room
function joinRoom(roomName) {
  if (document.getElementById("userName").checkValidity()) {
    //console.log("moving to chess-page.html with roomName: ", roomName);

    // setting room name to pass it with form to chess-page.html
    roomNameInput.value = roomName;
    // submit form
    document.getElementById("form").submit();
  } else {
    document.getElementById("userName").focus();
  }
}
