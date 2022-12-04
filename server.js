var express = require("express");
var app = express();
var http = require("http");
const { start } = require("repl");
var server = http.Server(app);
var socketio = require("socket.io");
var io = socketio(server);
var sctx;
app.use(express.static("pub"));

var wordList = require("./wordList");
var os = require('os');

//TODO: Call some REST API from the server side to get the random quote.
//TODO: Make it so they can acutally supply their own username.


let adjectives = ["Super", "Crazy", "Strong", "Wild", "Master"];
let noun = ["Willy", "Programmer", "Bicyclist", "Clown", "Tortoise"];
let emoji = ["😂", "❤", "😍", "🤣", "😊", "🙏", "💕", "😭"];
function randomFromArray(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

function randomUser() {
    return randomFromArray(adjectives) + randomFromArray(noun) + randomFromArray(emoji);
}

function randomWord() {
    return randomFromArray(wordList.getWordList());
}

//Returns an array of objects describing the users
function cleanUserList() {
    let ret = [];
    for (i in userList) ret.push(userList[i]);
    return ret;
}

//List of all users connected - each is associated with an object with these properties:
//username
//roundsPlayed
//roundsCorrect (where they typed in the phrase correctly before time ran out)
//roundsWon (where they were the first one to type it in correctly)
//correctThisRound (true or false)
//wonThisRound (true or false)
let userList = {};
let currentWord = null;
let someoneOne = false;

//Every time a client connects (visits the page) this function(socket) {...} gets executed.
//The socket is a different object each time a new client connects.
io.on("connection", function (socket) {
    socket.on("disconnect", function () {
        //This particular socket connection was terminated (probably the client went to a different page
        //or closed their browser).
        console.log(userList[socket.id].username + " disconnected.");
        delete userList[socket.id];
        io.emit("sendUsers", cleanUserList());
    });

    socket.on("gotIt", function () {
        if (currentQuote != null) { //only check it if we are in a round.
            userList[socket.id].correctThisRound = true;
            if (!someoneOne) { //if this is the first person to get it, give them credit.
                userList[socket.id].wonThisRound = true;
                someoneOne = true;
            }
            io.emit("sendUsers", cleanUserList());
        }
    });


    //Update internal bookeeping to have this client in our list
    userList[socket.id] = {
        username: randomUser(),
        roundsPlayed: null,
        roundsCorrect: null,
        roundsWon: null,
        correctThisRound: false,
        wonThisRound: false
    };

    console.log(userList[socket.id].username + " connected with id " + socket.id);

    socket.emit("sendName", userList[socket.id].username); //Tell this client their name.
    io.emit("sendUsers", cleanUserList()); //io.emit() broadcasts to all sockets that are connected!
});

function startGame() {
    someoneOne = false;
    for (i in userList) {
        //If this is their first round (they actually didn't play last round), start them out fresh
        if (userList[i].roundsPlayed == null) {
            userList[i].roundsPlayed = 0;
            userList[i].roundsCorrect = 0;
            userList[i].roundsWon = 0;
        }

        //Clear out their variables for this next round
        userList[i].correctThisRound = false;
        userList[i].wonThisRound = false;
    }
    /*
        //actually start the game
        currentQuote = randomFromArray(quoteList);
        let secondsToAnswer = currentQuote.length / 2; //Allow them 4 characters per second to get it.
        io.emit("newQuote", currentQuote, secondsToAnswer);
    
        setTimeout(gameOver, secondsToAnswer * 1000);
    */

    currentWord = randomWord();
    console.log(currentWord);

}

function gameOver() {
    //update scores
    for (i in userList) {
        if (userList[i].roundsPlayed != null) { //if they actually participated in this round that just finished...
            userList[i].roundsPlayed++;
            if (userList[i].correctThisRound) userList[i].roundsCorrect++;
            if (userList[i].wonThisRound) userList[i].roundsWon++;
        }
    }
    currentQuote = null; //indicates that we are between rounds.

    //Send the game results
    io.emit("sendUsers", cleanUserList());

    //Start the next round in 5 seconds.
    setTimeout(startGame, 5000);
}

server.listen(80, function () {
    console.log("Server with socket.io is ready.");
    console.log("Connect to: http://" + os.networkInterfaces()['Wi-Fi'][1].cidr.slice(0, -3) + ":80");
    startGame();
});
