<template>
    <div class="com-upload_file">
        <q-field outlined class="q-mb-xs pb0" 
                :error="(error)?true:false" :error-message="error" >
            <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">{{form.file_filename}}</div>
            </template>
        </q-field>
        <div v-if="percent==100">
            <input type="file" style="display:none;" ref="file" @change="changeUploadFile" />
        </div>
        
        <q-btn outline color="primary" class="px3 size-sm" :disabled="(percent!=100)?'disabled':null" 
                icon="image" label="Upload"
                @click="clickUploadFile" ></q-btn>
        <q-btn outline color="grey" class="px3 size-sm" :disabled="(percent!=100)?'disabled':null"
                icon="clear"
                @click="clickRemoveFile" ></q-btn>
    </div>
</template>

<script>
export default {
    props : {
        'form': Object,     //form데이터에서 file, file_filename의 2가지 데이터를 사용함
        'error' : String,
    },
    data : function() {
        return {
            percent : 100,
        }
    },
    methods: {
        clickUploadFile: function() {
            this.$refs.file.click();
        },
        clickRemoveFile : function() {
            let file_form = {
                file : "",
                file_filename : "",
            };
            this.$emit('change', file_form);
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
                        //multiple이 아니므로, 업로드된 파일은 하나이다.
                        let file_form = {
                            image : data.uploaded_file[0].file,
                            file_filename : data.uploaded_file[0].file_filename,
                        };
                        vm.$emit('change', file_form);
                        vm.percent = 100;
                        //동적생성에 의해서 form데이터가 생성되는 경우는 render가 안될경우가 있다.
                        //--> 이를 위해 forceUpdate를 한다.
                        //--> 이와 같은 경우는 /admin/pages/page/edit에서 element를 동적생성할 때 발생한다.
                        vm.$forceUpdate();
                    }
                }
            }
            ajax.upload.addEventListener("progress", function (event) {
                var percent = (event.loaded / event.total) * 100;
                vm.percent = percent;
            });
            ajax.open("POST", '/api/tool/upload/file_in_tmp', true);
            ajax.send(formData);
        },
    },
    mounted : function() {
    },
}
</script>

