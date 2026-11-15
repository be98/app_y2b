<template>
  <q-page class="y-page-narrow">
    <com-need-login v-if="!loggedIn" icon="video_call" title="영상을 올리려면 로그인하세요" text="로그인하면 내 채널이 만들어지고 바로 영상을 올릴 수 있습니다." />

    <template v-else>
      <div class="y-title">동영상 업로드</div>

      <!-- 1. 파일 고르기 -->
      <div v-if="!file" class="y-drop" :class="{ over: dragOver }" @dragover.prevent="dragOver = true" @dragleave="dragOver = false"
        @drop.prevent="onDrop" @click="$refs.input.click()" role="button" tabindex="0" @keydown.enter="$refs.input.click()">
        <q-icon name="upload" size="64px" class="y-drop-icon" />
        <div class="text-h6 q-mt-md">동영상 파일을 끌어다 놓거나 눌러서 고르세요</div>
        <div class="y-muted q-mt-xs">MP4 (H.264 권장) · 최대 {{ MAX_MB }}MB</div>
        <q-btn unelevated rounded no-caps color="primary" label="파일 선택" class="q-mt-lg" />
        <input ref="input" type="file" accept="video/mp4,.mp4" hidden @change="(e) => pick(e.target.files[0])" />
      </div>

      <!-- 2. 정보 입력 + 업로드 -->
      <div v-else class="y-upload">
        <div class="y-form">
          <q-input v-model="info.title" outlined label="제목 (필수)" maxlength="200" counter :error="!!err.title" :error-message="err.title" :disable="busy" />
          <q-input v-model="info.description" outlined type="textarea" label="설명" maxlength="5000" autogrow input-style="min-height: 120px" class="q-mt-sm" :disable="busy" />

          <div class="text-subtitle2 q-mt-md q-mb-xs">썸네일</div>
          <div class="row q-gutter-sm items-center">
            <img v-if="thumbUrl" :src="thumbUrl" class="y-thumb-pick" alt="썸네일 미리보기" />
            <div class="column q-gutter-xs">
              <q-btn outline rounded no-caps icon="image" label="이미지 업로드" :disable="busy" @click="$refs.thumb.click()" />
              <q-btn v-if="thumbCustom" flat rounded no-caps label="영상 장면으로 되돌리기" :disable="busy" @click="captureAt(sceneTime)" />
              <q-btn v-else flat rounded no-caps icon="shuffle" label="다른 장면" :disable="busy || !meta.duration" @click="otherScene" />
            </div>
            <input ref="thumb" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="(e) => pickThumb(e.target.files[0])" />
          </div>

          <div class="text-subtitle2 q-mt-md">공개 범위</div>
          <q-option-group v-model="info.visibility" :options="visOptions" :disable="busy" />
        </div>

        <div class="y-preview">
          <video ref="preview" :src="fileUrl" controls muted playsinline preload="metadata" @loadeddata="onLoaded" @error="onVideoError"></video>
          <div class="q-pa-md">
            <div class="text-caption y-muted">파일 이름</div>
            <div class="ellipsis">{{ file.name }}</div>
            <div class="text-caption y-muted q-mt-sm">크기 · 길이</div>
            <div>{{ fmt.bytes(file.size) }} · {{ meta.duration ? fmt.duration(meta.duration) : '확인 중' }}</div>
          </div>
        </div>

        <div class="y-actions">
          <div v-if="busy || progress" class="col">
            <q-linear-progress :value="progress" rounded size="8px" color="primary" />
            <div class="text-caption y-muted q-mt-xs">{{ progress < 1 ? `업로드 중 ${Math.floor(progress * 100)}%` : '처리 중…' }}</div>
          </div>
          <q-space v-else />
          <q-btn flat rounded no-caps label="취소" :disable="busy" @click="reset" />
          <q-btn unelevated rounded no-caps color="primary" icon="publish" label="업로드" :loading="busy" :disable="!canUpload" @click="upload" />
        </div>
      </div>
    </template>

    <canvas ref="canvas" hidden></canvas>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'
import comNeedLogin from '@/components/y2b/comNeedLogin.vue'

const MAX_MB = 500 // 서버 web.json video.max_mb 와 맞춘다 (서버가 최종 검사)

export default {
  name: 'UploadIndex',
  components: { comNeedLogin },
  data() {
    return {
      fmt, MAX_MB, file: null, fileUrl: '', dragOver: false, meta: { duration: 0, playable: true },
      info: { title: '', description: '', visibility: 'public' }, err: {},
      thumbBlob: null, thumbUrl: '', thumbCustom: false, sceneTime: 1,
      busy: false, progress: 0,
      visOptions: fmt.VISIBILITY.map((v) => ({ value: v.value, label: `${v.label} — ${v.desc}` })),
    }
  },
  computed: {
    loggedIn() { return this.$store.state.user.user_id > 0 },
    canUpload() { return !this.busy && this.meta.playable && this.info.title.trim() && this.meta.duration > 0 },
  },
  beforeUnmount() { this.revoke() },
  methods: {
    onDrop(e) { this.dragOver = false; this.pick(e.dataTransfer.files[0]) },
    pick(f) {
      if (!f) return
      if (!/\.mp4$/i.test(f.name)) return this.$q.notify({ message: 'MP4 파일만 올릴 수 있습니다', color: 'negative' })
      if (f.size > MAX_MB * 1024 * 1024) return this.$q.notify({ message: `${MAX_MB}MB 까지 올릴 수 있습니다`, color: 'negative' })
      this.revoke()
      this.file = f
      this.fileUrl = URL.createObjectURL(f)
      this.meta = { duration: 0, playable: true }
      this.info.title = f.name.replace(/\.mp4$/i, '').slice(0, 200)
      this.thumbCustom = false
    },
    // 메타데이터가 아니라 첫 프레임까지 읽힌 뒤에 캡처해야 검은 화면이 안 나온다
    onLoaded() {
      const v = this.$refs.preview
      this.meta.duration = Math.round(v.duration || 0)
      if (!v.videoWidth) return this.onVideoError()
      this.sceneTime = Math.min(1, v.duration / 2)
      if (!this.thumbCustom) this.captureAt(this.sceneTime)
    },
    onVideoError() {
      this.meta.playable = false
      this.$q.dialog({ title: '재생할 수 없는 영상', message: '이 브라우저에서 재생되지 않는 MP4 입니다. 다른 사람도 볼 수 없으니 H.264 코덱의 MP4 로 변환해서 올려 주세요. (아이폰 HEVC 영상은 "호환성 우선"으로 내보내기)', ok: { flat: true, label: '확인' } })
        .onOk(() => this.reset())
    },
    otherScene() { this.captureAt(Math.random() * this.meta.duration * 0.9) },
    captureAt(t) {
      const v = this.$refs.preview
      const done = () => {
        v.removeEventListener('seeked', done)
        const c = this.$refs.canvas
        const w = Math.min(1280, v.videoWidth)
        c.width = w
        c.height = Math.round((v.videoHeight / v.videoWidth) * w)
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height)
        c.toBlob((b) => { if (b) this.setThumb(b, false) }, 'image/jpeg', 0.85)
      }
      v.addEventListener('seeked', done)
      v.currentTime = t
    },
    pickThumb(f) {
      if (!f) return
      if (f.size > 2 * 1024 * 1024) return this.$q.notify({ message: '썸네일은 2MB 까지입니다', color: 'negative' })
      this.setThumb(f, true)
    },
    setThumb(blob, custom) {
      if (this.thumbUrl) URL.revokeObjectURL(this.thumbUrl)
      this.thumbBlob = blob
      this.thumbUrl = URL.createObjectURL(blob)
      this.thumbCustom = custom
    },
    revoke() {
      if (this.fileUrl) URL.revokeObjectURL(this.fileUrl)
      if (this.thumbUrl) URL.revokeObjectURL(this.thumbUrl)
      this.fileUrl = this.thumbUrl = ''
    },
    reset() {
      this.revoke()
      Object.assign(this, { file: null, thumbBlob: null, progress: 0, err: {}, meta: { duration: 0, playable: true } })
    },
    async upload() {
      this.err = {}
      this.busy = true
      this.progress = 0
      const thumb = this.thumbBlob ? new File([this.thumbBlob], 'thumbnail.jpg', { type: this.thumbBlob.type || 'image/jpeg' }) : null
      const r = await api.upload(this.file, { ...this.info, duration: this.meta.duration, thumbnail: thumb }, (p) => { this.progress = p })
      this.busy = false
      if (!r.success) {
        this.progress = 0
        this.err = r.error || {}
        return this.$q.notify({ message: r.message || '업로드에 실패했습니다', color: 'negative' })
      }
      this.$q.notify({ message: r.status === 'ready' ? '업로드했습니다' : '업로드했습니다. 변환이 끝나면 공개됩니다', color: 'positive' })
      location.href = fmt.watchUrl(r.video_id)
    },
  },
}
</script>

<style scoped>
.y-drop { border: 2px dashed #ccc; border-radius: 16px; padding: 64px 16px; text-align: center; cursor: pointer; transition: background .15s; }
.y-drop.over, .y-drop:hover { background: var(--y-soft); }
.y-drop-icon { background: var(--y-soft); border-radius: 50%; padding: 24px; color: var(--y-muted); }
.y-upload { display: grid; grid-template-columns: 1fr 360px; gap: 24px; }
.y-preview { background: var(--y-soft); border-radius: 12px; overflow: hidden; align-self: start; }
.y-preview video { width: 100%; aspect-ratio: 16 / 9; background: #000; display: block; }
.y-thumb-pick { width: 192px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; background: #000; }
.y-actions { grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--y-line); padding-top: 16px; }
@media (max-width: 899px) {
  .y-upload { grid-template-columns: 1fr; padding: 0 12px; }
  .y-preview { order: -1; }
}
</style>
