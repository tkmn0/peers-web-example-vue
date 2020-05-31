<template>
  <v-card
    v-if="stream"
    class="ma-0 pa-0  white d-flex justify-center"
    outlined
    tile
    height="200"
  >
    <video
      autoplay
      playsinline
      :srcObject.prop="stream"
      :muted="isLocal"
      width="100%"
      class="pa-2"
    ></video>
    <div class="controls">
      <div v-if="isLocal">
        <v-btn icon @click="$emit('video-button-clicked')">
          <v-icon v-if="isVideoEnable" color="black">mdi-video</v-icon>
          <v-icon v-else color="red">mdi-video-off</v-icon>
        </v-btn>
        <br />
        <v-btn icon @click="$emit('audio-button-clicked')">
          <v-icon v-if="isAudioEnable" color="black">mdi-microphone</v-icon>
          <v-icon v-else color="red">mdi-microphone-off</v-icon>
        </v-btn>
      </div>
      <div v-else>
        <v-icon v-if="isVideoEnable" color="black">mdi-video</v-icon>
        <v-icon v-else color="red">mdi-video-off</v-icon>
        <br />
        <v-icon v-if="isAudioEnable" color="black">mdi-microphone</v-icon>
        <v-icon v-else color="red">mdi-microphone-off</v-icon>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "Video",
  props: {
    stream: MediaStream,
    isLocal: Boolean,
    isVideoEnable: Boolean,
    isAudioEnable: Boolean
  }
};
</script>

<style scoped>
.video {
  position: absolute;
}
.controls {
  position: absolute;
  bottom: 0;
  right: 10px;
}
</style>
