/*
    To set up client side:
        In HTML: 		<script src="/socket.io/socket.io.js" type="text/javascript"></script>
        In client.js	var socket = io();
*/
/*
link to drawing stuff
https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse
*/

var socket = io();

let debug = false;

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x: x, y: y };
}

let myApp = Vue.createApp({
    data() {
        return {
            username: null,
            userList: null,
            canvas: null,
            ctx: null,
            lineColor: "#000000",
            lineSize: 10,
            word: null,
            wordLength: 0,
            displayWord: null,
            guess: "",
            correct: false,
            timeLeft: "",
            timeLimit: 0,
            artist: false
        };
    },
    methods: {
        mouseDown(event) {
            if (this.artist != true) {
                return;
            }
            let mouseCoords = getCursorPosition(canvas, event);
            ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineSize;
            ctx.moveTo(mouseCoords.x, mouseCoords.y);
            ctx.beginPath();
            socket.emit("startDrawing", mouseCoords, this.lineColor, this.lineSize);
            if (debug) {
                console.log(event.type);
                console.log(mouseCoords);
                console.log("Emit startDrawing");
            }
        },
        mouseMove(event) {
            if (this.artist != true) {
                return;
            }
            if (event.buttons !== 1) return;
            let mouseCoords = getCursorPosition(canvas, event);
            ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = this.lineSize;
            ctx.lineTo(mouseCoords.x, mouseCoords.y);
            ctx.stroke();
            socket.emit("drawTo", mouseCoords, this.lineColor, this.lineSize);
            if (debug) console.log("Emit drawTo");
        },
        checkGuess() {
            if (this.artist == true) {
                return;
            } else if (this.guess == this.word) {
                this.correct = true;
            } else {
                this.correct = false;
            }
        },
        setTimeLeft() {
            this.timeLeft = (this.timeLimit - new Date().getTime()) / 1000.0;
            if (this.timeLeft <= 0 && this.word == null) this.timeLeft = "Please wait rounds are 40 seconds long";
            else if (this.timeLeft <= 0) {
                this.timeLeft = "Times Up!";
                this.artist = false;
            }
            else this.timeLeft = this.timeLeft.toFixed(1) + " seconds left...";
        }
    },
    computed: {
    },
    mounted() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        ctx.lineCap = 'round';
        socket.on("sendName", (dataFromServer) => {
            this.username = dataFromServer;
        });
        socket.on("sendUsers", (dataFromServer) => {
            this.userList = dataFromServer;
        });
        socket.on("artistStartsDrawing", (coords, color, size) => {
            if (debug)
                console.log("recieved artistStart");
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.moveTo(coords.x, coords.y);
            ctx.beginPath();
        });
        socket.on("artistDrawsTo", (coords, color, size) => {
            if (debug)
                console.log("recieved artistDrawTo");
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        });
        socket.on("newWord", (recievedWord, timer, artist) => {
            const blank = "_" + String.fromCharCode(160);
            const doubleSpace = "" + String.fromCharCode(160) + String.fromCharCode(160);
            const regex = /[a-zA-z]/g;
            const spaceRegex = / /g;
            console.log("recieved newWord: " + recievedWord);
            if (artist == this.username) {
                console.log("You are the artist!");
                this.artist = true;
                this.displayWord = recievedWord;
            } else {
                console.log("You are a guesser!");
                this.artist = false;
                this.displayWord = recievedWord.replace(regex, blank).replace(spaceRegex, doubleSpace);
                console.log(this.displayWord);
            }

            this.word = recievedWord;
            this.wordLength = recievedWord.match(regex).length;
            this.guess = "";

            this.timeLimit = (new Date()).getTime() + 1000 * timer; // finds ending time in milliseconds
        });
        socket.on("clearCanvas", () => {
            console.log("recieved ClearCommand!");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        });
        setInterval(this.setTimeLeft, 100);
    }
}).mount("#app");
