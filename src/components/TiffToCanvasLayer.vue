<template></template>

<script>
import Pipeline from "raster-blaster/src/pipeline";
import * as PipelineSteps from "raster-blaster/src/pipeline-steps";
import WebGlRenderer from "raster-blaster/src/webgl/webgl-renderer";
import * as GeoTIFF from "geotiff";
import RasterLayer from "@/plugins/leaflet-raster";
import axios from "axios";
export default {
  name: "TiffToCanvasLayer",
  data() {
    return {};
  },
  methods: {
    init() {
      const pipeline = new Pipeline(
        [
          // VARI vegetation index
          new PipelineSteps.GrayScale("($g - $r) / ($g + $r - $b)"),
          // Stretch histogram to between index 0.2 to 0.8
          new PipelineSteps.SmoothstepContrast(0.2, 0.8),
          // Map grayscale to color scale Red-Yellow-Green
          new PipelineSteps.ColorMap("RdYlGn"),
          // Copy alpha band directly to alpha channel
          new PipelineSteps.BandsToChannels("a")
        ],
        {
          bands: "rgba",
          dataType: "Uint8"
        }
      );

      const renderer = new WebGlRenderer();

      const renderFn = (canvas, getRasters) =>
        renderer.render(canvas, pipeline, getRasters);
      axios("wrfout.tif", {
        responseType: "arraybuffer"
      }).then(res => {
        GeoTIFF.fromArrayBuffer(res.data).then(tiff => {
          const rasterFn = (nwSe, size) =>
            tiff.readRasters({
              bbox: [nwSe[0].lng, nwSe[1].lat, nwSe[1].lng, nwSe[0].lat],
              width: size.x,
              height: size.y
            });
          const geotiffLayer = new RasterLayer(tiff, rasterFn, renderFn);
          geotiffLayer.addTo(this.$parent.mapObject)
          console.log(geotiffLayer);
        });
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>
