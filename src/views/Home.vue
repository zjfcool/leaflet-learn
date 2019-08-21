<template>
  <map-layout>
    <map-layer></map-layer>
  </map-layout>
</template>

<script>
// @ is an alias to /src
import MapLayer from '@/components/MapLayer'
import MapLayout from '@/components/MapLayout';
export default {
  name: 'home',
  components: {
    MapLayer,
    MapLayout
  }
}
</script>

