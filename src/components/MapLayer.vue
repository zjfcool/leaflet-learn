<template>
  <l-map ref="map" :zoom="zoom" :center="center" :options="{zoomControl: false,attributionControl: false}">
    <ul class="btn-group">
      <li ref="btnItem" v-for="item in btnGroupList" :key="item.label" @click.stop="changeLayer($event,item)">{{item.label}}</li>
    </ul>
    <div class="desc-wrapper">
      <p>说明：{{content}}</p>
      <a :href="linkTo">示例代码</a>
    </div>
    <l-tile-layer :url="url"></l-tile-layer>
    <component :is="componentId" :data="tiffData" :ranges="ranges" :colors="colors" :noValueData="noValueData"></component>
    <!-- <tiff-to-geojson-layer :data="tiffData" :ranges="ranges" :colors="colors" :noValueData="noValueData"></tiff-to-geojson-layer> -->
  </l-map>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";
import TiffToGeojsonLayer from './TiffToGeojsonLayer';
import TiffToImageLayer from './TiffToImageLayer';
import axios from 'axios';
export default {
  name: "MapLayer",
  components: {
    LMap,
    LTileLayer,
    TiffToGeojsonLayer,
    TiffToImageLayer
  },
  data() {
    return {
      url:
        "https://t0.tianditu.gov.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}&tk=a10b5d58603d9a7abfe4731e8360fa91",
      zoom: 3,
      center: [45, 180],
      tiffData: '',
      ranges:[0, 0.001, 0.0015, 0.002, 0.0025, 0.003, 0.004, 0.0045, 0.005, 0.0055,],
      colors:["#EE4620", "#EE462F", "#ED4633", "#EF6B6D", "#F3A4A5", "#F9DCDD", "#DCDCFE", "#A5A6FD", "#6F6DFC", "#3D4BFB", "#2A4AFC"],
      noValueData:999999,
      btnGroupList:[
        {
          label:"tiffToGeojson",
          id:"TiffToGeojsonLayer",
          data:"/wrfout.tif",
          link:'https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToGeojsonLayer.vue',
          desc:"tiff数据通过geotiff.js解析，将其在转化为等值面的geojson，通过适量切片的形式渲染到地图中"
        },
        {
          label:"tiffToImage",
          data:"/wrfout.tif",
          id:"TiffToImageLayer",
          link:'https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToImageLayer.vue',
          desc:"tiff数据通过geotiff.js解析，将其生成canvas，再由canvas转图片，在渲染到地图中"
        }
      ],
      content:"",
      linkTo:"",
      componentId:""
    };
  },
  methods:{
    init(){
      this.$nextTick(()=>{
        this.$refs.btnItem[0].click()
      })
      
    },
    changeLayer(e,item){
      [...this.$refs.btnItem].forEach(item=>{
        item.classList.remove('active')
      })
      e.currentTarget.classList.add('active')
      this.componentId=item.id;
      this.tiffData=item.data;
      this.content=item.desc;
      this.linkTo=item.link;
    }
  },
  mounted(){
    this.init();
  }
};
</script>
<style lang="less" scoped>
.desc-wrapper{
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 8px 18px;
  width: 200px;
  z-index: 9999;
  background-color: rgba(255,255,255,.5);
  p{
    font-size: 12px;
    color: #000;
  }
}
.btn-group{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  text-align: center;
  li{
    display: inline-block;
    padding: 9px 12px;
    color: #fff;
    background-color: #058eed;
    font-size: 14px;
    &.active{
      background-color: red;
    }
  }
}
</style>
