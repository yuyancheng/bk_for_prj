<template lang="pug">
    div
        el-container
            el-aside.bdp-side(width="195px")
                el-menu(
                    :default-active="defaultActive",
                    class="menu-vertical",
                    @open="handleOpen",
                    @close="handleClose2",
                    background-color="#252934",
                    text-color="#B4BDDA",
                    size="mini",
                    style="height:100%;",
                    active-text-color="#ffa200")
                    div(style="height:40px;")
                    el-menu-item(index="1")
                        a(@click.prevent="visit('trends-notice')")
                            i(class="el-icon-message", style="font-size: 20px;color: #b4bdda;")
                            span(slot="title") 通知公告
                    el-menu-item(index="2")
                        a(@click.prevent="visit('trends-solution')")
                            i(class="el-icon-tickets", style="font-size: 22px;color: #b4bdda;")
                            span(slot="title") 规划方案
                    el-menu-item(index="3")
                        a(@click.prevent="visit('trends-policy')")
                            i(class="el-icon-news", style="font-size: 20px;color: #b4bdda;")
                            span(slot="title") 政策制度
                    el-menu-item(index="4")
                        a(@click.prevent="visit('trends-experience')")
                            i(class="el-icon-star-off", style="font-size: 22px;color: #b4bdda;")
                            span(slot="title") 经验做法
                    el-menu-item(index="5")
                        a(@click.prevent="visit('trends-partner')")
                            i(class="el-icon-menu", style="font-size: 22px;color: #b4bdda;")
                            span(slot="title") 合作企业
            el-main.bdp-main
                div(v-if="!showDetails", style="margin:10px 30px;")
                    // 滚动公告栏
                    notice-bar
                router-view
</template>

<script type="text/ecmascript-6">
    import NoticeBar from '@/views/trends/NoticeBar';

    export default {
        data: () => ({
            title: 'Express Module..',
            defaultActive: '1',
            showDetails: false,
        }),
        created() {
            const path = location.href;
            if (path.indexOf('notice') !== -1) {
                this.defaultActive = '1';
            } else if (path.indexOf('solution') !== -1) {
                this.defaultActive = '2';
            } else if (path.indexOf('policy') !== -1) {
                this.defaultActive = '3';
            } else if (path.indexOf('experience') !== -1) {
                this.defaultActive = '4';
            } else if (path.indexOf('partner') !== -1) {
                this.defaultActive = '5';
            } else {
                this.defaultActive = '6';
            }
        },
        components: { NoticeBar },
        methods: {
            open() {
                this.$alert('这是一段内容', '标题名称', {
                    confirmButtonText: '确定',
                    callback: action => {
                        this.$message({
                            type: 'info',
                            message: `action: ${action}`,
                        });
                    },
                });
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {
                    });
            },
            handleOpen(key, keyPath) {
                console.log(key, keyPath);
            },
            handleClose2(key, keyPath) {
                console.log(key, keyPath);
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
