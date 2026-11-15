<template>
    <div v-cloak>
        <com-index />
        <com-loading mode="hourglass"/>
    </div>
</template>

<script>
import comIndex from './comIndex.vue';
import comLoading from '@/components/comLoading.vue';
import $app from '@/app/app.js'

export default {
    name: 'App',
    components: {
        comIndex,
        comLoading,
    },
    created() {
        this.$c.$root = this;
        $app.load_user_info(this);
    },
}
</script>
