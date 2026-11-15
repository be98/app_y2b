<template>
  <q-page class="y-page-narrow">
    <div v-if="!q" class="y-empty"><q-icon name="search" /><div>검색어를 입력하세요.</div></div>
    <template v-else>
      <div class="y-title">'{{ q }}' 검색 결과</div>
      <com-video-card v-for="v in list" :key="v.video_id" :video="v" row show-desc class="y-result q-mb-md" />
      <div v-if="!loading && !list.length" class="y-empty"><q-icon name="search_off" /><div>검색 결과가 없습니다. 다른 검색어를 입력해 보세요.</div></div>
      <div v-if="loading" class="row justify-center q-my-lg"><q-spinner-dots size="40px" color="primary" /></div>
      <div v-else-if="more" class="text-center q-my-lg"><q-btn outline rounded no-caps label="더 보기" @click="load(page + 1)" /></div>
    </template>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import { query } from '@/app/y2b/format.js'
import comVideoCard from '@/components/y2b/comVideoCard.vue'

export default {
  name: 'SearchIndex',
  components: { comVideoCard },
  data() { return { q: query('q').trim(), list: [], page: 1, more: false, loading: false } },
  created() {
    if (!this.q) return
    document.title = this.q + ' - 검색 · y2b'
    this.load(1)
  },
  methods: {
    async load(page) {
      this.loading = true
      const r = await api.search(this.q, page)
      this.loading = false
      if (!r.success) return
      this.list = page === 1 ? r.list : this.list.concat(r.list)
      this.page = page
      this.more = r.list.length === 24
    },
  },
}
</script>

<style scoped>
/* 검색 결과는 썸네일을 크게 */
.y-result :deep(.y-thumb) { width: 360px; border-radius: 12px; }
.y-result :deep(.y-vtitle) { font-size: 18px; line-height: 26px; }
@media (max-width: 799px) { .y-result :deep(.y-thumb) { width: 45%; } }
</style>
