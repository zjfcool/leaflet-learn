<template></template>

<script>
import { FuncWind } from "../plugins/func.wind.js";
export default {
  name: "StaticFlowLayer",
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
    init() {
      this.wind = new FuncWind(this.$parent.mapObject);
    },
    start() {
      this.wind.start(this.data);
    },
    stop(){
      this.wind.stop();
    }
  },
  mounted() {
      this.init();
      this.start();
  },
  watch:{
      data(){
        this.start();
      }
  },
  beforeDestroy(){
    console.log('destory')
      this.stop();
  }
};
</script>

