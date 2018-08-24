<template lang="pug">
    div
        // .special-name(v-if="roleCode === 'MANAGER'")
            span(style="float:left;margin-right: 10px;margin-top:7px;") 专业
            el-select(v-model="specialName", placeholder="选择专业", size="small", @change="change")
                el-option(label="全部", value="全部")
                el-option(v-for="(it, idx) in materialList.list1", :key="idx", :label="it.name", :value="it.id")
        .tab-content(style="padding-top:30px;")
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
                        el-select(
                        v-model="searchForm.firstCategoryId",
                        placeholder="选择专业", size="medium",
                        :disabled="firstCategoryDisabled",
                        @change="changeList1('materialList','searchForm')")
                            el-option(label="全部专业", :value="-1")
                            el-option(v-for="(it, idx) in materialList.list1", :key="idx", :label="it.name", :value="it.id")
                    el-form-item(label="类别")
                        el-select(
                        v-model="searchForm.secondCategoryId",
                        placeholder="选择类别", size="medium",
                        :disabled="secondCategoryDisabled",
                        style="margin-left:10px;",
                        @change="changeList2('materialList','searchForm')")
                            el-option(label="全部类别", :value="-1")
                            el-option(v-for="(it, idx) in materialList.list2", :key="idx", :label="it.name", :value="it.id")
                    el-form-item(label="品名")
                        el-select(v-model="searchForm.goodsId", placeholder="选择品名", size="medium", style="margin-left:10px;")
                            el-option(label="全部品名", :value="-1")
                            el-option(v-for="(it, idx) in materialList.list3", :key="idx", :label="it.goodsName", :value="it.id")
                el-form-item
                    el-button.bpd(@click.prevent="search('', 1)", round, size="small", type="primary") 查询
            .title 概况
            .overView 2018年4月19日至2018年5月3日，共发货XXX单，重量XXX千克，物资数量共计XXX件。
            .chart-block
                el-row(:gutter="12", style="display:flex;margin:0;")
                    el-col(:span="12", style="padding:0;height:420px;margin-right:10px;overflow:hidden;border:1px solid #ddd;border-radius:6px;")
                        .seTitle(style="padding-left:20px;line-height:46px;border-bottom:1px solid #ddd;") 方向（单位）
                        bdp-charts(:echartsData="reEcharts",:type="['pie']", v-if="!hasNoContent1")
                        .no-content(v-if="hasNoContent1")
                        .title 发货情况
                    el-col(:span="12", style="padding:0;height:420px;margin-left:10px;overflow:hidden;border:1px solid #ddd;border-radius:6px;")
                        .seTitle(style="padding-left:20px;line-height:46px;border-bottom:1px solid #ddd;") {{ttl1}}
                        bdp-charts(:echartsData="seEcharts",:type="['pie']", v-if="!hasNoContent2")
                        .no-content(v-if="hasNoContent2")
            .chart-block(style="padding:0;height:380px;overflow:hidden;border:1px solid #ddd;border-radius:6px;")
                .seTitle(style="padding-left:20px;line-height:46px;border-bottom:1px solid #ddd;") {{ttl2}}
                bdp-charts(:echartsData="goodsEcharts",:type="['bar']", v-if="!hasNoContent3")
                .no-content(v-if="hasNoContent3")

            .chart-block(style="padding:0;height:380px;overflow:hidden;border:1px solid #ddd;border-radius:6px;")
                .seTitle(style="padding-left:20px;line-height:46px;border-bottom:1px solid #ddd;") 时间
                bdp-charts(:echartsData="timeEcharts",:type="['line']", v-if="!hasNoContent4")
                .no-content(v-if="hasNoContent4")
            .seTitle 物资明细
            .te-table
                .down-btn(@click="search('down')")
                    i.el-icon-download
                    | 导出
                sf-table(:tData="tData",:tColumns="tColumns",:tableSearch="tableSearch",@search="search")
                div(style="position:relative;height:0;top:-22px;")
                    p(style="position:absolute;font-size:12px;color:#999;") 注：列表默认展示1000条数据，若需要全部数据，请点击右上的“导出”

                el-tabs(v-model="tableActive", @tab-click="handleClick",type="border-card", v-if="false")
                    el-tab-pane(label="发送物资详情",name="deGoodDetail")
                    el-tab-pane(label="接收物资详情",name="reGoodDetail")
                        el-form(ref="ReSearchForm",:model="ReSearchForm",label-width="120px")
                            el-form-item(label="发运时间")
                                el-date-picker(v-model="ReSearchForm.time",type="daterange",start-placeholder="开始日期",end-placeholder="结束日期", size="medium")
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
                                    el-select(
                                    v-model="ReSearchForm.firstCategoryId",
                                    placeholder="选择专业", size="medium",
                                    :disabled="firstCategoryDisabled",
                                    @change="changeList1('ReMaterialList','ReSearchForm')")
                                        el-option(label="全部专业", :value="-1")
                                        el-option(v-for="(it, idx) in ReMaterialList.list1", :key="idx", :label="it.name", :value="it.id")
                                el-form-item(label="类别")
                                    el-select(
                                    v-model="ReSearchForm.secondCategoryId",
                                    placeholder="选择类别", size="medium",
                                    :disabled="secondCategoryDisabled",
                                    style="margin-left:10px;",
                                    @change="changeList2('ReMaterialList','ReSearchForm')")
                                        el-option(label="全部类别", :value="-1")
                                        el-option(v-for="(it, idx) in ReMaterialList.list2", :key="idx", :label="it.name", :value="it.id")
                                el-form-item(label="品名")
                                    el-select(
                                    v-model="ReSearchForm.goodsId",
                                    placeholder="选择品名", size="medium",
                                    style="margin-left:10px;")
                                        el-option(label="全部品名", :value="-1")
                                        el-option(v-for="(it, idx) in materialList.list3", :key="idx", :label="it.goodsName", :value="it.id")
                            el-form-item
                                el-button.bpd(@click.prevent="ReSearch('', 1)", round, size="small", type="primary") 查询
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
                firstCategoryDisabled: false,
                secondCategoryDisabled: false,
                hasNoContent1: false,
                hasNoContent2: false,
                hasNoContent3: false,
                hasNoContent4: false,
                ttl1: '发运专业占比',
                ttl2: '专业（类别）',
                specialName: '全部',
                formName: 'searchForm',
                listName: 'materialList',
                custOrgId: '',
                orgMaterialMark: '',
                deptPurview: '',
                roleCode: '',
                showAll: '123',
                orgTypeId: '',
                orgs: [],
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
                    { prop: 'idx', label: '序号' },
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
                    { prop: 'idx', label: '序号' },
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
                    legend: ['发货'],
                    xData: [],
                    yData: [
                        [],
                        [],
                    ],
                },
                timeEcharts: {
                    legend: ['发货量'],
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
            };
        },

        async mounted() {
            const $vm = this;
            await this.getMyInfo();
            await this.$axios.get('/organizationType/getAllValidOrgTypes').then(res => {
                $vm.orgTypeList = res.data.rows;
            });
            const id = this.custOrgId;
            if (id) {
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
                $vm.materialList.list2 = [];
                $vm.materialList.list3 = [];


                $vm.ReMaterialList.list1 = arr;
                $vm.ReMaterialList.list2 = [];
                $vm.ReMaterialList.list3 = [];
                $vm.initGoodsData();
            });
            await this.getData();
            await this.search();
            // await this.ReSearch();
        },
        watch: {
            custNo() {
                this.getData();
            },
        },
        methods: {
            initGoodsData() {
                if (this.roleCode === 'MANAGER') {
                    this[this.formName].firstCategoryId = this.specialName === '全部' ? -1 : (this.specialName || -1);
                } else if (this.deptPurview === 2 && this.orgMaterialMark === 1) {
                    if (this.orgPathList) {
                        if (this.orgPathList.length === 1) {
                            this.changeList1(this.listName, this.formName);
                            this[this.formName].firstCategoryId = this.specialtyId || -1;
                        } else {
                            this[this.formName].firstCategoryId = this.specialtyId || -1;
                            this.changeList1(this.listName, this.formName);
                            this[this.formName].secondCategoryId = this.categoryId || -1;
                            this.changeList2(this.listName, this.formName);
                        }
                    }
                }
            },
            setDataParam() {
                if (this.roleCode === 'MANAGER') {
                    this[this.formName].firstCategoryId = this.specialName === '全部' ? -1 : (this.specialName || -1);
                } else if (this.deptPurview === 2 && this.orgMaterialMark === 1) {
                    if (this.orgPathList) {
                        if (this.orgPathList.length === 1) {
                            this[this.formName].firstCategoryId = this.specialtyId || -1;
                        } else {
                            this[this.formName].firstCategoryId = this.specialtyId || -1;
                            this[this.formName].secondCategoryId = this.categoryId || -1;
                        }
                    } else {
                        this[this.formName].firstCategoryId = -1;
                        this[this.formName].secondCategoryId = -1;
                    }
                }
            },
            async getMyInfo() {
                const res = await this.$axios.get('/user/ops/myinfo');
                this.custOrgId = res.data.deptId;
                this.roleCode = res.data.roleCode;
                this.orgMaterialMark = res.data.orgMaterialMark;
                this.deptPurview = res.data.deptPurview;
                this.orgPathList = res.data.orgPathList;
                if (this.roleCode === 'MANAGER') {
                    this.ttl1 = '发运专业占比';
                    this.ttl2 = '专业TOP10';
                    this.firstCategoryDisabled = false;
                    this.secondCategoryDisabled = false;
                } else if (this.deptPurview === 2 && this.orgMaterialMark === 1) {
                    const re = await this.$axios.post('/baseDict/getCategoryInfo');
                    if (re.data) {
                        const categoryInfo = re.data;
                        this.specialtyId = categoryInfo.specialtyId !== '-1' ? categoryInfo.specialtyId * 1 : '';
                        // this.categoryId = categoryInfo.categoryId !== '-1' ? categoryInfo.categoryId : '';
                        this.categoryIds = categoryInfo.categoryId;
                    }
                    if (this.orgPathList) {
                        if (this.orgPathList.length === 1) {
                            this.ttl1 = '发运类别占比';
                            this.ttl2 = '类别TOP10';
                            this.firstCategoryDisabled = true;
                        } else {
                            this.ttl1 = '发运物资占比';
                            this.ttl2 = '发运物资TOP10';
                            this.firstCategoryDisabled = true;
                        }
                    }
                    this.setDataParam();
                }
            },
            getData() {
                // 概况
                const $vm = this;
                const specialName = this.specialName;
                // 时间
                this.$axios.get('/portraitStatistics/time', { params: { specialName } }).then(res => {
                    if (Array.isArray(res.data) && res.data.length) {
                        $vm.hasNoContent4 = false;
                        const timeEcharts = {
                            legend: ['发货量'],
                            xData: [],
                            yData: [
                                [],
                            ],
                        };
                        res.data.forEach(v => {
                            timeEcharts.xData.push(`${v.month}`);
                            timeEcharts.yData[0].push(v.goodsNum);
                        });
                        timeEcharts.dataZoom = {
                            show: timeEcharts.xData.length > 12,
                            showDetail: false,
                            startValue: timeEcharts.xData.length - 12,
                            endValue: timeEcharts.xData.length - 1,
                            backgroundColor: 'rgba(0,0,0,0)',
                            fillerColor: 'rgba(47,172,237,.2)',
                            zoomLock: true,
                            height: 13,
                            bottom: 17,
                        };
                        $vm.timeEcharts = timeEcharts;
                    } else {
                        $vm.hasNoContent4 = true;
                    }
                });
                // 专业
                this.$axios.get('/portraitStatistics/goods', { params: { specialName } }).then(res => {
                    if (Array.isArray(res.data) && res.data.length) {
                        $vm.hasNoContent3 = false;
                        const goodsEcharts = {
                            legend: ['', ''],
                            xData: [],
                            yData: [
                                [],
                            ],
                        };
                        res.data.forEach(v => {
                            goodsEcharts.xData.push(v.top10Name);
                            goodsEcharts.yData[0].push(v.goodsNum);
                            // goodsEcharts.yData[1].push(v.sendAmount);
                        });
                        $vm.goodsEcharts = goodsEcharts;
                    } else {
                        $vm.hasNoContent3 = true;
                    }
                });
                // 单位
                // this.$axios.get('/portraitStatistics/depts', { params: { custNo } }).then(res => {
                this.$axios.get('/portraitStatistics/depts', { params: { specialName } }).then(res => {
                    const { dept, rate } = res.data;
                    if (Array.isArray(dept) && dept.length) {
                        $vm.hasNoContent1 = false;
                        const reEcharts = {
                            legend: [],
                            xData: [],
                            yData: [],
                            series: [],
                        };
                        dept.forEach(v => {
                            reEcharts.legend.push(v.deptName);
                            reEcharts.yData.push([v.deptRate]);
                        });
                        this.reEcharts = reEcharts;
                    } else {
                        $vm.hasNoContent1 = true;
                    }
                    if (Array.isArray(rate) && rate.length) {
                        $vm.hasNoContent2 = false;
                        const seEcharts = {
                            legend: [],
                            xData: [],
                            yData: [],
                        };
                        rate.forEach(v => {
                            seEcharts.legend.push(v.deptName);
                            seEcharts.yData.push([v.deptRate]);
                        });
                        this.seEcharts = seEcharts;
                    } else {
                        $vm.hasNoContent2 = true;
                    }
                });
            },
            ReSearch(down, pageIndex) {
                const formData = {
                    ...this.ReSearchForm,
                    custNo: this.custNo,
                    pageSize: this.ReTableSearch.pageSize,
                    pageNum: pageIndex || this.ReTableSearch.currentPage,
                };
                if (formData.time) {
                    formData.sendStartDate = moment(formData.time[0]).format('YYYY-MM-DD');
                    formData.sendEndDate = moment(formData.time[1]).format('YYYY-MM-DD');
                }
                delete formData.time;
                let url = '/portraitStatistics/detailByReceive';
                if (down === 'down') {
                    url = '/portraitStatistics/exportByReceive';
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
                        if (rows) {
                            rows.forEach((v, idx) => {
                                const dt = v;
                                dt.idx = (formData.pageNum - 1) * this.ReTableSearch.pageSize + idx + 1;
                                dt.receiveRate = `${dt.receiveRate}%`;
                            });
                            this.RetData = rows;
                        }
                    });
                }
            },
            search(down, pageIndex) {
                let formData = {};
                if (this.tableActive === 'deGoodDetail') {
                    formData = {
                        ...this.searchForm,
                    };
                } else {
                    formData = {
                        ...this.ReSearchForm,
                    };
                }
                formData.custNo = this.custNo;
                formData.pageSize = this.tableSearch.pageSize;
                formData.pageNum = pageIndex || this.tableSearch.currentPage;
                if (pageIndex) {
                    this.tableSearch.currentPage = pageIndex;
                }
                if (formData.time) {
                    formData.sendStartDate = moment(formData.time[0]).format('YYYY-MM-DD');
                    formData.sendEndDate = moment(formData.time[1]).format('YYYY-MM-DD');
                }
                delete formData.time;
                let url = '/portraitStatistics/detailBySend';
                if (down === 'down') {
                    url = '/portraitStatistics/exportBySend';
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
                if (id) {
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
                }
                return {
                    orgIds: [],
                    orgTypeId: '',
                    orgList: [],
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
                this.ReSearchForm.sendOrgId = deptId;
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
                this.ReSearchForm.receiveOrgId = deptId;
            },
            handleClick() {
                this[this.formName].firstCategoryId = this.specialName === '全部' ? -1 : (this.specialName || -1);
                if (this.tableActive === 'deGoodDetail') {
                    this.formName = 'searchForm';
                    this.listName = 'materialList';
                    this.initGoodsData();
                    this.setDataParam();
                    this.search();
                } else {
                    this.formName = 'ReSearchForm';
                    this.listName = 'ReMaterialList';
                    this.initGoodsData();
                    this.setDataParam();
                    this.ReSearch();
                }
                this.changeList1(this.listName, this.formName);
            },
            change(name) {
                if (this.specialName === '全部') {
                    this.ttl1 = '发运专业占比';
                    this.ttl2 = '专业TOP10';
                } else {
                    this.ttl1 = '发运类别占比';
                    this.ttl2 = '类别TOP10';
                }
                this[this.formName].firstCategoryId = this.specialName === '全部' ? -1 : (this.specialName || -1);
                this.changeList1(this.listName, this.formName);
                this.getData();
                if (this.tableActive === 'deGoodDetail') {
                    this.search();
                } else {
                    this.ReSearch();
                }
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


                let ids = this.categoryIds;
                if (ids && typeof ids === 'string') {
                    ids = ids.split(',');
                    if (ids.length === 0) {
                        this.categoryId = '';
                        this[name].list2 = [];
                        this.secondCategoryDisabled = false;
                    } else if (ids.length === 1) {
                        this.categoryId = ids[0] * 1;
                        this[formName].secondCategoryId = this.categoryId || -1;
                        if (this[formName].secondCategoryId !== -1) {
                            this.secondCategoryDisabled = true;
                        }
                    } else {
                        const list = this[name].list2;
                        this.categoryId = '';
                        this.secondCategoryDisabled = false;
                        let len = list.length;
                        for (let n = len - 1; n >= 0; n -= 1) {
                            let bl = true;
                            for (let i = 0; i < ids.length; i += 1) {
                                if (ids[i] * 1 === list[n].id * 1) {
                                    bl = false;
                                    break;
                                }
                            }
                            if (bl) {
                                list.splice(n, 1);
                            }
                        }
                    }
                }
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
        font-size: 14px;
        color: #333333;
        letter-spacing: 0.06px;
        margin-bottom: 20px;
    }

    .chart-block {
        padding-bottom: 0;
        border-bottom: none;
        margin-bottom: 30px;
        .title {
            text-align: center;
            margin-top: 18px;
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
        height: 20px;
        float: right;
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

    .chart-block {

    }

    .bpd {
        width: 90px;
        padding: 9px 20px !important;
        font-size: 14px;
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
    .tab-content {
        .inline {
            display: flex;
        }
    }
    .no-content {
        width: 209px;
        margin: 0 auto;
        padding-top: 190px;
        opacity: .5;
        text-align: center;
        background: {
            image: url(../../assets/image/icon2/noContent.png);
            position: center center;
            repeat: no-repeat;
            size: 60%;
        };

        &:after {
            content: '暂无数据！';
            font-size: 14px;
        }
    }
    .special-name {
        position: absolute; top: 10px; right: 30px;
        .el-input__inner {
            padding-left: 10px;
            border: 1.5px solid #999;
            font-size: 14px;
        }
    }
</style>


