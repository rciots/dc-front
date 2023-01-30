var socket = io();
var host_name = document.location.hostname;
var countdownInterval;
var validkeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Space"];
if (navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i) 
                || navigator.userAgent.match(/iPad/i) 
                || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/Windows Phone/i)) {
                document.getElementById("joyDiv").style.top = "82%";
            } else {
}
console.log("connecting to host: ", host_name);
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
        document.getElementById("usernamecard").usernamecard.style.visibility = "visible";
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
        usernamecard.style.visibility = "hidden";
        socket.emit('validateusr', username);
    }

  }
document.addEventListener('keydown', (event) => {
    var code = event.code;    
    if ((currentplayer) &&(validkeys.indexOf(code) > -1 )) {
        socket.emit("control", code, "down");
        if (code === "Space"){
            launchClaw();
        }
    }
}, false);

document.addEventListener('keyup', (event) => {
    var code = event.code;
    
    if ((currentplayer) &&(validkeys.indexOf(code) > -1 )) {
        socket.emit("control", code, "up");
    }
}, false);

function launchClaw(){
    currentplayer = false;
    clearInterval(countdownInterval);
    socket.emit("control", "Space", "down");
    currentplayer = false;
    document.getElementById("launch").disabled = true;
    document.getElementById("countdown").style.visibility = "hidden";
    setTimeout(() => {
        document.getElementById("usernamecard").style.visibility = "visible";
    }, 7000);
}


function startcountdown() {
    console.log("startcountdown");
    var countdown = 3;
    document.getElementById("countdown").style.left= "45%";
    document.getElementById("countdown").style.top= "20%";
    document.getElementById("countdown").innerHTML = "Ready...";
    document.getElementById("countdown").style.visibility = "visible";
    var initial = true;
    var played = false;
        var joystickCatch = setInterval(function(){ 
            
            if (currentplayer == true) {
                played = true;
                var direction=joy.GetDir();
                if (["N","NW","NE"].includes(direction)) {
                    socket.emit("control", "ArrowUp");
                    console.log("Up");
                } else if (["S","SW","SE"].includes(direction)) {
                    socket.emit("control", "ArrowDown");
                    console.log("Down");
                }
                if (["E","NE","SE"].includes(direction)) {
                    socket.emit("control", "ArrowRight");
                    console.log("Right");
                } else if (["W","NW","SW"].includes(direction)) {
                    socket.emit("control", "ArrowLeft");
                    console.log("Left");
                }
            } else if ((currentplayer ==false ) && (played == true)) {
                clearInterval(joystickCatch);
            }
        }, 20);
    countdownInterval = setInterval(function() {
        console.log("countdown: " + countdown);
        if ((countdown === -1) && (initial === true)) {
            currentplayer = true;
            countdown -= 1;
            document.getElementById("countdown").innerHTML = "GO!";
            document.getElementById("launch").disabled = false;
        }else if ((countdown < -1) && (initial === true)) {
            countdown = 18;
            initial = false;
            document.getElementById("countdown").innerHTML = "GO!";
        } else if ((countdown < 0) && (initial === false)) {
            launchClaw();
            
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
var joy = new JoyStick('joyDiv');
