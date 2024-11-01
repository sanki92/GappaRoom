import { io } from "socket.io-client";

const socket = io("https://gapparoom.onrender.com/",{withCredentials:true});

export default socket;
