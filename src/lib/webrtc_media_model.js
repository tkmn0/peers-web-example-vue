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

  constructor(id, stream, isLocal) {
    this.id = id;
    this.stream = stream;
    this.isLocal = isLocal;
  }
}
