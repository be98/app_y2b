<template>
  <div class="y-player">
    <video ref="video" controls playsinline preload="metadata" :src="useHls ? null : video.file_path"
      :poster="video.thumbnail || null" @timeupdate="tick" @error="onError"></video>
    <div v-if="error" class="y-player-error">
      <q-icon name="error_outline" size="40px" />
      <div>영상을 재생할 수 없습니다.</div>
      <div class="text-caption">브라우저가 이 MP4 형식(코덱)을 지원하지 않을 수 있습니다.</div>
    </div>
  </div>
</template>

<script>
// hls_path 가 있으면(B 방식) hls.js 로, 없으면(C 방식) MP4 그대로 재생한다.
// 5초 이상 재생되면 'viewed' 를 한 번 보낸다 (조회수).
export default {
  name: 'ComVideoPlayer',
  props: { video: { type: Object, required: true } },
  emits: ['viewed'],
  data() { return { watched: 0, last: 0, sent: false, error: false, hls: null } },
  computed: { useHls() { return !!this.video.hls_path } },
  async mounted() {
    const el = this.$refs.video
    if (!this.useHls) return
    if (el.canPlayType('application/vnd.apple.mpegurl')) { el.src = this.video.hls_path; return } // 사파리
    const { default: Hls } = await import('hls.js')
    if (!Hls.isSupported()) { el.src = this.video.file_path; return }
    this.hls = new Hls()
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
    onError() { this.error = true },
  },
}
</script>

<style scoped>
.y-player { position: relative; width: 100%; aspect-ratio: 16 / 9; background: #000; border-radius: 12px; overflow: hidden; }
.y-player video { width: 100%; height: 100%; display: block; background: #000; }
.y-player-error { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; color: #eee; background: rgba(0,0,0,.85); text-align: center; padding: 16px; }
@media (max-width: 599px) { .y-player { border-radius: 0; } }
</style>
