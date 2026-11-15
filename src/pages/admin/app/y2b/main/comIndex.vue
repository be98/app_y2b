<template>
  <div class="admin-main">
    <!-- 상단 바: 브랜드 + 관리자 + 로그아웃 -->
    <header class="am-top">
      <div class="am-brand">y2b <span>관리자</span></div>
      <div class="am-user">
        <span v-if="adminName" class="am-name">{{ adminName }} 님</span>
        <q-btn flat dense color="grey-8" icon="logout" label="로그아웃" @click="logout" />
      </div>
    </header>

    <main class="am-body">
      <h1>y2b 관리</h1>
      <p class="am-sub">관리자 메인입니다. 관리 화면을 만들면 아래에 카드를 추가하세요.</p>

      <div class="am-cards">
        <div class="am-card">
          <q-icon name="dashboard" size="30px" color="primary" />
          <b>준비중</b>
          <span>관리 메뉴를 추가하세요</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'AdminY2bMain',
  data() {
    return { adminName: '' }
  },
  methods: {
    // 관리자 세션 확인(가드) — 로그인 안 되어 있으면 로그인 페이지로.
    async loadAdmin() {
      try {
        const res = await this.$c.io.get('/api/account/admin/info', {})
        const d = res.data || {}
        if (!d.success) {
          this.$c.goto_page('/admin/login')
          return
        }
        const p = d.admin_prof || {}
        this.adminName = p.admin_name || p.name || ''
      } catch (e) {
        this.$c.goto_page('/admin/login')
      }
    },
    logout() {
      this.$c.io
        .post('/api/account/admin/logout', {})
        .then(() => this.$c.goto_page('/admin/login'))
        .catch(() => this.$c.goto_page('/admin/login'))
    },
  },
  created() {
    this.loadAdmin()
  },
}
</script>

<style scoped>
.admin-main {
  position: fixed;
  inset: 0;
  overflow: auto;
  background: #eef2f6;
  color: #1e293b;
  font-family: 'Segoe UI', sans-serif;
}
/* 상단 바 */
.am-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: #1e293b;
  color: #fff;
}
.am-brand {
  font-size: 18px;
  font-weight: 800;
}
.am-brand span {
  color: #7dd0ff;
}
.am-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.am-name {
  font-size: 14px;
  color: #cbd5e1;
}
/* 본문 */
.am-body {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 48px;
  box-sizing: border-box;
}
.am-body h1 {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 800;
}
.am-sub {
  margin: 0 0 24px;
  color: #64748b;
}
.am-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.am-card {
  background: #fff;
  border: 1px solid #e2eaf2;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(20, 40, 60, 0.05);
}
.am-card b {
  font-size: 16px;
  margin-top: 4px;
}
.am-card span {
  font-size: 13px;
  color: #94a3b8;
}
.am-card-link { cursor: pointer; transition: box-shadow .15s, transform .15s; }
.am-card-link:hover { box-shadow: 0 8px 22px rgba(20, 40, 60, 0.12); transform: translateY(-2px); }
</style>
