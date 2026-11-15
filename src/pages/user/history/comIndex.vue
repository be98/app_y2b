<template>
  <q-page class="y-page-narrow">
    <com-need-login v-if="!loggedIn" icon="history" title="시청 기록을 보려면 로그인하세요" />

    <template v-else>
      <div class="row items-center q-mb-md">
        <div class="y-title q-my-none">시청 기록</div>
        <q-space />
        <q-btn v-if="list.length" flat rounded no-caps icon="delete_sweep" label="전체 지우기" @click="clearAll" />
      </div>
      <div v-for="v in list" :key="v.video_id" class="row no-wrap items-start q-mb-md">
        <com-video-card :video="v" row show-desc class="col" />
        <q-btn flat round dense icon="close" aria-label="기록에서 삭제" @click="removeOne(v)"><q-tooltip>기록에서 삭제</q-tooltip></q-btn>
      </div>
      <div v-if="!loading && !list.length" class="y-empty"><q-icon name="history" /><div>시청 기록이 없습니다.</div></div>
      <div v-if="loading" class="row justify-center q-my-lg"><q-spinner-dots size="40px" color="primary" /></div>
      <div v-else-if="more" class="text-center q-my-lg"><q-btn outline rounded no-caps label="더 보기" @click="load(page + 1)" /></div>
    </template>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import comVideoCard from '@/components/y2b/comVideoCard.vue'
import comNeedLogin from '@/components/y2b/comNeedLogin.vue'

export default {
  name: 'HistoryIndex',
  components: { comVideoCard, comNeedLogin },
  data() { return { list: [], page: 1, more: false, loading: true } },
  computed: { loggedIn() { return this.$store.state.user.user_id > 0 } },
  created() { if (this.loggedIn) this.load(1) },
  methods: {
    async load(page) {
      this.loading = true
      const r = await api.history(page)
      this.loading = false
      if (!r.success) return
      this.list = page === 1 ? r.list : this.list.concat(r.list)
      this.page = page
      this.more = r.list.length === 30
    },
    async removeOne(v) {
      const r = await api.clearHistory(v.video_id)
      if (r.success) this.list = this.list.filter((x) => x.video_id !== v.video_id)
    },
    clearAll() {
      this.$q.dialog({ title: '시청 기록 지우기', message: '시청 기록을 모두 지울까요?', cancel: { flat: true, label: '취소' }, ok: { flat: true, label: '지우기', color: 'primary' } })
        .onOk(async () => {
          const r = await api.clearHistory(0)
          if (r.success) this.list = []
        })
    },
  },
}
</script>
