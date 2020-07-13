import "../rtc_typedef";
// eslint-disable-next-line no-unused-vars
import WebRTCMediaModel from "../webrtc_media_model";
import WebRTCClientsManager from "./webrtc_clients_manager";
import SignalingManager from "./signaling_manager";
import WebRTCCallbackManager from "./webrtc_callback_manager";

export default class WebRTCManager {
  /**
   * @type {MediaStream}
   */
  localStream = null;

  /**
   * @type {WebRTCClientsManager}
   */
  webrtcClientsManager;

  /**
   * @type {SignalingManager}
   */
  signalingManager;

  /**
   * @type {WebRTCCallbackManager}
   */
  webRTCCallbackManager;

  mediaModels = () =>
    this.webrtcClientsManager.rtcClients.map(x => x.mediaModel);
  roomJoined = () => this.roomId != "";
  roomId = "";

  constructor() {
    this.webrtcClientsManager = new WebRTCClientsManager();
    this.signalingManager = new SignalingManager(this.webrtcClientsManager);
    this.webRTCCallbackManager = new WebRTCCallbackManager(
      this.signalingManager,
      this.webrtcClientsManager
    );

    this.webrtcClientsManager.setupCallbacks(
      this.webRTCCallbackManager.webrtcCallbacks
    );
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
        if (evt) {
          this.roomId = evt.data.roomId;
          console.log("room joined");
          this.signalingManager.emitLocalMediaStatus();
          this.signalingManager.callToOthers(this.roomId);
        }
      }
    );
  };

  toggleLocalAudioMute = () => {
    this.webrtcClientsManager.localClient.toggleLocalAudioMute();
  };

  toggleLocalVideoMute = () => {
    this.webrtcClientsManager.localClient.toggleLocalVideoMute();
  };
  //#endregion
}
