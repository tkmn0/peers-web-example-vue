<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="grey lighten-5" fluid style="height: 100%">
        <!-- <v-btn @click="counter += 1">Test Add</v-btn> -->
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
          <v-col v-for="n in counter" :key="n" xs="12" sm="6" md="4">
            <v-card class="pa-10" outlined tile height="300">
              One of three columns
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import WebRTCManager from "@/lib/webrtc_manager";

export default {
  name: "VideoRoom",
  data: function() {
    return {
      counter: 0,
      rtcManager: new WebRTCManager()
    };
  },
  mounted: function() {}
};
</script>
