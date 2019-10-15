//"use strict";

var chroma = require("chroma-js");

var L = window.L;

var GeoRasterLayer = L.GridLayer.extend({

    initialize: function initialize(options) {
        try {
            console.log("starting GeoRasterLayer.initialize with", options);
            options = Object.assign({
                keepBuffer: 25,
                resolution: 2**5,
                updateWhenZooming: false,
                interpolation: false
            },options)
            
            

            var georaster = options.georaster;
            this.georaster = georaster;

            this.scale =  options.color?options.color:chroma.scale('RdYlBu');


            /*
                Unpacking values for use later.
                We do this in order to increase speed.
            */
            this._maxs = georaster.maxs;
            this._mins = georaster.mins;
            this._ranges = georaster.ranges;
            this._no_data_value = georaster.noDataValue;
            this._pixelWidth = georaster.pixelWidth;
            this._pixelHeight = georaster.pixelHeight;
            this._rasters = georaster.values;
            this._tiff_width = georaster.width;
            this._tiff_height = georaster.height;
            this._xmin = georaster.xmin;
            this._ymin = georaster.ymin;
            this._xmax = georaster.xmax;
            this._ymax = georaster.ymax;
            // this._map = null
            this._popup = L.popup();
            
            // console.log("georaster.ymin:", georaster.ymin);
            var southWest = L.latLng(georaster.ymin, georaster.xmin);
            var northEast = L.latLng(georaster.ymax, georaster.xmax);
            this._bounds = L.latLngBounds(southWest, northEast);
            // console.log("this._bounds:", this._bounds);
            options.bounds = this._bounds;
            L.setOptions(this, options);

            /*
                Caching the constant tile size, so we don't recalculate everytime we
                create a new tile
            */
            var tileSize = this.getTileSize();

            this._tile_height = tileSize.y;
            this._tile_width = tileSize.x;
        } catch (error) {
            console.error("ERROR initializing GeoTIFFLayer", error);
        }
    },

    createTile: function createTile(coords) {

        var no_data_value = this._no_data_value;
        var pixelWidth = this._pixelWidth;
        var pixelHeight = this._pixelHeight;
        var rasters = this._rasters;
        var scale = this.scale;
        var xmin = this._xmin;
        var ymin = this._ymin;
        var xmax = this._xmax;
        var ymax = this._ymax;

        var tile = L.DomUtil.create('canvas', 'leaflet-tile');
        tile.height = this._tile_height;
        tile.width = this._tile_width;

        // get a canvas context and draw something on it using coords.x, coords.y and coords.z
        var context = tile.getContext('2d');

        var bounds = this._tileCoordsToBounds(coords);

        //if (debug_level >= 1) console.log("bounds:", bounds);

        var xmin_of_tile = bounds.getWest();
        var xmax_of_tile = bounds.getEast();
        var ymin_of_tile = bounds.getSouth();
        var ymax_of_tile = bounds.getNorth();
        //if (debug_level >= 1) console.log("ymax_of_tile:", ymax_of_tile);
        var resolution = this.options.resolution;

       resolution = 128
        var number_of_rectangles_across = resolution;
        var number_of_rectangles_down = resolution;

        var height_of_rectangle_in_pixels = this._tile_height / number_of_rectangles_down;
        //if (debug_level >= 1) console.log("height_of_rectangle_in_pixels:", height_of_rectangle_in_pixels);
        var width_of_rectangle_in_pixels = this._tile_width / number_of_rectangles_across;
        //if (debug_level >= 1) console.log("width_of_rectangle:", width_of_rectangle_in_pixels);

        var height_of_rectangle_in_degrees = (ymax_of_tile - ymin_of_tile) / number_of_rectangles_down;
        //if (debug_level >= 1) console.log("height_of_rectangle_in_degrees:", height_of_rectangle_in_degrees);
        var width_of_rectangle_in_degrees = (xmax_of_tile - xmin_of_tile) / number_of_rectangles_across;
        //if (debug_level >= 1) console.log("width_of_rectangle_in_degrees:", width_of_rectangle_in_degrees);

        //if (debug_level >= 1) console.log("ymax of raster:", ymax);

        var number_of_pixels_per_rectangle = this._tile_width / 8;

        for (var h = 0; h < number_of_rectangles_down; h++) {
            var lat = ymax_of_tile - (h + 0.5) * height_of_rectangle_in_degrees;

            for (var w = 0; w < number_of_rectangles_across; w++) {
                var lng = xmin_of_tile + (w + 0.5) * width_of_rectangle_in_degrees;

                if (lat > ymin && lat < ymax && lng > xmin && lng < xmax
                    //&& this.isContain(lng,lat)
                ) {
                        let x_in_raster_pixels = Math.floor( (lng - xmin) / pixelWidth );
                        let y_in_raster_pixels = Math.floor( (ymax - lat) / pixelHeight );
                        let values = rasters.map(raster => raster[y_in_raster_pixels][x_in_raster_pixels]);
                        let color;
                        if(values[0]==no_data_value){
                            color ='rgba(0,0,0,0)'
                        } else{
                            let value = this.options.interpolation?this.interpolatedValueAtIndexes((lng - xmin) / pixelWidth,(ymax - lat) / pixelHeight):values[0]
                            color = scale(value).hex();
                        }
                       context.fillStyle = color;

                       context.fillRect(w * width_of_rectangle_in_pixels, h * height_of_rectangle_in_pixels, width_of_rectangle_in_pixels, height_of_rectangle_in_pixels);
                    //if (debug_level >= 1) duration_filling_rects += performance.now() - time_started_filling_rect;


                }
            }
        }
      return tile;

    },
    interpolatedValueAtIndexes(i,j){
        const raster = this._rasters[0]
        let tiff_width = this._tiff_width
        let tiff_height = this._tiff_height;
        let fi,fj,ci,cj
        let g00, g10, g01, g11
        if(i >= tiff_width - 1){
          fi = ci =  tiff_width - 1
        }else{
          fi = Math.floor(i)
          ci = fi + 1
        }
        if(j >= tiff_height - 1){
          fj = cj =  tiff_height - 1
        }else{
          fj = Math.floor(j)
          cj = fj + 1
        }
        const row0 = raster[fj]
          g00 = row0[fi]
          g10 = row0[ci];

      const row1 = raster[cj]

      g01 = row1[fi]
      g11 = row1[ci];
      return this._doInterpolation(i-fi,j-fj,g00, g10, g01, g11)
    },
      /**
       * Bilinear interpolation for Number
       * https://en.wikipedia.org/wiki/Bilinear_interpolation
       * @param   {Number} x
       * @param   {Number} y
       * @param   {Number} g00
       * @param   {Number} g10
       * @param   {Number} g01
       * @param   {Number} g11
       * @returns {Number}
       */
      _doInterpolation(x, y, g00, g10, g01, g11) {
        var rx = 1 - x;
        var ry = 1 - y;
        return g00 * rx * ry + g10 * x * ry + g01 * rx * y + g11 * x * y;
      },
    getBounds: function getBounds() {
        return this._bounds;
    },

    getColor: function getColor(name) {
        var d = document.createElement("div");
        d.style.color = name;
        document.body.appendChild(d);
        return window.getComputedStyle(d).color;
    },
    onLayerDidMount:function() {
        this._map.on('click', this._onClick, this);
    },
    _onClick:function(e){
      this._queryvalue(e)
      this.fire('click', e);
    },
    _queryvalue(e){
      let xmin = this._xmin;
      let ymax = this._ymax;
      let pixelWidth = this._pixelWidth;
      let pixelHeight = this._pixelHeight;
      let lng = e.latlng.lng
      let lat = e.latlng.lat
      let rasters = this._rasters[0]
    let x_pixels = Math.floor((lng - xmin) / pixelWidth);
    let y_pixels = Math.floor((ymax - lat) / pixelHeight);
    const value =  rasters[y_pixels][x_pixels]
    if(!value) return;
    L.popup().setLatLng(e.latlng)
        .setContent(value+'')
        .openOn(this._map);
    },
    onAdd:function(map){
      this._map = map
      L.GridLayer.prototype.onAdd.call(this, map);
      this.onLayerDidMount()
    }
});

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = GeoRasterLayer;
}
if (typeof window !== "undefined") {
    window["GeoRasterLayer"] = GeoRasterLayer;
} else if (typeof self !== "undefined") {
    self["GeoRasterLayer"] = GeoRasterLayer; // jshint ignore:line
}