<template>
    <q-layout class="com-social-login" view="hHh lpR fFf">
        <q-page-container>
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; gap:16px;">
                <!-- 네이버 로그인 버튼 노출 영역
                <a :href="api_url"><img height="50" src="https://static.nid.naver.com/oauth/small_g_in.PNG"/></a>
                -->
                <q-spinner-dots color="primary" size="40px"/>
                <div class="text-grey-7">네이버 로그인 페이지로 이동 중입니다...</div>
            </div>
        </q-page-container>
    </q-layout>
</template>

<script>

export default {
    components : {
    },
    data : function() {
        return {
            api_url : window.__SERVER_DATA__['api_url'],
        }
    },
    computed :{
    },
    created : function() {
        if (this.api_url) {
            window.location.replace(this.api_url)
        }
    },
    methods : {
    },
}
</script>

