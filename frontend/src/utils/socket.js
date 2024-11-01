import { io } from "socket.io-client";

const socket = io("https://gapparoom-production.up.railway.app",{withCredentials:true});

export default socket;
