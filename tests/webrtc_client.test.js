import WebRTCClient from "../src/lib/webrtc_client";

class Test {
  message = "";

  constructor(message) {
    this.message = message;
  }

  callbacks = {
    testCallback: () => this._testCallback()
  };

  _testCallback = () => console.log("----test: ", this.message);
}

test("hello", () => {
  const webrtcClient = new WebRTCClient();
  const test = new Test("hello, test world");
  webrtcClient.setupCallbacks(test.callbacks);
  console.log(webrtcClient);
  webrtcClient.callCallback();
  expect(2 + 3).toBe(5);
});
