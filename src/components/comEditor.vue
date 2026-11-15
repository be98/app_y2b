<template>
    <div class="com-editor" >
    <form
        autocorrect="off"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false" >
        <q-editor class="w100p" 
                    :style="[{'background-color':options.bg_color}, {'color':options.color}]" 
                    :min-height="min_height" 
                    :definitions="{ upload: { tip: 'Upload Image', icon: 'image', handler: upload_image } }"
                    :toolbar="editor_toolbar"
                    v-model="text" ref="editor_content" 
                    @update:model-value="change" @focus="focused=true" @blur="focused=false" >
            <template v-slot:palette>
                <q-btn-dropdown dense no-caps ref="palette" no-wrap unelevated icon="palette" size="sm">
                    <q-list >
                        <q-item tag="label" >
                            <q-item-section>
                                <div>Text Color</div>
                            </q-item-section>
                        </q-item>
                        <hr class="ma0" />
                        <q-item tag="label" clickable @click="font_color('backColor', highlight)">
                            <q-item-section side>
                                <q-icon name="format_color_fill" ></q-icon> BG
                            </q-item-section>
                            <q-item-section>
                                <q-color v-model="highlight" default-view="palette" dark no-header no-footer 
                                    :palette="[
                                    '#ffccccaa', '#ffe6ccaa', '#ffffccaa', '#ccffccaa',
                                    '#ccffe6aa', '#ccffffaa', '#cce6ffaa', '#ccccffaa', '#e6ccffaa', '#ffccffaa', '#ff0000aa', 
                                    '#ff8000aa', '#ffff00aa', '#00ff00aa', '#00ff80aa', '#00ffffaa', '#0080ffaa', '#0000ffaa', '#8000ffaa', '#ff00ffaa',
                                    '#ffffff' ]" class="my-picker" ></q-color>
                            </q-item-section>
                        </q-item>
                        <q-item tag="label" clickable @click="font_color('foreColor', foreColor)">
                            <q-item-section side>
                                <q-icon name="border_color" ></q-icon> Text
                            </q-item-section>
                            <q-item-section>
                                <q-color v-model="foreColor" default-view="palette" dark  no-header no-footer :palette="[
                                    '#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff',
                                    '#ffffff'
                                ]" class="my-picker" ></q-color>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
            </template>
            <template v-slot:video>
                <q-btn dense no-caps no-wrap unelevated icon="videocam" size="sm" @click="open_video_menu">
                </q-btn>
                <div>
                    <q-menu @hide="hide_video_menu" v-model="is_open_video_menu">
                        <q-list style="min-width:300px;">
                            <q-item tag="label" >
                                <q-item-section>
                                    <div>Video Link</div>
                                </q-item-section>
                            </q-item>
                            <hr class="ma0" />
                            <q-item>
                                <q-item-section>
                                    <q-input dense v-model="video_url" autofocus ></q-input>
                                </q-item-section>
                            </q-item>
                            <q-item>
                                <q-item-section>
                                    <div class="text-right">
                                        <q-btn outline color="primary" label="Ok" size="sm" @click="click_video" ></q-btn>
                                    </div>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </div>
            </template>
        </q-editor>
        <com-upload-image-in-tmp ref="upload_image" ></com-upload-image-in-tmp>
    </form>
    </div>
</template>


<script>
import comUploadImageInTmp from '@/components/comUploadImageInTmp.vue';

export default {
    components : {
        comUploadImageInTmp,
    },
    props : [
        'modelValue', 'min_height', 'bg_color', 'color', 'toolbar'
    ],
    data() {
        return {
            focused:false,
            text : '',
            editor_toolbar : [ 
                [ { icon: this.$q.iconSet.editor.fontSize,
                    fixedLabel: true, fixedIcon: true, list: 'no-icons', 
                    options: ['size-1', 'size-2', 'size-3', 'size-4', 'size-5', 'size-6', 'size-7'], 
                    }], 
                ['left', 'center', 'right', 'justify'], ['bold', 'italic', 'strike', 'underline'], 
                ['palette','upload'], ['viewsource'] 
            ],
            options : {
                bg_color : 'white',
                color : '#222',
                min_height : '5rem',
            },
            foreColor: '#000000',
            highlight: '#ffff00aa',
            video_url : '',
            is_open_video_menu : false,
        }
    },
    watch : {
        //부모가 폼 객체를 통째로 갈아끼우는 경우(다이알로그 재오픈 등)에도 내용이 따라오도록 동기화.
        //입력 중에는 값이 같아 커서가 튀지 않는다.
        modelValue(value) {
            if( value !== this.text ) { this.text = value; }
        },
    },
    methods : {
        /* font color */
        font_color(cmd, name) {
            let vm = this;
            this.$refs.palette.hide();
            const edit = vm.$refs.editor_content;
            edit.caret.restore();
            edit.runCmd(cmd, name);
            edit.focus();
        },
        /* upload image */
        upload_image() {
            let vm = this;
            this.$refs.upload_image.upload(function(uploaded_file_list) {
                let uploaded_file = uploaded_file_list[0];
                let edit = vm.$refs.editor_content;
                edit.caret.restore();
                edit.runCmd('insertHTML', '<img src="'+uploaded_file.image+'" />');
                edit.focus();
            });
        },
        /* click video */
        open_video_menu() {
            let vm = this;
            let edit = vm.$refs.editor_content;
            this.is_open_video_menu = true;
            edit.caret.save();
        },
        hide_video_menu() {
            this.video_url = '';
        },
        click_video() {
            let vm = this;
            this.video_url = this.video_url.trim();
            if( this.video_url ) {
                this.$nextTick(function(){
                    let video_link = vm.video_url;
                    let key = '';
                    let youtube_url = 'https://www.youtube.com/embed/'; 
                    if (vm.video_url.startsWith("https://www.youtube.com/watch?v=") == true) {
                        key = vm.video_url.substring("https://www.youtube.com/watch?v=".length);
                        video_link = youtube_url+key;
                    } else if (vm.video_url.startsWith("https://youtu.be/") == true) {
                        key = vm.video_url.substring("https://youtu.be/".length);
                        video_link = youtube_url+key;
                    }
                    let video_html = '<div class="q-video q-video--responsive" style="padding-bottom: 56.25%;">'+
                        '<iframe src="' + video_link + '"' +
                        ' title="YouTube video player" frameborder="0" ' +
                        ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
                        ' allowfullscreen></iframe></div>';
                    //let video_html = '<img src="' + video_link + '" />';
                    let edit = vm.$refs.editor_content;
                    //let el = edit.getContentEl();
                    //let html = el.innerHTML+video_html;
                    //커서 위치에 삽입하는 것은 아직 구현하지 못했음
                    //--> 추후 수정 // https://www.youtube.com/watch?v=lOiqOFxrzHA
                    edit.caret.restore();
                    edit.runCmd('insertHtml', video_html);
                    //this.$emit('update:modelValue', html);
                    edit.focus();
                });
            }
            this.is_open_video_menu = false;
            let edit = vm.$refs.editor_content;
            edit.focus();
        },
        
        /* event */
        change(value) {
            this.$emit('update:modelValue', value);
        },
        /*
        set_contents(html) {
            let edit = vm.$refs.editor_content;
            //edit.runCmd('insertHtml', video_html);
        },*/
    },
    beforeMount() {
        if(this.min_height) { this.options.min_height= this.min_height; }
        if(this.bg_color) { this.options.bg_color= this.bg_color; }
        if(this.color) { this.options.color= this.color; }
        if(this.toolbar) { this.editor_toolbar=this.toolbar; }
        this.text = this.modelValue;
    },
}
</script>
