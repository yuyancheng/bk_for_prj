<template lang="pug">
    div
        .tab-content(style="padding-top:30px;")
            el-form(ref="ReSearchForm",:model="ReSearchForm",label-width="120px")
                el-form-item(label="发运时间")
                    el-date-picker(v-model="ReSearchForm.time",type="daterange",start-placeholder="开始日期",end-placeholder="结束日期")
                el-form-item(label="发运单位组织类别")
                    dept-select(
                    :showOrgTypes="true",
                    :showDeptOptions="true",
                    :config="{width:'80%'}",
                    :orgTypesList="orgTypeList",
                    @getResult="ReItemChanged",
                    )
                el-form-item(label="接收单位组织类别")
                    dept-select(
                    :orgs="orgs",
                    :custNo="showAll",
                    :orgTypeId="orgTypeId",
                    :showOrgTypes="true",
                    :ids="ids",
                    :initData="initData",
                    :showDeptOptions="orgMaterialMark ==2 && deptPurview ==1 ? 'disable' : true",
                    :config="{width:'80%'}",
                    :orgTypesList="orgTypeList",
                    @getResult="ReItemChangedRe",
                    )
                .inline
                    el-form-item(label="专业")
                        el-select(v-model="ReSearchForm.firstCategoryId", placeholder="选择专业", size="medium",@change="changeList1('ReMaterialList','ReSearchForm')")
                            el-option(label="全部专业", :value="-1")
                            el-option(v-for="(it, idx) in ReMaterialList.list1", :key="idx", :label="it.name", :value="it.id")
                    el-form-item(label="类别")
                        el-select(v-model="ReSearchForm.secondCategoryId", placeholder="选择类别", size="medium", style="margin-left:10px;",@change="changeList2('ReMaterialList','ReSearchForm')")
                            el-option(label="全部类别", :value="-1")
                            el-option(v-for="(it, idx) in ReMaterialList.list2", :key="idx", :label="it.name", :value="it.id")
                    el-form-item(label="品名")
                        el-select(v-model="ReSearchForm.goodsId", placeholder="选择类别", size="medium", style="margin-left:10px;")
                            el-option(label="全部类别", :value="-1")
                            el-option(v-for="(it, idx) in ReMaterialList.list3", :key="idx", :label="it.goodsName", :value="it.id")
                el-form-item
                    el-button.bpd(@click.prevent="ReSearch('', 1)", round, size="small", type="primary") 查询
            .title 概况
            .overView 截止{{info.date}} {{info.deptName}}单位共发货{{info.sendCount}}单，体积{{info.sendCubage}}立方米，重量{{info.sendWeight}}千克；收到物资{{info.receiveCount}}单，体积{{info.receiveCubage}}立方米，重量{{info.receiveWeight}}千克。
            .chart-block(style="height:420px;border:1px solid rgb(221, 221, 221);border-radius: 6px;")
                .seTitle(style="padding-left: 20px;line-height: 46px;border-bottom: 1px solid rgb(221, 221, 221);") 方向（单位）
                el-row(:gutter="12")
                    el-col(:span="12", style="border-right:1px solid #ededed;min-height:335px;")
                        .no-content(v-show="seEcharts.yData.length==0")
                        bdp-charts(:echartsData="seEcharts",:type="['pie']")
                        .title 发货情况
                    el-col(:span="12")
                        .no-content(v-show="reEcharts.yData.length==0")
                        bdp-charts(:echartsData="reEcharts",:type="['pie']")
                        .title 收货情况
            .chart-block(style="height: 380px;border: 1px solid rgb(221, 221, 221);border-radius: 6px;")
                .seTitle(style="padding-left: 20px;line-height: 46px;border-bottom: 1px solid rgb(221, 221, 221);") 物资统计
                .no-content(v-show="goodsEcharts.yData.length==0")
                div(style="padding: 0 30px;")
                    div(style="display:inline-block;width:45%;")
                        h4(style="line-height:40px;text-align:center;font-weight:normal;color:#666;") 发货情况
                        el-table(
                            :data="tableData[0]",
                            border,
                            height="247",
                            tooltip-effect="dark"
                            style="width: 100%",
                            size="medium")
                            el-table-column(prop="name", label="专业/类别/品名")
                            el-table-column(prop="amount", label="数量", width="120")
                            el-table-column(prop="rate", label="占比", width="90")
                    div(style="float:right;width:45%;margin-left:50px;")
                        h4(style="line-height:40px;text-align:center;font-weight:normal;color:#666;") 收货情况
                        el-table(
                            :data="tableData[1]",
                            border,
                            height="247",
                            tooltip-effect="dark"
                            style="width: 100%",
                            size="medium")
                            el-table-column(prop="name", label="专业/类别/品名")
                            el-table-column(prop="amount", label="数量", width="120")
                            el-table-column(prop="rate", label="占比", width="90")
            // .chart-block(style="height: 380px;border: 1px solid rgb(221, 221, 221);border-radius: 6px;")
                .seTitle(style="padding-left: 20px;line-height: 46px;border-bottom: 1px solid rgb(221, 221, 221);") 专业（类别）
                .no-content(v-show="goodsEcharts.yData.length==0")
                bdp-charts(:echartsData="goodsEcharts",:type="['bar']")
            .chart-block(style="height: 380px;border: 1px solid rgb(221, 221, 221);border-radius: 6px;")
                .seTitle(style="padding-left: 20px;line-height: 46px;border-bottom: 1px solid rgb(221, 221, 221);") 时间
                .no-content(v-show="timeEcharts.yData.length==0")
                bdp-charts(:echartsData="timeEcharts",:type="['line']")
            .seTitle 物资明细
            .te-table
                el-tabs(v-model="tableActive", @tab-click="handleClick",type="border-card")
                    el-tab-pane(label="发送物资详情",name="deGoodDetail")
                        el-form(ref="searchForm",:model="searchForm",label-width="120px")
                            el-form-item(label="发运时间")
                                el-date-picker(v-model="searchForm.time",type="daterange",start-placeholder="开始日期",end-placeholder="结束日期", size="medium")
                            el-form-item(label="发运单位组织类别")
                                dept-select(
                                :custNo="showAll",
                                :showOrgTypes="true",
                                :initData="initData",
                                :showDeptOptions="orgMaterialMark ==2 && deptPurview ==1 ? 'disable' : true",
                                :config="{width:'80%'}",
                                :orgTypesList="orgTypeList",
                                @getResult="itemChanged",
                                )
                            el-form-item(label="接收单位组织类别")
                                dept-select(
                                :showOrgTypes="true",
                                :showDeptOptions="true",
                                :config="{width:'80%'}",
                                :orgTypesList="orgTypeList",
                                @getResult="itemChangedRe",
                                )
                            .inline
                                el-form-item(label="专业")
                                    el-select(v-model="searchForm.firstCategoryId", placeholder="选择专业", size="medium",@change="changeList1('materialList','searchForm')")
                                        el-option(label="全部专业", :value="-1")
                                        el-option(v-for="(it, idx) in materialList.list1", :key="idx", :label="it.name", :value="it.id")
                                el-form-item(label="类别")
                                    el-select(v-model="searchForm.secondCategoryId", placeholder="选择类别", size="medium", style="margin-left:10px;",@change="changeList2('materialList','searchForm')")
                                        el-option(label="全部类别", :value="-1")
                                        el-option(v-for="(it, idx) in materialList.list2", :key="idx", :label="it.name", :value="it.id")
                                el-form-item(label="品名")
                                    el-select(v-model="searchForm.goodsId", placeholder="选择类别", size="medium", style="margin-left:10px;")
                                        el-option(label="全部品名", :value="-1")
                                        el-option(v-for="(it, idx) in materialList.list3", :key="idx", :label="it.goodsName", :value="it.id")
                            el-form-item
                                el-button.bpd(@click.prevent="search", round, size="small", type="primary") 查询
                            .down-btn(@click="search('down')")
                                i.el-icon-download
                                | 导出
                        sf-table(:tData="tData",:tColumns="tColumns",:tableSearch="tableSearch",@search="search")
                        div(style="position:relative;height:0;top:-22px;")
                            p(style="position:absolute;font-size:12px;color:#999;") 注：列表默认展示1000条数据，若需要全部数据，请点击右上的“导出”
                    el-tab-pane(label="接收物资详情",name="reGoodDetail")
                    .down-btn(@click="ReSearch('down')")
                        i.el-icon-download
                        | 导出
                    sf-table(:tData="RetData",:tColumns="ReTColumns",:tableSearch="ReTableSearch",@search="ReSearch")
                    div(style="position:relative;height:0;top:-22px;")
                        p(style="position:absolute;font-size:12px;color:#999;") 注：列表默认展示1000条数据，若需要全部数据，请点击右上的“导出”
</template>
<script>
    // import qs from 'qs';
    import { mapGetters } from 'vuex';
    import moment from 'moment';
    import qs from 'qs';
    import util from '../../lib/util';
    import deptSelect from '@/components/DepartmentSelector';

    export default {
        components: {
            'dept-select': deptSelect,
        },
        computed: {
            ...mapGetters('custNo', {
                custNo: 'custNo',
            }),
        },
        data() {
            return {
                // custNo: '全部',
                ids: [],
                initData: {},
                srcData: {},
                srcIds: [],
                custOrgId: '',
                orgMaterialMark: '',
                deptPurview: '',
                roleCode: '',
                showAll: '123',
                orgTypeId: '',
                orgs: [],
                info: {
                    date: '',
                    deptName: '',
                    receiveCount: 0,
                    receiveCubage: 0,
                    receiveWeight: 0,
                    sendCount: 0,
                    sendCubage: 0,
                    sendWeight: 0,
                },
                ReSearchForm: {
                    time: [moment().subtract('day', 7).format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
                    sendOrgTypeId: -1,
                    sendOrgId: -1,
                    sendDeptId: -1,
                    receiveOrgId: -1,
                    receiveOrgTypeId: -1,
                    receiveDeptId: -1,
                    firstCategoryId: -1,
                    secondCategoryId: -1,
                    goodsId: -1,
                },
                RetData: [
                    {
                        id: 1,
                        goodsCode: 'A-0001',
                        goodsName: '春装上衣',
                        firstCategoryName: 'aaa',
                        secondCategoryName: 'bbb',
                        name1: '11',
                        name2: '222',
                        name3: '333',
                        name4: 444,
                    },
                ],
                ReMaterialList: {
                    list1: [],
                    list2: [],
                    list3: [],
                },
                ReTableSearch: util.tableSearch(),
                tableSearch: util.tableSearch(),
                searchForm: {
                    time: [moment().subtract('day', 7).format('YYYY-MM-DD HH:mm:ss'), moment().format('YYYY-MM-DD HH:mm:ss')],
                    sendOrgTypeId: -1,
                    sendOrgId: -1,
                    sendDeptId: -1,
                    receiveOrgId: -1,
                    receiveOrgTypeId: -1,
                    receiveDeptId: -1,
                    firstCategoryId: -1,
                    secondCategoryId: -1,
                    goodsId: -1,
                },
                materialList: {
                    list1: [],
                    list2: [],
                    list3: [],
                },
                goodsList: {},
                tData: [],
                tColumns: [
                    { prop: 'idx', label: '序号', style: 'width:60px' },
                    { prop: 'goodsCode', label: '物资编码' },
                    { prop: 'goodsName', label: '物资名称' },
                    { prop: 'firstCategoryName', label: '专业' },
                    { prop: 'secondCategoryName', label: '类别' },
                    { prop: 'goodsUnit', label: '单位' },
                    { prop: 'sendCount', label: '已发运' },
                    { prop: 'receiveCount', label: '已签收' },
                    { prop: 'unReceiveCount', label: '未签收' },
                    { prop: 'receiveRate', label: '签收率' },
                ],
                ReTColumns: [
                    { prop: 'idx', label: '序号', style: 'width:60px' },
                    { prop: 'goodsCode', label: '物资编码' },
                    { prop: 'goodsName', label: '物资名称' },
                    { prop: 'firstCategoryName', label: '专业' },
                    { prop: 'secondCategoryName', label: '类别' },
                    { prop: 'goodsUnit', label: '单位' },
                    // { prop: 'sendCount', label: '已发运' },
                    { prop: 'receiveCount', label: '已接收' },
                    // { prop: 'unReceiveCount', label: '未签收' },
                    // { prop: 'receiveRate', label: '签收率' },
                ],
                options: [],
                orgTypeList: [],
                echartsData: {
                    legend: ['东部', '中部', '南部', '西部'],
                    xData: ['2017-09-27', '2017-09-28', '2017-09-29', '2017-09-30'],
                    yData: [
                        [12759, 12859, 12959, 13059],
                        [22759, 22859, 22959, 23059],
                        [32759, 32859, 32959, 33059],
                        [32759, 32859, 32959, 33059],
                    ],
                },
                tableActive: 'deGoodDetail',
                tabActive: 'sum',
                goodsEcharts: {
                    legend: ['发货', '收货'],
                    xData: [],
                    yData: [
                        [],
                        [],
                    ],
                },
                timeEcharts: {
                    legend: ['收件量', '发件量'],
                    xData: [],
                    yData: [
                        [],
                        [],
                    ],
                },
                reEcharts: {
                    legend: [],
                    xData: [],
                    yData: [],
                },
                seEcharts: {
                    legend: [],
                    xData: [],
                    yData: [],
                },
                orgsAll: [],
                tableData: [[
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                    {
                        name: 123,
                        amount: 321,
                        rate: '23%',
                    },
                ], []],
            };
        },

        async mounted() {
            const $vm = this;
            await this.getMyInfo();
            await this.$axios.get('/organizationType/getAllValidOrgTypes').then(res => {
                $vm.orgTypeList = res.data.rows;
            });
            const id = this.custOrgId;
            const result = await this.$axios.get('/department/getDeptWithHierarchicalOrgById', { params: { id } });
            if (result.data) {
                const org = result.data.organization ? result.data.organization : {};
                const orgs = util.getOrganization(org, []);
                orgs.reverse();
                // 带数据
                const ids = orgs.map(v => v.id);
                const length = ids.length;
                const srcData = await this.getOrgs(ids[length - 1]);
                this.srcData = srcData;
            }
            // if (this.orgMaterialMark === 1 || this.roleCode === 'MANAGER') {
            //   this.showAll = '全部';
            // }
            if (this.orgMaterialMark === 2) {
                const initData = Object.assign({}, this.srcData);
                initData.deptId = this.custOrgId;
                if (this.deptPurview === 1) { // 普通用户
                    initData.zlength = this.srcData.orgIds.length + 1;
                } else {
                    initData.zlength = this.srcData.orgIds.length;
                }
                this.initData = initData;
            }
            await this.$axios.post('/baseDict/getGoodsData').then(res => {
                const obj = {};
                const arr = [];
                res.data.forEach(v => {
                    arr.push({ name: v.name, id: v.id });
                    const obj2 = {
                        list: v.childrens,
                    };
                    v.childrens.forEach(vv => {
                        obj2[vv.id] = vv.goods;
                    });
                    obj[v.id] = obj2;
                });
                $vm.goodsList = obj;
                $vm.materialList.list1 = arr;
                $vm.ReMaterialList.list1 = arr;
                $vm.materialList.list2 = [];
                $vm.materialList.list3 = [];
            });
            await this.getData();
            await this.search();
            await this.ReSearch();
        },
        watch: {
            custNo() {
                this.getData();
            },
        },
        methods: {
            async getMyInfo() {
                const res = await this.$axios.get('/user/ops/myinfo');
                this.custOrgId = res.data.deptId;
                this.roleCode = res.data.roleCode;
                // this.orgMaterialMark = res.data.orgMaterialMark;
                // this.deptPurview = res.data.deptPurview;
                this.orgMaterialMark = 2;
                this.deptPurview = res.data.deptPurview;
            },
            getData() {
                // 概况
                const $vm = this;
                const custNo = this.custNo;
                this.$axios.get('/statistics/overview', { params: { custNo } }).then(res => {
                    $vm.info = res.data;
                });
                // 时间
                this.$axios.get('/statistics/time', { params: { custNo } }).then(res => {
                    if (Array.isArray(res.data)) {
                        const timeEcharts = {
                            legend: ['收件量', '发件量'],
                            xData: [],
                            yData: [
                                [],
                                [],
                            ],
                        };
                        // res.data.push({
                        //   month: '2018-03-02',
                        //   receiveAmount: 300,
                        //   sendAmount: 1200,
                        // });
                        res.data.forEach(v => {
                            timeEcharts.xData.push(`${v.month}`);
                            timeEcharts.yData[0].push(v.receiveAmount);
                            timeEcharts.yData[1].push(v.sendAmount);
                        });
                        timeEcharts.dataZoom = {
                            show: timeEcharts.xData.length > 12,
                            showDetail: false,
                            startValue: timeEcharts.xData.length - 12,
                            endValue: timeEcharts.xData.length - 1,
                            backgroundColor: 'rgba(0,0,0,0)',
                            fillerColor: 'rgba(47,172,237,.2)',
                            zoomLock: true,
                            height: 20,
                        };
                        $vm.timeEcharts = timeEcharts;
                    }
                });
                // 专业
                this.$axios.get('/statistics/goods', { params: { custNo } }).then(res => {
                    if (Array.isArray(res.data)) {
                        const goodsEcharts = {
                            legend: ['收货', '发货'],
                            xData: [],
                            yData: [
                                [],
                                [],
                            ],
                        };
                        res.data.forEach(v => {
                            goodsEcharts.xData.push(v.categoryName);
                            goodsEcharts.yData[0].push(v.receiveAmount);
                            goodsEcharts.yData[1].push(v.sendAmount);
                        });
                        $vm.goodsEcharts = goodsEcharts;
                    }
                });
                // 单位
                this.$axios.get('/statistics/depts', { params: { custNo } }).then(res => {
                    const { receive, send } = res.data;
                    if (Array.isArray(receive)) {
                        const reEcharts = {
                            legend: [],
                            xData: [],
                            yData: [],
                        };
                        receive.forEach(v => {
                            reEcharts.legend.push(v.deptName);
                            reEcharts.yData.push([v.deptAmount]);
                        });
                        this.reEcharts = reEcharts;
                    }
                    if (Array.isArray(send)) {
                        const seEcharts = {
                            legend: [],
                            xData: [],
                            yData: [],
                        };
                        send.forEach(v => {
                            seEcharts.legend.push(v.deptName);
                            seEcharts.yData.push([v.deptAmount]);
                        });
                        this.seEcharts = seEcharts;
                    }
                });
            },
            ReSearch(down, pageIndex) {
                const formData = {
                    ...this.ReSearchForm,
                    custNo: this.custNo,
                    pageSize: this.ReTableSearch.pageSize,
                    pageNum: pageIndex || this.tableSearch.currentPage,
                };
                if (formData.time) {
                    formData.sendStartDate = moment(formData.time[0]).format('YYYY-MM-DD');
                    formData.sendEndDate = moment(formData.time[1]).format('YYYY-MM-DD');
                }
                delete formData.time;
                let url = '/statistics/detailByReceive';
                if (down === 'down') {
                    url = '/statistics/exportByReceive';
                    delete formData.pageSize;
                    delete formData.pageNum;
                    window.location.href = `${url}?${qs.stringify(formData)}`;
                    // this.$axios.post(url, formData).then(res => {
                    //   console.log(res);// 导出
                    // });
                } else {
                    this.$axios.get(url, { params: formData }).then(res => {
                        const { rows, total } = res.data;
                        this.ReTableSearch.total = total;
                        rows.forEach((v, idx) => {
                            const dt = v;
                            dt.idx = (formData.pageNum - 1) * this.tableSearch.pageSize + idx + 1;
                            dt.receiveRate = `${dt.receiveRate}%`;
                        });
                        this.RetData = rows;
                    });
                }
            },
            search(down, pageIndex) {
                const formData = {
                    ...this.searchForm,
                    custNo: this.custNo,
                    pageSize: this.tableSearch.pageSize,
                    pageNum: pageIndex || this.tableSearch.currentPage,
                };
                if (pageIndex) {
                    this.tableSearch.currentPage = pageIndex;
                }
                if (formData.time) {
                    formData.sendStartDate = moment(formData.time[0]).format('YYYY-MM-DD');
                    formData.sendEndDate = moment(formData.time[1]).format('YYYY-MM-DD');
                }
                delete formData.time;
                let url = '/statistics/detailBySend';
                if (down === 'down') {
                    url = '/statistics/exportBySend';
                    delete formData.pageSize;
                    delete formData.pageNum;
                    window.location.href = `${url}?${qs.stringify(formData)}`;
                    // this.$axios.post(url, formData).then(res => {
                    //   console.log(res);// 导出
                    // });
                } else {
                    this.$axios.get(url, { params: formData }).then(res => {
                        const { rows, total } = res.data;
                        this.tableSearch.total = total;
                        rows.forEach((v, idx) => {
                            const dt = v;
                            dt.idx = (formData.pageNum - 1) * this.tableSearch.pageSize + idx + 1;
                            dt.receiveRate = `${dt.receiveRate}%`;
                        });
                        this.tData = rows;
                    });
                }
            },
            async getOrgs(id, tId) {
                const res = await this.$axios.get('/organization/getAscendingOrgById', { params: { id } });
                // if (!res.data.parentOrganization) return null;
                const orgTypeId = res.data.orgTypeId;
                let orgIds = [];
                if (res.data.parentOrganization) {
                    orgIds = util.getOrganization(res.data.parentOrganization, []);
                }
                orgIds = orgIds.reverse().map(v => v.id);
                orgIds.push(id);
                const ids = [].concat(orgIds);
                let orgList = [];
                if (!tId) {
                    orgList = await this.getOrgList(ids, orgTypeId);
                } else {
                    ids.unshift(tId);
                    orgList = await this.getOrgList(ids);
                }
                orgIds.push(-1);
                return {
                    orgIds,
                    orgTypeId,
                    orgList,
                };
            },
            async getOrgList(orgs, orgTypeId) {
                /* eslint-disable */
                const orgList = [];
                if (orgTypeId) {
                    const dt = await this.$axios.get('/organization/getTopOrgsByOrgTypeId', {params: {orgTypeId: orgTypeId}});
                    orgList.push(dt.data);
                    // console.log(dt);
                }
                for (let i = 0; i < orgs.length; i += 1) {
                    const res = await this.$axios.get('/organization/getSubOrgsByOrgId', {params: {orgId: orgs[i]}});
                    orgList.push(res.data);
                }
                return orgList;
            },
            itemChanged(dt) {
                if (!dt) return;
                const {deptId, result} = dt;
                let data = -1;
                if (result.indexOf(-1) != -1) {
                    for (let i = 0; i < result.length; i += 1) {
                        if (result[i] == -1) {
                            if (i > 1) data = result[i - 1];
                            break;
                        }
                    }
                } else {
                    data = result[result.length - 1];
                }
                this.searchForm.sendOrgTypeId = result[0];
                this.searchForm.sendDeptId = deptId;
                this.searchForm.sendOrgId = data;
            },
            itemChangedRe(dt) {
                if (!dt) return;
                const {deptId, result} = dt;
                let data = -1;
                if (result.indexOf(-1) != -1) {
                    for (let i = 0; i < result.length; i += 1) {
                        if (result[i] == -1) {
                            if (i > 1) data = result[i - 1];
                            break;
                        }
                    }
                } else {
                    data = result[result.length - 1];
                }
                this.searchForm.receiveOrgTypeId = result[0];
                this.searchForm.receiveDeptId = deptId;
                this.searchForm.receiveOrgId = data;
            },
            ReItemChanged(dt) {
                if (!dt) return;
                const {deptId, result} = dt;
                let data = -1;
                if (result.indexOf(-1) != -1) {
                    for (let i = 0; i < result.length; i += 1) {
                        if (result[i] == -1) {
                            if (i > 1) data = result[i - 1];
                            break;
                        }
                    }
                } else {
                    data = result[result.length - 1];
                }
                this.ReSearchForm.sendOrgTypeId = result[0];
                this.ReSearchForm.sendDeptId = deptId;
                this.ReSearchForm.sendOrgId = data;
            },
            ReItemChangedRe(dt) {
                if (!dt) return;
                const {deptId, result} = dt;
                let data = -1;
                if (result.indexOf(-1) != -1) {
                    for (let i = 0; i < result.length; i += 1) {
                        if (result[i] == -1) {
                            if (i > 1) data = result[i - 1];
                            break;
                        }
                    }
                } else {
                    data = result[result.length - 1];
                }
                this.ReSearchForm.receiveOrgTypeId = result[0];
                this.ReSearchForm.receiveDeptId = deptId;
                this.ReSearchForm.receiveOrgId = data;
            },
            handleClick() {
                // console.log('hello');
            },
            changeList1(name, formName) {
                const $vm = this;
                const {goodsList} = $vm;
                const key = $vm[formName].firstCategoryId;
                if (goodsList[key]) {
                    $vm[name].list2 = goodsList[key].list;
                } else {
                    $vm[name].list2 = [];
                }
                $vm[formName].secondCategoryId = -1;
                $vm[formName].goodsId = -1;
                $vm[name].list3 = [];
            },
            changeList2(name, formName) {
                const $vm = this;
                const {goodsList} = $vm;
                const key = $vm[formName].firstCategoryId;
                const good = $vm[formName].secondCategoryId;
                if (goodsList[key] && goodsList[key][good]) {
                    $vm[name].list3 = goodsList[key][good];
                } else {
                    $vm[name].list3 = [];
                }
                $vm[formName].goodsId = -1;
            },
        },
    };
</script>
<style lang="scss">
    .tab-content {
        padding: 10px 27px;
    }

    .title {
        font-size: 16px;
        color: #333333;
        letter-spacing: 0.06px;
        margin-bottom: 20px;
    }

    .chart-block {
        position: relative;
        padding-bottom: 38px;
        border-bottom: 1px solid #D8D8D8;
        margin-bottom: 0;
        .el-col {
            position: relative;
        }
        .title {
            text-align: center;
            margin-top: 18px;
        }
        .no-content {
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
        }
        .el-table__body tr:nth-of-type(even) td {
            background-color: #FFF;
        }
        .el-table__header-wrapper th {
            font-weight: normal;
        }
        .el-table td {
            padding: 9px 0;
        }
    }

    .overView {
        background: rgba(241, 176, 87, 0.10);
        border: 1px solid #F2B158;
        color: #F2B158;
        border-radius: 6px;
        margin-bottom: 28px;
        padding: 7px 17px;
    }

    .seTitle {
        font-size: 14px;
        color: #333333;
        letter-spacing: 0.05px;
        margin-bottom: 18px;
    }

    .down-btn {
        text-align: right;
        color: $pr;
        padding-right: 30px;
        margin-top: -20px;
        margin-bottom: 10px;
        cursor: pointer;
        i {
            display: inline-block;
            margin-right: 3px;
        }
    }

    .bpd {
        padding: 4px 20px !important;
    }

    .bdp-tabs {
        > .el-tabs__header {
            .el-tabs__nav-scroll {
                padding-left: 18px;
                .el-tabs__item {
                    font-size: 16px;
                    padding-top: 4px;
                    padding-bottom: 4px;
                    height: auto;
                    &.is-active {
                        color: $pr;
                    }
                }
            }
        }
    }

    .te-table {
        margin-bottom: 18px;
        .inline {
            display: flex;
        }
    }

</style>

