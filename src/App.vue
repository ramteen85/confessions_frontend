<template>
  <div id="app">
    <Navbar/>
    <router-view></router-view>
  </div>
</template>

<script>
import Navbar from './components/layout/Navbar';

export default {
  name: 'App',
  components: {
    Navbar
  }
}
</script>

<style>




* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
}

#app {

  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0;
}
</style>
