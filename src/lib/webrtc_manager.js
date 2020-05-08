import * as SocketIo from "socket.io-client";
export default class WebRTCManager {
  testFlag = false;
  localStream = new MediaStream();
  socketIo = null;

  constructor() {
    this.localStream = null;
  }

  call = () => {
    console.log("env: ", process.env.NODE_ENV);
    console.log("url: ", location.protocol + "//" + location.hostname);
    if (process.env.NODE_ENV == "development") {
      this.socketIo = SocketIo("localhost:3000");
    } else {
      this.socketIo = SocketIo(location.protocol + "//" + location.hostname);
    }
    this.setupSignalingEvent();
  };

  setupSignalingEvent = () => {
    this.socketIo.on("connect", () => console.log("socket connected"));
  };

  setupLocalStream = async () => {
    this.testFlag = !this.testFlag;
    const constraints = {
      width: { min: 320, ideal: 640, max: 1280 },
      height: { ideal: 360 },
      video: true,
      audio: true,
      facingMode: { exact: "user" }
    };
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.log(err);
    }
  };
}
