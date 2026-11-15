<template>
    <div class="element-list_menu" 
        :class="[css_class]" :style="[css_style]" :id="css_id?css_id:null">
        <div class="p-relative menu-wrapper text-left" >
            <div class="title" v-html="title" v-if="title"></div>
            <div class="menu">
                <slot v-bind:$="self">
                    <div class="item-list_menu" 
                        :class="{on:m.is_on}"
                        :key="m.id" 
                        v-for="m in menu.children" >
                        <a @click="clickMenu(m)">{{m.label}}</a>
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>


<script>
export default {
    props : [
        'padding', 'title', 'menu', 
        'css_style', 'css_class', 'css_id', 
    ],
    data : function() {
        return {
            self : this,
            /* help */
            help_text : `
#-- menu 사용법 --#
<el-list-menu title="메뉴" :menu="{
    'id': 1,
    'label': 'Menu',
    'open': true,
    'children': [
        {
            'menu_64': '이용약관',
            'link_url': '/policy?code=about',
            'sort_order': '1',
            'icon': '',
            'id': 1623394260420,
            'open': false,
            'label': '이용약관',
            'children': [],
            'is_root': false,
            'is_on' : false,
        },
    ]
}" />
`,
        }
    },
    methods : {
        /* check */
        get_url : function() {
            let url = this.$route.path;
            let url_prefix = this.$c.url.url_prefix;
            if(url_prefix.length>0 && url.indexOf('/~'+url_prefix)==0) {
                return url.substring(url_prefix.length+2, url.length);
            }
            return url;
        },
        
        /* click */
        clickMenu : function(menu) {
            if(menu.link_url) {
                let link_url = menu.link_url.trim();
                this.$c.goto_url(link_url);
            }
        },
    },
    mounted : function() {
    },
}
</script>

<style scope>
.menu-wrapper {
    border: 1px solid #e2e2e2;
    background: #f9f9f9;
}
.menu-wrapper > .title {
    padding: 10px 16px;
    background: #f9f9f9;
    border-bottom: 1px solid #e2e2e2;
}
.menu-wrapper > .menu {
    position: relative;
    padding: 13px 0;
}
.item-list_menu a {
    display: block;
    position: relative;
    padding: 2px 16px;
    text-decoration: none;
    color: #222;
}
.item-list_menu.on a {
    color: #932544;
    font-weight: 700;
}
.item-list_menu.active {
    background-color: #1976D2;
}
.item-list_menu.active a {
    color:#fff;
}
</style>
