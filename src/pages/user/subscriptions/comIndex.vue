<template>
  <q-page class="y-page">
    <com-need-login v-if="!loggedIn" icon="subscriptions" title="구독한 채널의 새 영상을 보려면 로그인하세요" />

    <template v-else>
      <div v-if="channels.length" class="y-chips q-mb-lg">
        <a v-for="c in channels" :key="c.channel_id" :href="fmt.channelUrl(c.handle)" class="y-chip">
          <com-avatar :name="c.name" :src="c.avatar" size="56px" />
          <div class="ellipsis text-caption q-mt-xs">{{ c.name }}</div>
        </a>
      </div>

      <div class="y-title">최신순</div>
      <div v-if="list.length" class="y-grid">
        <com-video-card v-for="v in list" :key="v.video_id" :video="v" />
      </div>
      <div v-else-if="!loading" class="y-empty">
        <q-icon name="subscriptions" />
        <div>{{ channels.length ? '구독한 채널에 아직 영상이 없습니다.' : '구독한 채널이 없습니다. 마음에 드는 채널을 구독해 보세요.' }}</div>
      </div>
      <div v-if="loading" class="row justify-center q-my-lg"><q-spinner-dots size="40px" color="primary" /></div>
      <div v-else-if="more" class="text-center q-my-lg"><q-btn outline rounded no-caps label="더 보기" @click="load(page + 1)" /></div>
    </template>
  </q-page>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'
import comVideoCard from '@/components/y2b/comVideoCard.vue'
import comAvatar from '@/components/y2b/comAvatar.vue'
import comNeedLogin from '@/components/y2b/comNeedLogin.vue'

export default {
  name: 'SubscriptionsIndex',
  components: { comVideoCard, comAvatar, comNeedLogin },
  data() { return { fmt, channels: [], list: [], page: 1, more: false, loading: true } },
  computed: { loggedIn() { return this.$store.state.user.user_id > 0 } },
  created() { if (this.loggedIn) this.load(1) },
  methods: {
    async load(page) {
      this.loading = true
      const r = await api.feed(page)
      this.loading = false
      if (!r.success) return
      if (page === 1) this.channels = r.channels
      this.list = page === 1 ? r.list : this.list.concat(r.list)
      this.page = page
      this.more = r.list.length === 24
    },
  },
}
</script>

<style scoped>
.y-chips { display: flex; gap: 16px; overflow-x: auto; padding: 4px 4px 8px; }
.y-chip { width: 80px; flex: none; text-align: center; color: var(--y-fg); text-decoration: none; }
@media (max-width: 599px) { .y-chips { padding: 4px 12px 8px; } }
</style>
