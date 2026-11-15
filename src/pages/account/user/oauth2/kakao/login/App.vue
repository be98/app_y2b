<template>
    <div>
        <com-login ></com-login>
        <com-loading></com-loading>
    </div>
</template>

<script>
import comLogin from './comLogin.vue'
import comLoading from '@/components/comLoading.vue'

export default {
    name: 'App',
    components: {
        comLogin,
        comLoading,
    },
    data() {
        return {
        }
    },
    methods : {
    },
    
    created() {
        this.$c.$root = this;
    },
    beforeMount() {
    },
}
</script>

