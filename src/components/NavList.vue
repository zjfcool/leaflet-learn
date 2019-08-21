<template>
  <ul class="nav-list">
    <router-link tag="li" v-for="item in data" :key="item.label" :to="item.link">{{item.label}}</router-link>
  </ul>
</template>

<script>
export default {
  name: "NavList",
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.nav-list {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 9999;
  li + li {
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }
  li {
    padding: 12px 4px;
    font-size: 14px;
    color: #fff;
    background-color: #058eed;
    &.router-link-active {
      background-color: #0a6db1;
    }
    &:hover{
        cursor: pointer;
        background-color: #0a6db1;
    }
  }
}
</style>