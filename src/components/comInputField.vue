<template>
    <div class="q-field com-input-field" :class="{'q-field--error':error, 'q-field--outlined':outlined}">
            <div class="field__control">
                <slot></slot>
            </div>
            <div class="q-field__bottom" >
                <div class="q-field__messages" v-if="error">
                    <div class="fadeInDown" >{{errorMessage}}</div>
                </div>
            </div>
        
    </div>
</template>

<script>
export default {
    props : {
        'error' : Boolean,
        'errorMessage' : String,
        'outlined' : Boolean,
    },
    data() {
        return {
        };
    },
    methods : {
    },
    beforeMount() {
    }
};
</script>


<style scoped>
.q-field.q-field--error {
    padding-bottom: 0;
}
.field__control {
    position: relative;
}

.field__control::after {
    border-bottom : 2px solid inherit;
    transform: scale3d(1, 1, 1);
}
.field__control:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    border : 2px solid transparent;
}
.q-field--error .field__control::after {
    border-bottom : 2px solid var(--q-negative);
}
.q-field--outlined.q-field--error .field__control::after {
    border : 2px solid var(--q-negative);
}

.fadeInDown {
    animation: fadeInDown .8s;
}
@keyframes fadeInDown {
    0% {
        opacity: 0;
        transform: translate3d(0, -100%, 0);
    }
    to {
        opacity: 1;
        transform: translateZ(0);
    }
}
-webkit-@keyframes fadeInDown {
    0% {
        opacity: 0;
        transform: translate3d(0, -100%, 0);
    }
    to {
        opacity: 1;
        transform: translateZ(0);
    }
}
</style>