<template lang="pug">
    section(:style="{'height':winHeight,'backgroundColor':'#fff'}")
        .err-404
        p(style="font-size:16px;text-align:center;") 您访问页面不存在, {{time}} 秒后跳转

</template>
<script>
    export default {
        data() {
            return {
                time: 3,
            };
        },
        methods: {},
        mounted() {
            const $vm = this;
            setInterval(() => {
                $vm.time -= 1;
                if ($vm.time === 0) {
                    $vm.$router.replace({
                        path: '/',
                    });
                }
            }, 1000);
        },
        computed: {
            winHeight() {
                return `${window.innerHeight}px`;
            },
        },
    };
</script>

<style lang="scss">
    .err-404 {
        width: 355px;
        height: 156px;
        margin: 0 auto;
        padding-top: 190px;
        text-align: center;
        background: {
            image: url(../assets/image/icon2/404.png);
            position: center center;
            repeat: no-repeat;
            size: 70%;
        };
    }
</style>
