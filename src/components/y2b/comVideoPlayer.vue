<template>
  <div class="y-player">
    <video ref="video" controls playsinline preload="metadata" :src="useHls ? null : src"
      :poster="video.thumbnail || null" @timeupdate="tick" @error="onError"></video>
    <div v-if="error" class="y-player-error">
      <q-icon name="error_outline" size="40px" />
      <div>영상을 재생할 수 없습니다.</div>
      <div class="text-caption">브라우저가 이 MP4 형식(코덱)을 지원하지 않을 수 있습니다.</div>
    </div>
  </div>
</template>

<script>
import api from '@/app/y2b/api.js'

// hls_path 가 있으면 hls.js 로, 없으면 MP4 그대로 재생한다.
// 5초 이상 재생되면 'viewed' 를 한 번 보낸다 (조회수).
// 주소는 file_server 보기 토큰이 붙은 것이라 몇 시간 뒤 끝난다 → 재생 오류가 나면 시청 정보를 한 번 다시 받아 그 자리부터 이어서 재생
export default {
  name: 'ComVideoPlayer',
  props: { video: { type: Object, required: true } },
  emits: ['viewed'],
  data() { return { watched: 0, last: 0, sent: false, error: false, hls: null, src: this.video.file_path, refreshedAt: 0 } },
  computed: { useHls() { return !!this.video.hls_path } },
  async mounted() {
    const el = this.$refs.video
    if (!this.useHls) return
    if (el.canPlayType('application/vnd.apple.mpegurl')) { el.src = this.video.hls_path; return } // 사파리
    const { default: Hls } = await import('hls.js')
    if (!Hls.isSupported()) { el.src = this.video.file_path; return }
    // 조각(.ts·하위 m3u8) 요청에도 master 주소의 범위 토큰(t·s)을 붙인다
    const token = this.video.hls_path.split('?')[1] || ''
    this.hls = new Hls({
      xhrSetup: (xhr, url) => { if (token && !/[?&]t=/.test(url)) xhr.open('GET', url + (url.includes('?') ? '&' : '?') + token, true) },
    })
    this.hls.loadSource(this.video.hls_path)
    this.hls.attachMedia(el)
  },
  beforeUnmount() { if (this.hls) this.hls.destroy() },
  methods: {
    // 실제로 재생된 시간만 센다 (앞으로 건너뛴 구간은 빼고)
    tick() {
      const t = this.$refs.video.currentTime
      const d = t - this.last
      if (d > 0 && d < 1.5) this.watched += d
      this.last = t
      if (!this.sent && this.watched >= 5) { this.sent = true; this.$emit('viewed') }
    },
    async onError() {
      // 방금 새 주소로 바꿨는데 또 오류면 코덱 등 다른 문제다
      if (this.useHls || Date.now() - this.refreshedAt < 60000) { this.error = true; return }
      this.refreshedAt = Date.now()
      const el = this.$refs.video
      const at = el.currentTime
      const playing = !el.paused
      const r = await api.video(this.video.video_id)
      if (!r.success || !r.video.file_path) { this.error = true; return }
      this.src = r.video.file_path
      el.addEventListener('loadedmetadata', () => {
        el.currentTime = at
        if (playing) el.play().catch(() => {})
      }, { once: true })
    },
  },
}
</script>

<style scoped>
.y-player { position: relative; width: 100%; aspect-ratio: 16 / 9; background: #000; border-radius: 12px; overflow: hidden; }
.y-player video { width: 100%; height: 100%; display: block; background: #000; }
.y-player-error { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #eee; background: rgba(0,0,0,.85); text-align: center; padding: 16px; }
@media (max-width: 599px) { .y-player { border-radius: 0; } }
</style>
