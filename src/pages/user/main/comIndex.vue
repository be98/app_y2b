<template>
  <q-page class="y-page">
    <template v-if="popular.length">
      <div class="y-title"><q-icon name="local_fire_department" color="primary" class="q-mr-xs" />이번 주 인기</div>
      <div class="y-grid q-mb-xl">
        <com-video-card v-for="v in popular" :key="'p' + v.video_id" :video="v" />
      </div>
    </template>

    <div class="y-title">최신 영상</div>
    <div v-if="latest.length" class="y-grid">
      <com-video-card v-for="v in latest" :key="v.video_id" :video="v" />
    </div>
    <div v-else-if="!loading" class="y-empty">
      <q-icon name="video_library" />
      <div class="q-mb-md">아직 올라온 영상이 없습니다. 첫 영상을 올려 보세요.</div>
      <q-btn unelevated rounded no-caps color="primary" icon="upload" label="업로드" href="/user/upload" />
    </div>
    <div v-if="loading" class="row justify-center q-my-lg"><q-spinner-dots size="40px" color="primary" /></div>
    <div v-else-if="more" class="text-center q-my-lg">
      <q-btn outline rounded no-caps label="더 보기" @click="load(page + 1)" />
    </div>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import comVideoCard from '@/components/y2b/comVideoCard.vue'

export default {
  name: 'MainIndex',
  components: { comVideoCard },
  data() { return { popular: [], latest: [], page: 1, more: false, loading: true } },
  created() { this.load(1) },
  methods: {
    async load(page) {
      this.loading = true
      const r = await api.home(page)
      this.loading = false
      if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
      if (page === 1) this.popular = r.popular
      this.latest = page === 1 ? r.latest : this.latest.concat(r.latest)
      this.page = page
      this.more = r.latest.length === 24
    },
  },
}
</script>
