<template>
    <div>
        <head-nav v-if="!singleBar1 && !singleBar2" class="header-fixed"></head-nav>
        <nav-inner v-if="singleBar2" class="header-fixed"></nav-inner>
        <head-bar v-else class="header-fixed"></head-bar>
        <div>
            <side-menu v-if="!singleBar1 && !singleBar2" class="side-fixed"></side-menu>
            <div v-if="!singleBar1 && !singleBar2" class="main-content">
                <router-view v-wechat-title="$route.meta.title"></router-view>
            </div>
            <div v-else-if="singleBar1" class="single-main-content">
                <router-view v-wechat-title="$route.meta.title"></router-view>
            </div>
            <div v-else class="single-main-content-full">
                <router-view v-wechat-title="$route.meta.title"></router-view>
            </div>
        </div>
        <custome-service></custome-service>
    </div>
</template>

<script>

    import Vue from 'vue';
    import VueWechatTitle from 'vue-wechat-title';
    import Navigator from '@/components/common/Navigator';
    import NavInner from '@/components/common/NavInner';
    import HeadBar from '@/components/common/HeadBar';
    import SideMenu from '@/components/common/SideMenu';
    import Service from '@/components/common/CustomerService';

    Vue.use(VueWechatTitle);

    let pathname = window.location.href;

    export default {
        name: 'app',
        components: {
            'head-nav': Navigator,
            'nav-inner': NavInner,
            'head-bar': HeadBar,
            'side-menu': SideMenu,
            'custome-service': Service
        },
        template: '<div></div>',
        created () {
            const regExp1 = /\/tools\//g;
            const regExp2 = /\/user_center|\/my_column/g;
            if (regExp1.test(pathname)) {
                this.singleBar1 = true;
            }
            if (regExp2.test(pathname)) {
                this.singleBar2 = true;
            }
        },
        init () {
            console.log('Mine module');
        },
        data () {
            return {
                singleBar1: false,
                singleBar2: false,
                mShow: true
            };
        }
    };

</script>

<style lang="less" type="text/less">

    @import "./assets/css/public.less";
    @import "./assets/css/menu.less";
    @import "./assets/css/service.less";
    @import "./assets/css/element-ui-covering.less";

    @top-val: 60px;

    body {
        background-color: #EDF1F5;
    }

    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

    .header-fixed {
        position: fixed;
        top: 0;
        z-index: 100;
        width: 100%;

        & ~ div {
            min-width: 100%;
            margin-top: @top-val;

            .side-fixed {
                top: @top-val;
                bottom: 0;
            }
        }
    }

    .side-fixed {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        overflow-y: auto;
    }

    .main-content {
        margin: 0 20px 20px 200px;
        background-color: #FFF;
    }

    .single-main-content {
        width: 1200px;
        margin: 0 auto;
        background-color: #FFF;
    }

</style>
