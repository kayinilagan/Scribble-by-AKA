/*
    To set up client side:
        In HTML: 		<script src="/socket.io/socket.io.js" type="text/javascript"></script>
        In client.js	var socket = io();
*/

var socket = io();


let myApp = Vue.createApp({
    data() {
        return {
            username: null,
            userList: null
        };
    },
    mounted() {
        socket.on("sendName", (dataFromServer) => {
            this.username = dataFromServer;
        });
        socket.on("sendUsers", (dataFromServer) => {
            this.userList = dataFromServer;
        });
    }
}).mount("#app");
