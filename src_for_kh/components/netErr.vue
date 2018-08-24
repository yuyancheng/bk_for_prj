<template lang="pug">
    section(:style="{'height':winHeight,'backgroundColor':'#fff'}")
        .net-err
        p(style="font-size:16px;text-align:center;") 当前没有网络信号，请检查您的网络！

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
        },
        computed: {
            winHeight() {
                return `${window.innerHeight}px`;
            },
        },
    };
</script>

<style lang="scss">
    .net-err {
        width: 334px;
        height: 156px;
        margin: 0 auto;
        padding-top: 190px;
        text-align: center;
        background: {
            image: url(../assets/image/icon2/netErr.png);
            position: center center;
            repeat: no-repeat;
            size: 70%;
        };
    }
</style>
