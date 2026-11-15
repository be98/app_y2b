<template>
  <com-y2b-layout>
    <com-index />
  </com-y2b-layout>
</template>

<script>
import comY2bLayout from '@/components/y2b/comY2bLayout.vue'
import comIndex from './comIndex.vue'

export default { name: 'App', components: { comY2bLayout, comIndex } }
</script>
