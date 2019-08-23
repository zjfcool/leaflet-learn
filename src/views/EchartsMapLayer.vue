<template>
  <l-map ref="map" :zoom="zoom" :center="center" :options="{zoomControl: false,attributionControl: false}">
    <button-group :data="btnGroupList" @changeLayer="changeLayer"></button-group>
    <description :data="description"/>
    <l-tile-layer :url="url"></l-tile-layer>
    <component :is="componentId" :data="ecData" :rangeData="rangeData"></component>
  </l-map>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import ButtonGroup from '@/components/ButtonGroup';
import Description from '@/components/Description';
import WindyLayer from '@/components/WindyLayer';
import { windData, windData2} from '@/assets/js/wind';
import points from '@/assets/js/points';
import axios from 'axios';
export default {
  name: "TiffMapLayer",
  components: {
    LMap,
    LTileLayer,
    ButtonGroup,
    Description,
    WindyLayer
  },
  data() {
    return {
      url:
        "https://t0.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=a10b5d58603d9a7abfe4731e8360fa91",
      zoom: 3,
      center: [45, 45],
      ecData: '',
      rangeData:{
        values:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9,],
        colors:["#EE4620", "#EE462F", "#ED4633", "#EF6B6D", "#F3A4A5", "#F9DCDD", "#DCDCFE", "#A5A6FD", "#6F6DFC", "#3D4BFB", "#2A4AFC"],
      }, 
      btnGroupList:[
        {
          label:"风场",
          id:"WindyLayer",
          data: windData2,
          link:'https://github.com/zjfcool/leaflet-learn/blob/master/src/components/WindyLayer.vue',
          desc:"静态风场"
        },
        {
          label:"散点",
          data: points,
          id:"TiffToImageLayer",
          // link:'https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToImageLayer.vue',
          desc:""
        },
        {
          label:"多线",
          data:"/wrfout.tif",
          id:"",
          // link:'https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToGridLayer.vue',
          desc:""
        },
        {
          label:"图层叠加",
          data:"/wrfout.tif",
          id:"",
          // link:'https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToGridLayer.vue',
          desc:""
        },

      ],
      description:{
        content:"",
        link:"",
      },
      componentId:""
    };
  },
  methods:{
    changeLayer(item){
      this.componentId=item.id;
      this.ecData=item.data;
      this.description.content=item.desc;
      this.description.link=item.link;
    }
  },
};
</script>
