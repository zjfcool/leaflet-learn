<template>
</template>

<script>
import L from "leaflet";
import "../plugins/leaflet-velocity.js";
export default {
  name: "FlowLayer",
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
      this.map = this.$parent.mapObject;
      if(this.layer) this.map.removeLayer(this.layer);
      this.layer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Global Wind",
          displayPosition: "bottomleft",
          displayEmptyString: "No wind data"
        },
        data: this.data,
        maxVelocity: 5,
        // velocityScale: 0.1,
        option: {}
      }).addTo(this.map);
    }
  },
  mounted() {
    if(this.data.length==0) return;
    this.init();
  },
  watch: {
    data(arr) {
      if(this.layer) return this.layer.setData(arr);
      this.init()
    }
  },
  beforeDestroy(){
    this.map.removeLayer(this.layer)
  }
};
</script>

