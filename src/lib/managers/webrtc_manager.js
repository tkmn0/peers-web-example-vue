import "../rtc_typedef";
// eslint-disable-next-line no-unused-vars
import WebRTCMediaModel from "../webrtc_media_model";
import WebRTCClientsManager from "./webrtc_clients_manager";
import SignalingManager from "./signaling_manager";

export default class WebRTCManager {
  /**
   * @type {MediaStream}
   */
  localStream = null;

  /**
   * @type {WebRTCCallbacks}
   */
  webrtcCallbacks = {};

  /**
   * @type {WebRTCClientsManager}
   */
  webrtcClientsManager;
  /**
   * @type {SignalingManager}
   */
  signalingManager;

  mediaModels = () =>
    this.webrtcClientsManager.rtcClients.map(x => x.mediaModel);
  roomJoined = () => this.roomId != "";
  roomId = "";

  constructor() {
    this.webrtcCallbacks.OnSdpCreated = this.onSdpCreated;
    this.webrtcCallbacks.OnCandidateCreated = this.onCandidateCreated;
    this.webrtcCallbacks.OnAddTrack = this.onAddTrack;
    this.webrtcCallbacks.OnDisconnected = this.onDisconnected;
    this.webrtcClientsManager = new WebRTCClientsManager();
    this.webrtcClientsManager.setupCallbacks(this.webrtcCallbacks);

    this.signalingManager = new SignalingManager(this.webrtcClientsManager);
    this.signalingManager.setupWebSocket();
  }

  destroy() {
    if (this.signalingManager.socketIo)
      this.signalingManager.socketIo.disconnect();
    this.signalingManager.socketIo = null;
    this.webrtcClientsManager.rtcClients = null;
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
      this.webrtcClientsManager.localClient.addLocalStream(this.localStream);
      this.webrtcClientsManager.setupStream(this.localStream);
    } catch (err) {
      console.log(err);
    }
  };

  //#region UI event
  joinRoom = roomId => {
    this.signalingManager.socketIo.emit(
      "joinRoom",
      {
        data: {
          roomId: roomId
        }
      },
      evt => {
        console.log("room joined");
        if (evt)
          this.updateMediaStatus(
            this.webrtcClientsManager.localClient.mediaModel
          );
      }
    );
    this.roomId = roomId;
  };

  createRoom = () => {
    this.signalingManager.socketIo.emit("createRoom", "", evt => {
      this.roomId = evt.data.roomId;
      console.log("room created: ", this.roomId);
      this.updateMediaStatus(this.webrtcClientsManager.localClient.mediaModel);
    });
  };

  toggleLocalAudioMute = () => {
    this.webrtcClientsManager.localClient.toggleLocalAudioMute();
    this.updateMediaStatus(this.webrtcClientsManager.localClient.mediaModel);
  };

  toggleLocalVideoMute = () => {
    this.webrtcClientsManager.localClient.toggleLocalVideoMute();
    this.updateMediaStatus(this.webrtcClientsManager.localClient.mediaModel);
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
          origin: this.signalingManager.socketIo.id,
          destination: id
        },
        sdp: sdp.sdp
      }
    };
    this.signalingManager.socketIo.emit(sdp.type, signalingMessage);
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
          origin: this.signalingManager.socketIo.id,
          destination: id
        },
        candidate: candidate.toJSON()
      }
    };

    this.signalingManager.socketIo.emit("candidate", candidateMessage);
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
    if (this.webrtcClientsManager.rtcClients) {
      this.webrtcClientsManager.rtcClients = this.webrtcClientsManager.rtcClients.filter(
        x => x.id !== id
      );
    }
  };

  //#endregion

  //#region MediaStaus
  /**
   * @param {WebRTCMediaModel} mediaModel
   */
  updateMediaStatus = mediaModel => {
    if (this.signalingManager.socketIo.connected) {
      const mediaMessage = {
        data: {
          id: this.signalingManager.socketIo.id,
          isAudioMute: mediaModel.isAudioMute,
          isVideoMute: mediaModel.isVideoMute
        }
      };
      this.signalingManager.socketIo.emit("mediaUpdated", mediaMessage);
    }
  };
  //#endregion
}
