<template lang="pug">
    div
        .cnt-wrapper
            div(style="height: 40px;padding:0;")
                h4(class="title-name" style="font-weight:normal; color:#333;font-size:17px;") 筛选条件
            div
                el-form(:model="searchFilter", ref="searchFilter", label-width="100px", size="small", :rules="rulesInfo", status-icon)
                    el-form-item(prop="payType", label="付款方式：", style="display: inline-block;")
                        el-select(v-model="searchFilter.payType", placeholder="选择付款方式", style="width:160px;margin-right:102px;")
                            el-option(label="全部", value="")
                            el-option(label="寄付", value="1")
                            el-option(label="到付", value="2")
                            el-option(label="第三方付", value="3")
                    el-form-item(prop="sendTime", label="寄件时间：", style="display: inline-block;")
                        el-date-picker(
                        style="width: 260px;zoom:.9;height:35px"
                        v-model="searchFilter.sendTime",
                        type="daterange",
                        align="right",
                        range-separator="至",
                        :picker-options="pickerOptions",
                        value-format="yyyyMMdd",
                        start-placeholder="开始日期",
                        end-placeholder="结束日期")
                    el-form-item(prop="addresser.deptId", label="发送单位：")
                        dept-picker(
                        :showOrgTypes ="true",
                        :showDeptOptions="true",
                        :loaded="handlerLoad1",
                        :change="itemChanged1",
                        :config="{width:'100%',itemWidth:'14%'}",
                        ref="deptPickerA")
                    el-form-item(prop="addressee.deptId", label="接收单位：")
                        dept-picker(
                        :showOrgTypes ="true",
                        :showDeptOptions="true",
                        :loaded="handlerLoad2",
                        :change="itemChanged2",
                        :config="{width:'100%',itemWidth:'14%'}",
                        ref="deptPickerB")
                    el-form-item(label="")
                        el-button(@click="query", type="primary", round, style="width: 80px;") 查 询
            hr(class="division-line")

            .waybill-status
                div( v-for="item in statusData")
                    h3 {{item.ttl}}
                    div {{item.dt}}

            div(style="padding-top:30px;")
                div(style="height: 40px;padding:0;")
                    h4(class="title-name" style="font-weight:normal; color:#333;font-size:17px;") 发运明细
                ul(class="nav-tabs")
                    li(v-for="(item, index) in tabs", :class="{'active': item.active}")
                        a(href="javascript:void(0)", v-on:click="tabTurn(index)") {{item.name}}
                div(style="border-top: 1px solid #ddd;")
                    div(style="padding: 10px 20px 10px 10px;border-right:1px solid #ddd;border-left:1px solid #ddd;")
                        div(style="margin-left:30%;")
                            div(style="width:140px;float:right;")
                                el-button(type="primary", size="mini", v-on:click="search()", round, style="padding: 6px 16px;margin:0 10px;") 查询
                                el-button(type="text", style="padding: 3px 0; color: #3B8EDE;font-size:13px", class="el-icon-download", v-on:click="exportInBatch()")  导出
                                    span(v-if="canDownload" class="loading size-xs")
                            multiple-query(ref="vQuery", :vqData="queryDt")
                div(class="order-table")
                    el-table(
                    :data="tables.data[tabIndex]",
                    tooltip-effect="dark"
                    style="width: 100%;",
                    size="medium")
                        el-table-column(prop="idx", label="序号", width="50")
                        el-table-column(prop="waybillNo", label="单号", width="120")
                            template(slot-scope="scope")
                                a(@click="showDespatchRouter(scope.row.waybillNo)", style="cursor:pointer;color:#3BA1DE;") {{scope.row.waybillNo}}
                        el-table-column(prop="consignedTimeStr", label="发运时间", width="150")
                        el-table-column(prop="waybillStatus", label="当前状态", width="90", v-if="tabIndex === 0")
                        el-table-column(prop="batchId", label="发运批次号", width="120")
                        el-table-column(prop="exceptionDesc", label="异常原因", width="200", v-if="tabIndex === 4", show-overflow-tooltip=true)
                        el-table-column(prop="sendAddr", label="发运单位", show-overflow-tooltip=true)
                        el-table-column(prop="rcvAddr", label="接收单位", show-overflow-tooltip=true)
                        el-table-column(prop="packageType", label="包裹类型", width="80")
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
                    @size-change="handleSizeChange",
                    @current-change="handleCurrentChange",
                    :current-page="tables.result.pageNum",
                    :page-sizes=[10, 20, 30, 40, 50, 100],
                    :page-size=10,
                    background,
                    layout="total, sizes, prev, pager, next, jumper",
                    :total="tables.result.total")
            // iframe(v-bind:src="downloadURL", style="display:none; width:0; height:0;")
            router-view
</template>

<script type="text/ecmascript-6">
    import MultipleQuery from '@/views/monitoring/MultipleQuery';
    import APIList from '@/assets/datas/APIList.json';
    import util from '@/lib/util';

    const statusData = [{
        ttl: '已发运（单）',
        dt: '--',
    }, {
        ttl: '已签收（单）',
        dt: '--',
    }, {
        ttl: '在途（单）',
        dt: '--',
    }, {
        ttl: '派送中（单）',
        dt: '--',
    }, {
        ttl: '异常（单）',
        dt: '--',
    }, {
        ttl: '签收率',
        dt: '--',
    }];

    const date = new Date();
    let startDate = new Date(date.getTime() - 3600 * 1000 * 24 * 14).toLocaleDateString();
    let endDate = date.toLocaleDateString();
    startDate = startDate.replace(/\/(?!1[0-9]|2[0-9]|3[0-9])/g, '0').replace(/\/(?=1[0-9]|2[0-9]|3[0-9])/g, '');
    endDate = endDate.replace(/\/(?!1[0-9]|2[0-9]|3[0-9])/g, '0').replace(/\/(?=1[0-9]|2[0-9]|3[0-9])/g, '');

    export default {
        data() {
            const that = this;
            const checkVal = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请选择寄件时间！'));
                } else {
                    callback();
                }
            };
            return {
                printWindowVisible: false,
                currentPage: 1,
                multipleSelection: [],
                isLoading: false,
                downloadURL: '',
                dialogVisible: false,
                tabIndex: 0,
                searchFilter: {
                    payType: '',
                    sendTime: [startDate, endDate],
                    addresser: {
                        deptId: '',
                        levelId: '',
                    },
                    addressee: {
                        typeId: '',
                        levelId: '',
                        deptId: '',
                    },
                },
                rulesInfo: {
                    sendTime: [
                        { validator: checkVal, required: false, trigger: 'blur' },
                    ],
                },
                tables: {
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        total: 0,
                        rows: [],
                    },
                    params: {
                        waybillStatusCode: 1,
                        custNo: that.curCustNo || '',
                        paymentType: '',
                        rcvDeptId: '',
                        rcvOrgId: '',
                        sendDeptId: '',
                        sendOrgId: '',
                        timeFrom: '',
                        timeTo: '',
                    },
                    data: [],
                    getData(idx, size) {
                        const userInfo = that.getUserInfo();
                        const payType = that.searchFilter.payType ? that.searchFilter.payType * 1 : '';
                        that.tables.params.waybillStatusCode = that.tabIndex + 1;
                        that.tables.params.custNo = that.curCustNo;
                        that.tables.params.paymentType = payType;
                        that.tables.params.sendOrgTypeId = that.searchFilter.addresser.typeId || (userInfo && userInfo.orgTypeId) || '';
                        that.tables.params.rcvOrgTypeId = that.searchFilter.addressee.typeId;
                        that.tables.params.sendOrgId = that.searchFilter.addresser.levelId;
                        that.tables.params.sendDeptId = that.searchFilter.addresser.deptId || (userInfo && userInfo.deptId) || '';
                        that.tables.params.rcvOrgId = that.searchFilter.addressee.levelId;
                        that.tables.params.rcvDeptId = that.searchFilter.addressee.deptId;
                        that.tables.params.timeFrom = that.searchFilter.sendTime[0] || '';
                        that.tables.params.timeTo = that.searchFilter.sendTime[1] || '';
                        if (idx) {
                            that.tables.params.pageNum = idx;
                        }
                        if (size) {
                            that.tables.params.pageSize = size;
                        }

                        that.$axios.post(APIList.GET_DESPATCH_INFO_LIST, that.tables.params).then((response) => {
                            if (response.code === 200) {
                                if (response.data) {
                                    const dt = response.data.rows;
                                    if (dt) {
                                        for (let i = 0; i < dt.length; i += 1) {
                                            dt[i].idx = (idx - 1) * that.tables.result.pageSize + i + 1;
                                        }
                                        that.tables.data[that.tabIndex] = dt || [];
                                    }
                                    that.tables.result = response.data;
                                }
                            }
                        }).catch((response) => {
                            console.log(response);
                        });
                    },
                },
                ifrStyle: {
                    border: 'none',
                    width: '100%',
                },
                statusData,
                tabs: [{
                    name: '已发运',
                    active: true,
                    code: 'nowaydetails',
                }, {
                    name: '已签收',
                    active: false,
                    code: 'switch',
                }, {
                    name: '在途',
                    active: false,
                    code: 'back',
                }, {
                    name: '派送中',
                    active: false,
                    code: 'online',
                }, {
                    name: '异常',
                    active: false,
                    code: 'delivering',
                }],
                queryKey: [],
                canDownload: false,
                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        },
                    }, {
                        text: '最近半个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 14);
                            picker.$emit('pick', [start, end]);
                        },
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        },
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        },
                    }],
                },
                curWaybillNo: '',
                curPatchId: '',
                showRouter: false,
                showDetails: false,
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
                that.query();
            };
        },
        mounted() {
            const userInfo = this.getUserInfo();
            this.searchFilter.addresser.deptId = (userInfo && userInfo.deptId) || '';
            this.searchFilter.addresser.levelId = (userInfo && userInfo.orgId) || '';
        },
        methods: {
            handleSizeChange(val) {
                this.tables.getData(1, val);
            },
            handleCurrentChange(val) {
                this.tables.getData(val);
            },
            exportInBatch() {
                if (this.$refs.searchFilter) {
                    this.$refs.searchFilter.validate((valid) => {
                        if (valid) {
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
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '请选择寄件时间！',
                            });
                        }
                    });
                }
            },
            getFile() {
                const that = this;
                const payType = this.searchFilter.payType ? this.searchFilter.payType * 1 : '';
                const params = {
                    waybillStatusCode: this.tabIndex + 1,
                    bisNums: this.queryKey,
                    custNo: this.curCustNo || '',
                    paymentType: payType,
                    sendOrgTypeId: this.searchFilter.addresser.typeId || this.getUserInfo().orgTypeId,
                    rcvOrgTypeId: this.searchFilter.addressee.typeId || this.getUserInfo().orgTypeId,
                    rcvDeptId: this.searchFilter.addressee.deptId,
                    rcvOrgId: this.searchFilter.addressee.levelId,
                    sendDeptId: this.searchFilter.addresser.deptId || this.getUserInfo().deptId,
                    sendOrgId: this.searchFilter.addresser.levelId,
                    timeFrom: this.searchFilter.sendTime[0] || '',
                    timeTo: this.searchFilter.sendTime[1] || '',
                    pageNum: this.tables.params.pageNum,
                    pageSize: this.tables.params.pageSize,
                };
                // 导出到文件
                that.$axios.post(APIList.DESPATCH_INFO_EXPORT, params, {
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
                    const blob = new window.Blob([dt]);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = window.URL.createObjectURL(blob);
                    // downloadLink.target = '_blank';
                    downloadLink.setAttribute('download', '发运明细.xls');
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            },
            tabTurn(idx) {
                if (idx !== this.tabIndex) {
                    this.tabIndex = idx;
                    this.tables.getData(1, this.tables.result.pageSize);
                }
                for (let i = 0, len = this.tabs.length; i < len; i += 1) {
                    if (this.tabs[i].active && i === idx) {
                        return;
                    }
                    this.tabs[i].active = false;
                }
                this.tabs[idx].active = true;
            },
            // 获取总体指标数据
            getDataOfTotal() {
                const that = this;
                const userInfo = this.getUserInfo();
                const payType = this.searchFilter.payType ? this.searchFilter.payType * 1 : '';
                const params = {
                    custNo: that.curCustNo || '',
                    paymentType: payType,
                    sendOrgTypeId: this.searchFilter.addresser.typeId || (userInfo && userInfo.orgTypeId) || '',
                    rcvOrgTypeId: this.searchFilter.addressee.typeId,
                    rcvDeptId: this.searchFilter.addressee.deptId,
                    rcvOrgId: this.searchFilter.addressee.levelId,
                    sendDeptId: this.searchFilter.addresser.deptId || (userInfo && userInfo.deptId) || '',
                    sendOrgId: this.searchFilter.addresser.levelId,
                    timeFrom: this.searchFilter.sendTime[0] || '',
                    timeTo: this.searchFilter.sendTime[1] || '',
                };
                that.$axios.post(APIList.DESPATCH_INFO_QUERY, params).then((response) => {
                // that.$axios.post('http://10.118.40.55:8080/monitor/statistic', params).then((response) => {
                    if (response.code === 200) {
                        if (response.data) {
                            that.statusData[0].dt = response.data.shipped;
                            that.statusData[1].dt = response.data.signed;
                            that.statusData[2].dt = response.data.intransit;
                            that.statusData[3].dt = response.data.deliverying;
                            that.statusData[4].dt = response.data.exception;
                            that.statusData[5].dt = `${response.data.signRatio}%`;
                        }
                        // console.log(response);
                    } else if (response.data) {
                        that.$message({
                            type: 'error',
                            message: response.data.msg,
                        });
                    } else {
                        that.$message({
                            type: 'error',
                            message: response.msg,
                        });
                    }
                }).catch((response) => {
                    console.log(response);
                });
            },
            query() {
                // console.log(this.searchFilter);
                this.$refs.searchFilter.validate((valid) => {
                    if (valid) {
                        this.getDataOfTotal();
                        this.tables.getData(1, this.tables.result.pageSize);
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '请选择寄件时间！',
                        });
                    }
                });
            },
            search() {
                this.$refs.searchFilter.validate((valid) => {
                    if (valid) {
                        if (this.getQueryKey) {
                            this.getQueryKey();
                        }
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '请选择寄件时间！',
                        });
                    }
                });
            },
            doSearch() {
                if (this.queryKey.length) {
                    const keys = util.unique(this.queryKey);
                    this.tables.params.bisNums = keys;
                } else {
                    this.tables.params.bisNums = null;
                }

                this.tables.getData(1, this.tables.result.pageSize);
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
            handlerLoad1(that) {
                const userInfo = this.getUserInfo();
                this.deptPickerA = that;  // 组织选择器对象引用
                if (this.deptPickerA) {
                    this.deptPickerA.clearData();
                    if (userInfo) {
                        this.deptPickerA.setOrgTypeId(userInfo.orgTypeId);
                        this.deptPickerA.setInitParams({
                            dept: {
                                name: userInfo.deptName,
                                id: userInfo.deptId,
                            },
                            initOrg: true,
                            prevDisabled: userInfo.deptPurview === 2 && userInfo.roleCode !== 'MANAGER',
                            allDisabled: userInfo.deptPurview !== 2 && userInfo.roleCode !== 'MANAGER',
                            selectDisabled: true,
                        });
                    }
                }
            },
            handlerLoad2(that) {
                this.deptPickerB = that;  // 组织选择器对象引用
                if (this.deptPickerB) {
                    this.deptPickerB.clearData();
                    // this.deptPickerB.setOrgTypeId(this.getUserInfo().orgTypeId);
                }
            },
            itemChanged1(dt) {
                this.searchFilter.addresser.typeId = dt.type.id;
                this.searchFilter.addresser.levelId = dt.level.id;
                this.searchFilter.addresser.deptId = dt.dept.id;
            },
            itemChanged2(dt) {
                this.searchFilter.addressee.typeId = dt.type.id;
                this.searchFilter.addressee.levelId = dt.level.id;
                this.searchFilter.addressee.deptId = dt.dept.id;
            },
            showDespatchRouter(id) {
                this.showRouter = true;
                this.curWaybillNo = id;
                this.$router.push({
                    name: 'default-express-route',
                    hash: `#${this.curWaybillNo}`,
                });
            },
            showDespatchDetails(id) {
                this.showDetails = true;
                this.curPatchId = id;
                this.$router.push({
                    name: 'default-despatch-details',
                    hash: `#${this.curPatchId}`,
                });
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
    .waybill-status {
        > div {
            &:nth-child(1):before {
                background: transparent url(../../assets/image/icon2/p1.png) center center no-repeat;
            }
            &:nth-child(2):before {
                background: transparent url(../../assets/image/icon2/p2.png) center center no-repeat;
            }
            &:nth-child(3):before {
                background: transparent url(../../assets/image/icon2/p3.png) center center no-repeat;
            }
            &:nth-child(4):before {
                background: transparent url(../../assets/image/icon2/p4.png) center center no-repeat;
            }
            &:nth-child(5):before {
                background: transparent url(../../assets/image/icon2/p5.png) center center no-repeat;
            }
            &:nth-child(6):before {
                background: transparent url(../../assets/image/icon2/p6.png) center center no-repeat;
            }
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
    .order-table {
        padding-bottom:6px;
        border-right:1px solid #ddd;
        border-left:1px solid #ddd;
        border-bottom:1px solid #ddd;
        border-radius: 4px;
    }
</style>
