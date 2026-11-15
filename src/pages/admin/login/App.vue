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
    // response_notify 등 공용 유틸이 참조하는 루트 인스턴스 등록
    this.$c.$root = this
  },
}
</script>
