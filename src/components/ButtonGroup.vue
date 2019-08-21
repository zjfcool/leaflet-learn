<template>
  <ul class="btn-group">
    <li
      ref="btnItem"
      v-for="item in data"
      :key="item.label"
      @click.stop="changeLayer($event,item)"
    >{{item.label}}</li>
  </ul>
</template>

<script>
export default {
  name: "ButtonGroup",
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  methods: {
    changeLayer(e, item) {
      [...this.$refs.btnItem].forEach(item => {
        item.classList.remove("active");
      });
      e.currentTarget.classList.add("active");
      this.$emit("changeLayer", item);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.btnItem[0].click();
    });
  }
};
</script>

<style lang="less" scoped>
.btn-group {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  text-align: center;
  li {
    display: inline-block;
    padding: 9px 12px;
    color: #fff;
    background-color: #058eed;
    font-size: 14px;
    &.active {
      background-color: #0a6db1;
    }
    &:hover{
        cursor: pointer;
        background-color: #0a6db1;
    }
  }
}
</style>