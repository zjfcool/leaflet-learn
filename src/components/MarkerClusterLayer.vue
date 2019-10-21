<template></template>

<script>
import L from 'leaflet';
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
export default {
  name: "MarkerClusterLayer",
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  methods: {
    init() {
      if(this.data.length===0) return;
      if(this.markers) this.markers.clearLayers();
      this.markers = L.markerClusterGroup();
      for (let i = 0; i < this.data.length; i++) {
        this.markers.addLayer(
          L.marker(this.data[i].latlng,{
              icon:L.divIcon({className:'marker-station',iconSize:12})
          }).bindPopup(
            this.formatContent(this.data[i])
          )
        );
      }
      this.markers.addTo(this.$parent.mapObject);
    },
    formatContent(data){
      let arr = [],desc=data.desc,img=data.img;
      Object.keys(desc).forEach(item=>{
        arr.push(`<p>${desc[item].label}:${desc[item].value}</p>`)
      })
      if(img) arr.push(`<p>${img.label}:</p><img src="${img.value}" style="max-height:100%;max-width:100%;"/>`)
      return arr.join('')
    }
  },
  mounted() {
    this.init();
  },
  watch: {
    data(){
      this.init();
    }
  }
};
</script>
<style lang="css">
.marker-station{
  border-radius: 50%;
  box-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  background-color: #222;
}
</style>

