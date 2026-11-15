<template>
  <q-dialog v-model="visible">
    <q-card class="nick-card">
      <q-card-section class="row items-center q-pb-none">
        <span class="text-h6">닉네임 설정</span>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="nick_name"
          outlined
          autofocus
          maxlength="150"
          counter
          label="닉네임"
          placeholder="사용할 닉네임을 입력하세요"
          :error="!!error"
          :error-message="error"
          @keyup.enter="save"
        >
          <template #prepend>
            <q-icon name="badge" />
          </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" color="grey-7" v-close-popup />
        <q-btn unelevated label="저장" color="primary" :loading="saving" @click="save" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'comNicknameDialog',
  emits: ['saved'],
  data() {
    return {
      visible: false,
      nick_name: '',
      error: '',
      saving: false,
    }
  },
  methods: {
    // 다이얼로그 열기 — 현재 닉네임(없으면 store값)을 프리필.
    open(current) {
      this.error = ''
      this.nick_name = (current != null ? current : this.$store.state.user.nick_name) || ''
      this.visible = true
    },
    async save() {
      const nick_name = (this.nick_name || '').trim()
      if (!nick_name) {
        this.error = '닉네임을 입력해 주세요.'
        return
      }
      this.saving = true
      this.error = ''
      try {
        const res = await this.$c.io.put('/api/account/user/info/nick_name', { nick_name })
        const data = res.data
        if (data && data.success) {
          // store 반영 — 화면 표시가 즉시 갱신됨.
          this.$store.state.user.nick_name = data.nick_name || nick_name
          this.$emit('saved', this.$store.state.user.nick_name)
          this.visible = false
          this.$q.notify({ message: '닉네임을 변경했어요.', color: 'positive', position: 'top' })
        } else {
          // 서버 필드 에러(error.nick_name) 우선 표시.
          this.error = (data && data.error && data.error.nick_name)
            ? data.error.nick_name
            : '저장에 실패했어요. 다시 시도해 주세요.'
        }
      } catch (e) {
        this.error = '저장 중 오류가 발생했어요. 다시 시도해 주세요.'
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.nick-card {
  width: 340px;
  max-width: 90vw;
  border-radius: 16px;
}
</style>
