<template>
  <router-view></router-view>
  <CuteGhost></CuteGhost>

</template>

<script setup>
// 这里不要写任何导入代码，只留路由出口
import CuteGhost from './pages/CuteGhost.vue';

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body {
  height: 100%;
  overflow-x: hidden;
}
</style>

