<template>
  <q-page class="y-page-narrow" style="max-width: 720px">
    <com-need-login v-if="!loggedIn" icon="settings" title="채널을 설정하려면 로그인하세요" />

    <template v-else>
      <div class="y-title">채널 설정</div>
      <div v-if="!channel" class="row justify-center q-my-xl"><q-spinner-dots size="40px" color="primary" /></div>

      <q-card v-else flat bordered class="q-pa-md">
        <div class="row items-center q-gutter-md q-mb-lg">
          <com-avatar :name="form.name" :src="avatarUrl || channel.avatar" size="96px" />
          <div>
            <q-btn outline rounded no-caps icon="photo_camera" label="프로필 사진 바꾸기" @click="$refs.avatar.click()" />
            <div class="text-caption y-muted q-mt-xs">JPG·PNG·WEBP, 2MB 이하, 정사각형 권장</div>
            <input ref="avatar" type="file" accept="image/jpeg,image/png,image/webp" hidden @change="pickAvatar" />
          </div>
        </div>
        <q-input v-model="form.name" outlined label="채널 이름" maxlength="100" counter :error="!!err.name" :error-message="err.name" />
        <q-input :model-value="'@' + channel.handle" outlined readonly label="핸들 (채널 주소)" class="q-mt-sm" hint="채널 주소에 쓰입니다">
          <template #append><q-btn flat round dense icon="open_in_new" :href="channelHref" aria-label="내 채널 열기" /></template>
        </q-input>
        <q-input v-model="form.description" outlined type="textarea" autogrow label="채널 소개" maxlength="2000" counter class="q-mt-md" />
        <div class="row justify-end q-mt-md">
          <q-btn unelevated rounded no-caps color="primary" label="저장" :loading="saving" @click="save" />
        </div>
      </q-card>

      <q-card flat bordered class="q-mt-md">
        <q-item>
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section><q-item-label caption>로그인 아이디</q-item-label><q-item-label>{{ user.user_name }}</q-item-label></q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="logout">
          <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
          <q-item-section class="text-negative">로그아웃</q-item-section>
        </q-item>
      </q-card>
    </template>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import { channelUrl } from '@/app/y2b/format.js'
import comAvatar from '@/components/y2b/comAvatar.vue'
import comNeedLogin from '@/components/y2b/comNeedLogin.vue'

export default {
  name: 'MyPageIndex',
  components: { comAvatar, comNeedLogin },
  data() { return { channel: null, form: { name: '', description: '' }, avatarFile: null, avatarUrl: '', err: {}, saving: false } },
  computed: {
    user() { return this.$store.state.user },
    loggedIn() { return this.user.user_id > 0 },
    channelHref() { return this.channel ? channelUrl(this.channel.handle) : '' },
  },
  async created() {
    if (!this.loggedIn) return
    const r = await api.myChannel()
    if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
    this.channel = r.channel
    this.form = { name: r.channel.name, description: r.channel.description }
  },
  methods: {
    pickAvatar(e) {
      const f = e.target.files[0]
      e.target.value = ''
      if (!f) return
      if (f.size > 2 * 1024 * 1024) return this.$q.notify({ message: '이미지는 2MB 까지입니다', color: 'negative' })
      if (this.avatarUrl) URL.revokeObjectURL(this.avatarUrl)
      this.avatarFile = f
      this.avatarUrl = URL.createObjectURL(f)
    },
    async save() {
      this.err = {}
      this.saving = true
      const r = await api.saveChannel({ ...this.form, avatar: this.avatarFile })
      this.saving = false
      if (!r.success) { this.err = r.error || {}; return this.$q.notify({ message: r.message, color: 'negative' }) }
      this.channel = r.channel
      this.avatarFile = null
      this.$q.notify({ message: '저장했습니다', color: 'positive' })
    },
    logout() {
      this.$c.io.post('/api/account/user/logout', {}).then(() => { location.href = '/user/main' })
    },
  },
}
</script>
