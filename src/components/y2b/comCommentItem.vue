<template>
  <div class="row no-wrap q-gutter-md q-py-xs">
    <a :href="chHref" class="y-link"><com-avatar :name="c.author_name" :src="c.author_avatar" :size="small ? '24px' : '40px'" /></a>
    <div class="col" style="min-width: 0">
      <div class="text-caption">
        <a :href="chHref" class="y-link text-weight-bold" :class="{ 'y-owner': c.user_id === ownerId }">{{ c.author_name }}</a>
        <span class="y-muted q-ml-xs">{{ fmt.ago(c.date_added) }}</span>
      </div>
      <div class="y-content">{{ c.content }}</div>
      <q-btn flat rounded dense no-caps size="sm" label="답글" class="q-mt-xs" @click="$emit('reply')" />
    </div>
    <q-btn flat round dense icon="more_vert" size="sm" aria-label="더보기">
      <q-menu>
        <q-list dense style="min-width: 120px">
          <q-item v-if="mine" v-close-popup clickable @click="$emit('delete')"><q-item-section avatar><q-icon name="delete" /></q-item-section><q-item-section>삭제</q-item-section></q-item>
          <q-item v-else v-close-popup clickable @click="$emit('report')"><q-item-section avatar><q-icon name="flag" /></q-item-section><q-item-section>신고</q-item-section></q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
</template>

<script>
import * as fmt from '@/app/y2b/format.js'
import comAvatar from './comAvatar.vue'

export default {
  name: 'ComCommentItem',
  components: { comAvatar },
  props: { c: { type: Object, required: true }, ownerId: { type: Number, default: 0 }, small: Boolean },
  emits: ['delete', 'report', 'reply'],
  data() { return { fmt } },
  computed: {
    mine() { return this.c.user_id === this.$store.state.user.user_id },
    chHref() { return this.c.author_handle ? fmt.channelUrl(this.c.author_handle) : null },
  },
}
</script>

<style scoped>
.y-content { white-space: pre-wrap; word-break: break-word; font-size: 14px; line-height: 20px; }
.y-owner { background: var(--y-soft); padding: 0 6px; border-radius: 10px; }
</style>
