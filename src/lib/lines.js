import "./rtc_typedef";
// eslint-disable-next-line no-unused-vars
import WebRTCMediaModel from "./webrtc_media_model";
import WebRTCClientsManager from "./managers/webrtc_clients_manager";
import SignalingManager from "./managers/signaling_manager";
import WebRTCCallbackManager from "./managers/webrtc_callback_manager";

export default class Lines {
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

  /**
   *
   * @param {MediaStreamConstraints} constraints
   */
  setupLocalStream = async constraints => {
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