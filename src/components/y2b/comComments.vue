<template>
  <section class="y-comments">
    <div class="text-h6 text-weight-bold q-mb-md">댓글 {{ fmt.count(count) }}개</div>

    <div class="row no-wrap q-gutter-md q-mb-lg">
      <com-avatar :name="myName" size="40px" />
      <div class="col">
        <q-input v-model="text" dense autogrow placeholder="댓글 추가..." maxlength="2000" @focus="needLogin" />
        <div v-if="text" class="row justify-end q-gutter-sm q-mt-xs">
          <q-btn flat rounded no-caps label="취소" @click="text = ''" />
          <q-btn unelevated rounded no-caps color="primary" label="댓글" :loading="saving" :disable="!text.trim()" @click="add()" />
        </div>
      </div>
    </div>

    <div v-for="c in list" :key="c.comment_id" class="y-comment">
      <com-comment-item :c="c" :owner-id="ownerId" @delete="remove(c)" @report="$emit('report', c)" @reply="openReply(c)" />
      <div class="y-replies">
        <div v-if="c._replying" class="row no-wrap q-gutter-sm q-mb-sm">
          <com-avatar :name="myName" size="24px" />
          <div class="col">
            <q-input v-model="c._reply" dense autogrow autofocus placeholder="답글 추가..." maxlength="2000" />
            <div class="row justify-end q-gutter-sm q-mt-xs">
              <q-btn flat rounded no-caps size="sm" label="취소" @click="c._replying = false" />
              <q-btn unelevated rounded no-caps size="sm" color="primary" label="답글" :disable="!(c._reply || '').trim()" @click="add(c)" />
            </div>
          </div>
        </div>
        <q-btn v-if="c.reply_count && !c._open" flat rounded no-caps dense color="blue-8" icon="expand_more" :label="`답글 ${c.reply_count}개`" @click="loadReplies(c)" />
        <template v-if="c._open">
          <q-btn flat rounded no-caps dense color="blue-8" icon="expand_less" label="답글 숨기기" @click="c._open = false" />
          <com-comment-item v-for="r in c._replies" :key="r.comment_id" :c="r" :owner-id="ownerId" small
            @delete="remove(r, c)" @report="$emit('report', r)" @reply="openReply(c)" />
        </template>
      </div>
    </div>

    <div v-if="more" class="text-center q-my-md">
      <q-btn flat rounded no-caps label="댓글 더 보기" :loading="loading" @click="load(page + 1)" />
    </div>
  </section>
</template>

<script>
import api from '@/app/y2b/api.js'
import * as fmt from '@/app/y2b/format.js'
import comAvatar from './comAvatar.vue'
import comCommentItem from './comCommentItem.vue'

export default {
  name: 'ComComments',
  components: { comAvatar, comCommentItem },
  props: {
    videoId: { type: Number, required: true },
    count: { type: Number, default: 0 },
    ownerId: { type: Number, default: 0 },   // 영상 주인 — 이름 옆에 표시
  },
  emits: ['report', 'changed'],
  data() { return { fmt, list: [], page: 1, more: false, loading: false, text: '', saving: false } },
  computed: {
    user() { return this.$store.state.user },
    myName() { return this.user.nick_name || this.user.u_name || this.user.user_name || '' },
  },
  created() { this.load(1) },
  methods: {
    needLogin(e) {
      if (this.user.user_id > 0) return
      e.target.blur()
      this.$emitter.emit('login')
    },
    async load(page) {
      this.loading = true
      const r = await api.comments(this.videoId, 0, page)
      this.loading = false
      if (!r.success) return
      const rows = r.list.map((c) => ({ ...c, _open: false, _replies: [], _replying: false, _reply: '' }))
      this.list = page === 1 ? rows : this.list.concat(rows)
      this.page = page
      this.more = r.list.length === 20
    },
    async loadReplies(c) {
      const r = await api.comments(this.videoId, c.comment_id)
      if (r.success) { c._replies = r.list; c._open = true }
    },
    openReply(c) {
      if (!(this.user.user_id > 0)) return this.$emitter.emit('login')
      c._replying = true
    },
    async add(parent) {
      const content = parent ? parent._reply : this.text
      this.saving = true
      const r = await api.addComment(this.videoId, content, parent ? parent.comment_id : 0)
      this.saving = false
      if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
      if (parent) {
        parent._reply = ''
        parent._replying = false
        parent.reply_count += 1
        await this.loadReplies(parent)
      } else {
        this.text = ''
        this.list.unshift({ ...r.comment, _open: false, _replies: [], _replying: false, _reply: '' })
      }
      this.$emit('changed', 1)
    },
    remove(c, parent) {
      this.$q.dialog({ title: '댓글 삭제', message: '댓글을 완전히 삭제할까요?', cancel: { flat: true, label: '취소' }, ok: { flat: true, label: '삭제', color: 'primary' } })
        .onOk(async () => {
          const r = await api.delComment(c.comment_id)
          if (!r.success) return this.$q.notify({ message: r.message, color: 'negative' })
          if (parent) {
            parent._replies = parent._replies.filter((x) => x.comment_id !== c.comment_id)
            parent.reply_count = Math.max(0, parent.reply_count - 1)
            this.$emit('changed', -1)
          } else {
            this.list = this.list.filter((x) => x.comment_id !== c.comment_id)
            this.$emit('changed', -(1 + c.reply_count))
          }
        })
    },
  },
}
</script>

<style scoped>
.y-comment { margin-bottom: 16px; }
.y-replies { margin-left: 56px; }
@media (max-width: 599px) { .y-comments { padding: 0 12px; } .y-replies { margin-left: 44px; } }
</style>
