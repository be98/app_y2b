<template>
  <q-avatar :size="size" :style="src ? null : { background: color, color: '#fff' }">
    <img v-if="src" :src="src" alt="" />
    <template v-else>{{ initial }}</template>
  </q-avatar>
</template>

<script>
// 채널 프로필. 이미지가 없으면 이름 첫 글자 + 이름으로 정해지는 색
const COLORS = ['#c2185b', '#7b1fa2', '#303f9f', '#0288d1', '#00796b', '#689f38', '#f57c00', '#5d4037']
export default {
  name: 'ComAvatar',
  props: {
    name: { type: String, default: '' },
    src: { type: String, default: '' },
    size: { type: String, default: '36px' },
  },
  computed: {
    initial() { return (this.name || '?').trim().charAt(0).toUpperCase() },
    color() {
      let h = 0
      for (const ch of this.name || '') h = (h * 31 + ch.charCodeAt(0)) >>> 0
      return COLORS[h % COLORS.length]
    },
  },
}
</script>
