<template>
  <q-layout view="hHh lpR fFf" class="y-admin">
    <q-header class="bg-dark text-white">
      <q-toolbar>
        <q-icon name="smart_display" size="28px" color="red-5" />
        <q-toolbar-title class="text-weight-bold">y2b <span class="text-red-3">관리자</span></q-toolbar-title>
        <span v-if="adminName" class="text-caption q-mr-sm">{{ adminName }} 님</span>
        <q-btn flat dense no-caps icon="open_in_new" label="사이트" href="/user/main" target="_blank" />
        <q-btn flat dense no-caps icon="logout" label="로그아웃" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page v-if="ready" class="q-pa-md" style="max-width: 1280px; margin: 0 auto">
        <div class="row q-col-gutter-md q-mb-md">
          <div v-for="s in stats" :key="s.label" class="col-6 col-sm-4 col-md">
            <q-card flat bordered class="q-pa-md">
              <div class="text-caption text-grey-7">{{ s.label }}</div>
              <div class="text-h5 text-weight-bold" :class="s.cls">{{ s.value }}</div>
            </q-card>
          </div>
        </div>

        <q-card flat bordered>
          <q-tabs v-model="tab" align="left" no-caps active-color="primary" indicator-color="primary">
            <q-tab name="reports" :label="`신고 처리${summary.open_reports ? ' (' + summary.open_reports + ')' : ''}`" icon="flag" />
            <q-tab name="videos" label="영상" icon="video_library" />
          </q-tabs>
          <q-separator />

          <!-- 신고 -->
          <div v-show="tab === 'reports'" class="q-pa-md">
            <q-btn-toggle v-model="rStatus" no-caps unelevated toggle-color="dark" class="q-mb-md" @update:model-value="loadReports(1)"
              :options="[{ value: 'open', label: '처리 대기' }, { value: 'hidden', label: '숨김 처리됨' }, { value: 'rejected', label: '기각' }]" />
            <q-table flat :rows="reports" :columns="reportCols" row-key="report_id" :loading="loading.reports" hide-pagination
              :pagination="{ rowsPerPage: 0 }" no-data-label="신고가 없습니다">
              <template #body-cell-target="p">
                <q-td :props="p" style="max-width: 360px; white-space: normal">
                  <q-badge :color="p.row.target_type === 'video' ? 'blue-7' : 'teal'" :label="p.row.target_type === 'video' ? '영상' : '댓글'" class="q-mr-xs" />
                  <a :href="fmt.watchUrl(p.row.video_id)" target="_blank" class="y-link">{{ p.row.target_text || '(삭제됨)' }}</a>
                  <q-badge v-if="p.row.target_hidden" color="grey" label="숨김" class="q-ml-xs" />
                  <div v-if="p.row.same_count > 1" class="text-caption text-negative">같은 대상 신고 {{ p.row.same_count }}건</div>
                </q-td>
              </template>
              <template #body-cell-reason="p">
                <q-td :props="p" style="white-space: normal">
                  <div>{{ fmt.reasonLabel(p.row.reason) }}</div>
                  <div v-if="p.row.memo" class="text-caption text-grey-7">{{ p.row.memo }}</div>
                </q-td>
              </template>
              <template #body-cell-actions="p">
                <q-td :props="p">
                  <template v-if="p.row.status === 'open'">
                    <q-btn dense unelevated no-caps color="negative" label="숨김" class="q-mr-xs" @click="handle(p.row, 'hide')" />
                    <q-btn dense flat no-caps label="기각" @click="handle(p.row, 'reject')" />
                  </template>
                  <q-btn v-else-if="p.row.target_hidden" dense flat no-caps label="숨김 해제" @click="unhide(p.row)" />
                </q-td>
              </template>
            </q-table>
            <div class="row justify-center q-mt-md"><q-pagination v-if="rPages > 1" v-model="rPage" :max="rPages" @update:model-value="loadReports" /></div>
          </div>

          <!-- 영상 -->
          <div v-show="tab === 'videos'" class="q-pa-md">
            <div class="row q-gutter-sm q-mb-md items-center">
              <q-input v-model="vKeyword" dense outlined placeholder="제목·채널 검색" style="width: 240px" @keyup.enter="loadVideos(1)">
                <template #append><q-icon name="search" class="cursor-pointer" @click="loadVideos(1)" /></template>
              </q-input>
              <q-select v-model="vHidden" dense outlined emit-value map-options style="width: 140px" @update:model-value="loadVideos(1)"
                :options="[{ value: '', label: '전체' }, { value: '0', label: '노출 중' }, { value: '1', label: '숨김' }]" />
              <q-select v-model="vVis" dense outlined emit-value map-options style="width: 140px" @update:model-value="loadVideos(1)"
                :options="[{ value: '', label: '공개 범위 전체' }].concat(fmt.VISIBILITY.map((v) => ({ value: v.value, label: v.label })))" />
              <q-space />
              <span class="text-caption text-grey-7">총 {{ vTotal }}개</span>
            </div>
            <q-table flat :rows="videos" :columns="videoCols" row-key="video_id" :loading="loading.videos" hide-pagination
              :pagination="{ rowsPerPage: 0 }" no-data-label="영상이 없습니다">
              <template #body-cell-title="p">
                <q-td :props="p" style="max-width: 420px; white-space: normal">
                  <div class="row no-wrap items-center q-gutter-sm">
                    <img v-if="p.row.thumbnail" :src="p.row.thumbnail" class="y-adm-thumb" alt="" />
                    <div>
                      <a :href="fmt.watchUrl(p.row.video_id)" target="_blank" class="y-link text-weight-medium">{{ p.row.title }}</a>
                      <div class="text-caption text-grey-7">{{ p.row.channel_name }} · {{ fmt.visibilityLabel(p.row.visibility) }} · {{ fmt.bytes(p.row.file_size) }}</div>
                    </div>
                  </div>
                </q-td>
              </template>
              <template #body-cell-state="p">
                <q-td :props="p">
                  <q-badge v-if="p.row.is_hidden" color="grey" label="숨김" />
                  <q-badge v-else color="positive" label="노출" />
                  <q-badge v-if="p.row.open_reports" color="negative" :label="`신고 ${p.row.open_reports}`" class="q-ml-xs" />
                </q-td>
              </template>
              <template #body-cell-actions="p">
                <q-td :props="p">
                  <q-btn dense flat no-caps :color="p.row.is_hidden ? 'primary' : 'negative'" :label="p.row.is_hidden ? '숨김 해제' : '숨김'" @click="toggleVideo(p.row)" />
                </q-td>
              </template>
            </q-table>
            <div class="row justify-center q-mt-md"><q-pagination v-if="vPages > 1" v-model="vPage" :max="vPages" @update:model-value="loadVideos" /></div>
          </div>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'

export default {
  name: 'AdminY2bMain',
  data() {
    return {
      fmt, ready: false, adminName: '', tab: 'reports', summary: {}, loading: { reports: false, videos: false },
      reports: [], rStatus: 'open', rPage: 1, rPages: 1,
      videos: [], vKeyword: '', vHidden: '', vVis: '', vPage: 1, vPages: 1, vTotal: 0,
      reportCols: [
        { name: 'date', label: '신고일', field: 'date_added', align: 'left', format: (v) => fmt.date(v) },
        { name: 'target', label: '대상', align: 'left' },
        { name: 'reason', label: '사유', align: 'left' },
        { name: 'reporter', label: '신고자', field: 'reporter_name', align: 'left' },
        { name: 'actions', label: '', align: 'right' },
      ],
      videoCols: [
        { name: 'id', label: 'ID', field: 'video_id', align: 'left' },
        { name: 'title', label: '영상', align: 'left' },
        { name: 'views', label: '조회수', field: 'view_count', format: (v) => fmt.count(v) },
        { name: 'date', label: '올린 날', field: 'date_added', format: (v) => fmt.date(v) },
        { name: 'state', label: '상태', align: 'left' },
        { name: 'actions', label: '', align: 'right' },
      ],
    }
  },
  computed: {
    stats() {
      const s = this.summary
      return [
        { label: '회원', value: fmt.count(s.users) },
        { label: '채널', value: fmt.count(s.channels) },
        { label: '영상', value: fmt.count(s.videos) },
        { label: '저장 용량', value: fmt.bytes(s.bytes) },
        { label: '처리 대기 신고', value: s.open_reports || 0, cls: s.open_reports ? 'text-negative' : '' },
      ]
    },
  },
  async created() {
    // 관리자 세션 확인 — 로그인 안 되어 있으면 로그인 페이지로
    const r = await this.$c.io.get('/api/account/admin/info', {}).then((x) => x.data).catch(() => ({}))
    if (!r.success) return this.$c.goto_page('/admin/login')
    const p = r.admin_prof || {}
    this.adminName = p.admin_name || p.name || ''
    this.ready = true
    this.loadReports(1)
    this.loadVideos(1)
  },
  methods: {
    fail(r) {
      if (r.error_code === 'no_login') return this.$c.goto_page('/admin/login')
      this.$q.notify({ message: r.message, color: 'negative' })
    },
    async loadReports(page) {
      this.loading.reports = true
      const r = await api.admin.reports({ status: this.rStatus, page })
      this.loading.reports = false
      if (!r.success) return this.fail(r)
      Object.assign(this, { reports: r.list, rPage: r.page, rPages: Math.max(1, Math.ceil(r.total / r.limit)) })
    },
    async loadVideos(page) {
      this.loading.videos = true
      const r = await api.admin.videos({ keyword: this.vKeyword, hidden: this.vHidden, visibility: this.vVis, page })
      this.loading.videos = false
      if (!r.success) return this.fail(r)
      Object.assign(this, { videos: r.list, vPage: r.page, vTotal: r.total, vPages: Math.max(1, Math.ceil(r.total / r.limit)), summary: r.summary })
    },
    refresh() { this.loadReports(this.rPage); this.loadVideos(this.vPage) },
    async handle(row, action) {
      const r = await api.admin.handleReport(row.report_id, action)
      if (!r.success) return this.fail(r)
      this.$q.notify({ message: action === 'hide' ? '숨김 처리했습니다' : '기각했습니다', color: 'dark' })
      this.refresh()
    },
    async unhide(row) {
      const r = row.target_type === 'video' ? await api.admin.hideVideo(row.target_id, false) : await api.admin.hideComment(row.target_id, false)
      if (!r.success) return this.fail(r)
      this.refresh()
    },
    async toggleVideo(v) {
      const r = await api.admin.hideVideo(v.video_id, !v.is_hidden)
      if (!r.success) return this.fail(r)
      this.refresh()
    },
    logout() {
      this.$c.io.post('/api/account/admin/logout', {}).finally(() => this.$c.goto_page('/admin/login'))
    },
  },
}
</script>

<style scoped>
.y-admin { background: #f4f5f7; }
.y-adm-thumb { width: 96px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; flex: none; }
</style>
