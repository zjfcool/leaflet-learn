import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'geotiff',
      component: () => import(/* webpackChunkName: "geotiff" */ './views/TiffMapLayer.vue')
    },
    {
      path: '/ec',
      name: 'leafletEcharts',
      component: () => import(/* webpackChunkName: "leafletEcharts" */ './views/EchartsMapLayer.vue')
    },
  ]
})
