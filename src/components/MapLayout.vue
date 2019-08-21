<template>
  <div class="map-layout">
    <slot/>
  </div>
</template>

<script>
export default {
  name: "MapLayout",
  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.map-layout {
  position: relative;
  height: 100%;
}
</style>