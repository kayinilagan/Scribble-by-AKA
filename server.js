var express = require("express");
var app = express();
var http = require("http");
const { start } = require("repl");
var server = http.Server(app);
var socketio = require("socket.io");
var io = socketio(server);
app.use(express.static("pub"));

//On the server side, you also need to do:
//	npm install express
//	npm install socket.io



let adjectives = ["Super", "Crazy", "Strong", "Wild", "Master"];
let noun = ["Willy", "Programmer", "Bicyclist", "Clown", "Tortoise"];
let emoji = ["😂", "❤", "😍", "🤣", "😊", "🙏", "💕", "😭"];
function randomFromArray(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function randomUser() {
    return randomFromArray(adjectives) + randomFromArray(noun) + randomFromArray(emoji);
}

function cleanUserList() {
    let ret = [];
    for (i in userList) ret.push(userList[i]);
    return ret;
}

//List of all users connected:
let userList = {};


//Every time a client connects (visits the page) this function(socket) {...} gets executed.
//The socket is a different object each time a new client connects.
io.on("connection", function (socket) {
    socket.on("disconnect", function () {
        //This particular socket connection was terminated (probably the client went to a different page
        //or closed their browser).
        console.log("Somebody disconnected.");
        delete userList[socket.id];
        io.emit("sendUsers", cleanUserList());
    });

    console.log("Somebody connected " + socket.id);
    //Update internal bookeeping to have this client in our list
    userList[socket.id] = randomUser();
    console.log(userList);
    //Send a random name and emoji to that particular client (socket)
    socket.emit("sendName", userList[socket.id]);
    //Tell this client the list of people connected to this particular server.
    io.emit("sendUsers", cleanUserList()); //broadcasts to all sockets that are connected!


});

function startGame() {
    /* TODO: actually start the game */
    setTimeout(gameOver, 10000);
}

function gameOver() {
    /* TODO: actually send the game-over stuff */
    setTimeout(startGame, 2000);
}

server.listen(80, function () {
    console.log("Server with socket.io is ready.");

    startGame();
});
