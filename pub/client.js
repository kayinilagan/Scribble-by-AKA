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
            x: null,
            y: null,
            type: null,
            canvas: null,
            ctx: null
        };
    },
    methods: {
        mouseDown(event) {
            let mouseCoords = getCursorPosition(canvas, event);
            console.log(event.type);
            console.log(mouseCoords);
            ctx.moveTo(mouseCoords.x, mouseCoords.y);
            ctx.beginPath();
            socket.emit("startDrawing", mouseCoords);
            console.log("Emit startDrawing");
        },
        mouseMove(event) {
            if (event.buttons !== 1) return;
            let mouseCoords = getCursorPosition(canvas, event);
            ctx.lineTo(mouseCoords.x, mouseCoords.y);
            ctx.stroke();
            socket.emit("drawTo", mouseCoords);
            console.log("Emit drawTo");
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
        socket.on("artistStartsDrawing", (coords) => {
            console.log("recieved artistStart");
            ctx.moveTo(coords.x, coords.y);
            ctx.beginPath();
        });
        socket.on("artistDrawsTo", (coords) => {
            console.log("recieved artistDrawTo");
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
        });
    }
}).mount("#app");
