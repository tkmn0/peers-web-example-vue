/**
 * @callback OnSdpCreated
 * @param {string} id - client id
 * @param {RTCSessionDescription} sdp - local sdp
 */

/**
 * @callback OnCandidateCreated
 * @param {string} id - client id
 * @param {RTCIceCandidate} candidate - local candidate
 */

/**
 * @callback OnAddTrack
 * @param {string} id - client id
 * @param {MediaStream} stream - remote stream
 */

/**
 * @callback OnRemoveTrack
 * @param {string} id - client id
 */

/**
 * @callback OnDisconnected
 * @param {string} id - client id
 */

/**
 * @typedef {Object} WebRTCCallbacks
 * @property {OnSdpCreated} OnSdpCreated
 * @property {OnCandidateCreated} OnCandidateCreated
 * @property {OnAddTrack} OnAddTrack
 * @property {OnRemoveTrack} OnRemoveTrack
 * @property {OnDisconnected} OnDisconnected
 */

/**
 * @typedef {Object} SignalingMessage
 * @property {DataSdp} data
 */

/**
 * @typedef {Object} CandidateMessage
 * @property {DataCandidate} data
 */

/**
 * @typedef {Object} DataSdp
 * @property {Transaction} id
 * @property {string} sdp
 */

/**
 * @typedef {Object} DataCandidate
 * @property {Transaction} id
 * @property {string} candidate
 */

/**
 * @typedef {Object} Transaction
 * @property {string} origin
 * @property {string} destination
 */
