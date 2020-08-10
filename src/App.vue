<template>
  <div id="app">
    <v-app-bar app color="blue-grey darken-4" dark>
      <v-spacer />
      <router-link to="/">
        Home
      </router-link>
      |
      <router-link to="/room">
        Room
      </router-link>
      <v-btn icon>
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
