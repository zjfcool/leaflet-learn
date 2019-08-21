<template></template>

<script>
import * as GeoTIFF from "geotiff";
import chroma from "chroma-js";
import * as rastertools from "raster-marching-squares";
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
    noValueData: {
        default: undefined
    }
  },
  data() {
    return {};
  },
  methods: {
    async init() {
      console.log(this.data)
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
      let tiffWidth = image.getWidth();
      let tiffHeight = image.getHeight();
      let rasters = await image.readRasters();
      let tiepoint = image.getTiePoints()[0];
      let pixelScale = image.getFileDirectory().ModelPixelScale;
      let geoTransform = [
        tiepoint.x,
        pixelScale[0],
        0,
        tiepoint.y,
        0,
        -1 * pixelScale[1]
      ];

      let tempData = new Array(tiffHeight);
      for (let j = 0; j < tiffHeight; j++) {
        tempData[j] = new Array(tiffWidth);
        for (let i = 0; i < tiffWidth; i++) {
          tempData[j][i] = rasters[0][i + j * tiffWidth];
        }
      }
      let a = [];
      a = a.concat(...tempData).filter(item => item!==this.noValueData);
      let intervalsSpd = this.intervalsSpdFormat(
        Math.min(...a),
        Math.max(...a),
        80
      );
      this.geojson_data = rastertools.isobands(
        tempData,
        geoTransform,
        intervalsSpd
      );
      if(this.layer) this.map.removeLayer(this.layer);
       this.layer = L.vectorGrid.slicer(this.geojson_data,{
          rendererFactory: L.canvas.tile,
          interactive: true,
          vectorTileLayerStyles:{
            sliced:this.geojsonStyle
          },
        })
      this.layer.addTo(this.map);
      this.layer.on('tileloadstart',()=>{
        this.$emit('loading');
      })
      this.layer.on('load',()=>{
        this.$emit('loaded');
      })
      this.map.on("click", e => {
        let xTiff = (e.latlng.lng - geoTransform[0]) / geoTransform[1];
        let yTiff = (e.latlng.lat - geoTransform[3]) / geoTransform[5];
        if(xTiff>tiffWidth||yTiff>tiffHeight) return;
        let temp = tempData[Math.round(yTiff)][Math.round(xTiff)];
        if(temp == this.noValueData) return;
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`${temp}`)
          .openOn(this.map);
      });
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
    }
  },
  mounted(){
    this.init()
  },
  watch: {
    data() {
      if(this.layer) return this.layer.redraw();
      this.init()
      
    },
    colors(){
      this.layer&&this.layer.redraw();
    },
    ranges(){
      this.layer&&this.layer.redraw();
    }
  }
};
</script>

