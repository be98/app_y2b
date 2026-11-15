<template>
  <com-index />
</template>

<script>
import comIndex from './comIndex.vue'

export default {
  name: 'App',
  components: { comIndex },
  created() { this.$c.$root = this },
}
</script>
