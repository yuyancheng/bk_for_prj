<template lang="pug">
    .my-column
        .content-title.fixed
            h4.title-name(style="display: inline-block") 我的看板
                i(v-on:mouseenter="hover()", v-on:mouseleave="leave()", class="question-mark", style="margin-left: 20px;",
                b-model='{"title": "", "body": "<table class=\'b-table\'><thead><tr><td>指标</td><td>详解</td></tr></thead><tbody><tr><td>未完成快件跟踪</td><td>近14天发的件，还未被签收的件总和；</td></tr><tr><td>转寄第三方</td><td>近14天发的件中，发生过转寄第三方且还未被签收的件总和；</td></tr><tr><td>转寄/退回</td><td>近14天发的件中，发生的转寄/退回且还未被签收的件总和；</td></tr><tr><td>在途</td><td>近14天发的件中，没有发生“转寄/退回”和“转寄第三方”且未被签收的件总和；</td></tr><tr><td>派送中</td><td>近14天发的件中，当前正在派送的件总和。</td></tr></tbody></table>"}') ?
                time(class="update-time") 数据更新于{{updateTime}}
            span(style="float:right;margin:5px 30px 0 0;")
                el-button(type="text", @click="setParams")
                    i(class="el-icon-setting")   设置
        .main
            .columns(v-for="dt in columnData")
                .column-head(style="line-height:42px;padding-left:30px;")
                    el-button(@click="loginWidthCompany(dt.companyAccount)", type="text", style="font-weight:bold;color: #09f;") {{dt.companyName}}
                    // span
                        a 下载月报
                        a 下载服务报告
                .items
                    .items-left
                        .item-icon
                        .item-text
                            .item-text-desc {{columnName[0]}}
                            .item-text-num {{dt.items[0].value}}
                    .items-body
                        .item-row
                            .item-text(v-for="(item, idx) in dt.items", :key="idx", v-if="idx < 4 && idx < dt.items.length - 1")
                                .item-text-desc {{columnName[idx + 1]}}
                                .item-text-num {{dt.items[idx + 1].value}}
                        .item-row(v-if="dt.items.length > 4", style="border-top:1px solid #eee;")
                            .item-text(v-for="(item, idx) in dt.items", :key="idx", v-if="idx >= 4 && idx < dt.items.length - 1")
                                .item-text-desc {{columnName[idx + 1]}}
                                .item-text-num {{dt.items[idx + 1].value}}

        el-dialog(
        title="设置",
        :visible.sync="dialogVisible"
        custom-class="",
        width="700px",
        padding="20px 40px",
        @close="close")
            el-tabs(v-model="activeName" type="card", @tab-click="handleClick", style="margin-top:-20px;")
                el-tab-pane(label="设置公司", name="first")
                    el-table(
                    :data="tableData[0]",
                    tooltip-effect="dark"
                    style="width: 100%",
                    size="medium")
                        el-table-column(prop="custCompanyName", label="公司名称")
                        // el-table-column(prop="custCompanyShortName", label="公司简称", width="140")
                        el-table-column(prop="orders", label="排序", width="120")
                            template(slot-scope="scope")
                                el-input-number(v-model="scope.row.orders",
                                controls-position="right", :min="1", size="mini", style="width:90px;")
                        el-table-column(prop="interested", label="看板关注", width="130")
                            template(slot-scope="scope")
                                el-switch(
                                style="display: block",
                                v-model="scope.row.interested",
                                active-color="#13ce66",
                                inactive-color="#ff4949",
                                active-text="是",
                                inactive-text="否")
                // el-tab-pane(label="设置指标" name="second")
                    el-table(
                    // :data="tableData[1]",
                    tooltip-effect="dark"
                    style="width: 100%",
                    size="medium")
                        el-table-column(prop="custCompanyName", label="指标")
                        el-table-column(prop="interested", label="看板关注", width="300")
                            template(slot-scope="scope")
                                el-switch(
                                style="display: block",
                                v-model="scope.row.interested",
                                active-color="#13ce66",
                                inactive-color="#ff4949",
                                active-text="是",
                                inactive-text="否")
            span(slot="footer", class="dialog-footer")
                el-button(
                :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                @click="dialogVisible = false") 取 消
                el-button(
                type="primary",
                :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                :loading="isLoading",
                @click="submitForm") 确 定

        v-bubble(ref="vBubble")
        iframe(v-bind:src="downloadURL", style="display:none; width:0; height:0;")
</template>

<script type="text/ecmascript-6">
    // import Vue from 'vue';
    import VModal from '@/components/common/modal/VModal';
    import VBubble from '@/components/common/modal/Bubble';
    // import utils from '@/assets/js/lib/utils';

    export default {
        data: () => {
            return {
                updateTime: '--',
                dialogVisible: false,
                confirmDisabled: false,
                cancelDisabled: false,
                isLoading: false,
                activeName: 'first',
                downloadURL: '',
                columnItem: {
                    histAvg: '上月均发件量',
                    todaySent: '今日已发送',
                    todayExcept: '今日产生异常件',
                    todayBack: '今日产生退回件',
                    todayReject: '今日产生拒收/拒付件',
                    unfinished: '未完成快件',
                    online: '在途',
                    deliver: '派送中',
                    except: '异常件'
                },
                comKey: [],
                itemKey: ['histAvg', 'todaySent', 'todayExcept', 'todayBack', 'todayReject', 'unfinished', 'online', 'deliver', 'except'],
                dataFull: [],
                columnName: ['上月均发件量', '今日已发送', '今日产生异常件', '今日产生退回件', '今日产生拒收/拒付件', '未完成快件', '在途', '派送中', '异常件'],
                columnData: [],
                tableData: [[], []]
            };
        },
        components: {
            'v-modal': VModal,
            'v-bubble': VBubble
        },
        beforeCreate () {
        },
        created () {
            // 更新导航菜单
            // this.$store.commit('refreshMenu');
            this.initStatusData();
        },
        mounted () {
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$refs.vmMsg;
            this.vbubble = this.$refs.vBubble;

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 1,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });
        },
        methods: {
            numberFormatter (num) {
                return (num + '').replace(/\d(?=(\d{3},?)+$)/g, '$&,');
            },
            initStatusData () {
                const that = this;
                // console.log(1);
                // 获取看板数据
                const getColumnData = () => {
                    this.$axios.get('/casuser/kanban', {
                        data: {}
                    }).then((response) => {
                        console.log(response);
                        if (response.code === 0) {
                            const data = response.data;
                            if (data) {
                                that.columnData = [];
                                data.forEach((v, i) => {
                                    if (v && that.comKey.indexOf(v.userName) === -1) {
                                        that.columnData[i] = {
                                            companyName: v.companyName,
                                            companyAccount: v.userName,
                                            items: []
                                        };
                                        that.itemKey.forEach((k, idx) => {
                                            that.columnData[i].items[idx] = {
                                                value: v[k]
                                            };
                                        });
                                    }
                                });
                            }
                        }
                    }).catch((response) => {
                        console.error(response);
                    });
                };

                // 获取指标看板配置
                // const getQuotaData = () => {
                //     this.$axios.get('/attention/indicator/get', {
                //         data: {}
                //     }).then((response) => {
                //         if (response.code === 0) {
                //             const data = response.data;
                //             if (data) {
                //                 that.itemKey = [];
                //                 for (const k in data) {
                //                     if (typeof data[k] === 'boolean' && !data[k]) {
                //                         that.itemKey.push(k);
                //                     }
                //                 }
                //             }
                //         }
                //         getColumnData();
                //     }).catch((response) => {
                //         console.error(response);
                //     });
                // };

                // 获取企业列表
                const getCustList = () => {
                    this.$axios.get('/casuser/cust', {
                        data: {}
                    }).then((response) => {
                        if (response.code === 0) {
                            const data = response.data;
                            if (data) {
                                that.tableData[0] = [];
                                data.map((v, i) => {
                                    that.tableData[0][i] = {
                                        custCompanyName: v.saspCompanyName,
                                        // custCompanyShortName: v.custCompanyName,
                                        orders: 1
                                    };
                                    if (that.comKey.indexOf(v.userName) !== -1) {
                                        that.tableData[0][i].interested = true;
                                    } else {
                                        that.tableData[0][i].interested = false;
                                    }
                                });
                            }
                        }
                    }).catch((response) => {
                        console.error(response);
                    });
                };

                // 获取企业看板配置
                this.$axios.get('/attention/cascust/get', {
                    data: {}
                }).then((response) => {
                    if (response.code === 0) {
                        let data = response.data;
                        if (data) {
                            data = Object(data);
                            data.map((v) => {
                                if (v.custUserName) {
                                    that.comKey.push(v.custUserName);
                                }
                            });
                        }
                    }
                    // getQuotaData();
                    getColumnData();
                    getCustList();
                }).catch((response) => {
                    console.error(response);
                });
            },
            // 指标气泡提示
            hover (e) {
                let evt = e || window.event;
                let target = evt.target || evt.srcElement;
                let dt = target.getAttribute('b-model') || '{}';
                this.vbubble.setData(dt, evt);
            },
            leave (e) {
                this.vbubble.remove();
            },
            setParams () {
                this.dialogVisible = true;
            },
            // 使用公司帐号登录
            loginWidthCompany (dt) {
                const params = this.$qs.stringify({
                    userName: dt
                });
                this.$axios.get(`/casuser/switch?${params}`, {
                    data: {}
                }).then((response) => {
                    if (response.code === 0) {
                        this.$message({
                            message: '设置成功！',
                            type: 'success'
                        });
                        this.close();
                    } else if (response.msg || response.data.msg) {
                        this.$message({
                            message: response.msg || response.data.msg,
                            type: 'error'
                        });
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            // 设置企业看板配置
            submitForm () {
                let url = '';
                let params = {};
                if (this.activeName === 'first') {
                    url = '/attention/cascust/save';
                    params.custUserName = [];
                    params.orders = [1];
                } else {
                    url = '/attention/indicator/save';
                }
                this.$axios.post(url, params).then((response) => {
                    if (response.code === 0) {
                        this.$message({
                            message: '设置成功！',
                            type: 'success'
                        });
                        this.close();
                    } else if (response.msg || response.data.msg) {
                        this.$message({
                            message: response.msg || response.data.msg,
                            type: 'error'
                        });
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            close () {
                this.dialogVisible = false;
                this.confirmDisabled = false;
                this.cancelDisabled = false;
                this.isLoading = false;
            },
            handleClick (e) {
            },
            getFile (dt) {
            },
            getDownloadStatus (n) {
            }
        }
    };
</script>

<style lang="less" type="text/less">
    .my-column {
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
        .main {
            padding: 20px 20px 40px;
            background-color: #fff;
        }

        .m-btn-w-xs {
            min-width: inherit;
            margin: 0 10px;
            line-height: 1.22857143;
        }
        .loading {
            margin: 0 0 -3px 0;
        }
        .content-title {
            border-bottom: 1px solid #3B8EDE;
            padding: 0;
            height: 50px;
            box-sizing: border-box;
            background-color: #EDF1F5;

            h4 {
                margin: 0;
                display: inline-block;
                line-height: 1em;
                font-size: 18px;
                color: #09f;
                padding: 16px 0 16px 0;
            }
            ~ div {
                margin: 0 30px 0;
            }
        }

        ////////////////////////////////////////////////////////////

        .update-time {
            font-size: 12px;
            color: #999;
            margin-left: 15px;
        }
        .division-line {
            height: 10px;
            margin: 0 -20px;
            background-color: #EDF1F5;
            border: none;
        }
        .waybill-status {
            display: flex;
            justify-content: space-around;
        }
        .waybill-status {
            > div {
                position: relative;
                height: 71px;
                flex-grow: 1;
                flex-basis: 25%;
                padding: 10px 0 10px 85px;

                h3 {
                    line-height: 22px;
                    font-size: 12px;
                    color: #999;
                }

                div {
                    line-height: 28px;
                    font-size: 18px;
                    color: #333;
                }
            }
        }

        .waybill-status, .item-icon {
            display: inline-block;
            width: 71px;
            height: 71px;
            background: transparent url(../../assets/image/logistics/waybill_icons_a.png) 0 0 no-repeat;
        }
        .waybill-status {
            > div {
                &:nth-child(1):before {
                    background-position: 0 0;
                }
                &:nth-child(2):before {
                    background-position: -213px 0;
                }
                &:nth-child(3):before {
                    background-position: -142px 0;
                }
                &:nth-child(4):before {
                    background-position: -355px 0;
                }
                &:nth-child(5):before {
                    background-position: -426px 0;
                }
            }
        }

        .columns {
            border: 1px solid #ddd;
            border-radius: 4px;
            float: none !important;
            margin-bottom: 30px;
        }
        .column-head {
            h3 {
                display:inline-block;
                font-size:13px;
                font-weight:bold;
                color: #09f;
            }
            span {
                float: right;
                a {
                    margin-right: 50px;
                    color: #09f;
                    font-size: 14px;
                    cursor: pointer;
                }
            }
        }
        .items {
            border-top: 1px solid #ddd;
        }
        .items-left {
            float: left;
            padding: 50px 0 50px 30px;
            width: 230px;
            .item-icon {
                float: left;
                width: 71px;
                height: 71px;
                margin-top: 13px;
            }
            .item-text {
                margin-left: 95px;
            }
        }
        .items-body {
            margin-left: 260px;
            .item-row {
                display: flex;
                justify-content: space-around;
                margin-right: 30px;
                padding-left: 30px;
            }
            .item-text {
                flex-basis: 100%;
                flex-grow: 1;
            }
        }
        .item-text-desc {
            line-height: 30px;
            padding-top: 15px;
            font-size: 12px;
            color: #999;
        }
        .item-text-num {
            line-height: 40px;
            font-size: 28px;
            padding-bottom: 15px;
        }
    }
</style>
