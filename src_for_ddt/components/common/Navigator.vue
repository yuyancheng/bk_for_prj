<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <header>
        <nav class="nav-bar nav-bar-default">
            <div class="nav-bar-brand">
                <a class="nav-bar-logo" href="/page/platform/home.html">
                    <img src="../../assets/image/logo.png"/>
                    <span>{{versionName}}</span>
                </a>
            </div>
            <div class="nav-bar-menu nav-bar-collapse">
                <ul class="nav-bar-left">
                    <li v-for="(nav, index, key) in menuList" v-if="!nav['$ref'] && nav['flag'] !== 2"
                        :class="['nav-item', {'active': index === activeIndex}]">
                        <a :href="index === activeIndex ? 'javascript:void(0);' : nav.resUrl">{{nav.resName}}</a>
                    </li>
                </ul>
                <ul class="nav-bar-right"></ul>
                <div class="nav-user-info" style="text-align: center;">
                    <img alt="" src="../../assets/image/icon/user.png" style="margin:17px 0 0px 0px">
                    <ul class="user-list" v-if="userName">
                        <li><a href="/page/personalCenter/basicInformation.html" target="_blank">{{userName}}</a></li>
                        <li><a v-on:click="logOut()">退出登录<i></i></a></li>
                    </ul>
                </div>
                <div class="nav-card-no">
                    <label>月结卡号：</label>
                    <select v-on:change="changeCardNo($event)">
                        <option v-for="opt in cardNos" :value="opt.accountCompanyValue">{{opt.accountCompany}}</option>
                    </select>
                </div>
            </div>
        </nav>
    </header>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';
    import menu from '@/assets/js/menuData';
    // import data from '@/assets/js/data';

    let pathname = window.location.href;

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

            this.submitForm();
            this.$store.commit('setTopMenuObject', this);
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

            // 获取月结卡号数据
            this.$store.commit('setAjax', {
                url: '/personal/findByAccountCompanyMore',
                params: {},
                success (res) {
                    that.cardNos = res.data;
                },
                error (err) {
                    console.log(err);
                }
            });
            this.$store.dispatch('ajax');
        },
        template: '<div></div>',
        methods: {
            setMenuObject () {},
            submitForm () {
                let thiz = this;
                this.$store.commit('setAjax', {
                    url: '/queryDdtResources',
                    params: {
                        sysCode: thiz.sysCode
                    },
                    success (res) {
                        thiz.menuList = res.data;
                        thiz.checkPath();
                        thiz.menuList[0].refreshTimes = 1;
                        thiz.$store.commit('setTopMenu', thiz.menuList);
                        thiz.$store.commit('setSideMenu', thiz.subMenuData);
                        // thiz.$store.commit('setMenuIndex', thiz.menuIndexStr);
                        if (thiz.$store.state.setSubMenu) thiz.$store.state.setSubMenu();
                    },
                    error (err) {
                        console.log(err);
                    }
                });
                this.$store.dispatch('ajax');
            },
            checkPath () {
                let pathHash = window.location.hash;
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
                this.$store.commit('setSideMenu', this.subMenuData);
                if (this.$store.state.setSubMenu) this.$store.state.setSubMenu();
            },
            refresh () {
                this.checkPath();
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
            },
            changeCardNo (e) {
                if (this.cardNos.length > 2) {
                    this.$store.dispatch('card_no_change', e.target.value);
                }
            }
        },
        data () {
            return {
                versionName: '',
                sysCode: 1,
                menuList: [],
                activeIndex: 0,
                menuIndexStr: '0',
                subMenuData: [],
                userName: '',
                mOver: false,
                cardNos: [{accountCompany: '全部', accountCompanyValue: '全部'}]
            };
        }
    });

    export default Nav;

</script>

<style lang="scss" type="text/scss">
    @import "navi.scss";

</style>
