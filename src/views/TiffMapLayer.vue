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
    <component :is="componentId" :data="tiffData" :ranges="ranges" :colors="colors"></component>
  </l-map>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import TiffToGeojsonLayer from "@/components/TiffToGeojsonLayer";
import TiffToImageLayer from "@/components/TiffToImageLayer";
import TiffToGridLayer from "@/components/TiffToGridLayer";
import ButtonGroup from "@/components/ButtonGroup";
import Description from "@/components/Description";
import axios from "axios";
export default {
  name: "TiffMapLayer",
  components: {
    LMap,
    LTileLayer,
    TiffToGeojsonLayer,
    TiffToImageLayer,
    TiffToGridLayer,
    ButtonGroup,
    Description
  },
  data() {
    return {
      url:
        "https://t0.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=a10b5d58603d9a7abfe4731e8360fa91",
      zoom: 3,
      center: [45, 180],
      tiffData: "",
      ranges: [
        0,
        0.001,
        0.0015,
        0.002,
        0.0025,
        0.003,
        0.004,
        0.0045,
        0.005,
        0.0055
      ],
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
      ],
      noDataValue: 999999,
      btnGroupList: [
        {
          label: "tiffToGeojson",
          id: "TiffToGeojsonLayer",
          data: "https://zjfcool.github.io/leaflet-learn/dist//wrfout.tif",
          // noDataValue:999999,
          link:
            "https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToGeojsonLayer.vue",
          desc:
            "tiff数据通过geotiff.js解析，将其在转化为等值面的geojson，通过适量切片的形式渲染到地图中"
        },
        {
          label: "tiffToImage",
          data: "https://zjfcool.github.io/leaflet-learn/dist//wrfout.tif",
          // noDataValue:999999,
          id: "TiffToImageLayer",
          link:
            "https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToImageLayer.vue",
          desc:
            "tiff数据通过geotiff.js解析，将其生成canvas，再由canvas转图片，在渲染到地图中"
        },
        {
          label: "tiffToGrid",
          data: "https://zjfcool.github.io/leaflet-learn/dist//wrfout.tif",
          // noDataValue:999999,
          id: "TiffToGridLayer",
          link:
            "https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToGridLayer.vue",
          desc: "tiff数据通过georaster解析，将其生成gridlayer，渲染到地图中"
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
    async changeLayer(item) {
      this.componentId = item.id;
      const res = await axios(item.data, {
        responseType: "arraybuffer"
      });
      this.tiffData = res.data;
      this.description.content = item.desc;
      this.description.link = item.link;
      // this.noDataValue=item.noDataValue;
    }
  }
};
</script>
