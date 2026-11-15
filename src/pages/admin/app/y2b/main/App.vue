<template>
  <div v-cloak>
    <com-index />
    <com-loading mode="hourglass" />
  </div>
</template>

<script>
import comIndex from './comIndex.vue'
import comLoading from '@/components/comLoading.vue'

export default {
  name: 'App',
  components: { comIndex, comLoading },
  created() {
    this.$c.$root = this
  },
}
</script>
