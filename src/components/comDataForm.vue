<template>
        <div class="com-data_form p-relative">
            <slot v-bind:form_error="form_error" v-bind:$="self">
                <div >
                    <pre>{{help_text}}</pre>
                </div>
            </slot>
            <q-inner-loading :showing="is_loading">
                <q-spinner-clock color="primary" size="30px" />
            </q-inner-loading>
        </div>
</template>


<script>
export default {
    props : {
        form : { type: Object, required: true },
    },
    data : function() {
        let self = this;
        return {
            self : self,
            form_error : {},
            //loading
            is_loading : false,
            help_text : `
#-- slot 사용법 --#
<template v-slot="props">
    <div class="row">
        <div class="col-2">아이디</div>
        <div class="col-10">
            <q-input :error="(props.form_error.user_name)?true:false" 
                     :error-message="props.form_error.user_name" 
                     v-model="form.user_name" />
        </div>
    </div>
</template>
#-- js에서 사용법 (에러처리 자동) --#
this.$refs.data_form.put(url, form_data).then(function(data) {
});
`,
        };
    },
    methods : {
        /* format date */
        format_date(datetime, date_format) {
            if( datetime ) {
                let date = datetime.toLocalDate(); //utc시간을 local시간으로 바꿈 (handler.i18n_datetime.date_format)
                if(!date_format) { date_format = this.$store.state.date_format; }
                if(date) { return this.$c.formatDate(date, date_format); }
            }
            return "";
        },
        format_time(datetime, time_format) {
            if( datetime ) {
                let date = datetime.toLocalDate(); //utc시간을 local시간으로 바꿈 (handler.i18n_datetime.time_format)
                if(!time_format) { time_format = this.$store.state.time_format; }
                if(date) { return this.$c.formatDate(date, time_format); }
            }
            return "";
        },
    
        /* loading
         * --> form 화면만 loading을 표시함. */
        show_loading() { this.is_loading = true; },
        hide_loading() { this.is_loading = false; },
        
        /* set */
        clear_error() {
            for(let key in this.form_error) {
                this.form_error[key] = '';
            }
        },
        set_error(error) {
            for(let key in error) {
                this.form_error[key] = error[key];
            }
        },
        
        
        /* handle */
        get(url, params) {
            return this.$c.io.get(url, params).then( function(response) {
                let data = response.data;
                return data
            });
        },
        
        post(url, params) {
            let vm = this;
            vm.$q.loading.show();
            vm.clear_error();
            return vm.$c.io.post(url, params).then( function(response) {
                let data = response.data;
                vm.$q.loading.hide();
                if(data.success==0) {
                    if(data.error) {
                        vm.set_error(data.error);
                    }
                    if(data.message) {
                        vm.$c.response_notify(0, data.message);
                    }
                }
                return data;
            });
        },
        
        put(url, params) {
            let vm = this;
            vm.$q.loading.show();
            vm.clear_error();
            return vm.$c.io.put(url, params).then( function(response) {
                let data = response.data;
                vm.$q.loading.hide();
                if(data.success==0) {
                    if(data.error) {
                        vm.set_error(data.error);
                    }
                    if(data.message) {
                        vm.$c.response_notify(0, data.message);
                    }
                }
                return data;
            });
        },
        
        delete(url, params) {
            let vm = this;
            vm.clear_error();
            return vm.$c.io.delete(url, params).then( function(response) {
                let data = response.data;
                vm.$q.loading.hide();
                if(data.success==0) {
                    if(data.error) {
                        vm.set_error(data.error);
                    }
                    if(data.message) {
                        vm.$c.response_notify(0, data.message);
                    }
                }
                return data;
            });
        },
        
        /* init */
        init_form_error() {
            // vm(vue콤포넌트) 에서 사용되는 데이터
            // 1) form 3) form_error
            let vm = this;
            vm.form_error = {};
            for(let key in vm.form) { vm.form_error[key] = ''; }
        },
        
        
    },
    beforeMount : function() {
        this.init_form_error();     //form으로 form_error를 세팅함
    },
};
</script>
