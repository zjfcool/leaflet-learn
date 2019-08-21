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
    noValueData: {
      default: undefined
    }
  },
  data() {
    return {
      imgsrc: ""
    };
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
      const tileWidth = image.getWidth();
      const tileHeight = image.getHeight();
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
    //   let arrbuffer = new Float32Array(data[0]);
    //   for (let i = 0; i < arrbuffer.length; i++) {
    //     if (isNaN(arrbuffer[i])) arrbuffer[i] = 0;
    //   }
      let tempData = new Array(tileHeight);
      for (let j = 0; j < tileHeight; j++) {
        tempData[j] = new Array(tileWidth);
        for (let i = 0; i < tileWidth; i++) {
          tempData[j][i] = data[0][i + j * tileWidth];
        }
      }
      let arr = data[0].filter(item => item!==this.noValueData);
      let min = Math.min(...arr),
        max = Math.max(...arr);

      const canvas = document.createElement("canvas");
      canvas.width = tileWidth;
      canvas.height = tileHeight;
      const context = canvas.getContext("2d");
      const id = context.createImageData(tileWidth, tileHeight);
      const canvasData = id.data;
      console.log(canvas.width, canvas.height);
      let scale = chroma
        .scale(this.colors)
        .domain(this.ranges);
      for (let y = 0; y < tileHeight; y++) {
        for (let x = 0; x < tileWidth; x++) {
          const i = y * tileWidth + x;
          let rgba = scale(data[0][i]).rgba();
          if(data[0][i] == this.noValueData) rgba=[0,0,0,0];
          const index = (y * tileWidth + x) * 4;
          canvasData[index + 0] = rgba[0];
          canvasData[index + 1] = rgba[1];
          canvasData[index + 2] = rgba[2];
          canvasData[index + 3] = rgba[3] * 255;
        }
      }

      context.putImageData(id, 0, 0);
      //   return
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
        if (temp === this.noValueData) return;
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
      if(this.imgLayer) return this.imgLayer.redraw();
      this.init()
      
    },
    colors(){
      this.imgLayer&&this.imgLayer.redraw();
    },
    ranges(){
      this.imgLayer&&this.imgLayer.redraw();
    }
  },
  beforeDestroy(){
      this.imgLayer.remove()
  }
};
</script>

