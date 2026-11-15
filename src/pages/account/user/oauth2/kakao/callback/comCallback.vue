<template>
    <q-layout class="com-social-login" view="hHh lpR fFf">
        <q-page-container>
            <div style="display:flex; align-items:center; justify-content:center; height:100vh;">
                <div v-if="key" class="welcome-card">
                    <div class="kakao-badge">
                        <span class="kakao-k">K</span> 카카오 로그인 완료
                    </div>

                    <div class="welcome-text">
                        <h2>환영합니다<span v-if="user_name">, {{ user_name }}님!</span></h2>
                    </div>

                    <hr class="divider"/>

                    <div class="info-item">
                        <div class="icon-dot">✓</div>
                        <span>카카오 계정으로 간편 로그인이 연동되었습니다</span>
                    </div>

                </div>
 
                <!-- 실패 -->
                <div v-else class="welcome-card">
                    <div class="fail-badge">
                        <span>!</span> 로그인 실패
                    </div>
 
                    <div class="welcome-text">
                        <h2>인증에 실패했습니다</h2>
                    </div>
                    
                </div>
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
            key : '',
            user_name : '',
        }
    },
    computed :{
    },
    methods : {
        close_popup() {
            if( window.opener && !window.opener.closed ) {
                try {
                    window.opener.location.reload();
                } catch(e) {
                    // 부모가 다른 도메인이면 접근할 수 없으므로 닫기만 한다
                }
            }
            window.close();
        },
    },
    beforeMount() {
        const params = new URLSearchParams(window.location.search)
        this.key       = params.get('key')  || ''
    },
    mounted() {
        // 실패 시에는 원인을 볼 수 있도록 화면을 남긴다
        if( this.key ) this.close_popup();
    },
}
</script>

<style scoped>
.welcome-card {
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.12);
    border-radius: 12px;
    padding: 2.5rem 2rem;
    width: 100%;
    max-width: 400px;
    text-align: center;
    animation: scaleIn 0.4s ease;
}
 
.kakao-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #FEE500;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    color: #3C1E1E;
    font-weight: 500;
    margin-bottom: 1.5rem;
    animation: fadeUp 0.5s ease 0.1s both;
}

.fail-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #E24B4A;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    color: #fff;
    font-weight: 500;
    margin-bottom: 1.5rem;
    animation: fadeUp 0.5s ease 0.1s both;
}

.welcome-text h2 {
    font-size: 20px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0;
}
 
.divider {
    border: none;
    border-top: 0.5px solid rgba(0,0,0,0.12);
    margin: 1.5rem 0;
}
 
.info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #666;
    justify-content: center;
    animation: fadeUp 0.5s ease 0.3s both;
}
 
.icon-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #FFF7CC;
    color: #8A6D00;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
}

</style>