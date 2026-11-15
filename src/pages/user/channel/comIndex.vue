<template>
  <q-page class="y-page-narrow">
    <div v-if="loading && !channel" class="row justify-center q-my-xl"><q-spinner-dots size="40px" color="primary" /></div>
    <div v-else-if="!channel" class="y-empty"><q-icon name="person_off" /><div>{{ error || '채널을 찾을 수 없습니다.' }}</div></div>

    <template v-else>
      <div class="y-ch-head">
        <com-avatar :name="channel.name" :src="channel.avatar" size="120px" class="y-ch-avatar" />
        <div class="col" style="min-width: 0">
          <h1 class="y-ch-name">{{ channel.name }}</h1>
          <div class="y-muted">@{{ channel.handle }} · 구독자 {{ fmt.count(channel.subscriber_count) }}명 · 동영상 {{ fmt.count(channel.video_count) }}개</div>
          <div v-if="channel.description" class="y-muted q-mt-sm y-ch-desc">{{ channel.description }}</div>
          <div class="q-mt-md row q-gutter-sm">
            <template v-if="isOwner">
              <q-btn unelevated rounded no-caps class="y-soft-btn" label="채널 맞춤설정" href="/user/mypage" />
              <q-btn unelevated rounded no-caps class="y-soft-btn" label="동영상 관리" href="/user/studio" />
            </template>
            <q-btn v-else unelevated rounded no-caps :class="subscribed ? 'y-soft-btn' : ''" :color="subscribed ? undefined : 'dark'"
              :label="subscribed ? '구독중' : '구독'" :loading="busy" @click="toggleSub" />
          </div>
        </div>
      </div>

      <q-tabs v-model="sort" align="left" no-caps dense active-color="dark" indicator-color="dark" class="q-mt-lg" @update:model-value="load(1)">
        <q-tab name="latest" label="최신순" />
        <q-tab name="popular" label="인기순" />
      </q-tabs>
      <q-separator class="q-mb-lg" />

      <div v-if="videos.length" class="y-grid">
        <com-video-card v-for="v in videos" :key="v.video_id" :video="v" hide-channel />
      </div>
      <div v-else-if="!loading" class="y-empty"><q-icon name="video_library" /><div>공개된 영상이 없습니다.</div></div>
      <div v-if="more" class="text-center q-my-lg"><q-btn outline rounded no-caps label="더 보기" :loading="loading" @click="load(page + 1)" /></div>
    </template>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'
import comVideoCard from '@/components/y2b/comVideoCard.vue'
import comAvatar from '@/components/y2b/comAvatar.vue'

export default {
  name: 'ChannelIndex',
  components: { comVideoCard, comAvatar },
  data() {
    return { fmt, handle: fmt.query('c'), channel: null, videos: [], subscribed: false, isOwner: false,
      sort: 'latest', page: 1, more: false, loading: true, busy: false, error: '' }
  },
  created() { this.load(1) },
  methods: {
    async load(page) {
      this.loading = true
      const r = await api.channel(this.handle, this.sort, page)
      this.loading = false
      if (!r.success) { this.error = r.message; return }
      Object.assign(this, { channel: r.channel, subscribed: r.subscribed, isOwner: r.is_owner, page })
      this.videos = page === 1 ? r.videos : this.videos.concat(r.videos)
      this.more = r.videos.length === 24
      document.title = r.channel.name + ' · y2b'
    },
    async toggleSub() {
      if (!(this.$store.state.user.user_id > 0)) return this.$emitter.emit('login')
      this.busy = true
      const r = await api.subscribe(this.handle, !this.subscribed)
      this.busy = false
      if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
      this.subscribed = r.subscribed
      this.channel.subscriber_count = r.subscriber_count
    },
  },
}
</script>

<style scoped>
.y-ch-head { display: flex; gap: 24px; align-items: center; margin-top: 16px; }
.y-ch-name { font-size: 32px; font-weight: 800; line-height: 1.2; margin: 0 0 4px; word-break: break-word; }
.y-ch-desc { white-space: pre-wrap; max-height: 60px; overflow: hidden; }
.y-soft-btn { background: var(--y-soft); }
@media (max-width: 599px) {
  .y-ch-head { flex-direction: column; text-align: center; padding: 0 12px; gap: 12px; }
  .y-ch-head .row { justify-content: center; }
  .y-ch-avatar { width: 80px !important; height: 80px !important; font-size: 80px !important; }
  .y-ch-name { font-size: 24px; }
}
</style>
