<!--콤포넌트 시작: com-tree_menu  
    1) parent_element가 꼭 필요함.
    2) menu_list의 menu 프로퍼트에 is_on, is_open 이 있어야 함.
    3) 부모에서 click_menu가 있는 경우 
       link_url값이 없으면 부모의 click_menu를 호출함.
-->
<template>
        <div class="com-tree_menu">
            <div v-for="(m,i) in menu_list" >
                <q-expansion-item expand-separator :group="(use_accordion)? 'accordion_group':null" 
                                :default-opened="m.is_open"
                                v-if="m.children.length>0" >
                    <template v-slot:header>
                        <q-item-section :class="{on:m.is_on==1, active:m.is_active==1}">
                            <a :style="{'padding-left':(level*16)+'px'}"
                                @click="clickMenu(m)">{{m.label}}<a>
                        </q-item-section>
                    </template>
                    <div class="p-relative">
                        <div class="d-inline-block p-absolute" style="width:1px;height:100%;border-left:1px solid #ddd" 
                            :style="{left:((level+1)*16)+'px'}">
                        </div>
                        <com-tree_menu  :menu_list="m.children" :level="level+1" :use_accordion="false" 
                                        :parent_element="parent_element" >
                        </com-tree_menu>
                    </div>
                </q-expansion-item >
                <q-item clickable v-ripple v-else>
                    <q-item-section :class="{on:m.is_on==1, active:m.is_active==1}">
                        <a  :style="{'padding-left':(level*16)+'px'}"
                            @click="clickMenu(m)">{{m.label}}<a>
                    </q-item-section>
                </q-item>
            </div>
        </div>
</template>

<script>
export default {
    props : [ 'menu_list', 'level', 'use_accordion', 'parent_element' ],
    data : function() {
        return {
            /* action */
            action : {
                logout(menu) {
                    this.$c.io.post( '/api/account/logout', {}).then(function(response) {
                        location.reload();
                    });
                },
            }
        }
    },
    methods : {
        /* click */
        clickMenu(menu) {
            if(menu.link_url) {
                let link_url = menu.link_url.trim();
                //link_url이 함수인지 체크함
                let [is_func, func_name, params] = this.$c.parse_func(link_url);
                
                //1) 부모 action에 함수가 있는지 검사
                // this.parent_element.hasOwnProperty('action') 는 에러가 발생하여 
                // this.parent_element.action값으로 바꿈
                // --> 만약, this.parent_element.action값이 없으면 undefind로 되어 잘 작동함.
                if( is_func == 1 &&
                    this.parent_element.action &&
                    this.$c.hasProperty(this.parent_element.action,func_name) ) {
                        let func = this.parent_element.action[func_name]
                        func(menu, params);
                //2) 현재 콤포넌트 action에 함수가 있는지 검사
                } else if( is_func == 1 && 
                    this.$c.hasProperty(this.action,func_name)) {
                    let func = this.action[func_name];
                    func(menu, params);
                //3) 링크로 이동
                } else {
                    this.$c.goto_url(link_url);
                }
            }
        },
    },
    mounted : function() {
    },
}
</script>
