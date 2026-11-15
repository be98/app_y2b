<template>
    <div>
        <com-callback ></com-callback>
        <com-loading></com-loading>
    </div>
</template>

<script>
import comCallback from './comCallback.vue'
import comLoading from '@/components/comLoading.vue'

export default {
    name: 'App',
    components: {
        comCallback,
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

