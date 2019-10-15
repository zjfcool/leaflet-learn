
<template></template>

<script>
import L from "leaflet";
import * as GeoTIFF from "geotiff";
import "@/plugins/georaster-layer-for-leaflet-interpotations";
import parseGeoraster from "georaster";
import chroma from "chroma-js";
export default {
  name: "RuiGeotiffLayer",
  props: {
    data: {
      required: true
    },
    colors: {
      type: Array,
      default: () => []
    },
    opacity: {
      type: Number,
      default: 0.5
    },
    ranges: {
      type: Array,
      default: () => []
    },
    noDataValue: {
      default: undefined
    }
  },
  data() {
    return {
      minMax: [0, 0],
      layer: null
    };
  },
  mounted() {
    this.update();
  },
  methods: {
    async update() {
      if (this.data.length === 0) return;
      this.map = this.$parent.mapObject;
      this.map.eachLayer(layer => {
        if (layer.options && layer.options.georaster)
          this.map.removeLayer(layer);
      });
      this.georaster = await parseGeoraster(this.data, {
        noDataValue: this.noDataValue
      });
      
      const { mins, ranges, maxs } = this.georaster;
      this.minMax = [mins[0], maxs[0]];
      this.layer = new GeoRasterLayer({
        georaster: this.georaster,
        opacity: this.opacity,
        color: chroma.scale(this.colors).domain(this.ranges),
        resolution: 64
      });
      this.layer.addTo(this.map);
      this.layer.on('loading',()=>{
          this.loadingtimer = Date.now();
          console.log('loading')
      })
      this.layer.on('load',()=>{
          console.log("georaser loading time:", Date.now() - this.loadingtimer, "ms");
      })
    }
  },
  watch: {
    data() {
      this.update();
    },
    colors() {
      this.layer && this.layer.redraw();
    },
    ranges() {
      this.layer && this.layer.redraw();
    },
    minMax(val, preVal) {
      if (JSON.stringify(val) === JSON.stringify(preVal)) return;
      this.$emit("georasterChange", val);
    },
    noDataValue() {
      this.layer && this.layer.redraw();
    }
  },
  beforeDestroy() {
    this.layer&&this.layer.remove();
  }
};
</script>
