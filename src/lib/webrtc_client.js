import "./rtc_typedef";

export default class WebRTCClient {
  /**
   * @type {RTCPeerConnection} peer connection
   */
  peer;

  /**
   * @type {WebRTCCallbacks} callbacks
   */

  callbacks;

  /**
   * @type {string} peer id
   */
  id;

  /**
   * @type {RTCRtpSender[]} rtp sender
   */
  rtpSender = [];

  /**
   * @type {MediaStream} local media stream
   */
  localStream;

  /**
   * @type {MediaStream} remote media stream
   */
  remoteStream;

  /**
   * @type {boolean}
   */
  isRemoteVideoEnabled;

  /**
   * @type {boolean}
   */
  isRemoteAudioEnabled;

  /**
   *
   * @param {string} id
   * @param {WebRTCCallbacks} callbacks
   */
  constructor(id, callbacks) {
    this.id = id;
    this.callbacks = callbacks;
    this.peer = this.setupPeerConnection();
  }

  setupPeerConnection = () => {
    const pc_config = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    };
    const peer = new RTCPeerConnection(pc_config);
    peer.ontrack = evt => {
      this.remoteStream = evt.streams[0];
      this.callbacks.OnAddTrack(this.id, evt.streams[0]);
    };
    peer.onicecandidate = evt =>
      this.callbacks.OnCandidateCreated(this.id, evt.candidate);
    peer.oniceconnectionstatechange = () => {
      switch (peer.iceConnectionState) {
        case "failed":
        case "closed":
        case "disconnected":
          console.log("peer dissconnect");
          if (!this.peer) return;
          peer.close();
          this.peer = null;
          this.callbacks.OnDisconnected(this.id);
          break;
      }
    };

    return peer;
  };

  /**
   * @param {MediaStream} stream - localStream
   */
  addLocalStream = stream => {
    console.log(this.id, " add stream");
    this.localStream = stream;
    stream
      .getTracks()
      .forEach(track => this.rtpSender.push(this.peer.addTrack(track, stream)));
  };

  createOffer = async () => {
    console.log(this.id, " create offer...");
    try {
      const sdp = await this.peer.createOffer();
      this.peer.setLocalDescription(sdp);
      this.callbacks.OnSdpCreated(this.id, sdp);
    } catch (err) {
      console.log(err);
    }
  };

  createAnsewr = async () => {
    console.log(this.id, " create answer...");
    try {
      const sdp = await this.peer.createAnswer();
      this.peer.setLocalDescription(sdp);
      this.callbacks.OnSdpCreated(this.id, sdp);
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * @param {RTCSessionDescription} sdp - sdp
   */
  setRemoteSdp = async sdp => {
    console.log(this.id, " set remote sdp");
    try {
      await this.peer.setRemoteDescription(sdp);
      if (sdp.type == "offer") {
        this.createAnsewr();
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * @param {RTCIceCandidate} candidate - remote candidate
   */
  setRemoteCandidate = async cnadidate => {
    console.log(this.id, " set remote candidate...");
    try {
      this.peer.addIceCandidate(cnadidate);
    } catch (err) {
      console.log(err);
    }
  };

  onRemoteVideoMuted = () => (this.isRemoteVideoEnabled = false);

  onRemoteVideoUnmuted = () => (this.isRemoteVideoEnabled = true);

  onRemoteAudioMuted = () => (this.isRemoteVideoEnabled = false);

  onRemtoeAudioUnmuted = () => (this.isRemoteAudioEnabled = true);
}
