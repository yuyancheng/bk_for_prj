<template lang="pug">
    div
        el-container
            el-aside.bdp-side(width="195px")
                el-menu(
                    :default-active="defaultActive",
                    class="menu-vertical",
                    background-color="#252934",
                    text-color="#B4BDDA",
                    size="mini",
                    style="height:100%;",
                    active-text-color="#ffa200")
                    div(style="height:40px;")
                    el-menu-item(index="1")
                        a(@click.prevent="visit('user-center')")
                            i(class="icon-uc")
                            span(slot="title") 用户中心
                    el-menu-item(index="2", v-if="isAdmin")
                        a(@click.prevent="visit('user-management')")
                            i(class="icon-um")
                            span(slot="title") 用户管理
                    el-menu-item(index="3", v-if="isAdmin")
                        a(@click.prevent="visit('category-management')")
                            i(class="el-icon-menu", style="font-size: 22px;color: #b4bdda;")
                            span(slot="title") 物资类别管理
                    el-menu-item(index="4", v-if="isAdmin")
                        a(@click.prevent="visit('material-management')")
                            i(class="icon-mm")
                            span(slot="title") 物资管理
                    el-menu-item(index="5", v-if="isAdmin")
                        a(@click.prevent="visit('unit-management')")
                            i(class="icon-rs")
                            span(slot="title") 收发单位管理
                    el-menu-item(index="6", v-if="isAdmin")
                        a(@click.prevent="visit('info-management')")
                            i(class="icon-im")
                            span(slot="title") 发运信息管理
                    el-menu-item(index="7", v-if="isAdmin")
                        a(@click.prevent="visit('notice-management')")
                            i(class="el-icon-edit-outline", style="font-size: 22px;color: #b4bdda;")
                            span(slot="title") 文章发布管理
            el-main
                router-view
</template>

<script type="text/ecmascript-6">
    export default {
        data: () => ({
            title: 'Express Module..',
            defaultActive: '1',
            isAdmin: false,
        }),
        created() {
            const path = location.href;
            if (path.indexOf('user-center') !== -1) {
                this.defaultActive = '1';
            } else if (path.indexOf('user-management') !== -1) {
                this.defaultActive = '2';
            } else if (path.indexOf('category-management') !== -1) {
                this.defaultActive = '3';
            } else if (path.indexOf('material-management') !== -1) {
                this.defaultActive = '4';
            } else if (path.indexOf('unit-management') !== -1 || path.indexOf('org-type-management') !== -1) {
                this.defaultActive = '5';
            } else if (path.indexOf('info-management') !== -1) {
                this.defaultActive = '6';
            } else if (path.indexOf('notice-management') !== -1) {
                this.defaultActive = '7';
            } else {
                this.defaultActive = '8';
            }

            if (localStorage) {
                let userInfo = localStorage.getItem('user_info');
                if (userInfo) {
                    userInfo = JSON.parse(userInfo);
                } else {
                    userInfo = this.$store.state.global.userInfo;
                }
                if (userInfo) {
                    this.isAdmin = userInfo.roleCode === 'MANAGER';
                    this.$store.commit('shareData', {
                        dataName: 'isAdmin',
                        value: this.isAdmin,
                    });
                }
            }
        },
        methods: {
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
    };

</script>

<style lang="scss" type="text/scss" scoped>

    $tl_height: 48px;
    .menu-vertical {
        .el-menu-item {
            height: $tl_height;
            line-height: $tl_height;
            a {
                padding-left: 0;
            }
        }
    }
    .is-active {
        background-color: #000 !important;

        span{
            color: #ffa200;
        }
    }

    .icon-uc, .icon-um, .icon-mm, .icon-rs, .icon-im {
        display: inline-block;
        margin-right: 8px;
        width: 24px;
        height: 24px;
        text-align: center;
        font-size: 18px;
        vertical-align: middle;
        line-height: 1;
        background: {
            position: center center;
            color: transparent;
            repeat: no-repeat;
            size: 80%;
        };
    }
    .icon-uc {
        background: {
            image: url(../../assets/image/icon2/u.png);
        };
    }
    .icon-um {
        background: {
            image: url(../../assets/image/icon2/um.png);
        };
    }
    .icon-mm {
        background: {
            image: url(../../assets/image/icon2/mm.png);
        };
    }
    .icon-rs {
        background: {
            image: url(../../assets/image/icon2/rs.png);
        };
    }
    .icon-im {
        background: {
            image: url(../../assets/image/icon2/im.png);
        };
    }


</style>
