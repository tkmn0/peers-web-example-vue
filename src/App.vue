<template>
  <div id="app">
    <v-app-bar app color="blue-grey darken-4" dark>
      <v-spacer />
      <v-btn icon @click="linkToGithub()">
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </v-app-bar>
    <router-view />
    <v-footer color="blue-grey darken-4" app>
      <v-spacer />
      <span class="white--text">&copy; 2020</span>
    </v-footer>
  </div>
</template>

<script>
export default {
  methods: {
    linkToGithub() {
      window.open("https://github.com/tkmn0/peers-web-example-vue");
    }
  }
};
</script>
