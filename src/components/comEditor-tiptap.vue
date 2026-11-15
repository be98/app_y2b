<template>
    <div >
        <editor-content :editor="editor" />
        <com-upload-image-in-tmp ref="upload_image" ></com-upload-image-in-tmp>
    </div>
</template>


<script>
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
//import comUploadImageInTmp from '@/components/comUploadImageInTmp';

export default {
    components : {
        EditorContent,
        //comUploadImageInTmp,
    },
    props : [
        'modelValue', 'min_height', 'bg_color', 'color', 'toolbar'
    ],
    data() {
        return {
            editor : null,
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
    mounted() {
        this.editor = new Editor({
            content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
            extensions: [
                StarterKit,
            ],
        });
    },
    beforeUnmount() {
        this.editor.destroy()
    },
}
</script>
