<template></template>

<script>
import "@/plugins/leaflet-echarts.js";
import echarts from "echarts";
import chroma from "chroma-js";
export default {
  name: "WindyLayer",
  props: {
    /**
     *  Array<Array<lng,lat,dx,dy,value>>,
     * */
    data: {
      type: Array,
      default: () => []
    },
    rangeData: {
      type: Object,
      default: () => ({
        colors: ["#A000C8", "#3BA0FF", "#F00582"],
        values: [0, 8]
      })
    }
  },
  data() {
    return {};
  },
  methods: {
    init() {
      this.overlay = L.echartsLayer(this.$parent.mapObject, echarts);
      this.echartContainer = this.overlay.getEchartsContainer();
      this.myChart = this.overlay.initECharts(this.echartContainer);
      const self = this;
      this.option = {
        tooltip: {
          trigger: "item",
          formatter: function(params) {
            return params.value[4];
          }
        },
        geo: {
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: "#323c48",
              borderColor: "#111"
            },
            emphasis: {
              areaColor: "#2a333d"
            }
          }
        },
        series: [
          {
            type: "custom",
            coordinateSystem: "geo",
            data: this.data,
            renderItem: function(params, api) {
              var x = api.value(0),
                y = api.value(1),
                dx = api.value(2),
                dy = api.value(3);
              var start = api.coord([x - dx, y - dy]);
              var end = api.coord([x + dy, y + dy]);
              return {
                type: "line",
                shape: {
                  x1: start[0],
                  y1: start[1],
                  x2: end[0],
                  y2: end[1]
                },
                style: {
                  lineWidth: 2,
                  stroke: self.getColor(api.value(4))
                }
              };
            },
            progressive: 2000
          }
        ]
      };
      this.overlay.setOption(this.option);
    },
    getColor(val) {
      return chroma.scale(this.rangeData.colors).domain(this.rangeData.values)(
        val
      );
    }
  },
  watch: {
    data() {
      this.overlay.update({
        seriesIndex: 0,
        data: this.data
      });
    },
    rangeData() {
      this.overlay.reload();
    }
  },
  mounted() {
    if (this.data.length == 0) return;
    this.init();
    console.log('mounted windy')
  },
  beforeDestroy(){
    this.overlay.destory()
  }
};
</script>