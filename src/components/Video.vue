<template>
  <v-card class="pa-10" outlined tile height="300">
    <video
      autoplay
      playsinline
      :srcObject.prop="stream"
      :muted="isLocal"
      class="video pr-2"
    ></video>
  </v-card>
</template>

<script>
export default {
  name: "Video",
  props: {
    stream: MediaStream,
    isLocal: Boolean
  },
  mounted: function() {
    console.log(this.stream);
    console.log(this.isLocal);
  }
};
</script>

<style scoped>
.video {
  position: relative;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
