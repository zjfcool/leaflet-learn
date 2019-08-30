<template></template>

<script>
import "@/plugins/leaflet-echarts.js";
import echarts from "echarts";
import chroma from "chroma-js";
export default {
  name: "ScatterLayer",
  props: {
    /**
     *  Array<Object{name:string,value:Array<lng,lat,value>}>,
     * */
    data: {
      type: Array,
      default: () => []
    },
    rangeData: {
      type: Object,
      default: () => ({
        colors: ["#A000C8", "#3BA0FF", "#F00582"],
        values: [0, 80]
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
            return params.value[2];
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
          type: "scatter",
          coordinateSystem: "geo",
          zlevel:2,
          data: this.data,
          symbolSize: 10,
          label: {
            normal: {
              show: false
            },
            emphasis: {
              show: false
            }
          },
          progressive: 1e6,
          itemStyle: {
            emphasis: {
              borderColor: "#fff",
              borderWidth: 1,
              color: (item)=>this.getColor(item.value[2])
            }
          }
        },
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
      console.log(this.rangeData)
      this.overlay.reload();
    }
  },
  mounted() {
    if (this.data.length == 0) return;
    console.log('mounted scatter')
    this.init();
  },
  beforeDestroy(){
    this.overlay.destory()
  }
};
</script>