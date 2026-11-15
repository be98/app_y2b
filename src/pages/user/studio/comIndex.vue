<template>
  <q-page class="y-page-narrow">
    <com-need-login v-if="!loggedIn" icon="video_library" title="내 영상을 관리하려면 로그인하세요" />

    <template v-else>
      <div class="row items-center q-mb-md">
        <div class="y-title q-my-none">내 영상</div>
        <q-space />
        <q-btn unelevated rounded no-caps color="primary" icon="upload" label="업로드" href="/user/upload" />
      </div>

      <div v-if="loading" class="row justify-center q-my-xl"><q-spinner-dots size="40px" color="primary" /></div>
      <div v-else-if="!list.length" class="y-empty"><q-icon name="video_library" /><div>아직 올린 영상이 없습니다.</div></div>

      <q-list v-else separator class="y-studio">
        <q-item v-for="v in list" :key="v.video_id" class="q-py-md">
          <q-item-section avatar class="y-st-thumb">
            <a :href="fmt.watchUrl(v.video_id)"><img v-if="v.thumbnail" :src="v.thumbnail" alt="" /><div v-else class="y-st-empty"><q-icon name="smart_display" /></div></a>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold y-clamp2">{{ v.title }}</q-item-label>
            <q-item-label caption class="y-clamp2">{{ v.description || '설명 없음' }}</q-item-label>
            <q-item-label caption class="row items-center q-gutter-x-sm q-mt-xs">
              <span><q-icon :name="visIcon(v.visibility)" /> {{ fmt.visibilityLabel(v.visibility) }}</span>
              <q-badge v-if="v.is_hidden" color="negative" label="관리자 숨김" />
              <q-badge v-if="v.status !== 'ready'" color="orange" :label="statusLabel(v.status)" />
              <span>· {{ fmt.date(v.date_added) }}</span>
              <span>· 조회수 {{ fmt.count(v.view_count) }}</span>
              <span>· 댓글 {{ fmt.count(v.comment_count) }}</span>
              <span>· 좋아요 {{ fmt.count(v.like_count) }}</span>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row no-wrap">
              <q-btn flat round icon="edit" aria-label="수정" @click="openEdit(v)"><q-tooltip>수정</q-tooltip></q-btn>
              <q-btn flat round icon="delete" aria-label="삭제" @click="remove(v)"><q-tooltip>삭제</q-tooltip></q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <q-dialog v-model="edit.visible">
      <q-card style="width: 560px; max-width: 94vw">
        <q-card-section class="text-h6">영상 수정</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="edit.title" outlined label="제목" maxlength="200" counter :error="!!edit.err.title" :error-message="edit.err.title" />
          <q-input v-model="edit.description" outlined type="textarea" autogrow label="설명" maxlength="5000" class="q-mt-sm" />
          <div class="row items-center q-gutter-sm q-mt-md">
            <img :src="edit.thumbUrl || edit.thumbnail" v-if="edit.thumbUrl || edit.thumbnail" class="y-edit-thumb" alt="" />
            <q-btn outline rounded no-caps icon="image" label="썸네일 바꾸기" @click="$refs.thumb.click()" />
            <input ref="thumb" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="pickThumb" />
          </div>
          <q-option-group v-model="edit.visibility" :options="visOptions" class="q-mt-md" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="취소" v-close-popup />
          <q-btn unelevated rounded no-caps color="primary" label="저장" :loading="edit.saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'
import comNeedLogin from '@/components/y2b/comNeedLogin.vue'

export default {
  name: 'StudioIndex',
  components: { comNeedLogin },
  data() {
    return {
      fmt, list: [], loading: true,
      edit: { visible: false, video_id: 0, title: '', description: '', visibility: 'public', thumbnail: '', thumbFile: null, thumbUrl: '', err: {}, saving: false },
      visOptions: fmt.VISIBILITY.map((v) => ({ value: v.value, label: v.label })),
    }
  },
  computed: { loggedIn() { return this.$store.state.user.user_id > 0 } },
  async created() {
    if (!this.loggedIn) return
    await this.load()
    const id = Number(fmt.query('edit'))
    const v = this.list.find((x) => x.video_id === id)
    if (v) this.openEdit(v)
  },
  methods: {
    async load() {
      const r = await api.myVideos()
      this.loading = false
      if (r.success) this.list = r.list
    },
    visIcon(v) { return (fmt.VISIBILITY.find((x) => x.value === v) || {}).icon },
    statusLabel(s) { return { queued: '변환 대기', processing: '변환 중', failed: '변환 실패' }[s] || s },
    openEdit(v) {
      if (this.edit.thumbUrl) URL.revokeObjectURL(this.edit.thumbUrl)
      Object.assign(this.edit, { visible: true, video_id: v.video_id, title: v.title, description: v.description, visibility: v.visibility,
        thumbnail: v.thumbnail, thumbFile: null, thumbUrl: '', err: {}, saving: false })
    },
    pickThumb(e) {
      const f = e.target.files[0]
      e.target.value = ''
      if (!f) return
      if (f.size > 2 * 1024 * 1024) return this.$q.notify({ message: '썸네일은 2MB 까지입니다', color: 'negative' })
      this.edit.thumbFile = f
      this.edit.thumbUrl = URL.createObjectURL(f)
    },
    async save() {
      const e = this.edit
      e.saving = true
      const r = await api.saveVideo(e.video_id, { title: e.title, description: e.description, visibility: e.visibility, thumbnail: e.thumbFile })
      e.saving = false
      if (!r.success) { e.err = r.error || {}; return this.$q.notify({ message: r.message, color: 'negative' }) }
      e.visible = false
      this.$q.notify({ message: '저장했습니다', color: 'positive' })
      this.load()
    },
    remove(v) {
      this.$q.dialog({ title: '영상 삭제', message: `"${v.title}" 영상을 영구 삭제할까요? 조회수·댓글·좋아요도 함께 사라지며 되돌릴 수 없습니다.`,
        cancel: { flat: true, label: '취소' }, ok: { flat: true, label: '삭제', color: 'negative' } })
        .onOk(async () => {
          const r = await api.deleteVideo(v.video_id)
          if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
          this.list = this.list.filter((x) => x.video_id !== v.video_id)
          this.$q.notify({ message: '삭제했습니다', color: 'dark' })
        })
    },
  },
}
</script>

<style scoped>
.y-st-thumb { width: 160px; padding-right: 16px; }
.y-st-thumb img, .y-st-empty { width: 144px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; background: var(--y-soft); display: flex; align-items: center; justify-content: center; }
.y-edit-thumb { width: 160px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; }
@media (max-width: 599px) {
  .y-st-thumb { width: 104px; padding-right: 8px; }
  .y-st-thumb img, .y-st-empty { width: 96px; }
  .y-title { padding: 0 12px; }
}
</style>
