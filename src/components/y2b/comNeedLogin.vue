<template>
  <div class="y-empty">
    <q-icon :name="icon" />
    <div class="text-h6 text-weight-bold q-mb-xs" style="color: var(--y-fg)">{{ title }}</div>
    <div class="q-mb-md">{{ text }}</div>
    <q-btn outline rounded no-caps color="primary" icon="account_circle" label="로그인" @click="$emitter.emit('login')" />
  </div>
</template>

<script>
export default {
  name: 'ComNeedLogin',
  props: {
    icon: { type: String, default: 'account_circle' },
    title: { type: String, default: '로그인이 필요합니다' },
    text: { type: String, default: '로그인하면 이용할 수 있습니다.' },
  },
}
</script>
