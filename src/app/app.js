import axios from 'axios';

const $app = (function() {
    var self = {
        load_user_info(vm) {
            const set_user = (data) => {
                console.log(data)
                vm.$store.state.user_id = data.user_id;
                vm.$store.state.user.user_id = data.user_id;
                vm.$store.state.user.user_group_id = data.user_group_id;
                vm.$store.state.user.u_name = data.u_name;
                vm.$store.state.user.user_name = data.user_name;
                vm.$store.state.user.nick_name = data.nick_name;
            }
            set_user(window.__USER__)
            // vm.$store.dispatch('loading', {name:'유저정보', loading:true});
            // let url_info = `/api/account/user/info`;
            // // let url_permission = `/api/admin/app/aca_erp/settings/permissions/2`;
            // // let url_permission_admin = `/api/admin/app/aca_erp/settings/permission_admins/me`;
            // axios.all([
            //     vm.$c.io.get(url_info, {}),
            //     // vm.$c.io.get(url_permission, {}),
            //     // vm.$c.io.get(url_permission_admin, {}),
            // ]).then( axios.spread( (res1)=>{
            //     let data1 = res1.data;
            //     console.log(data1)
            //     if(data1.success) {
            //         set_user(data1.user_prof);
            //     }
            //     vm.$store.dispatch('loading', {name:'유저정보', loading:false});
            // } ));
        },
    };
    return self;
})();


export default $app;
