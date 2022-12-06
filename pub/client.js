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
            lineSize: 3,
            word: null,
            wordLength: 0,
            guess: "",
            correct: false,
            timeLeft: "",
            timeLimit: 0
        };
    },
    methods: {
        mouseDown(event) {
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
            if (this.guess == this.word) {
                this.correct = true;
            } else {
                this.correct = false;
            }
        },
        setTimeLeft() {
            this.timeLeft = (this.timeLimit - new Date().getTime()) / 1000.0;
            if (this.timeLeft <= 0 && this.word == null) this.timeLeft = "Please wait games are 40 seconds long";
            else if (this.timeLeft <= 0) this.timeLeft = "Times Up!";
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
        socket.on("newWord", (recievedWord, timer) => {
            console.log("recieved newWord: " + recievedWord);
            this.word = recievedWord;
            this.guess = "";
            this.wordLength = recievedWord.length;
            this.timeLimit = (new Date()).getTime() + 1000 * timer; // finds ending time in milliseconds
        });
        setInterval(this.setTimeLeft, 100);
    }
}).mount("#app");
