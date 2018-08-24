<template lang="pug">
    router-view
</template>

<script>

    import Vue from 'vue';
    import VueWechatTitle from 'vue-wechat-title';
    import Navigator from '@/components/common/nav/Navigator';

    Vue.use(VueWechatTitle);

    // const pathname = window.location.href;

    export default {
        name: 'app',
        data() {
            return {
                isCollapse: false,
            };
        },
        components: {
            'head-nav': Navigator,
        },
        computed: {},
        template: '<div></div>',
        created() {},
        mounted() {
        },
    };
</script>

<style lang="scss">
    @import '/assets/reset.scss';
    @import '/assets/common.scss';
    @import 'assets/css/element-ui-covering.scss';

    body {
        background-color: #191919;
    }
    #app {}

</style>
