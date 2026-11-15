<template>
    <div v-cloak>
        <com-index />
        <com-loading mode="hourglass"/>
    </div>
</template>

<script>
import comIndex from './comIndex.vue';
import comLoading from '@/components/comLoading.vue';
import loginData from '@/app/i18n/account/login.js';
import $app from '@/app/app.js'

export default {
    name: 'App',
    components: {
        comIndex,
        comLoading,
    },
    created() {
        this.$c.$root = this;
        // 모듈 경로를 ns로 등록 — 다른 API의 동일 키와 충돌하지 않음
        this.$store.commit('set_i18n', { ns: 'account/login', dict: loginData });
        $app.load_user_info(this);
    },
}
</script>
