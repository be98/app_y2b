<template>
    <div >
        <q-dialog persistent class="login_dialog" v-model="login_dialog_visible">
                <q-card  flat bordered style="width:300px; max-width:80vw;" >
                    <q-card-section>
                        <span class="ft18">{{i18n['title_login']}}</span>
                        <q-btn icon="close" class="f-right mt-3 text-grey" outline round dense v-close-popup ></q-btn>
                    </q-card-section>
                
                    <q-card-section class="q-px-md pt0 q-pb-sm text-left text-grey">
                        <com-data-form :form="formLogin" ref="formLogin">
                            <template v-slot="props">
                                <q-input outlined class="pb2" :placeholder="i18n['text_user_name']"
                                         :error="(props.form_error.user_name)?true:false" 
                                         :error-message="props.form_error.user_name" 
                                         v-model="formLogin.user_name" >
                                    <template #prepend>
                                        <q-icon name="perm_identity" ></q-icon>
                                    </template>
                                </q-input>
                                <q-input outlined class="pb2" :placeholder="i18n['text_password']" type="password"
                                         :error="(props.form_error.passwd)?true:false" 
                                         :error-message="props.form_error.passwd" 
                                         v-model="formLogin.passwd" >
                                    <template #prepend>
                                        <q-icon name="lock_open" ></q-icon>
                                    </template>
                                </q-input>
                                <div class="text-right">
                                    <q-btn color="primary size-sm" @click="handleLogin">{{i18n['title_login']}}</q-btn>
                                </div>
                            </template>
                        </com-data-form>
                    </q-card-section>
                    <hr class="mt2 mb3 border-t0 border-l0 border-r0" style="border-color:#ccc" />
                    <q-card-section class="q-px-md pt2 q-pb-sm q-gutter-y-xs text-left text-grey">
                        <q-btn outline align="left" class="full-width" style="padding-left:40px;" @click="on_naver_login">
                            <img src="@/assets/user/sns_login/naver.png" alt="네이버 로그인" class="mr3" style="width:28px;height:28px;"> 네이버 로그인
                        </q-btn>
                        <q-btn outline align="left" class="full-width" style="padding-left:40px;" @click="on_kakao_login">
                            <img src="@/assets/user/sns_login/kakao.png" alt="카카오 로그인" class="mr3" style="width:28px;height:28px;"> 카카오 로그인
                        </q-btn>
                        <!--
                        <q-btn outline align="left" class="full-width" style="padding-left:40px;" @click="on_facebook_login">
                            <img src="@/assets/user/sns_login/facebook.png" alt="페이스북 로그인" class="mr3" style="width:28px;height:28px;"> 페이스북 로그인
                        </q-btn>-->
                    </q-card-section>
                    <hr class="mt2 mb3 border-t0 border-l0 border-r0" style="border-color:#ccc" />
                    <div class="footer text-right q-px-md q-pb-md pt2">
                        <div>{{i18n['message_forgot_your_password']}} 
                            <a class="text-primary" @click="click_forgot" >{{i18n['title_forgot_password']}}</a> </div>
                        <div>{{i18n['message_dont_have_account']}} 
                            <a class="text-primary" @click="click_register" >{{i18n['message_register']}}</a> </div>
                    </div>
                </q-card>
        </q-dialog>
        
        <q-dialog persistent class="login_dialog" v-model="register_dialog_visible">
                <q-card  flat bordered style="width:300px; max-width:80vw;" >
                    <q-card-section>
                        <span class="ft18">{{i18n['title_register']}}</span>
                        <q-btn icon="close" class="f-right mt-3 text-grey" outline round dense v-close-popup ></q-btn>
                    </q-card-section>
                
                    <q-card-section class="q-px-md pt0 q-pb-sm text-left text-grey">
                        <com-data-form :form="formRegister" ref="formRegister">
                            <template v-slot="props">
                                <q-input outlined class="pb2" :placeholder="i18n['text_user_name']"
                                         :error="(props.form_error.user_name)?true:false" 
                                         :error-message="props.form_error.user_name" 
                                         v-model="formRegister.user_name" >
                                    <template #prepend>
                                        <q-icon name="perm_identity" ></q-icon>
                                    </template>
                                </q-input>
                                <q-input outlined class="pb2" :placeholder="i18n['text_password']" type="password"
                                         :error="(props.form_error.passwd)?true:false" 
                                         :error-message="props.form_error.passwd" 
                                         v-model="formRegister.passwd" >
                                    <template #prepend>
                                        <q-icon name="lock_open" ></q-icon>
                                    </template>
                                </q-input>
                                <q-input outlined class="pb2" :placeholder="i18n['text_password_confirm']" type="password"
                                         :error="(props.form_error.passwd_confirm)?true:false" 
                                         :error-message="props.form_error.passwd_confirm" 
                                         v-model="formRegister.passwd_confirm" >
                                    <template #prepend>
                                        <q-icon name="lock_open" ></q-icon>
                                    </template>
                                </q-input>
                                
                                <div class="mt3">
                                    {{i18n['message_use_email']}}
                                </div>
                                <q-input outlined class="pb2" :placeholder="i18n['text_email']" type="password"
                                         :error="(props.form_error.email)?true:false" 
                                         :error-message="props.form_error.email" 
                                         v-model="formRegister.email" >
                                    <template #prepend>
                                        <q-icon name="mail" ></q-icon>
                                    </template>
                                </q-input>
                                
                                <div class="text-right">
                                    <q-btn color="primary size-sm" @click="handleRegister">{{i18n['title_register']}}</q-btn>
                                </div>
                            </template>
                        </com-data-form>
                    </q-card-section>
                    <hr class="mt2 mb3 border-t0 border-l0 border-r0" style="border-color:#ccc" />
                    <div class="footer text-right q-px-md q-pb-md pt2">
                        <div>{{i18n['message_have_account']}} 
                            <a class="text-primary" @click="click_login" >{{i18n['message_login']}}</a> </div>
                    </div>
                    
                </q-card>
        </q-dialog>
        
        <q-dialog persistent class="login_dialog" v-model="forgot_dialog_visible">
                <q-card flat bordered style="width:300px; max-width:80vw;" >
                    <q-card-section>
                        <span class="ft18">{{i18n['title_forgot_password']}}</span>
                        <q-btn icon="close" class="f-right mt-3 text-grey" outline round dense v-close-popup ></q-btn>
                    </q-card-section>
                    
                    <q-card-section class="q-px-md pt0 q-pb-sm text-left text-grey">
                        <com-data-form :form="forgotSendKey" ref="forgotSendKey">
                            <template v-slot="props">
                                <q-input outlined class="pb2" :placeholder="i18n['text_email']"
                                         :error="(props.form_error.email)?true:false" 
                                         :error-message="props.form_error.email" 
                                         v-model="forgotSendKey.email" >
                                    <template #prepend>
                                        <q-icon name="mail" ></q-icon>
                                    </template>
                                </q-input>
                                <div class="text-right">
                                    <q-btn color="primary size-sm" @click="handleSendKeyToEmail">
                                        {{i18n['text_forgot_submit']}}</q-btn>
                                </div>
                            </template>
                        </com-data-form>
                        <com-data-form :form="forgotLogin" ref="forgotLogin">
                            <template v-slot="props">
                                <div>{{i18n['text_email_password']}}</div>
                                <q-input outlined class="pb2" :placeholder="i18n['text_email_password']" 
                                         :error="(props.form_error.email_passwd)?true:false" 
                                         :error-message="props.form_error.email_passwd" 
                                         v-model="forgotLogin.email_passwd" >
                                    <template #prepend>
                                        <q-icon name="lock_open" ></q-icon>
                                    </template>
                                </q-input>
                                <div>{{i18n['text_new_password']}}</div>
                                <q-input outlined class="pb2" :placeholder="i18n['text_new_password']" type="password"
                                         :error="(props.form_error.passwd)?true:false" 
                                         :error-message="props.form_error.passwd" 
                                         v-model="forgotLogin.passwd" >
                                    <template #prepend>
                                        <q-icon name="lock_open" ></q-icon>
                                    </template>
                                </q-input>
                                
                                <div class="text-right">
                                    <q-btn color="primary size-sm" @click="handleRePassword">{{i18n['text_forgot_password_submit']}}</q-btn>
                                </div>
                            </template>
                        </com-data-form>
                    </q-card-section>
                    
                    <hr class="mt2 mb3 border-t0 border-l0 border-r0" style="border-color:#ccc" />
                    <div class="footer text-right q-px-md q-pb-md pt2">
                        <div>{{i18n['message_have_account']}} 
                            <a class="text-primary" @click="click_login" >{{i18n['message_login']}}</a> </div>
                        <div>{{i18n['message_dont_have_account']}} 
                            <a class="text-primary" @click="click_register" >{{i18n['message_register']}}</a> </div>
                    </div>
                </q-card>
        </q-dialog>

    </div>
</template>

<script>
import comDataForm from '@/components/comDataForm.vue';
import loginData from '@/app/i18n/account/login.js';

export default {
    components : {
        comDataForm,
    },
    props : {
        useLogin : {
            type : Boolean,
            default : true,
        }
    },
    data() {
        return {
            formLogin: {
                user_name: '',
                passwd: '',
            },
            formRegister: {
                user_name: '',
                passwd: '',
                passwd_confirm: '',
                email:'',
            },
            forgotSendKey : {
                email : '',
            },
            forgotLogin : {
                email_passwd: '',
                passwd: '',
            },
            callback : null,
            login_dialog_visible : false,
            register_dialog_visible : false,
            forgot_dialog_visible : false,
        }
    },
    computed : {
        // account/login 네임스페이스 사전을 그대로 참조 (템플릿의 i18n['key']용)
        i18n() { return this.$store.state.i18n['account/login'] || {}; },
        user() { return this.$store.state.user; },
        user_id() { return this.$store.state.user_id; },
        user_name() { return this.$store.state.user.user_name; },
        user_image() {
            if( this.$c.hasProperty(this.$store.state.user,'image') ) {
                return this.$store.state.user.image;
            }
            return '';
        },
        resized_user_image() {
            let resized_user_image = '';
            if( this.$c.hasProperty(this.$store.state.user,'resized_user_image') ) {
                resized_user_image = this.$store.state.user.resized_user_image;
            }
            if( resized_user_image ) return resized_user_image;
            return '/image/user/user-2-32x32.png';
        },
    },
    methods : {
        /* open */
        open_login(callback) {
            this.login_dialog_visible = true;
            this.register_dialog_visible = false;
            this.forgot_dialog_visible = false;
            this.callback = callback;
        },
        open_register(callback) {
            this.login_dialog_visible = false;
            this.register_dialog_visible = true;
            this.forgot_dialog_visible = false;
            this.callback = callback;
        },
        open_forgot(callback) {
            this.login_dialog_visible = false;
            this.register_dialog_visible = false;
            this.forgot_dialog_visible = true;
            this.callback = callback;
        },
        
        /* click */
        click_login() {
            this.login_dialog_visible = (this.useLogin)? true : false;
            this.register_dialog_visible = false;
            this.forgot_dialog_visible = false;
        },
        click_register() {
            this.login_dialog_visible = false;
            this.register_dialog_visible = true;
            this.forgot_dialog_visible = false;
        },
        click_forgot() {
            this.login_dialog_visible = false;
            this.register_dialog_visible = false;
            this.forgot_dialog_visible = true;
        },
        
        /* login */
        on_facebook_login() {
            let host_name = this.$c.io.origin;
            let option = "location=no,toolbar=no";
            option += "left=50, top=50, width=600, height=550, scrollbars=1"; //모바일에서는 이줄을 사용하지 않음
            let ref = window.open(host_name+'/account/user/oauth2/facebook/login?is_mobile=0', "_blank", option);
            this.on_login_event(ref);
        },
        on_naver_login() {
            let host_name = this.$c.io.origin;
            let option = "location=no,toolbar=no";
            option += "left=50, top=50, width=600, height=650, scrollbars=1"; //모바일에서는 이줄을 사용하지 않음
            let ref = window.open(host_name+'/account/user/oauth2/naver/login?is_mobile=0', "_blank", option);
            this.on_login_event(ref);
        },
        on_kakao_login() {
            let host_name = this.$c.io.origin;
            let option = "location=no,toolbar=no";
            option += "left=50, top=50, width=600, height=650, scrollbars=1"; //모바일에서는 이줄을 사용하지 않음
            let ref = window.open(host_name+'/account/user/oauth2/kakao/login?is_mobile=0', "_blank", option);
            this.on_login_event(ref);
        },
        on_login_event(ref) {
            // 로그인 완료 시 callback 페이지가 opener를 reload 하고 팝업을 닫음
            if( !ref ) {
                this.$c.response_notify(false, '팝업이 차단되었습니다. 팝업 차단을 해제해 주세요.');
                return;
            }
            ref.focus();
        },
        
        /* handle */
        handleLogin() {
            let vm = this;
            vm.$q.loading.show();
            vm.$refs.formLogin.clear_error();
            vm.$c.io.post( '/api/account/user/login', vm.formLogin).then( (response)=> {
                let data = response.data;
                if(data['success']) {
                    location.reload();
                } else {
                    if( data['message'] ) {
                        vm.$c.response_notify(data.success, data.message);
                    }
                    vm.$refs.formLogin.set_error(data.error);
                    vm.$q.loading.hide();
                }
            });
        },
        handleLogout() {
            let vm = this;
            vm.$q.loading.show();
            vm.$refs.formLogin.clear_error();
            vm.$c.io.post( '/api/account/user/logout', {}).then( (response)=> {
                let data = response.data;
                if(data['success']) {
                    location.reload();
                } else {
                    if( data['message'] ) {
                        vm.$c.response_notify(data.success, data.message);
                    }
                    vm.$refs.formLogin.set_error(data.error);
                    vm.$q.loading.hide();
                }
            });
        },
        handleRegister() {
            let vm = this;
            vm.$q.loading.show();
            vm.$refs.formRegister.clear_error();
            vm.$c.io.post( '/api/account/user/join/register', vm.formRegister).then( (response)=> {
                let data = response.data;
                if(data['success']) {
                    location.reload();
                } else {
                    if( data['message'] ) {
                        vm.$c.response_notify(data.success, data.message);
                    }
                    vm.$refs.formRegister.set_error(data.error);
                    vm.$q.loading.hide();
                }
            });
        },
        handleSendKeyToEmail() {
            let vm = this;
            vm.$q.loading.show();
            vm.$refs.forgotSendKey.clear_error();
            vm.$c.io.post( '/api/account/user/join/send_email_key', vm.forgotSendKey).then( (response)=> {
                let data = response.data;
                vm.$q.loading.hide();
                if(data['success']==0) {
                    vm.$refs.forgotSendKey.set_error(data.error);
                }
                if( data['message'] ) {
                    vm.$c.response_notify(data.success, data.message);
                }
            });
        },
        handleRePassword() {
            let vm = this;
            vm.$q.loading.show();
            vm.$refs.forgotLogin.clear_error();
            vm.$c.io.post( '/api/account/user/join/reset_password', vm.forgotLogin).then( (response)=> {
                let data = response.data;
                vm.$q.loading.hide();
                if(data['success']) {
                    vm.forgot_dialog_visible = false;
                    vm.forgotSendKey.email = '';
                    vm.forgotLogin.email_passwd = '';
                    vm.forgotLogin.passwd = '';
                } else {
                    vm.$refs.forgotLogin.set_error(data.error);
                }
                if( data['message'] ) {
                    vm.$c.response_notify(data.success, data.message);
                }
            });
        },
    },
    beforeMount() {
        // account/login 모듈을 네임스페이스로 스토어에 등록
        this.$store.commit('set_i18n', { ns: 'account/login', dict: loginData });
    },
    mounted() {
    },
}
</script>
