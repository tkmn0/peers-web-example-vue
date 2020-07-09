import * as SocketIo from "socket.io-client";
import WebRTCClient from "./webrtc_client";
import "./rtc_typedef";
// eslint-disable-next-line no-unused-vars
import WebRTCMediaModel from "./webrtc_media_model";
import MessagingHandler from "./messaging_handler";

export default class WebRTCManager {
  /**
   * @type {MediaStream}
   */
  localStream = null;

  /**
   * @type {SocketIOClient.Socket}
   */
  socketIo = null;

  /**
   * @type {WebRTCClient[]}
   */
  rtcClients = [];

  /**
   * @type {WebRTCCallbacks}
   */
  webrtcCallbacks = {};

  /**
   * @type {MessagingHandler}
   */
  messagingHandler = new MessagingHandler(this.rtcClients, this.localStream);

  mediaModels = () => this.rtcClients.map(x => x.mediaModel);
  roomJoined = () => this.roomId != "";
  roomId = "";

  constructor() {
    this.webrtcCallbacks.OnSdpCreated = this.onSdpCreated;
    this.webrtcCallbacks.OnCandidateCreated = this.onCandidateCreated;
    this.webrtcCallbacks.OnAddTrack = this.onAddTrack;
    this.webrtcCallbacks.OnDisconnected = this.onDisconnected;
    this.messagingHandler.setupCallbacks(this.webrtcCallbacks);
    this.setupWebsocket();
  }

  destroy() {
    if (this.socketIo) this.socketIo.disconnect();
    this.socketIo = null;
    this.rtcClients = null;
    console.log("webrtc manager destroyed...");
  }

  setupLocalStream = async () => {
    this.testFlag = !this.testFlag;
    const constraints = {
      width: { min: 320, ideal: 320, max: 640 },
      height: { ideal: 360 },
      video: true,
      audio: true,
      facingMode: { exact: "user" }
    };
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localClient.addLocalStream(this.localStream);
      this.messagingHandler.setupStream(this.localStream);
    } catch (err) {
      console.log(err);
    }
  };

  setupWebsocket = () => {
    let url = location.hostname;
    if (process.env.NODE_ENV == "development") {
      url += ":3001";
    }
    this.socketIo = SocketIo(url);
    this.setupSignalingEvent();
  };

  //#region UI event
  joinRoom = roomId => {
    this.socketIo.emit(
      "joinRoom",
      {
        data: {
          roomId: roomId
        }
      },
      evt => {
        console.log("room joined");
        if (evt) this.updateMediaStatus(this.localClient.mediaModel);
      }
    );
    this.roomId = roomId;
  };

  createRoom = () => {
    this.socketIo.emit("createRoom", "", evt => {
      this.roomId = evt.data.roomId;
      console.log("room created: ", this.roomId);
      this.updateMediaStatus(this.localClient.mediaModel);
    });
  };

  toggleLocalAudioMute = () => {
    this.localClient.toggleLocalAudioMute();
    this.updateMediaStatus(this.localClient.mediaModel);
  };

  toggleLocalVideoMute = () => {
    this.localClient.toggleLocalVideoMute();
    this.updateMediaStatus(this.localClient.mediaModel);
  };
  //#endregion

  //#region Websocket
  setupSignalingEvent = () => {
    this.socketIo.on("connect", () => {
      console.log("local socket id: ", this.socketIo.id);
      this.localClient = new WebRTCClient(this.socketIo.id, null, true);
      this.rtcClients.push(this.localClient);
    });
    this.socketIo.on("call", evt =>
      this.messagingHandler.handleCall(evt.data.ids)
    );
    this.socketIo.on("remote-offer", evt =>
      this.messagingHandler.handleRemoteOffer(evt)
    );
    this.socketIo.on("remote-answer", evt =>
      this.messagingHandler.handleRemoteAnswer(evt)
    );
    this.socketIo.on("remote-candidate", evt =>
      this.messagingHandler.handleRemoteCandidate(evt)
    );
    this.socketIo.on("remote-disconnected", evt =>
      this.messagingHandler.handleRemoteDisconnected(evt.data.id)
    );
    this.socketIo.on("remote-media-updated", evt =>
      this.messagingHandler.handleRemoteMediaUpdated(evt)
    );
  };
  //#endregion

  //#region WebRTC Callbacks
  /**
   * @type {OnSdpCreated}
   */
  onSdpCreated = (id, sdp) => {
    /**
     * @type {SignalingMessage}
     */
    const signalingMessage = {
      data: {
        id: {
          origin: this.socketIo.id,
          destination: id
        },
        sdp: sdp.sdp
      }
    };
    this.socketIo.emit(sdp.type, signalingMessage);
  };

  /**
   * @type {OnCandidateCreated}
   */
  onCandidateCreated = (id, candidate) => {
    if (!candidate) return;
    /**
     * @type {CandidateMessage}
     */
    const candidateMessage = {
      data: {
        id: {
          origin: this.socketIo.id,
          destination: id
        },
        candidate: candidate.toJSON()
      }
    };

    this.socketIo.emit("candidate", candidateMessage);
  };

  /**
   * @type {OnAddTrack}
   */
  onAddTrack = (id, stream) => {
    console.log(id, " - on add track: ", stream.id);
  };

  /**
   * @type {OnDisconnected}
   */
  onDisconnected = id => {
    if (this.rtcClients)
      (this.rtcClients = this.rtcClients.filter(x => x.id !== id));
  };

  //#endregion

  //#region MediaStaus
  /**
   * @param {WebRTCMediaModel} mediaModel
   */
  updateMediaStatus = mediaModel => {
    if (this.socketIo.connected) {
      const mediaMessage = {
        data: {
          id: this.socketIo.id,
          isAudioMute: mediaModel.isAudioMute,
          isVideoMute: mediaModel.isVideoMute
        }
      };
      this.socketIo.emit("mediaUpdated", mediaMessage);
    }
  };
  //#endregion
}
