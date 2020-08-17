<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="grey lighten-5" fluid style="height: 100%">
        <v-spacer />
        <v-toolbar dense flat>
          <v-btn v-if="peers.LocalStream() == null" @click="setupLocalStream">
            CAMERA
          </v-btn>
          <v-btn v-else-if="!peers.RoomJoined()" @click="call">
            JOIN
          </v-btn>
          <v-spacer />
          <v-btn v-if="peers.roomId" @click="copyLink">
            invite link
          </v-btn>
          <v-snackbar
            v-model="snackbar"
            :timeout="2000"
            :top="true"
            :right="true"
          >
            {{ text }}
            <v-btn dark text @click="snackbar = false">
              Close
            </v-btn>
          </v-snackbar>
        </v-toolbar>

        <v-row
          class="blue lighten-4"
          justify="start"
          align-content="center"
          dense
          style="height: 100%;"
        >
          <v-col
            v-for="(mediaModel, index) in peers.MediaModels()"
            :key="index"
            xs="12"
            sm="6"
            md="4"
            lg="3"
          >
            <Video
              :stream="mediaModel.stream"
              :is-local="mediaModel.isLocal"
              :is-video-enable="!mediaModel.isVideoMuted"
              :is-audio-enable="!mediaModel.isAudioMuted"
              @video-button-clicked="toggleLocalVideoMute"
              @audio-button-clicked="toggleLocalAudioMute"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Video from "@/components/Video.vue";
// import Peers from "../../../peers-web/dist";
import Peers from "peers-web";

export default {
  name: "VideoRoom",
  components: { Video },
  data: function() {
    return {
      snackbar: false,
      text: "link copied!",
      peers: new Peers()
    };
  },
  mounted: function() {
    let uri = window.location.hostname;
    if (process.env.NODE_ENV === "development") {
      uri += ":3000";
    }
    this.peers.setupConnection(uri);
    this.peers.setLogLevel("info");
  },
  destroyed: function() {
    //TODO: destroy peers
  },
  methods: {
    copyLink: function() {
      let link = window.location.href;
      if (!this.$route.params.roomId) {
        link += this.peers.roomId;
      }
      navigator.clipboard.writeText(link);
      this.snackbar = true;
    },
    call: function() {
      const roomId = this.$route.params.roomId;
      this.peers.joinRoom(roomId);
    },
    toggleLocalVideoMute: function() {
      this.peers.toggleLocalVideoMute();
    },
    toggleLocalAudioMute: function() {
      this.peers.toggleLocalAudioMute();
    },
    setupLocalStream: async function() {
      const constraints = {
        width: { min: 320, ideal: 320, max: 640 },
        height: { ideal: 360 },
        video: true,
        audio: true,
        facingMode: { exact: "user" }
      };

      const localStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      this.peers.addLocalStream(localStream);
    }
  }
};
</script>
