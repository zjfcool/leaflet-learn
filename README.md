# leaflet-learn

## Example
[demo](https://zjfcool.github.io/leaflet-learn/dist/)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### geotiff文件在leaflet中的几种渲染方式  

1. 怎样解析一个geotiff文件  


解析geotiff文件我们需要用到开源的库[geotiff](https://github.com/geotiffjs/geotiff.js),具体用法如下

```javscript

import * as GeoTIFF from 'geotiff'

const tiff= await GeoTIFF.fromArrayBuffer(buffer);
let image = await tiff.getImage();
this.tiffWidth = image.getWidth();
this.tiffHeight = image.getHeight();
let rasters = await image.readRasters();
let tiepoint = image.getTiePoints()[0];
let pixelScale = image.getFileDirectory().ModelPixelScale;
<!-- 坐标，像素转换 -->
this.geoTransform = [
        tiepoint.x,
        pixelScale[0],
        0,
        tiepoint.y,
        0,
        -1 * pixelScale[1]
    ];
<!-- 生成二维数组 -->

this.tempData = new Array(this.tiffHeight);
for (let j = 0; j < this.tiffHeight; j++) {
    this.tempData[j] = new Array(this.tiffWidth);
    for (let i = 0; i < this.tiffWidth; i++) {
        this.tempData[j][i] = rasters[0][i + j * this.tiffWidth];
    }
}

```

2. 将解析完的tiff文件转为等值面  [示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToGeojsonLayer.vue)
```

import {isobands} from "raster-marching-squares";
<!-- 区间划分 -->
const intervalsSpd = [-1,0,1,2,3,4,5];
this.geojson_data = isobands(
    this.tempData,
    this.geoTransform,
    intervalsSpd
);
<!-- 渲染到地图中 -->
import 'leaflet.vectorgrid'
<!-- 矢量切片layer -->
this.layer = L.vectorGrid.slicer(this.geojson_data,{
    rendererFactory: L.canvas.tile,
    interactive: true,
    vectorTileLayerStyles:{
        sliced:this.geojsonStyle
    },
}).addTo(this.map);

```

3. 将tiff文件转化为图片渲染到地图中 [示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/TiffToImageLayer.vue)

```

<!-- 获取边界 -->
const bounds = image.getBoundingBox();
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
<!-- 渲染到地图中 -->
L.imageOverlay(
    canvas.toDataURL(),
    [[bounds[1], bounds[0]], [bounds[3], bounds[2]]],
    {
        opacity: 0.3
    }
).addTo(this.map);


```

### leaflet与echarts结合

1. 风场[示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/WindyLayer.vue)
2. 散点[示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/ScatterLayer.vue)

### 风场

1. 动态风场，使用插件[leaflet-velocity](https://github.com/zjfcool/leaflet-learn/blob/master/src/plugins/leaflet-velocity.js),[示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/FlowLayer.vue)

2. 静态风场[示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/StaticFlowLayer.vue)

### 散点聚合

1. 聚合插件[leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster),[示例代码](https://github.com/zjfcool/leaflet-learn/blob/master/src/components/MarkerClusterLayer.vue)