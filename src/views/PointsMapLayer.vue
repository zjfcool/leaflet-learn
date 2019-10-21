<template>
  <l-map
    ref="map"
    :zoom="zoom"
    :center="center"
    :options="{zoomControl: false,attributionControl: false}"
  >
    <button-group :data="btnGroupList" @changeLayer="changeLayer"></button-group>
    <description :data="description"/>
    <l-tile-layer :url="url"></l-tile-layer>
    <component :is="componentId" :data="ecData" :rangeData="rangeData" :key="componentId"></component>
  </l-map>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import ButtonGroup from "@/components/ButtonGroup";
import Description from "@/components/Description";
import MarkerClusterLayer from "@/components/MarkerClusterLayer";
import stationData from "@/assets/js/stations";
export default {
  name: "TiffMapLayer",
  components: {
    LMap,
    LTileLayer,
    ButtonGroup,
    Description,
    MarkerClusterLayer
  },
  data() {
    return {
      url:
        "https://t0.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=a10b5d58603d9a7abfe4731e8360fa91",
      zoom: 3,
      center: [45, 45],
      ecData: "",
      rangeData: {
        values: [],
        colors: []
      },
      btnGroupList: [
        {
          label: "散点",
          id: "MarkerClusterLayer",
          data: [],
          rangeData: {
            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            colors: [
              "#EE4620",
              "#EE462F",
              "#ED4633",
              "#EF6B6D",
              "#F3A4A5",
              "#F9DCDD",
              "#DCDCFE",
              "#A5A6FD",
              "#6F6DFC",
              "#3D4BFB",
              "#2A4AFC"
            ]
          },
          link:
            "https://github.com/zjfcool/leaflet-learn/blob/master/src/components/MarkerClusterLayer.vue",
          desc: "散点聚合"
        }
      ],
      description: {
        content: "",
        link: ""
      },
      componentId: ""
    };
  },
  methods: {
    changeLayer(item) {
      this.componentId = item.id;
      this.ecData = this.formatData(stationData);
      this.description.content = item.desc;
      this.description.link = item.link;
      this.rangeData = Object.assign({}, item.rangeData);
    },
    formatData(arr) {
      let ret = [];
      for (let i = 0; i < arr.length; i++) {
          ret.push({
              latlng:[arr[i].lat,arr[i].lon],
              desc:[
                  {
                      label:"风向",
                      value:arr[i].dird
                  },
                  {
                      label:"风速",
                      value:arr[i].speed
                  },
                  {
                      label:'名称',
                      value:arr[i].station_name
                  }
              ]
          })
      }
      return ret;
    }
  }
};
</script>
