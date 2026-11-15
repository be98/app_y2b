<template>
  <q-dialog v-model="visible">
    <q-card style="width: 420px; max-width: 92vw">
      <q-card-section class="text-h6">{{ targetType === 'video' ? '영상 신고' : '댓글 신고' }}</q-card-section>
      <q-card-section class="q-pt-none">
        <q-option-group v-model="reason" :options="reasons" type="radio" />
        <q-input v-model="memo" type="textarea" outlined autogrow maxlength="500" counter label="자세한 내용 (선택)" class="q-mt-sm" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat no-caps label="취소" v-close-popup />
        <q-btn flat no-caps color="primary" label="신고" :disable="!reason" :loading="saving" @click="send" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import api from '@/app/y2b/api.js'
import { REPORT_REASONS } from '@/app/y2b/format.js'

export default {
  name: 'ComReportDialog',
  data() {
    return { visible: false, targetType: 'video', targetId: 0, reason: '', memo: '', saving: false,
      reasons: REPORT_REASONS.map((r) => ({ value: r.value, label: r.label })) }
  },
  methods: {
    open(targetType, targetId) {
      if (!(this.$store.state.user.user_id > 0)) return this.$emitter.emit('login')
      Object.assign(this, { targetType, targetId, reason: '', memo: '', visible: true })
    },
    async send() {
      this.saving = true
      const r = await api.report(this.targetType, this.targetId, this.reason, this.memo)
      this.saving = false
      this.$q.notify({ message: r.success ? '신고가 접수되었습니다. 검토 후 조치하겠습니다.' : r.message, color: r.success ? 'dark' : 'negative' })
      if (r.success) this.visible = false
    },
  },
}
</script>
