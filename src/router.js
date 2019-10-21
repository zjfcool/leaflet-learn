import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: {
        name:'geotiff'
      },
    },
    {
      path: '/geotiff',
      name: 'geotiff',
      component: () => import(/* webpackChunkName: "geotiff" */ './views/TiffMapLayer.vue')
    },
    {
      path: '/ec',
      name: 'leafletEcharts',
      component: () => import(/* webpackChunkName: "leafletEcharts" */ './views/EchartsMapLayer.vue')
    },
    {
      path: '/flow',
      name: 'flow',
      component: () => import(/* webpackChunkName: "flow" */ './views/FlowMapLayer.vue')
    },
    {
      path: '/points',
      name: 'points',
      component: () => import(/* webpackChunkName: "points" */ './views/PointsMapLayer.vue')
    },
  ]
})
