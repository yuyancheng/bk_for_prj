<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <header>
        <nav class="nav-bar">
            <div class="nav-bar-brand">
                <a class="nav-bar-logo" href="/page/platform/home.html">
                    <img src="../../assets/image/logo.png"/>
                    <span>{{versionName}}</span>
                </a>
            </div>
            <div class="nav-bar-menu nav-bar-collapse">
                <div class="nav-user-info">
                    <img alt="" src="../../assets/image/icon/user.png" style="float:right;margin:17px 20px 0px 0px">
                    <ul class="user-list" v-if="userName">
                        <li><a href="/page/personalCenter/basicInformation.html" target="_blank">{{userName}}</a></li>
                        <li><a v-on:click="logOut()">退出登录<i></i></a></li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';
    import menu from '@/assets/js/menuData';

    let pathname = window.location.href;
    let pathHash = window.location.hash;

    let Nav = Vue.component('head-nav', {
        props: [],
        created () {
            for (let i = 0; i < menu.versions.length; i++) {
                if (pathname.search('/' + menu.versions[i].code + '/') !== -1) {
                    this.versionName = menu.versions[i].name;
                    this.sysCode = i + 1;
                    break;
                }
            }
        },
        mounted () {
            let that = this;
            this.$store.commit('setAjax', {
                url: '/auth/findUserInfo',
                params: {},
                success (res) {
                    that.userName = res.data && res.data.userName || '';
                },
                error (err) {
                    console.log(err);
                }
            });
            this.$store.dispatch('ajax');
        },
        template: '<div></div>',
        methods: {
            checkPath () {
                let pathSection = pathHash.split('/')[2];

                for (let m = 0; m < this.menuList.length; m++) {
                    let resCode = this.menuList[m].resCode;
                    if (!resCode) continue;
                    if (resCode === pathSection) {
                        this.activeIndex = m;
                        break;
                    }
                }

                this.subMenuData = this.menuList[this.activeIndex]['childRes'];
            },
            logOut () {
                this.$store.commit('setAjax', {
                    url: '/auth/logout',
                    params: {},
                    success (res) {
                        if (res.data && res.data.result === 600) {
                            window.location.href = '/page/platform/login.html';
                        }
                    },
                    error (err) {
                        console.log(err);
                    }
                });
                this.$store.dispatch('ajax');
            }
        },
        data () {
            return {
                versionName: '',
                userName: '',
                mOver: false
            };
        }
    });

    export default Nav;

</script>

<style lang="scss" type="text/scss">
    @import "navi.scss";
</style>
