<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="grey lighten-5" fluid style="height: 100%">
        <v-spacer></v-spacer>
        <v-toolbar dense flat>
          <v-btn
            v-if="rtcManager.localStream == null"
            @click="rtcManager.setupLocalStream"
            >CAMERA</v-btn
          >
          <v-btn v-else-if="!rtcManager.roomJoined()" @click="call">JOIN</v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="rtcManager.roomId" @click="copyLink">
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
            v-for="(mediaModel, index) in rtcManager.mediaModels()"
            :key="index"
            xs="12"
            sm="6"
            md="4"
            lg="3"
          >
            <Video
              :stream="mediaModel.stream"
              :is-local="mediaModel.isLocal"
              :is-video-enable="!mediaModel.isVideoMute"
              :is-audio-enable="!mediaModel.isAudioMute"
              @video-button-clicked="toggleLocalVideoMute"
              @audio-button-clicked="toggleLocalAudioMute"
            ></Video>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import WebRTCManager from "@/lib/managers/webrtc_manager";
import Video from "@/components/Video.vue";

export default {
  name: "VideoRoom",
  components: { Video },
  data: function() {
    return {
      rtcManager: new WebRTCManager(),
      snackbar: false,
      text: "link copied!"
    };
  },
  destroyed: function() {
    this.rtcManager.destroy();
  },
  methods: {
    copyLink: function() {
      let link = window.location.href;
      if (!this.$route.params.roomId) {
        link += this.rtcManager.roomId;
      }
      navigator.clipboard.writeText(link);
      this.snackbar = true;
    },
    call: function() {
      const roomId = this.$route.params.roomId;
      this.rtcManager.joinRoom(roomId);
    },
    toggleLocalVideoMute: function() {
      this.rtcManager.toggleLocalVideoMute();
    },
    toggleLocalAudioMute: function() {
      this.rtcManager.toggleLocalAudioMute();
    }
  }
};
</script>
