// eslint-disable-next-line no-unused-vars
import WebRTCClientsManager from "./webrtc_clients_manager";
import * as SocketIo from "socket.io-client";

export default class SignalingManager {
  /**
   * @type {WebRTCClientsManager}
   */
  webrtcClientsManager;

  /**
   * @type {SocketIOClient.Socket}
   */
  socketIo = null;

  constructor(clientsManager) {
    this.webrtcClientsManager = clientsManager;
  }

  setupWebSocket() {
    let url = location.hostname;
    if (process.env.NODE_ENV == "development") {
      url += ":3001";
    }
    this.socketIo = SocketIo(url);
    this.setupSignalingEvent();
  }

  //#region Websocket
  setupSignalingEvent = () => {
    this.socketIo.on("connect", () => {
      console.log("local socket id: ", this.socketIo.id);
      this.webrtcClientsManager.createLocalClient(this.socketIo.id);
    });
    this.socketIo.on("call", evt =>
      this.webrtcClientsManager.handleCall(evt.data.ids)
    );
    this.socketIo.on("remote-offer", evt =>
      this.webrtcClientsManager.handleRemoteOffer(evt)
    );
    this.socketIo.on("remote-answer", evt =>
      this.webrtcClientsManager.handleRemoteAnswer(evt)
    );
    this.socketIo.on("remote-candidate", evt =>
      this.webrtcClientsManager.handleRemoteCandidate(evt)
    );
    this.socketIo.on("remote-disconnected", evt =>
      this.webrtcClientsManager.handleRemoteDisconnected(evt.data.id)
    );
    this.socketIo.on("remote-media-updated", evt =>
      this.webrtcClientsManager.handleRemoteMediaUpdated(evt)
    );
  };
  //#endregion
}
