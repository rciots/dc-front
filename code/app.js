const express = require('express');
const app = express();
const http = require('http');
var path = require('path');
var websocket = require("ws");
const server = http.createServer(app);
const { Server } = require("socket.io");
const socketcli = require("socket.io-client");
const port = process.env.PORT || 8085;
const cliport = process.env.CLI_PORT || 8083;
var websocket_stream_port = process.env.WS_STREAM_PORT || 8084;
const video_route = process.env.VIDEO_ROUTE || "localhost";
const video_uri = "wss://" + video_route;
const socket_manager = process.env.SOCKET_MANAGER_SVC || "localhost";
const ioclient = new socketcli.connect("http://" + socket_manager + ":" + cliport, {
  reconnection: true,
  reconnectionDelay: 500
});
var streaming_websocket = new websocket.Server({port: websocket_stream_port, perMessageDeflate: false});
streaming_websocket.broadcast = function(data){
	streaming_websocket.clients.forEach(function each(client){
        if (client.readyState === websocket.OPEN){
            client.send(data);
        }
	});
};
const io = new Server(server);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
ioclient.on('video', (data) => {
  streaming_websocket.broadcast(data);
});
var playlist = ["---"];
var socketlist = {};
var currentplayer;
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => {
  ioclient.emit("user_on", true);
  console.log('a user connected');
  socket.emit("video_uri", video_uri );
  socket.emit("playlist", playlist);
  //socket.emit("playlist",playlist);
  socket.on('disconnect', () => {
    console.log("username disconnected: " + socket.username);
    if (!io.engine.clientsCount > 0) {
      ioclient.emit("user_on", false);
    }
    if (socket.username) {
      updateusrlist("del", socket.username);
    }
  });
  socket.on('validateusr',(usr) => {

    console.log('user ' + usr + ' connected');
    const newuser = playlist.find(user => user == usr);
    if ((/^[a-zA-Z0-9]+$/.test(usr)) && (!newuser)){
      console.log("user valid: " + usr);
      socketlist[usr] = socket;
      socket.username = usr;
      updateusrlist("add", usr);

      socket.emit("valid_user", {"valid": true, "username": usr});
      socket.on('control',(key, act) => {
        if (currentplayer === usr){
          console.log(usr + " send: " + key);
          ioclient.emit("control", key, act);
          if (key === "Space"){
            currentplayer = null;
            socket.emit('endgame', true);
            socket.removeAllListeners('control');
            clearTimeout(timeoutgame);
            setTimeout(() => {
              updateusrlist("del", usr);
            }, 7000);
            
          }
        }
      });
    }else{
      socket.emit("valid_user", {"valid": false, "username": usr, "reason": "user '" + usr + "' not valid or in use."});
      console.log("user not valid: " + usr);
    }
  });
});
var updateusrlist = function (verb,usr) {
  if (verb === "add"){
    if (playlist[0] === "---") {
      playlist.splice(0, 1);
    }
    playlist.push(usr);
    if (playlist.length === 1) {
      changeplayer(usr);
    }
  }else if (verb === "del") {
    if (playlist[0] === usr){
      currentplayer = null;
      if (playlist[1]){
        changeplayer(playlist[1]);
      }
    }
    for( var i = 0; i < playlist.length; i++){ 
    
      if ( playlist[i] === usr) { 
          playlist.splice(i, 1); 
          if (playlist.length === 0) {
            playlist.push("---");
            changeplayer();
          }
      }
    }
  }
  console.log("playlist: " + playlist);
  io.emit("playlist", playlist);
};

var changeplayer = function(usr) {
  console.log("changeplayer");
  if (usr == null) {
    console.log("nobody to play");
  };
  if ((playlist[0] === "---") || (usr === null)) {
    currentplayer = null;
  } else {
    console.log("enable player: " + usr );

    enableplayer(usr);
  };
  
};
var timeoutplay;
var timeoutgame;
var enableplayer = function(usr) {
  socketlist[usr].emit('currentplayer', true);
  timeoutplay = setTimeout(() => {
    currentplayer = usr;
    console.log("currentplayer: " + currentplayer);
    timeoutgame = setTimeout(() => {
      ioclient.emit("control", "Space");
      currentplayer = null;
      socketlist[usr].emit('endgame', true);
      socketlist[usr].removeAllListeners('control');
      setTimeout(() => {
        updateusrlist("del", usr);
      }, 7000);
    }, 22000);
  }, 3000);
}

server.listen(port, () => {
  console.log('listening on *:' + port);
});