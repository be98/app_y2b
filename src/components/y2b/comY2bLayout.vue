<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="y-header" bordered>
      <q-toolbar class="y-toolbar">
        <q-btn flat round dense icon="menu" aria-label="메뉴" @click="drawer = !drawer" />
        <a href="/user/main" class="y-logo" aria-label="y2b 홈">
          <q-icon name="smart_display" size="30px" color="primary" /><span>y2b</span>
        </a>
        <q-space />
        <form class="y-search gt-xs" role="search" @submit.prevent="search">
          <input v-model="q" type="search" placeholder="검색" aria-label="검색어" />
          <button type="submit" aria-label="검색"><q-icon name="search" size="22px" /></button>
        </form>
        <q-btn class="lt-sm" flat round dense icon="search" aria-label="검색" @click="mobileSearch = true" />
        <q-space />
        <q-btn flat round dense icon="video_call" aria-label="업로드" @click="go('/user/upload', true)">
          <q-tooltip>업로드</q-tooltip>
        </q-btn>
        <template v-if="loggedIn">
          <q-btn flat round dense class="q-ml-sm" aria-label="내 계정">
            <com-avatar :name="displayName" :src="channel.avatar" size="32px" />
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 220px">
                <q-item>
                  <q-item-section avatar><com-avatar :name="displayName" :src="channel.avatar" size="40px" /></q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ channel.name || displayName }}</q-item-label>
                    <q-item-label caption>@{{ channel.handle }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item v-if="channel.handle" clickable :href="channelHref"><q-item-section avatar><q-icon name="account_box" /></q-item-section><q-item-section>내 채널</q-item-section></q-item>
                <q-item clickable href="/user/studio"><q-item-section avatar><q-icon name="video_library" /></q-item-section><q-item-section>내 영상 관리</q-item-section></q-item>
                <q-item clickable href="/user/mypage"><q-item-section avatar><q-icon name="settings" /></q-item-section><q-item-section>채널 설정</q-item-section></q-item>
                <q-separator />
                <q-item clickable @click="logout"><q-item-section avatar><q-icon name="logout" /></q-item-section><q-item-section>로그아웃</q-item-section></q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
        <q-btn v-else outline rounded no-caps color="primary" icon="account_circle" label="로그인" class="q-ml-sm" @click="login()" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above :width="220" :breakpoint="1024" class="y-drawer">
      <q-list padding>
        <q-item v-for="m in menus" :key="m.href" clickable :href="m.href" :active="active(m.href)" active-class="y-menu-active">
          <q-item-section avatar><q-icon :name="m.icon" /></q-item-section>
          <q-item-section>{{ m.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <slot />
    </q-page-container>

    <q-dialog v-model="mobileSearch" position="top">
      <q-card style="width: 100vw">
        <form class="row items-center q-pa-sm no-wrap" @submit.prevent="search">
          <q-input v-model="q" dense outlined autofocus class="col" placeholder="검색" type="search" />
          <q-btn type="submit" flat round icon="search" aria-label="검색" />
        </form>
      </q-card>
    </q-dialog>

    <com-user-login-popup ref="loginPopup" />
  </q-layout>
</template>

<script>
// 모든 y2b 화면의 틀 — 상단바(로고·검색·업로드·계정)와 왼쪽 메뉴.
// 로그인이 필요한 동작은 this.$emitter.emit('login') 또는 ref 의 login() 으로 팝업을 띄운다.
import comUserLoginPopup from '@/components/comUserLoginPopup.vue'
import comAvatar from './comAvatar.vue'
import loginData from '@/app/i18n/account/login.js'
import $app from '@/app/app.js'
import api from '@/app/y2b/api.js'
import { query, channelUrl } from '@/app/y2b/format.js'

export default {
  name: 'ComY2bLayout',
  components: { comUserLoginPopup, comAvatar },
  provide() {
    return { y2b: this }
  },
  data() {
    return {
      drawer: false,
      mobileSearch: false,
      q: location.pathname.startsWith('/user/search') ? query('q') : '',
      channel: {},
      menus: [
        { href: '/user/main', icon: 'home', label: '홈' },
        { href: '/user/subscriptions', icon: 'subscriptions', label: '구독' },
        { href: '/user/history', icon: 'history', label: '시청 기록' },
        { href: '/user/studio', icon: 'video_library', label: '내 영상' },
        { href: '/user/upload', icon: 'upload', label: '업로드' },
      ],
    }
  },
  computed: {
    user() { return this.$store.state.user },
    loggedIn() { return this.user.user_id > 0 },
    displayName() { return this.user.nick_name || this.user.u_name || this.user.user_name || '' },
    channelHref() { return channelUrl(this.channel.handle) },
  },
  created() {
    this.$c.$root = this
    this.$store.commit('set_i18n', { ns: 'account/login', dict: loginData })
    $app.load_user_info(this)
    if (this.loggedIn) api.myChannel().then((r) => { if (r.success) this.channel = r.channel })
    this.$emitter.on('login', (cb) => this.login(cb))
  },
  methods: {
    active(href) { return location.pathname === href },
    search() {
      const q = this.q.trim()
      if (q) location.href = '/user/search?q=' + encodeURIComponent(q)
    },
    // 로그인 후에는 새로고침해서 세션을 반영한다
    login(cb) {
      this.$refs.loginPopup.open_login(cb || (() => location.reload()))
    },
    go(href, needLogin) {
      if (needLogin && !this.loggedIn) return this.login(() => { location.href = href })
      location.href = href
    },
    logout() {
      this.$c.io.post('/api/account/user/logout', {}).then(() => { location.href = '/user/main' })
    },
  },
}
</script>

<style scoped>
.y-header { background: var(--y-bg); color: var(--y-fg); }
.y-toolbar { min-height: 56px; gap: 4px; }
.y-logo { display: flex; align-items: center; gap: 2px; color: var(--y-fg); text-decoration: none; font-weight: 800; font-size: 20px; letter-spacing: -0.5px; margin-left: 8px; }
.y-search { display: flex; width: min(560px, 50vw); }
.y-search input { flex: 1; min-width: 0; height: 40px; padding: 0 16px; border: 1px solid #ccc; border-right: 0; border-radius: 20px 0 0 20px; font-size: 16px; outline: none; }
.y-search input:focus { border-color: #1c62b9; }
.y-search button { width: 64px; border: 1px solid #ccc; border-radius: 0 20px 20px 0; background: var(--y-soft); cursor: pointer; }
.y-drawer :deep(.q-item) { border-radius: 10px; margin: 0 12px; min-height: 40px; }
.y-menu-active { background: var(--y-soft); color: var(--y-fg); font-weight: 700; }
</style>
