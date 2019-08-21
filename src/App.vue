<template>
  <div id="app">
    <nav-list :data="navList"></nav-list>
    <router-view/>
  </div>
</template>
<script>
import NavList from '@/components/NavList';
export default {
  components:{
    NavList
  },
  data(){
    return {
      navList:[
        {
          label:'geotiff',
          link:{
            name:'geotiff'
          }
        },
        {
          label:'leaflet-echarts',
          link:{
            name:'leafletEcharts'
          }
        }
      ]
    }
  }
}
</script>
<style lang="less">
#app{
  height: 100%;
}
</style>
