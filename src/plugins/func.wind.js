import { WindLayer } from './ocean.weather.wind'

export class FuncWind {

  constructor(map) {
    this._map = map;
    this._findValData={}
    this._attribution = L.control.attribution({
      prefix:"no data",
      position:"bottomleft"
    }).addTo(this._map);
    
  }

  start(results) {
    this.getDataCallback(results)
  }

  stop() {
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    this._attribution.remove()
    this._map.off('mousemove');
  }

  showTooltip(e){
    const {lat,lng} = e.latlng;
    const arr = this._findValData[`${Math.floor(lat)},${Math.floor(lng)}`];
    if(arr){
      this._attribution.setPrefix(`经度：${arr[1]},纬度：${arr[0]},风速：${arr[2]},风向：${arr[3]}`)
    }else{
      this._attribution.setPrefix(`no data`)
    }
  }

  getDataCallback (results) {
    var datas = results;
    var config = {
      lat: '0',
      lng: '1',
      value: '2',
      dir: '3',
      data: datas
    };
    datas.forEach(item=>{
      this._findValData[`${Math.floor(item[0])},${Math.floor(item[1])}`]=item;
    })
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    
    this._layer = new WindLayer({}, config);
    this._map.addLayer(this._layer);
    this._map.on('mousemove',this.showTooltip.bind(this))
  }
}
