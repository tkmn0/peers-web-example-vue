export default class WebRTCMediaModel {
  /**
   * @type {Boolean}
   */
  isLocal;

  /**
   * @type {MediaStream}
   */
  stream;

  /**
   * @type {string}
   */
  id;

  /**
   * @type {boolean}
   */
  isAudioMute;

  /**
   * @type {boolean}
   */
  isVideoMute;

  constructor(id, stream, isLocal, isAudioMute, isVideoMute) {
    this.id = id;
    this.stream = stream;
    this.isLocal = isLocal;
    this.isAudioMute = isAudioMute;
    this.isVideoMute = isVideoMute;
  }
}
