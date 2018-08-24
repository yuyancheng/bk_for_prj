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
                    <li class="nav-item active">
                        <a href="javascript:void(0)">公司看板</a>
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
            </div>
        </nav>
    </header>
</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';

    let Nav = Vue.component('head-nav', {
        props: [],
        created () {
        },
        mounted () {
            let that = this;
            this.$axios.get(`/auth/findUserInfo`, {
                data: {}
            }).then((res) => {
                that.userName = res.data && res.data.userName || '';
            }).catch((res) => {
                console.log(res.msg);
            });
        },
        template: '<div></div>',
        methods: {
            setMenuObject () {},
            submitForm () {
            },
            logOut () {
                this.$axios.get(`/auth/logout`, {
                    data: {}
                }).then((res) => {
                    if (res.data && res.data.result === 600) {
                        window.location.href = '/page/platform/login.html';
                    }
                }).catch((res) => {
                    console.log(res.msg);
                });
            }
        },
        data () {
            return {
                versionName: '内部版',
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
