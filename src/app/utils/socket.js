import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_URL;
const socket = io(`${URL}`, {
  withCredentials: true,
});

export default socket;
