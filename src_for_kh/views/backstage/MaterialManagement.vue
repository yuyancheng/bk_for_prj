<template lang="pug">
    div
        .cnt-header
            h3 物资管理
        .cnt-wrapper(v-if="isAdmin")
            div
                .opr-btns
                    el-button(@click.prevent="addVisableClick", round, size="mini", type="primary") 新增物资
                    el-button(@click.prevent="showDialog('import')", round, size="mini", type="primary") 批量导入
                    el-button(@click.prevent="deleteInBatch", round, size="mini", type="primary") 批量删除
                    el-button(@click.prevent="exportInBatch", round, size="mini", type="primary") 导 出
                    // a(href="/kh_proxy/baseGoods/export", target="_blank") 导 出
                div(style="float:right;")
                    el-form(ref="materialSearchForm", label-width="50px", size="small", style="width:600px;")
                        el-form-item(label="筛选")
                            el-select(v-model="materialSearchForm.firstCategoryId", placeholder="选择专业", style="width:25%;",@change="changeList('materialList','materialSearchForm')")
                                el-option(label="全部专业", :value="-1")
                                el-option(v-for="(it, idx) in materialList.list1", :key="idx", :label="it.name", :value="it.id")
                            el-select(v-model="materialSearchForm.secondCategoryId", placeholder="选择类别", style="width:25%;margin-left:10px;")
                                el-option(label="全部类别", :value="-1")
                                el-option(v-for="(it, idx) in materialList.list2", :key="idx", :label="it.name", :value="it.id")
                            el-input(v-model="materialSearchForm.search", auto-complete="on", @keyup.native.13="search", placeholder="物资编码 / 品名", style="width:32%;margin-left:10px;")
                            el-button(@click.prevent="search()", round, size="mini", type="primary", style="width:65px;margin-left:10px;") 搜索
            div
                el-table(
                    :data="table.result.rows",
                    tooltip-effect="dark"
                    style="width: 100%",
                    size="medium",
                    @selection-change="handleSelectionChange")
                    el-table-column(type="selection", width="50")
                    el-table-column(prop="goodsCode", label="物资编码", width="120")
                    el-table-column(prop="goodsName", label="品名", width="120")
                    el-table-column(prop="goodsUnit", label="单位", width="120")
                    el-table-column(prop="firstCategoryName", label="专业", width="110")
                    el-table-column(prop="secondCategoryName", label="类别", width="110")
                    el-table-column(prop="professionDeptName", label="所属业务局", width="110")
                    el-table-column(prop="operatingDeptName", label="所属业务处")
                    el-table-column(label="操作", width="134")
                        template(slot-scope="scope")
                            el-button(
                            style="font-size:13px;",
                            type="text",
                            @click="handleEdit(scope.$index, scope.row)") 编辑
                            el-button(
                            style="color:#ff4a01;font-size:13px;",
                            type="text",
                            @click="handleDelete(scope.$index, scope.row)") 删除

                el-pagination(
                style="margin-top:5px;text-align:right;",
                @size-change="handleSizeChange",
                @current-change="handleCurrentChange",
                :current-page="table.result.pageNum || 1",
                :page-sizes=[10, 20, 30, 40, 50, 100],
                :page-size="table.result.pageSize || 10",
                background,
                layout="total, sizes, prev, pager, next, jumper",
                :total="table.result.total")
            el-dialog(:visible.sync="addVisable",:title="edit ?'编辑物资':'新增物资'")
                el-form(
                :model="addMaterialForm", status-icon,
                :rules="rulesMaterialInfo", ref="addMaterialForm", label-width="130px", size="small")
                    el-form-item(label="品名", prop="goodsName")
                        el-input(v-model="addMaterialForm.goodsName", auto-complete="off", placeholder="输入品名", style="width:84%;")
                    el-form-item(label="物资编码", prop="goodsCode")
                        el-input(v-model="addMaterialForm.goodsCode", auto-complete="off", placeholder="输入物资编码", style="width:84%;")
                    el-form-item(label="单位", prop="goodsUnit")
                        el-input(v-model="addMaterialForm.goodsUnit", auto-complete="off", placeholder="如：个，件，台", style="width:84%;")
                    el-form-item(label="专业", prop="firstCategoryId")
                        el-select(v-model="addMaterialForm.firstCategoryId", placeholder="选择专业", style="width:84%;",@change="changeList('materialFormList','addMaterialForm')")
                            el-option(v-for="(it, idx) in materialFormList.list1", :key="idx", :label="it.name", :value="it.id")
                    el-form-item(label="类别", prop="secondCategoryId")
                        el-select(v-model="addMaterialForm.secondCategoryId", placeholder="选择类别", style="width:84%;", @change="typeChange")
                            el-option(v-for="(it, idx) in materialFormList.list2", :key="idx", :label="it.name", :value="it.id")
                            // el-option(label="其他",:value="-1")
                    // el-form-item(label="", v-if="addMaterialForm.secondCategoryId == -1")
                    //     div(style="line-height:14px;top:-5px;position:relative;font-size:12px;color:#9999;") 若下拉框中没有合适的类别，请点击“新增类别”添加
                    //     el-button(v-if="!addType",type="primary", @click="addType = true") 新增类别

                <!--el-form(-->
                <!--v-if="addMaterialForm.secondCategoryId === -1",-->
                <!--:model="addTypeForm", status-icon,-->
                <!--:rules="rulesType", ref="addTypeForm", label-width="130px", size="small")-->
                    <!--div(style="height:0;border-bottom:1.5px dashed #eee;margin-bottom: 18px;")-->
                    <!--el-form-item(label="所属专业局", prop="professionDeptId")-->
                        <!--el-select(v-model="addTypeForm.professionDeptId", placeholder="选择专业局", style="width:84%;", @change="orgChange", :disabled="selectDisabled")-->
                            <!--el-option(v-for="item in orgs",:label="item.orgName",:value="item.id",:key="item.id" )-->
                    <!--el-form-item(label="所属业务处", prop="operatingDeptId")-->
                        <!--el-select(v-model="addTypeForm.operatingDeptId", placeholder="选择业务处", style="width:84%;")-->
                            <!--el-option(v-for="item in orgChildren",:label="item.orgName",:value="item.id",:key="item.id" )-->
                    <!--el-form-item(label="类别名", prop="secondCategoryName")-->
                        <!--el-input(v-model="addTypeForm.secondCategoryName", auto-complete="off", placeholder="输入类别名", style="width:84%;")-->
                span(slot="footer", class="dialog-footer")
                    el-button(
                    :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                    @click="closeDialog") 取 消
                    el-button(
                    type="primary",
                    :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                    :loading="isLoading",
                    @click="addSubmit()") 确 定
            el-dialog(
            ref="multipleTable",
            :title="!showImportResult ? '批量导入物资' : '导入结果'",
            :visible.sync="dialogVisible"
            width="600px",
            padding="20px 40px",
            @close="close")
                el-form(v-if="!showImportResult && visible==='import'", ref="fileUploadForm", status-icon, label-width="120px")
                    el-form-item(label="导入物资数据", prop="fileList", style="width:90%;")
                        el-upload(
                        class="upload-demo",
                        action="/baseGoods/uploadGoods",
                        :on-change="handleChange",
                        :on-success="success",
                        :on-progress="handleProgress",
                        :file-list="fileList",
                        :before-upload="beforeAvatarUpload")
                            el-button(size="mini", type="primary", round) 点击上传
                            div(slot="tip", class="el-upload__tip", style="line-height:20px;") 只能上传xlsx/xls文件，且不超过10Mb.
                                a.downExcle(href="/baseGoods/templete",target="_blank", style="margin-left:20px;color:blue") 下载模板文件

                div(v-if="showImportResult")
                    div(style="line-height:30px;font-size:16px;margin-top:-20px;")
                        span(style="color:#00b30c;") 导入成功：{{numbersOfSuccess}} 条
                        span(style="color:#ff0000;margin-left:50px;") 导入失败：{{numbersOfError}} 条
                    el-table(
                    :data="resultTableData",
                    tooltip-effect="dark"
                    class="import-fail-result",
                    style="width: 100%,padding:15px 20px",
                    size="mini")
                        el-table-column(prop="num", label="编号", width="60")
                        el-table-column(prop="reason", label="失败原因")

                    el-pagination(
                    style="margin-top:5px;text-align:right;",
                    @size-change="handleSizeChange2",
                    @current-change="handleCurrentChange2",
                    :current-page="importFailedResult.pageNum",
                    :page-sizes=[10, 20, 30, 40, 50],
                    :page-size="importFailedResult.pageSize",
                    background,
                    layout="total, sizes, prev, pager, next, jumper",
                    :total="importFailedResult.total")

                span(slot="footer", class="dialog-footer", v-if="showImportResult")
                    el-button(round, style="min-width: 80px", type="primary", size="small", @click="dialogVisible = false") 确 定

        iframe(v-bind:src="downloadURL", style="display:none; width:0; height:0;")
</template>

<script type="text/ecmascript-6">
    import Qs from 'qs';
    import APIList from '@/assets/datas/APIList.json';
    import util from '../../lib/util';

    export default {
        data() {
            const that = this;
            const checkValue = (rule, value, callback) => {
                if (!value) {
                    if (rule.field === 'goodsName') {
                        callback(new Error('请填写品名！'));
                    } else if (rule.field === 'goodsCode') {
                        callback(new Error('请填写物资编码！'));
                    } else if (rule.field === 'goodsUnit') {
                        callback(new Error('请填写单位！'));
                    } else if (rule.field === 'secondCategoryName') {
                        callback(new Error('请输入类别名！'));
                    }
                } else if (rule.field === 'goodsName') {
                    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/g.test(value)) {
                        callback(new Error('只能包含中文、字母、数字、-(中划线)、_(下划线)！'));
                    } else if (value.length > 30) {
                        callback(new Error('长度不能超过30个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else if (rule.field === 'goodsCode') {
                    if (!/^[a-zA-Z0-9_-]+$/g.test(value)) {
                        callback(new Error('只能包含字母、数字、-(中划线)、_(下划线)！'));
                    } else if (value.length > 50) {
                        callback(new Error('长度不能超过50个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else if (rule.field === 'goodsUnit') {
                    if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/g.test(value)) {
                        callback(new Error('只能包含中文、字母、数字！'));
                    } else if (value.length > 10) {
                        callback(new Error('长度不能超过10个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else if (rule.field === 'secondCategoryName') {
                    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/g.test(value)) {
                        callback(new Error('只能包含中文、字母、数字、-(中划线)、_(下划线)！'));
                    } else if (value.length > 30) {
                        callback(new Error('长度不能超过30个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else {
                    setTimeout(() => {
                        callback();
                        that.isLoading = false;
                    }, 500);
                }
            };
            return {
                showImportResult: false,
                isAdmin: false,
                selectDisabled: false,
                downloadURL: '',
                // 物资
                addMaterialForm: {
                    goodsName: '',
                    goodsCode: '',
                    goodsUnit: '',
                    firstCategoryId: '',
                    secondCategoryId: '',
                },
                resultData: [],
                resultTableData: [],
                importFailedResult: {
                    pageNum: 1,
                    pageSize: 10,
                    total: 0,
                },
                multipleSelection: [],
                orgs: [],
                orgChildren: [],
                // 物资类型
                addTypeForm: {
                    secondCategoryName: '',
                    professionDeptId: '',
                    operatingDeptId: '',
                },
                materialList: {
                    list1: [],
                    list2: [],
                },
                materialFormList: {
                    list1: [],
                    list2: [],
                },
                // 筛选
                materialSearchForm: {
                    firstCategoryId: -1,
                    secondCategoryId: -1,
                    search: '',
                },
                rulesMaterialInfo: {
                    goodsName: [
                        { required: true, trigger: 'change', validator: checkValue },
                    ],
                    goodsCode: [
                        { required: true, trigger: 'change', validator: checkValue },
                    ],
                    goodsUnit: [
                        { required: true, trigger: 'change', validator: checkValue },
                    ],
                    firstCategoryId: [
                        { required: true, message: '请选择专业', trigger: 'change' },
                    ],
                    secondCategoryId: [
                        { required: true, message: '请选择类别', trigger: 'change' },
                    ],
                },
                rulesType: {
                    secondCategoryName: [
                        { required: true, trigger: 'change', validator: checkValue },
                    ],
                    professionDeptId: [
                        { required: true, message: '请选择专业局', trigger: 'change' },
                    ],
                    operatingDeptId: [
                        { required: true, message: '请选择业务处', trigger: 'change' },
                    ],
                },
                // 表格
                tData: [],
                tColumns: [
                    { prop: 'goodsCode', label: '物资编码' },
                    { prop: 'goodsName', label: '品名' },
                    { prop: 'goodsUnit', label: '单位' },
                    { prop: 'firstCategoryName', label: '专业' },
                    { prop: 'secondCategoryName', label: '类别' },
                    { prop: 'professionDeptName', label: '所属专业局' },
                    { prop: 'operatingDeptName', label: '所属业务处' },
                ],
                tableSearch: util.tableSearch({ selection: [] }),
                // 新增
                addVisable: false,
                addType: false,
                edit: false,

                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                dialogVisible: false,
                visible: '',
                fileList: [],
                ruleFileUpload: {
                    fileList: [
                        { required: true, trigger: 'change' },
                    ],
                },
                table: {
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    params: {
                        keyword: '',
                        firstCategoryId: '',
                        secondCategoryId: '',
                    },
                    getData(idx, size) {
                        const params = {
                            pageSize: size || that.table.result.pageSize,
                            pageNum: idx,
                            firstCategoryId: that.materialSearchForm.firstCategoryId,
                            secondCategoryId: that.materialSearchForm.secondCategoryId || '-1',
                        };
                        const search = that.materialSearchForm.search;
                        if (/\S/.test(search)) {
                            params.search = search;
                        }
                        const dt = that.$qs.stringify(params);
                        that.$axios.get(`${APIList.MATERIAL_LIST}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            that.table.result = response.data;
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
            };
        },
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
        methods: {
            showLog(row) {
                console.log(row);
            },
            addVisableClick() {
                this.addVisable = true;
                this.edit = false;
                if (this.$refs.addMaterialForm) {
                    this.addMaterialForm = {
                        goodsName: '',
                        goodsCode: '',
                        goodsUnit: '',
                        firstCategoryId: '',
                        secondCategoryId: '',
                    };
                    this.resetAdd();
                }
            },
            init() {
                const $vm = this;

                $vm.initGoodsType();

                // this.$axios.get('/organization/getTopOrgsWithMaterialMark').then(resp => {
                //     const res = resp.data;
                //     if (Array.isArray(res)) {
                //         $vm.orgs = res.map(v => {
                //             const obj = {};
                //             obj.orgTypeName = v.orgTypeName;
                //             obj.id = v.id;
                //             return v;
                //         });
                //     }
                // });
                // this.searchMaterial();
                this.table.getData(1, this.table.result.pageSize || 10);
            },
            initGoodsType() {
                const $vm = this;
                this.$axios.post('/baseDict/getGoodsTypes').then(resp => {
                    const res = resp.data;
                    if (Array.isArray(res)) {
                        $vm.materialList.list1 = res;
                        // $vm.materialList.list2 = res[0].childrens;
                        $vm.materialList.obj = {};
                        res.forEach(v => {
                            $vm.materialList.obj[v.id] = v.childrens;
                        });
                        $vm.materialFormList.list1 = res;
                        // $vm.materialFormList.list2 = res[0].childrens;
                        $vm.materialFormList.obj = {};
                        res.forEach(v => {
                            $vm.materialFormList.obj[v.id] = v.childrens;
                        });
                    }
                });
            },
            search() {
                this.table.getData(1, this.table.result.pageSize || 10);
            },
            handleSizeChange(val) {
                this.table.getData(1, val);
            },
            handleCurrentChange(val) {
                this.table.getData(val, this.table.result.pageSize || 10);
            },
            handleSizeChange2(val) {
                this.importFailedResult.pageSize = val;
                this.resultTableData = this.resultData.slice(0, val);
            },
            handleCurrentChange2(val) {
                this.resultTableData = this.resultData.slice((val - 1) * this.importFailedResult.pageSize, val * this.importFailedResult.pageSize);
            },
            changeList(name, formName) {
                const $vm = this;
                const { obj } = $vm[name];
                const key = $vm[formName].firstCategoryId;
                if (Object.hasOwnProperty.call(obj, key)) {
                    $vm[name].list2 = obj[key];
                } else {
                    $vm[name].list2 = [];
                }
                $vm[formName].secondCategoryId = '';
                this.materialFormList.list1.forEach(dt => {
                    if (dt.id === key) {
                        $vm[formName].firstCategoryName = dt.name;
                    }
                });
            },
            typeChange() {
                const $vm = this;
                if ($vm.addMaterialForm.secondCategoryId === -1) {
                    this.$axios.post('/baseGoods/getParentOrg', { firstCategoryId: $vm.addMaterialForm.firstCategoryId }).then(resp => {
                        if (resp.data) {
                            $vm.addTypeForm.professionDeptId = resp.data * 1;
                            $vm.selectDisabled = true;
                            $vm.orgChange();
                        }
                    }).catch(resp => {
                        console.error(resp.msg);
                    });
                }
                const key = $vm.addMaterialForm.secondCategoryId;
                this.materialFormList.list2.forEach(dt => {
                    if (dt.id === key && key !== -1) {
                        $vm.addMaterialForm.secondCategoryName = dt.name;
                    }
                });
            },
            orgChange() {
                const $vm = this;
                const { professionDeptId } = this.addTypeForm;
                this.$axios.get('/organization/getSubOrgsByOrgId', { params: { orgId: professionDeptId } }).then(resp => {
                    const res = resp.data;
                    if (Array.isArray(res)) {
                        $vm.orgChildren = res;
                    }
                });
            },
            searchMaterial() {
                const { tableSearch, materialSearchForm } = this;
                const $vm = this;
                const data = {
                    pageNum: tableSearch.currentPage,
                    pageSize: tableSearch.pageSize,
                    search: materialSearchForm.search,
                    firstCategoryId: materialSearchForm.firstCategoryId,
                    secondCategoryId: materialSearchForm.secondCategoryId || '-1',
                };
                // if (!data.searh) {
                //     delete data.searh;
                // }
                this.$axios.get('/baseGoods/list', Qs.stringify(data)).then(resp => {
                    const res = resp.data;
                    $vm.tData = res.rows;
                    $vm.tableSearch.total = res.total;
                });
            },
            addSubmit() {
                let data = {};
                let flag = false;
                const { addMaterialForm, addTypeForm } = this;
                this.$refs.addMaterialForm.validate((valid) => {
                    if (valid) {
                        // alert('submit!');
                    } else {
                        flag = true;
                    }
                });
                const addType = this.addMaterialForm.secondCategoryId === -1;
                if (!addType) {
                    data = Object.assign({}, addMaterialForm);
                } else {
                    this.$refs.addTypeForm.validate((valid) => {
                        if (valid) {
                            // alert('submit!');
                        } else {
                            flag = true;
                        }
                    });
                    data = Object.assign({}, addMaterialForm, addTypeForm);
                }
                if (flag) return;
                let url = '/baseGoods/add';
                let txt = '添加成功';
                if (this.edit) {
                    url = '/baseGoods/update';
                    txt = '编辑成功';
                }
                this.$axios.post(url, data).then(resp => {
                    if (resp.code === 200) {
                        this.addVisable = false;
                        if (this.addType) { this.init(); }
                        this.resetAdd();
                        this.$message.success(txt);
                        this.initGoodsType();
                        this.table.getData(1, this.table.result.pageSize || 10);
                    } else if (resp.msg || resp.data.msg) {
                        this.$message.error(resp.msg || resp.data.msg);
                    }
                });
            },
            beforeAvatarUpload(file) {
                const isXCFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
                const isLt10M = file.size / 1024 / 1024 < 10;
                const length = this.fileList.length - 1;
                if (!isXCFile) {
                    this.$message.error('上传文件只能是 xlsx/xsl 格式!');
                    this.fileList.splice(length, 1);
                } else if (!isLt10M) {
                    this.$message.error('上传文件大小不能超过 10MB!');
                    this.fileList.splice(length, 1);
                } else {
                    this.close();
                }

                return isXCFile && isLt10M;
            },
            resetAdd() {
                this.resetForm('addMaterialForm');
                if (this.addType) {
                    this.resetForm('addTypeForm');
                }
                this.addType = false;
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
                // console.log(val);
            },
            handleEdit(idx, row) {
                // console.log(row);
                if (row) {
                    this.addMaterialForm = Object.assign({}, row);
                    const secondId = this.addMaterialForm.secondCategoryId;
                    if (this.addMaterialForm.firstCategoryId) {
                        this.changeList('materialFormList', 'addMaterialForm');
                        if (secondId) {
                            this.addMaterialForm.secondCategoryId = secondId;
                        }
                    }
                    this.addType = false;
                    this.addVisable = true;
                    this.edit = true;
                }
            },
            handleDelete(idx, row) {
                if (row) {
                    this.insureDoDelete([row]);
                }
            },
            deleteInBatch() {
                if (this.multipleSelection.length === 0) {
                    this.$message({
                        message: '请选择要删除的数据！',
                        type: 'warning',
                    });
                } else {
                    this.insureDoDelete(this.multipleSelection);
                }
            },
            insureDoDelete(data) {
                if (data.length !== 0) {
                    this.$confirm('删除物资将影响到该物资的统计数据，请慎重删除！', '删除提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        this.multipleSelection = data;
                        this.doDelete();
                    }).catch(() => {
                    });
                }
            },
            doDelete() {
                const $vm = this;
                const arr = [].concat(this.multipleSelection);
                const id = arr.map(v => (v.id)).toString();
                let data = { id };
                data = Qs.stringify(data);
                this.$axios.post('/baseGoods/delete', data).then(resp => {
                    if (resp.code === 200) {
                        this.multipleSelection = [];
                        $vm.$message.success('删除成功');
                        $vm.table.getData(1, this.table.result.pageSize || 10);
                    } else if (resp.data) {
                        $vm.$message({
                            type: 'error',
                            message: resp.data.msg,
                        });
                    }
                });
            },
            exportInBatch() {
                this.$confirm('将要导出所有数据，确定导出吗?', '导出提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    this.doExport();
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消导出',
                    });
                });
            },
            doExport() {
                const that = this;
                this.downloadURL = '/baseGoods/export';
                setTimeout(() => {
                    that.downloadURL = '';
                }, 1000);
            },
            handleChange(file, fileList) {
                this.fileList = fileList.slice(-3);
            },
            success(resp) {
                if (resp.code !== 200) {
                    if (resp.msg) {
                        this.$message.error(resp.msg);
                    } else if (resp.data && resp.data.msg) {
                        this.$message.error(resp.data.msg);
                    }
                    this.importFinished = true;
                } else {
                    this.importFinished = true;
                    this.dialogVisible = true;
                    this.showImportResult = true;
                    const dt = resp.data;
                    if (dt.errorList) {
                        for (let i = 0; i < dt.errorList.length; i += 1) {
                            this.resultData.push({
                                num: i + 1,
                                reason: dt.errorList[i],
                            });
                        }
                        const endIdx = this.importFailedResult.pageSize;
                        this.resultTableData = this.resultData.slice(0, endIdx);
                        this.importFailedResult.total = this.resultData.length;
                    }
                    this.numbersOfError = dt.numbersOfError || 0;
                    this.numbersOfSuccess = (dt.numbersOfSuccess * 1 > 0 ? dt.numbersOfSuccess : 0);
                    this.table.getData(1, this.table.result.pageSize || 10);
                }
            },
            handleProgress(evt) {
                this.importProgress = `${(evt.percent * 1).toFixed(2)}%`;
                if (evt.percent === 100) {
                    this.importFinished = true;
                }
            },
            showDialog(type) {
                // this.ttl = ttl;
                this.dialogVisible = true;
                // this.hasNewOne = false;
                this.visible = type;
                this.fileList = [];
            },
            close() {
                this.dialogVisible = false;
                this.showImportResult = false;
                this.resultTableData = [];
                this.resultData = [];
            },
            closeDialog() {
                const that = this;
                this.resetAdd();
                setTimeout(() => {
                    that.addVisable = false;
                }, 100);
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
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

    .opr-btns {
        display: inline-block;
        > .el-button {
            width: 90px;
        }
    }

    .lv-desc {
        font: {
            size: 12px;
        }
    }
    .downExcle {
        cursor: pointer;
        text-decoration: none;
    }
</style>
