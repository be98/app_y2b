<template>
  <div class="mp-app">
    <header class="mp-head">
      <div class="mp-head-inner">
        <q-btn flat round dense icon="arrow_back" aria-label="메인으로" @click="goMain" />
        <span class="mp-title">마이페이지</span>
      </div>
    </header>

    <main class="mp-body">
      <section class="mp-card mp-profile">
        <div class="mp-avatar">{{ userInitial }}</div>
        <div>
          <div class="mp-name">{{ displayName || '이름 없음' }}</div>
          <div class="mp-sub">{{ userName }}</div>
        </div>
      </section>

      <section class="mp-card mp-menu">
        <q-item clickable @click="$refs.nickDialog.open()">
          <q-item-section avatar><q-icon name="badge" /></q-item-section>
          <q-item-section>닉네임 설정</q-item-section>
          <q-item-section side>{{ nickName }}</q-item-section>
        </q-item>
      </section>

      <q-btn unelevated color="negative" label="로그아웃" class="full-width" @click="doLogout" />
    </main>

    <com-nickname-dialog ref="nickDialog" />
  </div>
</template>

<script>
import comNicknameDialog from '@/components/comNicknameDialog.vue'

export default {
  name: 'MyPageIndex',
  components: { comNicknameDialog },
  computed: {
    user() {
      return this.$store.state.user
    },
    loggedIn() {
      return this.user.user_id > 0
    },
    userName() {
      return this.user.user_name
    },
    nickName() {
      return this.user.nick_name
    },
    displayName() {
      return this.nickName || this.userName
    },
    userInitial() {
      return this.displayName ? this.displayName.trim().charAt(0).toUpperCase() : ''
    },
  },
  methods: {
    goMain() {
      this.$c.goto_page('/user/main')
    },
    doLogout() {
      this.$q.loading.show()
      this.$c.io.post('/api/account/user/logout', {}).then((response) => {
        if (response.data && response.data.success) {
          this.goMain()
        } else {
          this.$q.loading.hide()
          this.$q.notify({ message: '로그아웃에 실패했어요. 다시 시도해 주세요.', color: 'negative', position: 'top' })
        }
      })
    },
  },
  mounted() {
    // 개인 화면 보호 — 사용자 정보는 HTML 의 /api/account/user/info/js 로 동기 주입되므로 바로 판단할 수 있다.
    if (!this.loggedIn) this.goMain()
  },
}
</script>

<style scoped>
.mp-app {
  min-height: 100vh;
  background: #f5f7fa;
  color: #1e293b;
}
.mp-head {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.mp-head-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 640px;
  height: 56px;
  margin: 0 auto;
  padding: 0 12px;
}
.mp-title {
  font-size: 18px;
  font-weight: 700;
}
.mp-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}
.mp-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}
.mp-menu {
  padding: 4px;
}
.mp-profile {
  display: flex;
  align-items: center;
  gap: 16px;
}
.mp-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #1976d2;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}
.mp-name {
  font-size: 18px;
  font-weight: 700;
}
.mp-sub {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 14px;
}
</style>
