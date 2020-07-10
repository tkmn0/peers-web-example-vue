// eslint-disable-next-line no-unused-vars
import SignalingManager from "./signaling_manager";
// eslint-disable-next-line no-unused-vars
import WebRTCClientsManager from "./webrtc_clients_manager";

export default class WebRTCCallbackManager {
  /**
   * @type {SignalingManager}
   */
  signalingManager;

  /**
   * @type {WebRTCClientsManager}
   */
  clientsManager;

  /**
   * @type {WebRTCCallbacks}
   */
  webrtcCallbacks = {};

  constructor(signalingManager, clientsManager) {
    this.signalingManager = signalingManager;
    this.clientsManager = clientsManager;
    this.webrtcCallbacks.OnSdpCreated = this.onSdpCreated;
    this.webrtcCallbacks.OnCandidateCreated = this.onCandidateCreated;
    this.webrtcCallbacks.OnAddTrack = this.onAddTrack;
    this.webrtcCallbacks.OnDisconnected = this.onDisconnected;
  }
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
    if (this.clientsManager.rtcClients) {
      this.clientsManager.rtcClients = this.clientsManager.rtcClients.filter(
        x => x.id !== id
      );
    }
  };

  //#endregion
}
