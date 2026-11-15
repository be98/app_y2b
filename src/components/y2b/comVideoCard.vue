<template>
  <div class="y-card" :class="{ 'y-card-row': row }">
    <a :href="href" class="y-thumb" :aria-label="video.title">
      <img v-if="video.thumbnail" :src="video.thumbnail" alt="" loading="lazy" />
      <div v-else class="y-thumb-empty"><q-icon name="smart_display" size="40px" /></div>
      <span v-if="video.duration" class="y-dur">{{ fmt.duration(video.duration) }}</span>
    </a>
    <div class="y-info">
      <a v-if="!row && !hideChannel" :href="chHref" class="y-ch-avatar" :aria-label="video.channel_name">
        <com-avatar :name="video.channel_name" :src="video.channel_avatar" />
      </a>
      <div class="y-meta">
        <a :href="href" class="y-vtitle y-clamp2">{{ video.title }}</a>
        <a v-if="!hideChannel" :href="chHref" class="y-sub y-ch">{{ video.channel_name }}</a>
        <div class="y-sub">조회수 {{ fmt.count(video.view_count) }}회 · {{ fmt.ago(video.date_added) }}</div>
        <div v-if="row && showDesc && video.description" class="y-sub y-clamp2 q-mt-xs">{{ video.description }}</div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import comAvatar from './comAvatar.vue'
import * as fmt from '@/app/y2b/format.js'

export default {
  name: 'ComVideoCard',
  components: { comAvatar },
  props: {
    video: { type: Object, required: true },
    row: { type: Boolean, default: false },        // 가로형 (시청 페이지 옆 목록·검색 결과)
    hideChannel: { type: Boolean, default: false },
    showDesc: { type: Boolean, default: false },
  },
  data() { return { fmt } },
  computed: {
    href() { return fmt.watchUrl(this.video.video_id) },
    chHref() { return fmt.channelUrl(this.video.channel_handle) },
  },
}
</script>

<style scoped>
.y-card { min-width: 0; }
.y-thumb { position: relative; display: block; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; }
.y-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .2s; }
.y-thumb:hover img { transform: scale(1.03); }
.y-thumb-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #777; background: var(--y-soft); }
.y-dur { position: absolute; right: 6px; bottom: 6px; background: rgba(0,0,0,.8); color: #fff; font-size: 12px; font-weight: 600; padding: 1px 4px; border-radius: 4px; }
.y-info { display: flex; gap: 12px; margin-top: 12px; }
.y-ch-avatar { flex: none; }
.y-meta { min-width: 0; flex: 1; }
.y-vtitle { color: var(--y-fg); text-decoration: none; font-weight: 600; font-size: 16px; line-height: 22px; margin-bottom: 4px; }
.y-sub { color: var(--y-muted); font-size: 14px; line-height: 20px; }
.y-ch { display: block; text-decoration: none; }
.y-ch:hover { color: var(--y-fg); }
.y-card-row { display: flex; gap: 8px; }
.y-card-row .y-thumb { flex: none; width: 168px; border-radius: 8px; }
.y-card-row .y-info { margin-top: 0; }
.y-card-row .y-vtitle { font-size: 14px; line-height: 20px; }
.y-card-row .y-sub { font-size: 12px; line-height: 18px; }
@media (max-width: 599px) {
  .y-thumb { border-radius: 0; }
  .y-info { padding: 0 12px; }
  .y-card-row { padding: 0 12px; }
  .y-card-row .y-thumb { border-radius: 8px; width: 150px; }
  .y-card-row .y-info { padding: 0; }
}
</style>
