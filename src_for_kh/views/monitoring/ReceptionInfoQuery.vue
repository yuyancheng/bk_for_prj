<template lang="pug">
    div
        .cnt-wrapper
            div(style="height: 40px;padding:0;")
                h4(class="title-name" style="font-weight:normal; color:#333;font-size:17px;") 待接收清单
            div(style="border-bottom: 1.5px solid #ededed; padding-bottom: 30px;")
                el-table(
                :data="tables[0].data",
                tooltip-effect="dark"
                style="width: 100%",
                size="medium")
                    el-table-column(prop="idx", label="序号", width="50")
                    el-table-column(prop="batchId", label="发运批次号", width="140")
                    el-table-column(prop="waybillNo", label="运单号", width="140")
                    el-table-column(prop="sendAddr", label="发运单位", width="260", show-overflow-tooltip=true)
                    el-table-column(prop="createTm", label="发运时间", width="160")
                    el-table-column(prop="exceptionDesc", label="备注", show-overflow-tooltip=true)
                    el-table-column(label="操作", width="100")
                        template(slot-scope="scope")
                            el-button(
                            style="font-size:14px;",
                            type="text",
                            @click="handlePreview(scope.$index, scope.row)") 查看
                            el-button(
                            style="font-size:14px;",
                            type="text",
                            @click="handlePrint(scope.$index, scope.row)") 打印
                el-pagination(
                style="margin-top:5px;text-align:right;",
                @size-change="handleSizeChange1",
                @current-change="handleCurrentChange1",
                :current-page="tables[0].result.pageNum",
                :page-sizes=[10, 20, 30, 40, 50, 100],
                :page-size=10,
                background,
                layout="total, sizes, prev, pager, next, jumper",
                :total="tables[0].result.total")

            div(style="padding-top:30px;")
                div(style="height: 40px;padding:0;")
                    h4(class="title-name" style="font-weight:normal; color:#333;font-size:17px;") 已接收清单
                div
                    div(style="padding: 10px 20px 10px 10px;")
                        div(style="margin-left:30%;")
                            div(style="width:140px;float:right;")
                                el-button(type="primary", size="mini", v-on:click="search()", round, style="padding: 6px 16px;margin:0 10px;") 查询
                                el-button(type="text", style="padding: 3px 0; color: #3B8EDE;font-size:13px", class="el-icon-download", v-on:click="exportInBatch()")  导出
                                    span(v-if="canDownload" class="loading size-xs")
                            multiple-query(ref="vQuery", :vqData="queryDt")
                div(class="order-table")
                    el-table(
                    :data="tables[1].data",
                    tooltip-effect="dark"
                    style="width: 100%;",
                    size="medium")
                        el-table-column(prop="idx", label="序号", width="50")
                        el-table-column(prop="waybillNo", label="单号", width="120")
                            template(slot-scope="scope")
                                a(@click="showDespatchRouter(scope.row.waybillNo)", style="cursor:pointer;color:#3BA1DE;") {{scope.row.waybillNo}}
                        el-table-column(prop="consignedTimeStr", label="发运时间", width="160")
                        el-table-column(prop="batchId", label="发运批次号", width="130")
                        el-table-column(prop="sendAddr", label="发运单位", show-overflow-tooltip=true)
                        el-table-column(prop="signInTimStr", label="签收时间", width="160")
                        el-table-column(prop="packageType", label="包裹类型", width="120")
                            template(slot-scope="scope")
                                span {{scope.row.packageType * 1 === 1 ? '单品' : '混合'}}
                        el-table-column(prop="MaterialName", label="物资名称", width="110")
                            template(slot-scope="scope")
                                a(@click="showDespatchDetails(scope.row.batchId)", style="cursor:pointer;color:#3BA1DE;") 查看详情
                        el-table-column(prop="goodsNum", label="物资数量", width="80")

                    div(style="position:relative;height:0;bottom:-15px;")
                        p(style="position:absolute;font-size:12px;color:#999;") 注：列表默认展示1000条数据，若需要全部数据，请点击右上的“导出”

                    el-pagination(
                    style="margin-top:5px;text-align:right;",
                    @size-change="handleSizeChange2",
                    @current-change="handleCurrentChange2",
                    :current-page="tables[1].result.pageNum",
                    :page-sizes=[10, 20, 30, 40, 50, 100],
                    :page-size=10,
                    background,
                    layout="total, sizes, prev, pager, next, jumper",
                    :total="tables[1].result.total")

            el-dialog(
            ref="printWindow",
            title="发运单",
            :visible.sync="printWindowVisible",
            :width="winWidth",
            :custom-class="'dialog-css-print'",
            @close="close")
                div(style="width:100%;position:relative;")
                    div(v-show="hasLoaded", style="width:70%;text-align:center;margin:0 auto 0;position:relative;bottom:15px;")
                        el-button(type="primary", round, size="small", :disabled="resetDisabled", @click="doPrint", style="width:110px")
                            i(class="el-icon-printer")  打印

                    div(v-if="!hasLoaded", :style="loadStyle")
                        i(class="el-icon-loading", style="margin-right: 20px;")
                        span(style="margin-top:-3px;font-size: 14px;") 加载中...

                    iframe(id="printWindow", :style="ifrStyle", src="/#/print-preview")

                    div(v-show="hasLoaded", style="width:100%;text-align:center;position:relative;bottom:-10px;")
                        el-button(type="primary", round, size="small", :disabled="resetDisabled", @click="doPrint", style="width:110px")
                            i(class="el-icon-printer")  打印
            // iframe(id="printWindow", :style="ifrStyle", src="/#/kh/print-preview")
            router-view
</template>

<script type="text/ecmascript-6">
    import MultipleQuery from '@/views/monitoring/MultipleQuery';
    import APIList from '@/assets/datas/APIList.json';
    import util from '@/lib/util';

    export default {
        data() {
            const that = this;
            return {
                printWindowVisible: false,
                currentPage: 1,
                hasLoaded: false,
                resetDisabled: false,
                printIfrm: {},
                winWidth: '400px',
                multipleSelection: [],
                isLoading: false,
                tables: [{
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    data: [],
                    getData(idx, size) {
                        const params = that.tables[1].params;
                        params.pageSize = size || that.tables[0].result.pageSize;
                        params.pageNum = idx || that.tables[0].result.pageNum;
                        params.custNo = that.curCustNo || '';
                        that.$axios.post(APIList.TO_RECEIVE_LIST, params).then((response) => {
                            if (response.data) {
                                const dt = response.data.rows;
                                if (dt) {
                                    for (let i = 0; i < dt.length; i += 1) {
                                        dt[i].idx = (idx - 1) * that.tables[0].result.pageSize + i + 1;
                                    }
                                    that.tables[0].data = dt || [];
                                }
                                that.tables[0].result = response.data;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                }, {
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        total: 0,
                        rows: [],
                    },
                    params: {
                        custNo: that.curCustNo || '',
                    },
                    data: [],
                    getData(idx, size) {
                        const params = that.tables[1].params;
                        params.pageSize = size || that.tables[1].result.pageSize;
                        params.pageNum = idx || that.tables[1].result.pageNum;
                        params.custNo = that.curCustNo || '';
                        that.$axios.post(APIList.RECEIVED_LIST, params).then((response) => {
                            if (response.code === 200) {
                                const dt = response.data.rows;
                                if (dt) {
                                    for (let i = 0; i < dt.length; i += 1) {
                                        dt[i].idx = (idx - 1) * that.tables[1].result.pageSize + i + 1;
                                    }
                                    that.tables[1].data = dt || [];
                                }
                                that.tables[1].result = response.data;
                            }
                        }).catch((response) => {
                            console.log(response);
                        });
                    },
                }],
                queryKey: [],
                canDownload: false,
                curWaybillNo: '',
                curPatchId: '',
                showRouter: false,
                showDetails: false,
                hide: {
                    position: 'relative',
                    zIndex: '-10',
                },
                loadStyle: {
                    lineHeight: '100px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '20px',
                },
                ifrStyle: {
                    visibility: 'hidden',
                    width: '100%',
                    height: '0px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                },
            };
        },
        components: { MultipleQuery },
        created() {
            const that = this;
            this.queryDt = {
                func(dt) {
                    that.queryKey = dt;
                },
                setQueryCallback(fun) {
                    that.getQueryKey = fun;
                },
                clear() {
                    that.queryKey = [];
                    that.doSearch();
                },
                doQuery() {
                    that.doSearch();
                },
                maxSize: 50,
                filterRegExp: null,
                invalidTip: null,
                repeatedTip: null,
                overflowTip: null,
            };

            this.$store.state.onCustNoChange = (custNo) => {
                that.curCustNo = custNo;
                this.init();
            };
        },
        mounted() {
        },
        methods: {
            init() {
                this.tables[0].getData(1);
                this.tables[1].getData(1);
            },
            handleSizeChange1(val) {
                this.tables[0].getData(1, val);
            },
            handleSizeChange2(val) {
                this.tables[1].getData(1, val);
            },
            handleCurrentChange1(val) {
                this.tables[0].getData(val);
            },
            handleCurrentChange2(val) {
                this.tables[1].getData(val);
            },
            exportInBatch() {
                this.$confirm('将要导出所有数据，确定导出吗?', '导出提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    this.getFile();
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消导出',
                    });
                });
            },
            getFile() {
                const that = this;
                const params = {
                    bisNums: that.queryKey,
                    custNo: that.curCustNo || '',
                };
                // 导出到文件
                that.$axios.post(APIList.RECEIVED_EXPORT, params, {
                    responseType: 'blob',
                }).then((response) => {
                    if (response) {
                        that.doExport(response.data);
                    } else if (response.msg) {
                        that.$message({
                            type: 'error',
                            message: response.msg,
                        });
                    }
                }).catch((response) => {
                    console.log(response);
                });
            },
            doExport(dt) {
                if (dt) {
                    const blob = new Blob([dt]);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(blob);
                    // downloadLink.target = '_blank';
                    downloadLink.setAttribute('download', '已接收清单.xls');
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            },
            getUserInfo() {
                if (localStorage) {
                    const userInfo = localStorage.getItem('user_info');
                    if (userInfo) {
                        return JSON.parse(userInfo);
                    }
                }
                return null;
            },
            showDialog(type, ttl) {
                const that = this;
                this.ttl = ttl;
                this.printWindowVisible = true;

                this.visible = type;
                if (type === 'addUser') {
                    this.dTtl = ttl;
                } else {
                    this.dTtl = ttl;
                }
                if (type === 'import') {
                    this.formName = 'fileUploadForm';
                } else if (type === 'addUser') {
                    this.formName = 'addWaybillForm';
                }

                setTimeout(() => {
                    that.dPicker = that.$refs.dPicker;  // 地址选择器对象引用
                }, 200);
            },
            close() {
                this.hasLoaded = false;
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
                this.dialogVisible = false;

                if (this.printIfrm) {
                    this.printIfrm.src = '';
                    this.printIfrm.style.visibility = 'hidden';
                    this.printIfrm.style.height = '0px';
                    this.winWidth = '400px';
                }
            },
            search() {
                if (this.getQueryKey) {
                    this.getQueryKey();
                } else {
                    this.doSearch();
                }
            },
            doSearch() {
                if (this.queryKey.length) {
                    const keys = util.unique(this.queryKey);
                    this.tables[1].params.bisNums = keys;
                } else {
                    this.tables[1].params.bisNums = [];
                }

                this.tables[1].getData(1, this.tables[1].result.pageSize);
            },
            showDespatchRouter(id) {
                this.showRouter = true;
                this.curWaybillNo = id;
                this.$router.push({
                    name: 'reception-express-route',
                    hash: `#${this.curWaybillNo}`,
                });
            },
            showDespatchDetails(id) {
                this.showDetails = true;
                this.curPatchId = id;
                this.$router.push({
                    name: 'reception-despatch-details',
                    hash: `#${this.curPatchId}`,
                });
            },
            getPrintWin(row) {
                const that = this;
                const timer = setInterval(() => {
                    that.printIfrm = document.getElementById('printWindow');

                    if (that.printIfrm) {
                        that.printIfrm.src = `/#/print-preview?id=${row.batchId}`;
                        clearInterval(timer);
                    }
                }, 20);
            },
            // 预览加打印
            handlePreview(idx, row) {
                const that = this;
                if (row) {
                    this.printWindowVisible = true;
                    if (!this.printIfrm) {
                        that.getPrintWin(row);
                    } else {
                        that.printIfrm.src = `/#/print-preview?id=${row.batchId}`;
                    }
                }
                window.initStatus = () => {
                    that.winWidth = '1200px';
                };
                window.setStatusReady = () => {
                    that.hasLoaded = true;
                    that.printIfrm.style.visibility = 'visible';
                };
            },
            // 不预览打印
            handlePrint(idx, row) {
                const that = this;
                if (row) {
                    this.printWindowVisible = true;
                    that.winWidth = '400px';
                    if (!this.printIfrm) {
                        that.getPrintWin(row);
                    } else {
                        that.printIfrm.src = `/#/print-preview?id=${row.batchId}`;
                    }
                    window.initStatus = () => {
                        that.winWidth = '1200px';
                    };
                    window.setStatusReady = () => {
                        that.printWindowVisible = false;
                        that.printIfrm.src = '';
                        that.printIfrm.style.height = '0px';
                        that.doPrint();
                    };
                }
            },
            // 弹出打印预览界面
            doPrint() {
                this.printIfrm.contentWindow.printPreview.print();
            },
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-wrapper {
        padding: 20px 30px 40px;
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
    .form-user-info {
        width: 500px;
    }

    .opr-btns {
        > .el-button {
            display: block;
            margin: 30px auto 0;
            font-size: 16px;
        }
    }

    .lv-desc {
        font: {
            size: 12px;
        }
    }
    .el-form-item--mini.el-form-item {
        margin-bottom: 13px;
    }
    .el-button--mini, .el-button--mini.is-round {
        padding: 7px 15px;
    }

    ////////////////////////////////////////////////
    .nav-tabs {
        padding-left: 0;
        margin-bottom: -1px;
        list-style: none;
        overflow: hidden;

        &:before {
            display: table;
            content: " ";
        }

        &:after {
            clear: both;
        }

        > li {
            position: relative;
            float: left;
            font-size: 15px;

            > a {
                position: relative;
                display: block;
                padding: 10px 25px;
                margin-right: 2px;
                line-height: 1.42857143;
                border: 1px solid transparent;
                border-radius: 4px 4px 0 0;
                color: #666;
                text-decoration: none;

                &:hover {
                    background-color: #f7f7f7;
                    border: 1px solid #ddd;
                    border-bottom-color: transparent;
                    color: #3BA1DE;
                    opacity: .9;
                }
            }

            &.active > a, &.active > a :focus, &.active > a:hover {
                cursor: default;
                background-color: #fff;
                border: 1px solid #ddd;
                border-bottom-color: transparent;
                color: #3BA1DE;
                opacity: 1;
            }
        }
    }
    .division-line {
        height: 10px;
        margin: 0 -30px;
        background-color: #EDF1F5;
        border: none;
    }
    .waybill-status {
        display: flex;
        justify-content: space-around;
    }
    .waybill-status {
        padding: 30px 0 10px;
        border-bottom: 1.5px solid #ededed;
        > div {
            position: relative;
            height: 71px;
            flex-grow: 1;
            flex-basis: 25%;
            padding: 10px 0 10px 85px;

            h3 {
                line-height: 22px;
                font-size: 13px;
                color: #999;
                font-weight: normal;
            }

            div {
                line-height: 28px;
                font-size: 20px;
                color: #333;
            }
        }
    }

    .waybill-status {
        > div:before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            display: inline-block;
            width: 71px;
            height: 71px;
        }
    }
    .multiple-query {
        display: block;
        float: none;
        margin-right: 150px;

        &>div {
            width: auto;
        }
    }
</style>
