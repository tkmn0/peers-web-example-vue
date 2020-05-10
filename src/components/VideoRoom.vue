<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="grey lighten-5" fluid style="height: 100%">
        <v-btn @click="rtcManager.setupLocalStream">{{
          rtcManager.localStream == null
        }}</v-btn>
        <v-btn @click="rtcManager.call()">call</v-btn>
        <v-row
          class="blue lighten-4"
          justify="start"
          align-content="center"
          dense
          style="height: 100%;"
        >
          <!-- <Video :stream="rtcManager.localStream" :is-local="true"></Video> -->

          <v-col
            v-for="(model, index) in rtcManager.rtcMediaModels"
            :key="index"
            xs="12"
            sm="6"
            md="4"
          >
            <!-- <v-card class="pa-10" outlined tile height="300">
              {{ client.id }}
            </v-card> -->
            <Video :stream="model.stream" :is-local="model.isLocal"></Video>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import WebRTCManager from "@/lib/webrtc_manager";
import Video from "@/components/Video.vue";

export default {
  name: "VideoRoom",
  components: { Video },
  data: function() {
    return {
      rtcManager: new WebRTCManager()
    };
  },
  mounted: function() {},
  destroyed: function() {
    this.rtcManager.destroy();
  }
};
</script>
