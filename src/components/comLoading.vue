<template>
    <q-inner-loading class="com-loading" :class="mode"
        :showing="is_loading">
        <div class="text-center">
            <div v-if="mode=='hourglass'">
                <q-spinner-hourglass
                    size="2em" />
                <div>
                    데이터 로딩중
                </div>
            </div>
            <div class="d-inline-block" style="width:220px;" v-else >
                <table class="form-table">
                <tr v-for="(value, k) in load_data_dict" :key="k" >
                    <td>{{k}}</td>
                    <td class="w100px text-right">
                        <div v-if="value==true">
                            loading
                            <q-spinner></q-spinner>
                        </div>
                        <div v-else>
                            ok
                        </div>
                    </td>
                </tr>
                </table>
            </div>
        </div>
    </q-inner-loading>
</template>

<script>
export default {
    props : {
        mode : { type:String, defaul:'' },
    },
    data: function() {
        return {
        }
    },
    computed : {
        is_loading() {
            return this.$store.state.loading.is_loading;
        },
        load_data_dict() {
            return this.$store.state.loading.load_data_dict;
        },
    },
    methods: {
    },
    mounted() {
    }
}
</script>

<style scoped>
.q-inner-loading {
    z-index:5000;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    color: #888;
}
.com-loading :deep(.q-spinner) {
    color: #888;
}
</style>

