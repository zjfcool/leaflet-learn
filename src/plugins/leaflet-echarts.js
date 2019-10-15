import L from 'leaflet';
L.EchartsLayer = L.Class.extend({
    includes: [L.Evented],
    _echartsContainer: null,
    _map: null,
    _ec: null,
    _option: null,
    _mapOffset: [0, 0],
    _delta: 0,
    _startTime: null,
    _lastMousePos: null,
    _data: null,
    _once: 0,
    initialize: function (map, ec, oriData = []) {
        this._map = map;
        let size = map.getSize();
        const div = this._echartsContainer = document.createElement('div');
        div.style.position = 'absolute';
        div.style.height = size.y + 'px';
        div.style.width = size.x + 'px';
        div.style.top = 0;
        div.style.left = 0;
        div.style.zIndex = 555
        this.overlayPane = map.getPanes().overlayPane;
        this.overlayPane.appendChild(div);
        this._init(map, ec);
        this._data = oriData
        this._once = 0;
    },

    _init: function (map, ec) {
        let task;
        const self = this;
        self._map = map;
        //初始化mapoverlay
        /**
         * 获取echarts容器
         *
         * @return {HTMLElement}
         * @public
         */
        self.getEchartsContainer = function () {
            return self._echartsContainer;
        };
        self.update = function ({
            seriesIndex,
            data
        }) {
            this._data[seriesIndex] = data
            self._once = 1;
            self._ec && self._ec.clear();
            self.setOption(self._option)
        }
        self.reload = function () {
            self._once = 1;
            self._ec && self._ec.clear();
            console.log(self._option);
            self._ec.setOption(self._option);
        }
        /**
         * 获取map实例
         *
         * @return {map.Map}
         * @public
         */
        self.getMap = function () {
            return self._map;
        };
        /**
         * 经纬度转换为屏幕像素
         *
         * @param {Array.<number>} geoCoord  经纬度
         * @return {Array.<number>}
         * @public
         */
        self.geoCoord2Pixel = function (latLng) {
            //const point = new L.latLng(geoCoord[1], geoCoord[0]);
            const pos = self._map.latLngToContainerPoint(latLng);
            return [pos.x, pos.y];
        };

        /**
         * 屏幕像素转换为经纬度
         *
         * @param {Array.<number>} pixel  像素坐标
         * @return {Array.<number>}
         * @public
         */
        self.pixel2GeoCoord = function (pixel) {
            const point = self._map.containerPointToLatLng(L.point(pixel[0], pixel[1]));
            return [point.lng, point.lat];
        };

        /**
         * 初始化echarts实例
         *
         * @return {ECharts}
         * @public
         */
        self.initECharts = function () {

            self._ec = ec.init.apply(self, arguments);

            self._bindEvent();
            return self._ec;
        };


        /**
         * 获取ECharts实例
         *
         * @return {ECharts}
         * @public
         */
        self.getECharts = function () {
            return self._ec;
        };

        /**
         * 获取地图的偏移量
         *
         * @return {Array.<number>}
         * @public
         */
        self.getMapOffset = function () {
            return self._mapOffset;
        };

        /**
         * 对echarts的setOption加一次处理
         * 用来为markPoint、markLine中添加x、y坐标，需要name与geoCoord对应
         *
         * @public
         * @param option
         * @param notMerge
         */
        self.setOption = function (option, notMerge) {
            self._option = option;
            let series = self._option.series;
            if (!Array.isArray(series)) series = [series];
            for (let i = 0; i < series.length; i++) {
                if (series[i].coordinateSystem !== 'geo') return;
                if (self._once === 0) self._data[i] = series[i].data;
                if (series[i].type === 'scatter') {
                    self.scatterRender(series[i], i)
                }
                if (series[i].type === 'flowGL' || series[i].type === 'custom') {
                    self.flowRender(series[i], i)
                }
                if (series[i].type === 'lines') {
                    self.linesRender(series[i], i)
                }
            }
            self._ec.setOption(option, notMerge);

        };
        // 风场
        self.flowRender = function (serie, index = 0) {
            serie.data = self.flowData(self._data[index]);
        }
        self.flowData = function (data) {
            const ret = [];
            for (let i = 0; i < data.length; i++) {
                const layerXY = self.geoCoord2Pixel(L.latLng([data[i][1], data[i][0]]));
                ret.push([layerXY[0], layerXY[1]].concat(data[i].slice(2)))
            }
            return ret;
        }
        // 散点
        self.scatterRender = function (serie, index = 0) {
            serie.data = self.scatterData(self._data[index]);
        }
        self.scatterData = function (data) {
            const ret = [];
            for (let i = 0; i < data.length; i++) {
                const layerXY = self.geoCoord2Pixel(L.latLng([data[i].value[1], data[i].value[0]]));
                ret.push(Object.assign({},data[i],{
                    value: [layerXY[0], layerXY[1]].concat(data[i].value.slice(2))
                }))
            }
            return ret;
        }
        // 线
        self.linesRender = function (serie, index = 0) {
            serie.data = self.linesData(self._data[index]);
        }
        self.linesData = function (data) {
            const ret = [],
                coords = [];
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].coords.length; j++) {
                    const layerXY = self.geoCoord2Pixel(L.latLng([data[i].coords[j][1], data[i].coords[j][0]]));
                    coords.push([layerXY[0], layerXY[1]].concat(data[i].coords[j].slice(2)))
                }
                let obj = Object.assign({},data[i],{
                    coords: coords
                })
                ret.push(obj)

            }
            return ret;
        }

        /**
         * 绑定地图事件的处理方法
         *
         * @private
         */
        self._bindEvent = function () {
            console.log('hello')
            self._map.on('move', _moveHandler('moving'));
            self._map.on('moveend', _moveHandler('moveend'));
            self._map.on('zoomstart', function () {
                self._ec.clear();
            }); //去掉zoomstart事件
            self._map.on('zoomend', _zoomChangeHandler);
            self._ec.getZr().on('mousewheel', function (e) {
                if (self._map.getZoom() == self._map.getMaxZoom()) {
                    self._ec.clear(); //在mousewheel的时候清除echarts内容
                    _zoomChangeHandler();
                } else if (self._map.getZoom() == self._map.getMinZoom()) {
                    self._ec.clear(); //在mousewheel的时候清除echarts内容
                    _zoomChangeHandler();
                } else {
                    self._ec.clear(); //在mousewheel的时候清除echarts内容
                    self._lastMousePos = self._map.mouseEventToContainerPoint(e.event);
                    let delta = L.DomEvent.getWheelDelta(e.event);
                    const map = self._map,
                        zoom = map.getZoom();
                    delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
                    delta = Math.max(Math.min(delta, 4), -4);
                    delta = map._limitZoom(zoom + delta) - zoom;

                    self._delta = 0;
                    self._startTime = null;

                    if (!delta) {
                        return;
                    }

                    if (map.options.scrollWheelZoom === 'center') {
                        map.setZoom(zoom + delta);
                    } else {
                        map.setZoomAround(self._lastMousePos, zoom + delta);
                    }
                }

            });
        };
        // 追加数据
        self.appendData = function ({
            seriesIndex,
            data
        }) {
            self._data[seriesIndex] = self._data[seriesIndex].concat(data);
            let series = self._option.series,
                serieData = null;
            if (!Array.isArray(self._option.series)) series = [series];
            const type = series[seriesIndex].type;
            switch (type) {
                case 'scatter':
                    serieData = self.scatterData(data);
                    break;
                case 'lines':
                    serieData = self.linesData(data);
                    break;
                case 'custom':
                    serieData = self.flowData(data);
                    break;
                case 'flowGL':
                    serieData = self.flowData(data);
                    break;
            }
            self.getECharts().appendData({
                seriesIndex,
                data: serieData
            })
        }
        /**
         * 地图缩放触发事件
         *
         * @private
         */
        function _zoomChangeHandler() {
            let timer;
            if (self._option.series) {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    self._once = 1;
                    self.setOption(self._option)
                }, 150);
            }
        }

        /**
         * 地图移动、如拖拽触发事件
         *
         * @param {string} type moving | moveend  移动中|移动结束
         * @return {Function}
         * @private
         */
        function _moveHandler(type) {
            return function () {
                const domPosition = self._map._getMapPanePos();
                // 记录偏移量
                self._mapOffset = [-parseInt(domPosition.x) || 0, -parseInt(domPosition.y) || 0];
                self._echartsContainer.style.left = self._mapOffset[0] + 'px';
                self._echartsContainer.style.top = self._mapOffset[1] + 'px';
                //_fireEvent(type);
                if (type == 'moving') {
                    self._ec.clear();
                }
                if (type == 'moveend') {
                    _zoomChangeHandler()
                }
            }
        }
    },
    destory: function(){
        this.overlayPane.removeChild(this._echartsContainer);
    }
});
L.echartsLayer = function (map, ec, data = []) {
    return new L.EchartsLayer(map, ec, data)
}