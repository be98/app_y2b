<template>
    <div class="color-picker">
            <div v-for="c in color_list"
                :key="c" >
              <div class="color"
                   @click="setColor(c)"
                   :class="[{'active': color===c }, {'clear': c=='' }]"
                   :style="{ 'background-color': c }"></div>
            </div>
    </div>
</template>

<script>
export default {
    props : [ 'modelValue', 'palette' ],
    data: function() {
        return {
            color : '',
            color_list: [],
        }
    },
    methods: {
        setColor(color) {
            this.color = color;
            this.$emit('update:modelValue', color);
        },
    },
    beforeMount() {
        this.color = this.modelValue.toUpperCase();
        if(this.palette) {
            this.color_list = this.palette;
        } else {
            this.color_list = ['', '#000000', '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', 
                    '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', 
                    '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#FFFFFF' ];
        }
    }
}
</script>

<style scoped>
.color-picker {
    display: flex;
    flex-wrap: wrap;
    background: white;
}
.color {
    width: 1.5em;
    height: 1.5em;
    cursor: pointer;
    border: 1px solid #555;
}
.clear {
    background: linear-gradient(to top right,transparent 0,transparent calc(50% - 2.4px),#de080a 50%,transparent calc(50% + 2.4px),transparent);
    background-color:#fff;
}
.color.active {
    border: 4px solid #000;
    transform: scale(1.3);
    -webkit-box-shadow: 0px 0px 15px -3px rgba(41,40,41,1);
    -moz-box-shadow: 0px 0px 15px -3px rgba(41,40,41,1);
    box-shadow: 0px 0px 15px -3px rgba(41,40,41,1);
}
</style>
