var socket = io();
var host_name = document.location.hostname;
var countdownInterval;
console.log("connecting to host: ", host_name);
var mycanvas = document.getElementById("video-canvas");
    var player = new JSMpeg.Player("ws://" + host_name + ":8084", {canvas: mycanvas});
    //Connect to the server via websocket
socket.on("video_uri", (uri) => {
    console.log("video_uri: " + uri);
    var mycanvas = document.getElementById("video-canvas");
        var player = new JSMpeg.Player(uri, {canvas: mycanvas});
});

socket.on("playlist", (data) => {
    //const playlist = data.split(',');
    console.log("tlist: " + data);
    var t = "";
    for (var i = 0; i < data.length; i++){
    var tr = "<tr>";
    if(data[i] != "---") {
        tr += "<td>"+ i +"</td>";
    } else{
        tr += "<td>&nbsp</td>";
    }
    tr += "<td>"+data[i]+"</td>";
    tr += "</tr>";
    t += tr;
    }
    console.log("tr: " + tr);
    document.getElementById("playertable").innerHTML = t;
});
var currentplayer = false;
socket.on("currentplayer", (data) => {
    if (data){
        startcountdown();
    }
})
socket.on("valid_user", (data) => {
    if (data.valid === false){
        alert(data.reason);
        document.getElementById("usernamecard").usernamecard.style.display = "";
    }
})

function toggledisplay() {
    var clawcam = document.getElementById("clawcam");
    var usernamecard = document.getElementById("usernamecard");
    var username = document.getElementById("username").value;
    
    if (username.length < 3){
        window.alert("too short username");
    } else {
        console.log("username: " + username);
        usernamecard.style.display = "none";
        socket.emit('validateusr', username);
    }

  }
document.addEventListener('keydown', (event) => {
    var name = event.key;
    var code = event.code;
    validkeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space"]
    
    if ((currentplayer) &&(validkeys.indexOf(code) > -1 )) {
        socket.emit("control", code);
        if (code === "Space"){
            currentplayer = false;
            clearInterval(countdownInterval);
            document.getElementById("countdown").style.display = "none";
            setTimeout(() => {
                document.getElementById("usernamecard").style.display = "";
            }, 7000);
        }
    }
}, false);

function startcountdown() {
    console.log("startcountdown");
    var countdown = 3;
    document.getElementById("countdown").style.left= "45%";
    document.getElementById("countdown").style.top= "20%";
    document.getElementById("countdown").innerHTML = "Ready...";
    document.getElementById("countdown").style.display = "block";
    var initial = true;
    countdownInterval = setInterval(function() {
        console.log("countdown: " + countdown);
        if ((countdown === -1) && (initial === true)) {
            currentplayer = true;
            countdown -= 1;
            document.getElementById("countdown").innerHTML = "GO!";
        }else if ((countdown < -1) && (initial === true)) {
            countdown = 18;
            initial = false;
            document.getElementById("countdown").innerHTML = "GO!";
        } else if ((countdown < 0) && (initial === false)) {
            currentplayer = false;
            clearInterval(countdownInterval);
            document.getElementById("countdown").style.display = "none";
            setTimeout(() => {
                document.getElementById("usernamecard").style.display = "";
            }, 7000);
            
        } else  if (initial === true){

            document.getElementById("countdown").innerHTML = "Start in: " + countdown;
            countdown -= 1;
        }else{
            document.getElementById("countdown").style.left= "5%";
            document.getElementById("countdown").style.top= "12%";
            document.getElementById("countdown").innerHTML = "Time left: " + countdown;
            countdown -= 1;
        }
    }, 1000);
}