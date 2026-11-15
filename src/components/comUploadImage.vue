<template>
    <div class="com-upload_image" :style="{width:(mini)?'200px':'100%'}">
        <table >
        <tr><td class="no-border" style="width:110px;padding:0;">
                <div class="input-image-thumbnail"> 
                    <img :src="resized_image" /> 
                </div>
            </td>
            <td class="no-border" style="padding:0;">
                <q-field outlined class="q-mb-xs pb0"
                        :error="(error)?true:false" :error-message="error" v-if="mini==false">
                    <template v-slot:control>
                        <div class="self-center full-width no-outline" tabindex="0">{{form.image_filename}}</div>
                    </template>
                </q-field>
                <div v-if="percent==100">
                    <input type="file" style="display:none;" ref="file" @change="changeUploadFile" />
                </div>
                <q-btn outline color="primary" class="mt1 mr1 px3 size-sm" :disabled="(percent!=100)?'disabled':null" 
                    icon="image" label="Upload"
                    @click="clickUploadFile" ></q-btn>
                <q-btn outline color="grey" class="mt1 q-px-sm size-sm" :disabled="(percent!=100)?'disabled':null"
                    icon="clear"
                    @click="clickRemoveFile" ></q-btn>
            </td>
        </tr>
        </table>
    </div>
</template>

<script>
export default {
    props : {
        'form': Object,     //form데이터에서 image, image_filename, resized_image의 3가지 데이터를 사용함
        'error' : String,
        'mini' : Boolean,
    },
    data : function() {
        return {
            image : '',
            percent : 100,
        }
    },
    computed : {
        resized_image() {
            console.log('checked image');
            return this.form.resized_image;
        }
    },
    methods: {
        clickUploadFile: function() {
            this.$refs.file.click();
        },
        clickRemoveFile : function() {
            let image_form = {
                image : "",
                resized_image : "",
                image_filename : "",
            };
            this.$emit('change', image_form);
        },
        changeUploadFile : function($e) {
            //input file이 multiple이면 여러개의 파일을 가져오게 된다.
            //--> 추후 여러 파일 경우도 사용할 수 있도록 changeUploadFile과 uploadFile를 분리하였다.
            this.uploadFile( $e.target.files[0] );
        },
        uploadFile : function( file ) {
            var vm = this;
            this.percent = 0;
            var formData = new FormData();
            var ajax = new XMLHttpRequest();
            formData.append("upfile", file);
            
            ajax.onreadystatechange = function () {
                if (ajax.status) {
                    if (ajax.status == 200 && (ajax.readyState == 4)){
                        var data = JSON.parse(ajax.responseText);
                        console.log(data);
                        //multiple이 아니므로, 업로드된 파일은 하나이다.
                        let image_form = {
                            image : data.uploaded_file[0].image,
                            resized_image : data.uploaded_file[0].resized_image,
                            image_filename : data.uploaded_file[0].image_filename,
                        };
                        vm.$emit('change', image_form);
                        vm.percent = 100;
                        //동적생성에 의해서 form데이터가 생성되는 경우는 render가 안될경우가 있다.
                        //--> 이를 위해 forceUpdate를 한다.
                        //--> 이와 같은 경우는 /admin/pages/page/edit에서 element를 동적생성할 때 발생한다.
                        //vm.$forceUpdate();
                    }
                }
            }
            ajax.upload.addEventListener("progress", function (event) {
                var percent = (event.loaded / event.total) * 100;
                vm.percent = percent;
            });
            //ajax.open("POST", '/api/admin/tool/upload/image', true); --> /tmp폴더로 바꿈
            ajax.open("POST", '/api/tool/upload/image_in_tmp', true);
            ajax.send(formData);
        },
        
    },
    mounted : function() {
    },
}
</script>

<style scoped>
.input-image-thumbnail {
    width: 100px;
    height: 100px;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: center;
    padding: 0;
    position: relative;
    display: inline-block;
}
.input-image-thumbnail img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    max-width: 100%;
    max-height: 100%;
}
</style>
