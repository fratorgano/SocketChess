# [SocketChess](https://chess.fratorgano.me/)
Small Node.js and Socket.io project that allows you play chess with your friends online. <br/>
This project was devolped on Node.js 16.10 but is currently deployed on 14.17.6. <br/>
Feel free to contribute! <br/>
You can play with it here: [chess.fratorgano.me](https://chess.fratorgano.me/)

## Current features
* Drag and drop to move pieces
* See possible moves when hovering over a piece
* Allow only legal moves
* Restart game, switch sides (both players need to agree)
* Show last move
* White/Dark mode

## Try it
If you want to try it on your local machine, you just need to run some simple commands
1. Either download the repo or clone it (git clone https://github.com/fratorgano/SocketChess/)
1. Go to the folder you cloned it to
1. Run the following commands
    1. npm install (Which install all the modules needed, it shouldn't fail but if it does, just run it again)
    1. npm start (Starts the server on localhost:3001)

## Dependencies/Modules Used
### Server-side
* [Node.js](https://github.com/nodejs/node) - Javascript runtime
* [Express](https://github.com/expressjs/express) - Web Framework
* [chess.js](https://github.com/jhlywa/chess.js) - Library for chess moves validation/generation

### Client-side
* [chess.js](https://github.com/jhlywa/chess.js) - Library for chess moves validation/generation
* [chessboard.js](https://github.com/oakmac/chessboardjs) - JavaScript chessboard component

## License
SocketChess is released under the MIT License.
