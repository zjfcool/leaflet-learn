<template></template>

<script>
import * as GeoTIFF from "geotiff";
import chroma from "chroma-js";
import * as rastertools from "raster-marching-squares";
// import {isoBands} from 'marchingsquares'
import 'leaflet.vectorgrid'
export default {
  name: "RuiTiffToGeojsonLayer",
  props: {
    data: {
      required: true
    },
    colors: {
        type: Array,
        default: () => []
    },
    ranges: {
        type: Array,
        default: () => []
    },
    noDataValue: {
        default: 999999
    }
  },
  data() {
    return {};
  },
  methods: {
    async init() {
      if (this.data.length == 0) return;
      this.map = this.$parent.mapObject;
      let tiff ;
      if(typeof this.data =='string'){
        tiff = await GeoTIFF.fromUrl(this.data);
      }else if(this.data instanceof ArrayBuffer){
        tiff= await GeoTIFF.fromArrayBuffer(this.data);
      }else{
        console.error('data must arrybuffer or url')
        return
      }
      
      let image = await tiff.getImage();
      this.tiffWidth = image.getWidth();
      this.tiffHeight = image.getHeight();
      let rasters = await image.readRasters();
      let tiepoint = image.getTiePoints()[0];
      let pixelScale = image.getFileDirectory().ModelPixelScale;
      this.geoTransform = [
        tiepoint.x,
        pixelScale[0],
        0,
        tiepoint.y,
        0,
        -1 * pixelScale[1]
      ];

      this.tempData = new Array(this.tiffHeight);
      for (let j = 0; j < this.tiffHeight; j++) {
        this.tempData[j] = new Array(this.tiffWidth);
        for (let i = 0; i < this.tiffWidth; i++) {
          this.tempData[j][i] = rasters[0][i + j * this.tiffWidth];
        }
      }
      let a = [];
      a = a.concat(...this.tempData).filter(item => item!==this.noDataValue);
      let min=0,max=0;
      for(let i=0;i<a.length;i++){
        if(min>a[i]){
          min = a[i]
        }
        if(max<a[i]){
          max = a[i];
        }
      }
      let intervalsSpd = this.intervalsSpdFormat(
        min,
        max,
        20
      );
      this.geojson_data = rastertools.isobands(
        this.tempData,
        this.geoTransform,
        intervalsSpd
      );
      // this.geojson_data = this.bands(this.tempData,intervalsSpd)
      if(this.layer) this.map.removeLayer(this.layer);
       this.layer = L.vectorGrid.slicer(this.geojson_data,{
          rendererFactory: L.canvas.tile,
          interactive: true,
          vectorTileLayerStyles:{
            sliced:this.geojsonStyle
          },
        })
      this.layer.addTo(this.map);
      // this.pbflayer = L.vectorGrid.protobuf("https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf?access_token={token}", {
      //     subdomains: "abcd",
      //     token: "pk.eyJ1IjoiempmY29vbCIsImEiOiJjaXkweGdmNm8wMDZ5MzNsYW02bmNuMDE5In0.zfhxXcLdVb4bXBsA9Xp6EQ"
      // });
      // console.log(this.pbflayer.addTo(this.map))
    },
    applyGeoTransform(x, y, geoTransform){
      let xgeo = geoTransform[0] + x*geoTransform[1] + y*geoTransform[2];
      let ygeo = geoTransform[3] + x*geoTransform[4] + y*geoTransform[5];
      return [xgeo, ygeo];
    },
    intervalsSpdFormat(min, max, num = 80) {
      let range = (max - min) / num;
      let ret = [];
      for (let i = 0; i < num; i++) {
        ret.push(min + range * i);
      }
      return ret;
    },
    geojsonStyle(properties) {
      let scale = chroma.scale(this.colors).domain(this.ranges);
      return {
        fill:true,
        stroke:false,
        fillColor: scale(properties[0].lowerValue),
        fillOpacity: 0.5
      };
    },
    // 当使用 marchingsquares 时的做法，tempData中的值必须为Number。
    // bands(data,threshold){
    //   let bands = { "type": "FeatureCollection",
    //   "features": []
    //   };
    //   for(let i=1; i<threshold.length; i++){
    //       let lowerValue = threshold[i-1];
    //       let upperValue = threshold[i];
    //       let coords = isoBands(data,lowerValue,upperValue-lowerValue);
    //       let polygens = []
    //       //Change clockwise
    //       for(let j=0; j< coords.length; j++){
    //         polygens[j]=[];
    //         for(let f=0;f<coords[j].length;f++){
    //          let latlng = this.applyGeoTransform (coords[j][f][0],coords[j][f][1],this.geoTransform)
    //          polygens[j].push(latlng)
    //         }
    //       }
           

    //       bands['features'].push({"type": "Feature",
    //       "geometry": {
    //         "type": "Polygon",
    //         "coordinates": polygens},
    //         "properties": [{"lowerValue": lowerValue, "upperValue": upperValue}]}
    //       );
    //   }
    //   return bands;
    // }
  },
  mounted(){
    this.init()
    this.$parent.mapObject.on("click", e => {
        let xTiff = (e.latlng.lng - this.geoTransform[0]) / this.geoTransform[1];
        let yTiff = (e.latlng.lat - this.geoTransform[3]) / this.geoTransform[5];
        if(xTiff>this.tiffWidth||yTiff>this.tiffHeight) return;
        let temp = this.tempData[Math.round(yTiff)][Math.round(xTiff)];
        if(isNaN(this.noDataValue)?isNaN(temp):temp == this.noDataValue) return;
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`${temp}`)
          .openOn(this.$parent.mapObject);
      });
      // let n=0;
      // if(this.timer) clearInterval(this.timer);
      // this.timer = setInterval(()=>{
      //   n++;
      //   if(n>10) return clearInterval(this.timer);
      //   this.init()
      // },4000)
  },
  watch: {
    data() {
      this.init()
    },
    colors(){
      this.layer&&this.layer.redraw();
    },
    ranges(){
      this.layer&&this.layer.redraw();
    }
  },
  beforeDestroy(){
    this.layer&&this.layer.remove()
  }
};
</script>

