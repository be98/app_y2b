<template>
  <q-page class="y-page">
    <div v-if="loading" class="row justify-center q-my-xl"><q-spinner-dots size="40px" color="primary" /></div>
    <div v-else-if="!video" class="y-empty">
      <q-icon name="videocam_off" />
      <div>{{ error || '볼 수 없는 영상입니다.' }}</div>
      <q-btn flat rounded no-caps color="primary" label="홈으로" href="/user/main" class="q-mt-md" />
    </div>

    <div v-else class="y-watch">
      <div class="y-main">
        <!-- 관리자가 숨긴 영상은 파일이 공개 경로에서 빠져 있어 주인도 재생할 수 없다 -->
        <div v-if="video.is_hidden" class="y-hidden-box">
          <q-icon name="visibility_off" size="48px" />
          <div class="text-subtitle1 text-weight-bold q-mt-sm">관리자가 숨긴 영상입니다</div>
          <div class="text-caption">신고 검토 결과 숨김 처리되어 다른 사람에게 보이지 않고 재생도 되지 않습니다.</div>
        </div>
        <com-video-player v-else :key="video.video_id" :video="video" @viewed="viewed" />

        <div v-if="video.visibility !== 'public' || video.is_hidden" class="q-mt-sm row q-gutter-xs">
          <q-chip v-if="video.visibility !== 'public'" dense square :icon="video.visibility === 'private' ? 'lock' : 'link'">{{ fmt.visibilityLabel(video.visibility) }}</q-chip>
          <q-chip v-if="video.is_hidden" dense square color="negative" text-color="white" icon="visibility_off">관리자가 숨긴 영상 (나만 보임)</q-chip>
        </div>
        <h1 class="y-vtitle">{{ video.title }}</h1>

        <div class="y-bar">
          <a :href="fmt.channelUrl(video.channel_handle)" class="y-link row no-wrap items-center q-gutter-sm">
            <com-avatar :name="video.channel_name" :src="video.channel_avatar" size="40px" />
            <div>
              <div class="text-weight-bold">{{ video.channel_name }}</div>
              <div class="text-caption y-muted">구독자 {{ fmt.count(video.subscriber_count) }}명</div>
            </div>
          </a>
          <q-btn v-if="isOwner" unelevated rounded no-caps class="y-soft-btn" icon="edit" label="영상 수정" :href="'/user/studio?edit=' + video.video_id" />
          <q-btn v-else unelevated rounded no-caps :class="subscribed ? 'y-soft-btn' : ''" :color="subscribed ? undefined : 'dark'"
            :icon="subscribed ? 'notifications' : undefined" :label="subscribed ? '구독중' : '구독'" :loading="busy.sub" @click="toggleSub" />
          <q-space />
          <div class="y-pill">
            <q-btn flat rounded no-caps :icon="my === 1 ? 'thumb_up' : 'thumb_up_off_alt'" :label="fmt.count(video.like_count)" @click="react(1)" aria-label="좋아요" />
            <q-separator vertical inset />
            <q-btn flat rounded :icon="my === -1 ? 'thumb_down' : 'thumb_down_off_alt'" @click="react(-1)" aria-label="싫어요" />
          </div>
          <q-btn unelevated rounded no-caps class="y-soft-btn" icon="share" label="공유" @click="share" />
          <q-btn v-if="!isOwner" unelevated round class="y-soft-btn" icon="flag" aria-label="신고" @click="$refs.report.open('video', video.video_id)">
            <q-tooltip>신고</q-tooltip>
          </q-btn>
        </div>

        <div class="y-desc" :class="{ open: descOpen }" @click="descOpen = true">
          <div class="text-weight-bold">조회수 {{ video.view_count.toLocaleString() }}회 · {{ fmt.date(video.date_added) }}</div>
          <div class="y-desc-text">{{ video.description || '설명이 없습니다.' }}</div>
          <q-btn v-if="!descOpen" flat dense no-caps label="더보기" class="text-weight-bold" />
          <q-btn v-else flat dense no-caps label="간략히" class="text-weight-bold" @click.stop="descOpen = false" />
        </div>

        <com-comments class="q-mt-lg":video-id="video.video_id" :count="video.comment_count" :owner-id="video.user_id"
          @report="(c) => $refs.report.open('comment', c.comment_id)" @changed="(n) => (video.comment_count = Math.max(0, video.comment_count + n))" />
      </div>

      <aside class="y-side">
        <com-video-card v-for="v in next" :key="v.video_id" :video="v" row class="q-mb-sm" />
      </aside>
    </div>

    <com-report-dialog ref="report" />
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'
import comVideoPlayer from '@/components/y2b/comVideoPlayer.vue'
import comVideoCard from '@/components/y2b/comVideoCard.vue'
import comAvatar from '@/components/y2b/comAvatar.vue'
import comComments from '@/components/y2b/comComments.vue'
import comReportDialog from '@/components/y2b/comReportDialog.vue'

export default {
  name: 'WatchIndex',
  components: { comVideoPlayer, comVideoCard, comAvatar, comComments, comReportDialog },
  data() {
    return { fmt, loading: true, error: '', video: null, next: [], my: 0, subscribed: false, isOwner: false,
      descOpen: false, busy: { sub: false } }
  },
  computed: { loggedIn() { return this.$store.state.user.user_id > 0 } },
  async created() {
    const r = await api.video(fmt.query('v'))
    this.loading = false
    if (!r.success) { this.error = r.message; return }
    Object.assign(this, { video: r.video, next: r.next, my: r.my_reaction, subscribed: r.subscribed, isOwner: r.is_owner })
    document.title = r.video.title + ' · y2b'
  },
  methods: {
    async viewed() {
      const r = await api.view(this.video.video_id)
      if (r.success && r.counted) this.video.view_count += 1
    },
    async react(value) {
      if (!this.loggedIn) return this.$emitter.emit('login')
      const v = this.my === value ? 0 : value
      const r = await api.react(this.video.video_id, v)
      if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
      this.my = r.my_reaction
      this.video.like_count = r.like_count
      this.video.dislike_count = r.dislike_count
    },
    async toggleSub() {
      if (!this.loggedIn) return this.$emitter.emit('login')
      this.busy.sub = true
      const r = await api.subscribe(this.video.channel_handle, !this.subscribed)
      this.busy.sub = false
      if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
      this.subscribed = r.subscribed
      this.video.subscriber_count = r.subscriber_count
    },
    async share() {
      const url = location.origin + fmt.watchUrl(this.video.video_id)
      try {
        await navigator.clipboard.writeText(url)
        this.$q.notify({ message: '링크를 복사했습니다', color: 'dark' })
      } catch (e) {
        this.$q.dialog({ title: '공유', prompt: { model: url, type: 'text' }, ok: { flat: true, label: '닫기' } })
      }
    },
  },
}
</script>

<style scoped>
.y-watch { display: flex; gap: 24px; align-items: flex-start; }
.y-main { flex: 1; min-width: 0; }
.y-hidden-box { aspect-ratio: 16 / 9; border-radius: 12px; background: #222; color: #ddd; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 16px; }
.y-side { width: 402px; flex: none; }
.y-vtitle { font-size: 20px; line-height: 28px; font-weight: 700; margin: 12px 0 8px; word-break: break-word; }
.y-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; }
.y-pill { display: flex; align-items: center; background: var(--y-soft); border-radius: 20px; }
.y-soft-btn { background: var(--y-soft); }
.y-desc { background: var(--y-soft); border-radius: 12px; padding: 12px; margin-top: 12px; font-size: 14px; cursor: pointer; }
.y-desc-text { white-space: pre-wrap; word-break: break-word; max-height: 40px; overflow: hidden; }
.y-desc.open { cursor: default; }
.y-desc.open .y-desc-text { max-height: none; }
@media (max-width: 1100px) {
  .y-watch { flex-direction: column; }
  .y-side { width: 100%; }
}
@media (max-width: 599px) {
  .y-vtitle, .y-bar, .y-desc { margin-left: 12px; margin-right: 12px; }
  .y-vtitle { font-size: 18px; }
}
</style>
