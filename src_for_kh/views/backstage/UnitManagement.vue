<template lang="pug">
    div
        .cnt-header
            h3 收发单位管理
        .cnt-wrapper(v-if="isAdmin", style="position:relative;")
            el-menu(
            style="min-height:60px;padding-right:90px;",
            :default-active="activeIndex", mode="horizontal")
                el-menu-item(v-for="(item, idx) in unitTypeList.default", :key="item.id",
                @click="visitPage('unit-management-list', item.orgTypeName, item.id)", :index="idx+1+''") {{item.orgTypeName}}

            .org-type-mg(style="position:absolute;top:10px;right:30px;")
                el-button(type="text", @click="visitPage('org-type-management')")
                    i(class="el-icon-setting", style="font-size: 14px;")  组织类型管理

        router-view(v-if="isAdmin", :key="routerKey")

</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;
            return {
                isAdmin: false,
                activeIndex: '1',
                historyHref: '',
                unitTypeList: {
                    default: [],
                    getData() {
                        that.$axios.get(APIList.GET_UNIT_TYPE, {
                            data: {},
                        }).then((response) => {
                            that.unitTypeList.default = response.data.rows;
                            const hash = that.$router.history.current.hash;
                            const hashValue = decodeURIComponent(hash.substring(1));
                            let idx = 0;
                            for (let i = 0; i < that.unitTypeList.default.length; i += 1) {
                                if (hashValue === that.unitTypeList.default[i].orgTypeName) {
                                    that.activeIndex = `${i + 1}`;
                                    idx = i;
                                    break;
                                }
                            }
                            const curID = that.unitTypeList.default[idx].id;
                            that.curOrgTypeID = curID;
                            that.$store.commit('shareData', {
                                dataName: 'curOrgTypeID',
                                value: curID,
                            });

                            let href = window.location.href;
                            const index = href.indexOf('?');
                            if (index !== -1) {
                                href = href.substring(0, index);
                            }
                            if (!hashValue) {
                                window.location.href = `${href}?type_id=${curID}#${that.unitTypeList.default[0].orgTypeName}`;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
            };
        },
        computed: {
            routerKey() {
                const hash = decodeURIComponent(this.$router.history.current.hash);
                const key = `${this.$route.path}${hash}`;
                return key;
            },
        },
        components: {},
        created() {
            if (!this.$store.state.global.isAdmin) {
                this.isAdmin = false;
                this.$alert('非管理员角色，不能访问此页！', {
                    confirmButtonText: '确定',
                    type: 'warning',
                }).then(() => {
                });
            } else {
                this.isAdmin = true;
                this.init();
            }
        },
        mounted() {},
        methods: {
            init() {
                this.unitTypeList.getData();
            },
            visitPage(href, tabName, id) {
                const params = {
                    name: href,
                };

                if (tabName) {
                    params.hash = `#${tabName}`;
                }
                if (id !== undefined) {
                    params.query = {
                        type_id: id,
                    };
                }
                this.curOrgTypeID = id;
                this.$router.push(params);
            },
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-wrapper {
        padding: 0 30px 20px;
        background-color: #FFF;
    }
    .cnt-header {
        border-bottom: 1.5px solid #4791FF;
        background-color: #f5f5f5;
        h3 {
            padding-left: 30px;
            line-height: 48px;
            font: {
                weight: normal;
                size: 19px;
            };
            color: #565656;
        }
    }
    .el-menu-item {
        padding: 0 15px;
    }
    .opr-btns {
        display: inline-block;
        > .el-button {
            width: 90px;
        }
    }
</style>
