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
            lineColor: "#000000"
        };
    },
    methods: {
        mouseDown(event) {
            let mouseCoords = getCursorPosition(canvas, event);
            ctx.strokeStyle = this.lineColor;
            ctx.moveTo(mouseCoords.x, mouseCoords.y);
            ctx.beginPath();
            socket.emit("startDrawing", mouseCoords, this.lineColor);
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
            ctx.lineTo(mouseCoords.x, mouseCoords.y);
            ctx.stroke();
            socket.emit("drawTo", mouseCoords, this.lineColor);
            if (debug) console.log("Emit drawTo");
        },
    },
    computed: {

    },
    mounted() {
        canvas = document.getElementById("canvas");
        ctx = canvas.getContext("2d");
        socket.on("sendName", (dataFromServer) => {
            this.username = dataFromServer;
        });
        socket.on("sendUsers", (dataFromServer) => {
            this.userList = dataFromServer;
        });
        socket.on("artistStartsDrawing", (coords, color) => {
            if (debug)
                console.log("recieved artistStart");
            ctx.strokeStyle = color;
            ctx.moveTo(coords.x, coords.y);
            ctx.beginPath();
        });
        socket.on("artistDrawsTo", (coords, color) => {
            if (debug)
                console.log("recieved artistDrawTo");
            ctx.strokeStyle = color;
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        });
    }
}).mount("#app");
