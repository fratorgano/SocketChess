var roomNameInput = document.getElementById("roomName");
var createRoomButton = document.getElementById("createRoomButton");
var socket = io();

socket.on("room_list", (roomListServer) => {
  document.getElementById("rows").textContent = "";
  //roomList.innerHTML = "";
  for (var i = 0; i < roomListServer.length; i++) {
    var room = roomListServer[i];
    console.log("room: ", room);

    var roomRow = document.createElement("tr");
    var roomName = document.createElement("td");
    roomName.innerText = room.name;
    var roomWhite = document.createElement("td");
    roomWhite.innerText = room.white.name ? room.white.name : "";
    var roomBlack = document.createElement("td");
    roomBlack.innerText = room.black.name ? room.black.name : "";
    var roomSpecators = document.createElement("td");
    roomSpecators.innerText = room.spectators.length;

    var roomButton = document.createElement("td");
    var roomJoinButton = document.createElement("button");
    roomJoinButton.textContent = "Join";
    roomJoinButton.addEventListener("click", function () {
      joinRoom(room.name);
    });
    roomButton.appendChild(roomJoinButton);
    roomRow.appendChild(roomName);
    roomRow.appendChild(roomWhite);
    roomRow.appendChild(roomBlack);
    roomRow.appendChild(roomSpecators);
    roomRow.appendChild(roomButton);
    document.getElementById("rows").appendChild(roomRow);
    //roomList.appendChild(roomItem);
  }
});

function createRoom() {
  if (
    document.getElementById("userName").checkValidity() &&
    document.getElementById("roomName").checkValidity()
  ) {
    console.log("creating room: ", roomNameInput.value);
    socket.emit("create_room", roomNameInput.value);
  }
}
function joinRoom(roomName) {
  if (document.getElementById("userName").checkValidity()) {
    console.log("moving to chess-page.html with roomName: ", roomName);
    roomNameInput.value = roomName;
    document.getElementById("form").submit();
  } else {
    document.getElementById("userName").focus();
  }
}
