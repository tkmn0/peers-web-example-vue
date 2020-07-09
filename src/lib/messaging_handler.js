import WebRTCClient from "./webrtc_client";

export default class MessagingHandler {
  /**
   * @type {WebRTCClient[]} clients
   */
  rtcClients = [];

  /**
   * @type {MediaStream}
   */
  localStream;

  /**
   * @type {WebRTCCallbacks}
   */
  webrtcCallbacks;

  /**
   * @param {WebRTCClient[]} clients
   */
  constructor(clients) {
    this.rtcClients = clients;
  }

  setupStream = stream => {
    this.localStream = stream;
  };

  setupCallbacks = callbacks => {
    this.webrtcCallbacks = callbacks;
  };

  handleCall = ids => {
    console.log("handle call");
    ids.forEach(id => {
      const rtcClient = new WebRTCClient(id, this.webrtcCallbacks, false);
      this.rtcClients.push(rtcClient);
      console.log(this.localStream);
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

  /**
   * @param {MediaStatusMessage} message
   */
  handleRemoteMediaUpdated = message => {
    const remoteClient = this.rtcClients.find(
      client => client.id == message.data.id
    );
    if (remoteClient) remoteClient.onRemoteMediaStatusUpdated(message);
  };
}
