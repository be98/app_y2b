<template>
  <div class="admin-login">
    <form class="al-card" @submit.prevent="handleLogin">
      <div class="al-brand">
        <div class="al-logo">🛡️</div>
        <h1>y2b <span>관리자</span></h1>
        <p>관리자 계정으로 로그인하세요.</p>
      </div>

      <q-input
        outlined
        class="al-input"
        v-model="form.admin_name"
        placeholder="관리자 아이디"
        autofocus
        :error="!!error.admin_name"
        :error-message="error.admin_name"
      >
        <template #prepend><q-icon name="person" /></template>
      </q-input>

      <q-input
        outlined
        class="al-input"
        v-model="form.passwd"
        type="password"
        placeholder="비밀번호"
        :error="!!error.passwd"
        :error-message="error.passwd"
      >
        <template #prepend><q-icon name="lock" /></template>
      </q-input>

      <q-btn
        unelevated
        color="primary"
        class="al-submit"
        type="submit"
        label="로그인"
        :loading="loading"
      />
    </form>
  </div>
</template>

<script>
export default {
  name: 'AdminLoginIndex',
  data() {
    return {
      form: { admin_name: '', passwd: '' },
      error: {},
      loading: false,
    }
  },
  methods: {
    // 관리자 로그인 → 성공 시 관리자 메인으로 이동. 실패 시 필드/메시지 에러 표시.
    handleLogin() {
      if (this.loading) return
      this.error = {}
      this.loading = true
      this.$c.io
        .post('/api/account/admin/login', this.form)
        .then((res) => {
          const data = res.data || {}
          if (data.success) {
            this.$c.goto_page('/admin/app/y2b/main')
          } else {
            this.error = data.error || {}
            if (data.message) this.$c.response_notify(0, data.message)
            this.loading = false
          }
        })
        .catch(() => {
          this.$c.response_notify(0, '로그인 처리 중 오류가 발생했습니다.')
          this.loading = false
        })
    },
  },
}
</script>

<style scoped>
.admin-login {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #1e293b, #334155);
}
.al-card {
  width: min(100%, 360px);
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(8, 15, 30, 0.35);
  padding: 32px 28px 28px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.al-brand {
  text-align: center;
  margin-bottom: 6px;
}
.al-logo {
  font-size: 40px;
  line-height: 1;
}
.al-brand h1 {
  margin: 10px 0 4px;
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
}
.al-brand h1 span {
  color: #2f6cae;
}
.al-brand p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.al-submit {
  margin-top: 6px;
  height: 46px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 10px;
}
</style>
