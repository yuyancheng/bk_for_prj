<template lang="pug">
    div(class="nav-bar-menu")
        div(class="nav-bar-brand")
            a(class="nav-bar-logo", href="/#/", style="font-size:20px; text-decoration:none;") 后勤物流融合网
        el-menu(
        :default-active="defaultActive",
        class="el-menu-demo",
        mode="horizontal",
        background-color="#2FACED",
        text-color="#fff",
        active-text-color="#eee")
            el-menu-item(index="1")
                a(@click.prevent="visit('home')") 首页
            el-menu-item(index="2")
                a(@click.prevent="visit('trendsOfWork')") 工作动态
            el-menu-item(index="3")
                a(@click.prevent="visit('release-of-materials')") 物资发运
            el-menu-item(index="4")
                a(@click.prevent="visit('monitoring-of-transportation')") 在运监控
            el-menu-item(index="5")
                a(@click.prevent="visit('data-centre')") 数据中心
            el-menu-item(index="6")
                a(@click.prevent="visit('managementOfBackstage')") 后台管理
        el-form.z-form(:inline="true",v-if="custNoVisable")
            el-form-item(label="月结卡号")
                el-select(:value="custNo",@change="change")
                    el-option(label="全部",value="全部")
                    el-option(v-for="item in custNoList",:label="item.label",:value="item.value",:key="item.key")
        div(style="float:right;line-height:60px")
            strong(style="font-weight:normal;font-size:13px;color:#fff;") {{userName}}
            el-button(@click="logout", type="text", class="user-logout", v-if="hasChecked")
</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';
    import logInOut from '@/lib/loginout';
    import { mapGetters, mapMutations } from 'vuex';
    // const pathname = window.location.href;
    const Nav = Vue.component('head-nav', {
        props: [],
        created() {
            const path = location.href;
            if (path.indexOf('home') !== -1) {
                this.defaultActive = '1';
            } else if (path.indexOf('trends-of-work') !== -1) {
                this.defaultActive = '2';
            } else if (path.indexOf('release-of-materials') !== -1) {
                this.defaultActive = '3';
            } else if (path.indexOf('monitoring-of-transportation') !== -1) {
                this.defaultActive = '4';
            } else if (path.indexOf('data-centre') !== -1) {
                this.defaultActive = '5';
            } else if (path.indexOf('management-of-backstage') !== -1) {
                this.defaultActive = '6';
            }

            this.$store.state.clearUserInfo = () => {
                this.userName = '';
            };
        },
        watch: {
            $route(to) {
                const paths = to.path;
                if (new RegExp('/kh/data-centre/default').test(paths) || new RegExp('/kh/monitoring-of-transportation').test(paths)) {
                    this.custNoVisable = true;
                    this.$axios.get('/user/ops/myinfo').then(res => {
                        if (Array.isArray(res.data.custNoList)) {
                            this.custNoList = res.data.custNoList.map(v => ({ label: v, value: v }));
                            this.setCustNo({ custNo: this.custNoList[0].value });
                            if (this.$store.state.onCustNoChange) {
                                this.$store.state.onCustNoChange(this.custNoList[0].value);
                            }
                        } else if (this.$store.state.onCustNoChange) {
                            this.$store.state.onCustNoChange('全部');
                        }
                        // this.setCustOrgId({ custOrgId: res.data.deptId });
                        // this.setRoleCode({ roleCode: res.data.roleCode });
                        // this.setOrgMaterialMark({ orgMaterialMark: res.data.orgMaterialMark });
                        // this.setDeptPurview({ deptPurview: res.data.deptPurview });
                    });
                } else {
                    this.custNoVisable = false;
                }
            },
            // custNo() {
            //     console.log(this.custNo);
            // },
        },
        mounted() {
            const { path } = this.$route;
            if (new RegExp('/kh/data-centre/default').test(path) || new RegExp('/kh/monitoring-of-transportation').test(path)) {
                this.custNoVisable = true;
                this.$axios.get('/user/ops/myinfo').then(res => {
                    if (Array.isArray(res.data.custNoList)) {
                        // res.data.custNoList.push({ label: '001022313213213', value: '001022313213213' });
                        this.custNoList = res.data.custNoList.map(v => ({ label: v, value: v }));
                        this.setCustNo({ custNo: this.custNoList[0].value });
                        if (this.$store.state.onCustNoChange) {
                            this.$store.state.onCustNoChange(this.custNoList[0].value);
                        }
                    } else if (this.$store.state.onCustNoChange) {
                        this.$store.state.onCustNoChange('全部');
                    }
                    // this.setCustOrgId({ custOrgId: res.data.deptId });
                    this.setRoleCode({ roleCode: res.data.roleCode });
                    // this.setOrgMaterialMark({ orgMaterialMark: res.data.orgMaterialMark });
                    // this.setDeptPurview({ deptPurview: res.data.deptPurview });
                });
            } else {
                this.custNoVisable = false;
            }
            if (localStorage) {
                let userInfo = localStorage.getItem('user_info');
                if (userInfo) {
                    userInfo = JSON.parse(userInfo);
                    if (userInfo) {
                        this.userName = userInfo.username;

                        this.$store.commit('shareData', {
                            dataName: 'userInfo',
                            value: userInfo,
                        });
                    }
                }
            }
            this.hasChecked = this.nameRegExp.test(this.userName);
        },
        template: '<div></div>',
        methods: {
            ...mapMutations('custNo', ['setCustNo', 'setCustOrgId', 'setRoleCode', 'setDeptPurview', 'setOrgMaterialMark']),
            logout() {
                const that = this;
                logInOut.logout(that, () => {
                    that.isLoading = false;
                }, () => {});
            },
            change(custNo) {
                this.setCustNo({ custNo });
                if (this.$store.state.onCustNoChange) {
                    this.$store.state.onCustNoChange(custNo);
                }
            },
            visit(name) {
                const urls = this.$router.history.current.matched;
                let flg = true;
                urls.forEach(val => {
                    if (val.name === name) {
                        flg = false;
                    }
                });
                if (flg) {
                    this.$router.push({
                        name,
                    });
                }
            },
        },
        computed: {
            ...mapGetters('custNo', { custNo: 'custNo' }),
        },
        data() {
            return {
                versionName: '',
                sysCode: 1,
                nameRegExp: new RegExp(/\S/),
                menuList: [
                    {
                        name: '首页',
                        href: '/home',
                        index: 0,
                    },
                    {
                        name: '工作动态',
                        href: '/trends-of-work',
                        index: 1,
                    },
                    {
                        name: '物资发放',
                        href: '/release-of-materials',
                        index: 2,
                    },
                    {
                        name: '在运监控',
                        href: '/monitoring-of-transportation ',
                        index: 3,
                    },
                    {
                        name: '数据中心',
                        href: '/data-centre',
                        index: 4,
                    },
                    {
                        name: '后台管理',
                        href: '/management-of-backstage',
                        index: 5,
                    },
                ],
                defaultActive: '1',
                menuIndexStr: '0',
                subMenuData: [],
                userName: '',
                hasChecked: false,
                mOver: false,
                cardNos: [{ accountCompany: '全部', accountCompanyValue: '全部' }],
                // custNo: '全部',
                custNoVisable: false,
                custNoList: [],
            };
        },
    });
    export default Nav;
</script>

<style lang="scss" type="text/scss" scoped>

    .user-logout {
        display: inline-block;
        width: 60px;
        height: 30px;
        background: {
            image: url(../../../assets/image/icon2/quit.png);
            position: center center;
            repeat: no-repeat;
        }
    }
    .el-menu--horizontal > .el-menu-item.is-active {
        border-bottom: none;
        a {
            color: rgba(255,255,255,.8);
            background-color: #0E95DB;
            cursor: default;
        }
        &:hover {
            color: rgba(255,255,255,.8);
            background-color: #0E95DB;
        }
    }
</style>
<style lang="scss">
.nav-bar-menu {
    display: flex;
    background-color: rgb(47, 172, 237);
    justify-content: space-between;
    align-items: center;
    .z-form {
        margin-right: 40px;
        .el-form-item {
                margin:0;
        }
    }
    .nav-bar-brand {
        padding: 0 20px;
        margin-right: 20px;
    }
    .el-menu {
        flex:1;
    }
    .el-menu-item a {
        font-size: 16px;
    }
    .nav-bar-logo {
        color:#fff;
        line-height: 60px;
        padding-left: 65px;
        background: {
            image: url(../../../assets/image/logo.png);
            position: left center;
            repeat: no-repeat;
            size: 60px;
        };
    }
    .el-input__inner{
        background-color: transparent;
        color: #fff;
        border: 1px solid #fff;
        height: 32px;
        width: 160px;
        line-height: 32px;
        &:hover {
            border-color: rgba(255,255,255,.8);
        }
    }
    .el-select .el-input.is-focus .el-input__inner {
        border-color: #fff;
    }
    .el-select .el-input .el-select__caret{
        color: #fff;
    }
    .el-select .el-input__inner:focus {
        border-color: #FFF;
    }
}
</style>

