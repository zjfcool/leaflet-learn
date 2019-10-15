<template></template>

<script>
import L from "leaflet";
import * as GeoTIFF from "geotiff";
import chroma from "chroma-js";
export default {
  name: "TiffToImageLayer",
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
      let tiff;
      if (typeof this.data == "string") {
        tiff = await GeoTIFF.fromUrl(this.data);
      } else if (this.data instanceof ArrayBuffer) {
        tiff = await GeoTIFF.fromArrayBuffer(this.data);
      } else {
        console.error("data must arrybuffer or url");
        return;
      }
      const image = await tiff.getImage();
      const data = await image.readRasters();
      const tiffWidth = image.getWidth();
      const tiffHeight = image.getHeight();
      const samplesPerPixel = image.getSamplesPerPixel();
      const bounds = image.getBoundingBox();
      const tiepoint = image.getTiePoints()[0];
      const pixelScale = image.getFileDirectory().ModelPixelScale;
      const geoTransform = [
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
          tempData[j][i] = data[0][i + j * tiffWidth];
        }
      }
    //   let arr = data[0].filter(item => item!==this.noDataValue);
    //   let min = Math.min(...arr),
    //     max = Math.max(...arr);

      const canvas = document.createElement("canvas");
      const rightBottomPixel = this.map.latLngToContainerPoint([bounds[1],bounds[2]])
      const leftTopPixel = this.map.latLngToContainerPoint([bounds[3],bounds[0]]);
      const tileWidth = rightBottomPixel.x - leftTopPixel.x,
            tileHeight = rightBottomPixel.y - leftTopPixel.y;
      canvas.width = tileWidth;
      canvas.height = tileHeight;
      const context = canvas.getContext("2d");
      const id = context.createImageData(tileWidth, tileHeight);
      const canvasData = id.data;
      let scale = chroma
        .scale(this.colors)
        .domain(this.ranges);
      for (let y = 0; y < tileHeight; y++) {
        for (let x = 0; x < tileWidth; x++) {
          const latlng = this.map.layerPointToLatLng([leftTopPixel.x+x,leftTopPixel.y+y])
          const px = ( latlng.lng - geoTransform[0])/geoTransform[1]
          const py = ( latlng.lat - geoTransform[3])/geoTransform[5]
          if(Math.floor(px) >= 0 && Math.floor(py) >= 0){
            // console.log(Math.floor(px),Math.floor(py))
            let rgba = scale(tempData[Math.floor(py)][Math.floor(px)]).rgba();
            if(tempData[Math.floor(py)][Math.floor(px)] == this.noDataValue) rgba=[0,0,0,0];
            const index = (y * tileWidth + x) * 4;
            canvasData[index + 0] = rgba[0];
            canvasData[index + 1] = rgba[1];
            canvasData[index + 2] = rgba[2];
            canvasData[index + 3] = rgba[3] * 255;
          }
          
        }
      }

      context.putImageData(id, 0, 0);
      //   return
      console.log(bounds)
      if (this.imgLayer) this.map.removeLayer(this.imgLayer);
      this.imgLayer = L.imageOverlay(
        canvas.toDataURL(),
        [[bounds[1], bounds[0]], [bounds[3], bounds[2]]],
        {
          opacity: 0.3
        }
      );
      this.imgLayer.addTo(this.map);

      this.map.on("click", e => {
        let xTiff = (e.latlng.lng - geoTransform[0]) / geoTransform[1];
        let yTiff = (e.latlng.lat - geoTransform[3]) / geoTransform[5];
        if (xTiff > tileWidth || yTiff > tileHeight) return;
        let temp = tempData[Math.round(yTiff)][Math.round(xTiff)];
        if (temp === this.noDataValue) return;
        L.popup()
          .setLatLng(e.latlng)
          .setContent(`${temp}`)
          .openOn(this.map);
      });
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    data() {
      this.init()
      
    },
    colors(){
      this.init()
    },
    ranges(){
      this.init()
    }
  },
  beforeDestroy(){
      this.imgLayer&&this.imgLayer.remove()
  }
};
</script>

