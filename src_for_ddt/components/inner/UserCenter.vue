<template lang="pug">
    .user-info
        .content-title.fixed
            h4.title-name(style="display: inline-block") 用户中心
        .cnt-wrapper
            el-form(ref="userInfoForm", v-model="userInfo", label-width="90px", class="form-user-info")
                el-form-item(label="工　　号：")
                    span {{userInfo.code}}
                el-form-item(label="姓　　名：")
                    span {{userInfo.name}}
                el-form-item(label="管理组织：")
                    span {{userInfo.orgNum}} 个
                el-form-item(label="月结卡号：")
                    span {{userInfo.cardNum}} 个

            el-table(
            :data="tableData",
            tooltip-effect="dark"
            style="width: 100%",
            size="medium")
                el-table-column(prop="orgName", label="组织名称")
                // el-table-column(prop="orgName", label="组织简称", width="300")
                el-table-column(prop="cardNum", label="月结卡号数量", width="550")
                    template(slot-scope="scope")
                        el-button(type="text", @click="showCardList(scope.row)") {{scope.row.cardNum}}
                // el-table-column(prop="typeName", label="最后更新时间", width="350")

        el-dialog(
        title="设置",
        :visible.sync="dialogVisible"
        custom-class="",
        width="700px",
        padding="20px 40px",
        @close="close")
            div(style="line-height:40px;margin-bottom: 10px;")
                span 组织名称：
                    b(style="color:#000") {{curOrgName}}
                span(style="margin-left: 20px;") 月结卡号数：
                    b(style="color:#000") {{cardSetsDefault.length}}
                span(style="float:right;width:220px;")
                    el-input(v-model="cardKey", auto-complete="off", placeholder="输入月结卡号", size="small", style="width:70%;margin-right:10px")
                    el-button(type="primary", size="small", @click="search") 查询

            el-table(
            :data="cardSets",
            tooltip-effect="dark"
            style="width: 100%",
            size="medium")
                el-table-column(prop="card", label="月结卡号", align="center")
                // el-table-column(prop="time", label="时间", width="300")
            span(slot="footer", class="dialog-footer")
                el-button(type="primary", round, style="min-width: 80px", size="small", @click="close") 关 闭
</template>

<script type="text/ecmascript-6">
    import utils from '@/assets/js/lib/utils';

    export default {
        data () {
            return {
                currentPage: 1,
                dialogVisible: false,
                tableData: [],
                cardSetsDefault: [],
                cardSets: [],
                curOrgName: '',
                cardKey: '',
                userInfo: {
                    code: '--',
                    name: '--',
                    orgNum: 0,
                    cardNum: 0
                }
            };
        },
        components: {

        },
        created () {
            this.init();
        },
        mounted () {

        },
        methods: {
            init () {
                // this.userInfo.getData(1);
                this.getInfoData();
            },
            getInfoData () {
                const that = this;
                // 获取企业列表
                const getCustList = () => {
                    this.$axios.get('/casuser/cust', {
                        data: {}
                    }).then((response) => {
                        if (response.code === 0) {
                            const data = response.data;
                            if (data) {
                                that.userInfo.orgNum = data.length;
                                data.map((v, i) => {
                                    that.userInfo.cardNum = v.saspCardNoList.length;
                                    that.tableData.push({
                                        orgName: v.saspCompanyName,
                                        cards: v.saspCardNoList,
                                        cardNum: v.saspCardNoList.length
                                    });
                                });
                            }
                        }
                    }).catch((response) => {
                        console.error(response);
                    });
                };
                const setUserInfo = (dt) => {
                    that.userInfo.code = dt.casUserName || '--';
                    that.userInfo.name = dt.casFullName || '--';
                };
                // 获取用户信息
                that.$axios.get('/auth/findUserInfo', {
                    data: {}
                }).then((response) => {
                    if (response) {
                        const data = response;
                        if (data) {
                            setUserInfo(data);
                            // 保存用户信息到localStorage
                            if (localStorage) {
                                localStorage.setItem('user_info', JSON.stringify(data));
                            }
                        }
                    }
                    getCustList();
                }).catch((response) => {
                    console.error(response);
                });
                // 获取组织列表数据
                that.$axios.get('', {
                    data: {}
                }).then((response) => {
                    if (response.code === 200) {
                        that.dataTable = response.data;
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            search () {
                const arr = [];
                const regExp = new RegExp(this.cardKey, 'g');
                this.cardSetsDefault.map(v => {
                    if (regExp.test(v.card)) {
                        arr.push(v);
                    }
                });
                this.cardSets = arr;
            },
            showCardList (dt) {
                this.dialogVisible = true;
                this.cardSets = [];
                if (dt && dt.cards) {
                    this.curOrgName = dt.orgName;
                    dt.cards.map(v => {
                        this.cardSets.push({
                            card: v
                        });
                    });
                    this.cardSetsDefault = utils.deepClone(this.cardSets);
                }
            },
            close () {
                this.dialogVisible = false;
            }
        }
    };

</script>

<style lang="scss" type="text/scss">
    .user-info {
        .content-title.fixed {
            position: fixed;
            top: 60px;
            right: 30px;
            left: 30px;
            z-index: 50;

            ~ div {
                margin-top: 110px;
                ~ div {
                    margin-top: 0;
                }
            }
        }
        .cnt-wrapper {
            padding: 20px 20px 40px;
            background-color: #fff;
        }

        .form-user-info {
            width: 700px;
            .el-input input {
                border: none;
            }
        }
        .lv-desc {
            font: {
                size: 12px;
            }
        }
        .user-info-modify {
            .sf-dist-picker {
                .el-input {
                    margin-top: 15px;
                }
            }
        }
        .el-table__header-wrapper th {
            background-color: #E5E5E5;
            color: #565656;
            font-weight: normal;
        }
        .content-title ~ div {
            margin: 0 30px 0;
        }
    }
</style>
