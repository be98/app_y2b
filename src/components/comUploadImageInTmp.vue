<template>
    <div class="com-upload_image_in_tmp" >
        <div v-if="percent==100">
            <input type="file" style="display:none;" ref="file" @change="changeUploadFile" tabindex="-1" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            percent : 100,
            callback : null,
        }
    },
    methods: {
        upload(callback) {
            this.callback = callback;
            this.$refs.file.click();
        },
        changeUploadFile($e) {
            //input file이 multiple이면 여러개의 파일을 가져오게 된다.
            //--> 추후 여러 파일 경우도 사용할 수 있도록 changeUploadFile과 uploadFile를 분리하였다.
            this.uploadFile( $e.target.files[0] );
        },
        uploadFile( file ) {
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
                        //vm.form.image = data.uploaded_file[0].image;
                        //vm.form.resized_image = data.uploaded_file[0].resized_image;
                        //vm.form.image_filename = data.uploaded_file[0].image_filename;
                        vm.percent = 100;
                        if(vm.callback) {
                            vm.callback(data.uploaded_file);
                        }
                        vm.callback = null;
                    }
                }
            }
            ajax.upload.addEventListener("progress", function (event) {
                var percent = (event.loaded / event.total) * 100;
                vm.percent = percent;
            });
            ajax.open("POST", '/api/tool/upload/image_in_tmp', true);
            ajax.send(formData);
        },
    },
    mounted() {
    },
}
</script>
