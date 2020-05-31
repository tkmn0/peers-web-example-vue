import * as SocketIo from "socket.io-client";
import WebRTCClient from "./webrtc_client";
import "./rtc_typedef";
// import WebRTCMediaModel from "./webrtc_media_model";

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
   * @type {WebRTCMediaModel[]}
   */
  mediaModels = [];

  // getModels = () => {
  //   /**
  //    * @type {WebRTCMediaModel[]}
  //    */
  //   const models = [];
  //   if (this.localClient) {
  //     models.push(
  //       new WebRTCMediaModel(
  //         this.localClient.id,
  //         this.localClient.localStream,
  //         true,
  //         this.localClient.isLocalAudioEnabled,
  //         this.localClient.isLocalVideoEnabled
  //       )
  //     );
  //   }
  //   this.rtcClients.forEach(client =>
  //     models.push(
  //       new WebRTCMediaModel(
  //         client.id,
  //         client.remoteStream,
  //         false,
  //         client.isRemoteAudioEnabled,
  //         client.isRemoteVideoEnabled
  //       )
  //     )
  //   );
  //   return models;
  // };

  roomJoined = () => this.roomId != "";
  roomId = "";

  constructor() {
    this.webrtcCallbacks.OnSdpCreated = this.onSdpCreated;
    this.webrtcCallbacks.OnCandidateCreated = this.onCandidateCreated;
    this.webrtcCallbacks.OnAddTrack = this.onAddTrack;
    this.webrtcCallbacks.OnDisconnected = this.onDisconnected;
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

  joinRoom = roomId => {
    this.socketIo.emit("joinRoom", {
      data: {
        roomId: roomId
      }
    });
    this.roomId = roomId;
  };

  createRoom = () => {
    this.socketIo.emit("createRoom", "", evt => {
      this.roomId = evt.data.roomId;
      console.log("room created: ", this.roomId);
    });
  };

  toggleLocalAudioMute = () => {
    this.localClient.toggleLocalAudioMute();
  };

  toggleLocalVideoMute = () => {
    this.localClient.toggleLocalVideoMute();
  };

  //#region Websocket
  setupSignalingEvent = () => {
    this.socketIo.on("connect", () => {
      console.log("local socket id: ", this.socketIo.id);
      this.localClient = new WebRTCClient(this.socketIo.id, null);
      this.rtcClients.push(this.localClient);
    });
    this.socketIo.on("call", evt => this.handleCall(evt.data.ids));
    this.socketIo.on("remote-offer", evt => this.handleRemoteOffer(evt));
    this.socketIo.on("remote-answer", evt => this.handleRemoteAnswer(evt));
    this.socketIo.on("remote-candidate", evt =>
      this.handleRemoteCandidate(evt)
    );
    this.socketIo.on("remote-disconnected", evt =>
      this.handleRemoteDisconnected(evt.data.id)
    );
  };

  handleCall = ids => {
    console.log("handle call");
    ids.forEach(id => {
      const rtcClient = new WebRTCClient(id, this.webrtcCallbacks);
      this.rtcClients.push(rtcClient);
      rtcClient.addLocalStream(this.localStream);
      rtcClient.createOffer();
    });
  };

  /**
   * @param {SignalingMessage} message
   */
  handleRemoteOffer = message => {
    /**
     * @param {RTCSessionDescription} sdp
     */
    const sdp = new RTCSessionDescription({
      type: "offer",
      sdp: message.data.sdp
    });

    const rtcClient = new WebRTCClient(
      message.data.id.origin,
      this.webrtcCallbacks
    );
    this.rtcClients.push(rtcClient);
    rtcClient.addLocalStream(this.localStream);
    rtcClient.setRemoteSdp(sdp);
  };

  /**
   * @param {SignalingMessage} message
   */
  handleRemoteAnswer(message) {
    /**
     * @param {RTCSessionDescription} sdp
     */
    const sdp = new RTCSessionDescription({
      type: "answer",
      sdp: message.data.sdp
    });

    const rtcClient = this.rtcClients.find(
      x => x.id === message.data.id.origin
    );

    rtcClient.setRemoteSdp(sdp);
  }

  /**
   * @param {CandidateMessage} message
   */
  handleRemoteCandidate = message => {
    const rtcClient = this.rtcClients.find(x => x.id == message.data.id.origin);
    if (!rtcClient) return;

    rtcClient.setRemoteCandidate(message.data.candidate);
  };

  /**
   * @param {string} id
   */
  handleRemoteDisconnected = id => {
    console.log("handle remote disconnected:", id);
    this.rtcClients = this.rtcClients.filter(x => x.id != id);
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
    this.rtcClients = this.rtcClients.filter(x => x.id !== id);
  };
  //#endregion
}
