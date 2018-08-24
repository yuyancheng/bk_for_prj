<template lang="pug">
    .cnt-wrapper
        div
            .opr-btns
                // el-button(@click.prevent="showDialog('addUnit', '新增单位')", round, size="mini", type="primary") 新增单位
                el-button(@click.prevent="visitPage()", round, size="mini", type="primary") 架构管理
                el-button(@click.prevent="showDialog('import', '批量导入单位')", round, size="mini", type="primary") 批量导入
                // el-button(@click.prevent="deleteInBatch", round, size="mini", type="primary") 批量删除
                el-button(@click.prevent="exportInBatch", round, size="mini", type="primary") 导 出
            div(style="float:right;text-align:right;")
                el-form(ref="userSearchForm", label-width="0px", size="small", style="width:780px;")
                    el-form-item(label="")
                        dept-picker(
                        :loaded="handlerLoad1",
                        :showLabel="true",
                        :change="itemChanged",
                        :config="{width:'65%',itemWidth:'17%'}",
                        ref="deptPickerA")
                        el-input(v-model="unitSearchForm.keyword", auto-complete="on", @keyup.native.13="search", placeholder="单位名称", style="width:16%;")
                        el-button(@click.prevent="search", round, size="mini", type="primary", style="width:60px;margin-left:10px;") 搜索
        div
            el-table(
            :data="tableData",
            tooltip-effect="dark"
            style="width: 100%",
            size="medium",
            @selection-change="handleSelectionChange")
                el-table-column(type="selection", width="35")
                el-table-column(prop="deptName", label="单位名称", show-overflow-tooltip=true, width="110")
                el-table-column(prop="orgLevelName", label="组织级别", show-overflow-tooltip=true, width="80")
                el-table-column(prop="orgAttr", label="类型", width="55")
                    template(slot-scope="scope")
                        span {{scope.row.orgAttr === 2 ? '机关' : '部队'}}
                el-table-column(v-for="(item, idx) in orgLevelHead", v-if="idx < 5", :key="idx", :prop="item.propName", :label="item.headName")
                el-table-column(prop="cityName", label="所在城市", show-overflow-tooltip=true, width="115")
                    template(slot-scope="scope")
                        span {{addrRegExp.test(scope.row.provinceName) ? scope.row.provinceName : scope.row.cityName}}
                el-table-column(prop="custNo", label="月结卡号", show-overflow-tooltip=true, width="90")
                el-table-column(label="操作", width="90")
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
            :current-page="tables.unitsList.result.pageNum",
            :page-sizes=[10, 20, 30, 40, 50, 100],
            :page-size="tables.unitsList.result.pageSize",
            background,
            layout="total, sizes, prev, pager, next, jumper",
            :total="tables.unitsList.result.total")

        el-dialog(
        ref="multipleTable",
        :title="dTtl",
        :visible.sync="dialogVisible"
        width="700px",
        padding="20px 40px",
        @close="close")
            el-form(ref="fileUploadForm", v-if="visible==='import'", :model="fileUpload", status-icon, :rules="ruleFileUpload", label-width="120px")
                // el-form-item(label="组织类型", prop="orgType", style="width:90%;")
                    el-radio-group(v-model="addUnitForm.orgType")
                        el-radio(v-for="(item, idx) in unitTypeList.default", :key="idx", :label="item.orgTypeName", @change="handleRadio(item.orgTypeName, item.id)")
                el-form-item(label="导入单位数据", prop="fileList", style="width:90%;")
                    el-upload(
                    class="upload-demo",
                    :action="`/department/upload?orgTypeId=${orgTypeId}`",
                    :on-change="handleChange",
                    :on-success="success",
                    :file-list="fileList",
                    :before-upload="beforeAvatarUpload")
                        el-button(size="small", type="primary", round) 点击上传
                        div(slot="tip", class="el-upload__tip", style="line-height:20px;") 只能上传xlsx/xls文件，且不超过10Mb.
                            a(:href="`/department/downloadTemplate?orgTypeId=${orgTypeId}`", target="_blank", style="margin-left:20px;color:blue") 下载模板文件

            el-form(
            :model="addUnitForm", v-if="visible==='addUnit'||visible==='editUnit'", status-icon,
            :rules="rulesUnitInfo", ref="addUnitForm", label-width="100px", size="small")
                el-form-item(
                    label="单位所属", :prop="visible==='addUnit' ? addUnitForm.orgLv[0] : ''")
                    dept-picker(
                    v-if="visible==='addUnit'",
                    :loaded="handlerLoad2",
                    :change="itemChanged",
                    :config="{width:'90%'}",
                    ref="deptPickerB")
                    el-select(
                    v-if="visible==='editUnit'",
                    v-for="(it, idx) in sendAddress", :key="idx",
                    v-model="sendAddress[idx]", disabled,
                    size="mini",
                    :style="{width:itemWidth, margin: (idx % 2 === 1) ? '0 5px' : '0'}")
                el-form-item(label="单位类型")
                    el-radio-group(v-model="addUnitForm.scope")
                        el-radio(label="机关", @click.native.prevent="radioChange('机关')")
                        el-radio(label="部队", @click.native.prevent="radioChange('部队')")
                el-form-item(label="单位名称", prop="deptName")
                    el-input(v-model="addUnitForm.deptName", auto-complete="off", placeholder="输入单位名称", style="width:30%;")
                el-form-item(label="收件地址", prop="address")
                    dist-picker(
                    v-if='dialogVisible',
                    ref="dPicker",
                    style="width:95%;display:inline-block;",
                    v-model="addUnitForm.address",
                    :address="''",
                    :change="regionChange",
                    :province="addUnitForm.province",
                    :city="addUnitForm.city",
                    :district="addUnitForm.district",
                    :location="addUnitForm.location")
                el-form-item(label="月结卡号", prop="custNo")
                    el-input(v-model="addUnitForm.custNo", auto-complete="off", placeholder="输入月结卡号", style="width:30%;")
                el-form-item(label="管理物资类别")
                    div(class="el-transfer" style="text-align: left; display: inline-block; position:relative;")
                        div(class="el-transfer-panel")
                            p(class="el-transfer-panel__header")
                                el-checkbox(:indeterminate="isIndeterminateA", :disabled="!dataSetsALen", v-model="checkAllA", @change="handleCheckAllChangeA", size="mini") 待选择
                                span(style="position:absolute;top:10px;right:10px;z-index:10;") {{dataSetsALen>0?`${selectDtALen}/${dataSetsALen}`:0}}
                            div(class="el-transfer-panel__body is-with-footer")
                                div(v-if="dataSetsA.length", class="el-checkbox-group el-transfer-panel__list is-filterable")
                                    el-tree(
                                    :data="dataSetsA",
                                    show-checkbox,
                                    node-key="id",
                                    ref="treeA",
                                    @check-change="handleCheckChangeA",
                                    :default-expanded-keys="[]",
                                    :default-checked-keys="[]")
                                p(class="el-transfer-panel__empty" style="display: none;") 无匹配数据
                                p(v-if="!dataSetsA.length", class="el-transfer-panel__empty") 无数据
                            p(class="el-transfer-panel__footer" style="text-align:right;")
                                el-button(size="mini", @click="resetCheckedA") 重置
                        div(class="el-transfer__buttons")
                            el-button(@click="moveToR(null)", :disabled="!selectDtA.length", type="primary" size="mini" style="display:block;margin:0 0 10px;")
                                span 选择
                                i(class="el-icon-arrow-right")
                            el-button(@click="moveToL", :disabled="!selectDtB.length", type="primary" size="mini" style="display:block;margin:0;")
                                i(class="el-icon-arrow-left")
                                span(style="margin:0;") 撤销
                        div(class="el-transfer-panel" style="margin-left:130px;")
                            p(class="el-transfer-panel__header")
                                el-checkbox(:indeterminate="isIndeterminateB", :disabled="!dataSetsBLen", v-model="checkAllB", @change="handleCheckAllChangeB") 已选择
                                span(style="position:absolute;top:10px;right:10px;z-index:10;") {{dataSetsBLen>0?`${selectDtBLen}/${dataSetsBLen}`:0}}
                            div(class="el-transfer-panel__body is-with-footer")
                                div(v-if="dataSetsB.length", class="el-checkbox-group el-transfer-panel__list is-filterable")
                                    el-tree(
                                    :data="dataSetsB",
                                    show-checkbox,
                                    node-key="id",
                                    ref="treeB",
                                    @check-change="handleCheckChangeB",
                                    :default-expanded-keys="[]",
                                    :default-checked-keys="[]")
                                p(class="el-transfer-panel__empty" style="display: none;") 无匹配数据
                                p(v-if="!dataSetsB.length", class="el-transfer-panel__empty") 无数据
                            p(class="el-transfer-panel__footer" style="text-align:right;")
                                el-button(size="mini", @click="resetCheckedB") 重置

            span(slot="footer", class="dialog-footer", v-if="visible!=='import'")
                el-button(
                v-if="visible==='addUnit'||visible==='editUnit'",
                :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                @click="dialogVisible = false") 取 消
                el-button(
                v-if="visible==='addUnit'||visible==='editUnit'",
                type="primary",
                :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                :loading="isLoading",
                @click="submitForm(formName)") 确 定
</template>

<script type="text/ecmascript-6">
    // import VDistpicker from 'v-distpicker';
    import Distpicker from '@/components/common/distpicker/DistPicker';
    import DepartmentPicker from '@/views/backstage/DepartmentPicker';
    import APIList from '@/assets/datas/APIList.json';
    import util from '../../lib/util';

    export default {
        data() {
            const that = this;
            const checkValue = (rule, value, callback) => {
                if (!value) {
                    if (rule.field === 'deptName') {
                        callback(new Error('请输入单位名称！'));
                    } else if (rule.field === 'orgId') {
                        callback(new Error('请选择单位所属！'));
                    } else if (rule.field === 'address') {
                        callback(new Error('请完善收件地址！'));
                    } else if (rule.field === 'custNo') {
                        callback(new Error('请输入月结卡号！'));
                    }
                } else if (rule.field === 'deptName' && value.length > 20) {
                    callback(new Error('单位名称不能超过20个字符！'));
                } else if (rule.field === 'orgId' && !/\S{1,30}/.test(value)) {
                    callback(new Error('请选择单位所属！'));
                } else if (rule.field === 'address' && !/^.{1,60}$/.test(value)) {
                    callback(new Error('地址过长，请确认是否正确！'));
                } else if (rule.field === 'custNo') {
                    if (!/^\d+$/.test(value)) {
                        callback(new Error('只能为数字！'));
                    } else if (value.length > 50) {
                        callback(new Error('长度不能超过50！'));
                    } else {
                        callback();
                    }
                } else {
                    setTimeout(() => {
                        callback();
                        that.isLoading = false;
                    }, 200);
                }
            };
            const checkFileName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请选择文件！'));
                } else {
                    if (value.size > 100000) {
                        console.log('');
                    }
                    callback();
                }
            };
            return {
                isIndeterminateA: false,
                checkAllA: false,
                isIndeterminateB: false,
                checkAllB: false,
                value4: ['1'],
                dataSetsA: [],
                dataSetsB: [],
                selectDtA: [],
                selectDtB: [],
                defaultDataA: [],
                defaultDataB: [],
                dataSetsALen: 0,
                dataSetsBLen: 0,
                selectDtALen: 0,
                selectDtBLen: 0,
                activeIndex: '1',
                addUnitForm: {
                    orgLv: ['org_lv_1', 'org_lv_2', 'org_lv_3', 'org_lv_4'],
                    org_lv_1: '',
                    org_lv_2: '',
                    org_lv_3: '',
                    org_lv_4: '',
                    orgType: [],
                    curOrgId: [],
                    deptName: '',
                    orgId: '',
                    scope: '机关',
                    address: '',
                    province: '',
                    city: '',
                    district: '',
                    location: '',
                    custNo: '',
                },
                addrRegExp: /市|行政区/g,
                currentDeptId: '',
                orgFirstLevelId: '',
                orgLevelHead: [{}, {}, {}, {}, {}, {}],
                unitSearchForm: {
                    keyword: '',
                },
                rulesUnitInfo: {
                    deptName: [
                        { validator: checkValue, required: true, trigger: 'blur' },
                    ],
                    org_lv_1: [
                        { required: true, message: '请选单位所属！', trigger: 'change' },
                    ],
                    orgId: [
                        { required: true, message: '请选单位所属！', trigger: 'change' },
                    ],
                    address: [
                        { validator: checkValue, required: true, trigger: ['blur', 'change'] },
                    ],
                    custNo: [
                        { validator: checkValue, required: true, trigger: 'blur' },
                    ],
                },
                currentPage: 1,
                multipleSelection: [],
                tableData: [],
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                fileUpload: {
                    name: '',
                    telephone: '',
                    address: '',
                },
                dTtl: '新增单位',
                ttl: '',
                dialogVisible: false,
                isEmpty: false,
                visible: '',
                unitTypeList: {
                    default: [],
                    getData() {
                        that.$axios.get(APIList.GET_UNIT_TYPE, {
                            data: {},
                        }).then((response) => {
                            that.unitTypeList.default = response.data.rows;
                            that.addUnitForm.orgType = that.unitTypeList.default[0].orgTypeName;
                            if (that.unitTypeList.default.length > 0 && !that.orgTypeId) {
                                that.orgTypeId = that.unitTypeList.default[0].id;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                orgLevels: {
                    getData() {
                        let num = 1;
                        const heads = [];
                        const makeLists = (dt) => {
                            heads.push({
                                headName: dt.levelName,
                                propName: `prop_${num}`,
                            });
                            if (dt.subLevel && dt.subLevel.levelName) {
                                num += 1;
                                makeLists(dt.subLevel);
                            }
                        };
                        const dt = that.$qs.stringify({
                            orgTypeId: that.orgTypeId,
                        });

                        that.$axios.get(`${APIList.GET_ORG_LEVEL}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            const data = response.data;
                            if (data && data.levelName) {
                                makeLists(data);
                                that.orgLevelHead = heads;
                            } else {
                                that.orgLevelHead = [];
                            }

                            that.tables.unitsList.getData(1, that.tables.unitsList.result.pageSize);
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                tables: {
                    unitsList: {
                        result: {
                            pageSize: 10,
                        },
                        getData(idx, size) {
                            const getOrgLevelData = (data) => {
                                // const len = that.orgLevelHead.length;
                                let n = 0;
                                const sets = [];

                                const doRecursion = (dt) => {
                                    const org = dt.organization || dt.parentOrganization;
                                    if (org && org.parentOrganization) {
                                        doRecursion(org);
                                    }

                                    if (org) {
                                        sets[n] = {
                                            propName: org.orgName || '',
                                        };
                                        n += 1;
                                    }
                                };
                                doRecursion(data);
                                return sets;
                            };
                            const resetUnitsData = (dt) => {
                                for (let i = 0; i < dt.length; i += 1) {
                                    if (dt[i].organization) {
                                        that.tableData[i].orgLevelName = dt[i].organization.levelName || '';
                                        // that.tableData[i].orgLevelName = dt[i].orgLevelName;
                                    }

                                    const set = getOrgLevelData(dt[i]);
                                    for (let m = 0; m < set.length; m += 1) {
                                        // const key = that.orgLevelHead[set.length - m - 1].propName;
                                        if (that.orgLevelHead[m]) {
                                            const key = that.orgLevelHead[m].propName;
                                            that.tableData[i][key] = set[m].propName;
                                        }
                                    }
                                }
                            };
                            const data = that.$qs.stringify({
                                orgTypeId: that.orgTypeId,
                                pageSize: size || that.tables.unitsList.result.pageSize,
                                pageNum: idx,
                            });
                            that.$axios.get(`${APIList.GET_UNITS_BY_ORG_TYPE}?${data}`, {
                                data: {},
                            }).then((response) => {
                                // console.log(response);
                                that.tableData = response.data.rows;
                                that.tables.unitsList.result = response.data;
                                resetUnitsData(response.data.rows);
                            }).catch((response) => {
                                console.error(response);
                            });
                        },
                    },
                },
                sendAddress: [],
                userTypes: [],
                fileList: [],
                ruleFileUpload: {
                    fileList: [
                        { validator: checkFileName, required: true, trigger: 'change' },
                    ],
                },
            };
        },
        components: { Distpicker, DepartmentPicker },
        beforeCreate() {
        },
        created() {
            this.unitType = decodeURIComponent(this.$router.history.current.hash.substring(1));
            this.orgTypeId = decodeURIComponent(this.$router.history.current.query.type_id || '');

            if (this.orgTypeId) {
                this.init();
            }
            this.getDefaultDataA();
        },
        mounted() {
        },
        watch: {
            addUnitForm: {
                handler(nVal, oVal) {
                    if ((nVal && nVal.unitB) !== (oVal && oVal.unitB)) {
                        this.addUnitForm.unitC = '';
                        this.addUnitForm.unitD = '';
                        this.addUnitForm.unitE = '';
                    }
                },
                immediate: true,
                deep: true,
            },
        },
        methods: {
            init() {
                this.orgLevels.getData();
                this.unitTypeList.getData();
            },
            getDefaultDataA() {
                const that = this;
                that.dataSetsA = [];
                that.selectDtA = [];
                that.dataSetsALen = 0;
                that.selectDtALen = 0;
                const getChildren = (arr) => {
                    const dt = [];
                    arr.forEach(v => {
                        dt.push({
                            id: v.id,
                            pid: v.parentId,
                            label: v.name,
                            disabled: v.disabled,
                            children: getChildren(v.childrens),
                        });
                    });
                    return dt;
                };
                this.$axios.post('/baseDict/getGoodsTypes').then(resp => {
                    const res = resp.data;
                    if (Array.isArray(res)) {
                        res.forEach((v, i) => {
                            that.dataSetsA.push({
                                id: v.id,
                                pid: v.parentId,
                                label: v.name,
                                disabled: v.disabled,
                                children: getChildren(v.childrens),
                            });
                            that.dataSetsALen += that.dataSetsA[i].children.length;
                        });
                    }
                    that.defaultDataA = util.deepClone(that.dataSetsA);
                    if (that.$refs.treeA) {
                        that.$refs.treeA.setCheckedKeys([]);
                    }
                });
            },
            handleCheckAllChangeA(val) {
                this.isIndeterminateA = false;
                if (!val) {
                    if (this.$refs.treeA) {
                        this.$refs.treeA.setCheckedKeys([]);
                    }
                } else {
                    // this.selectDtA = util.deepClone(this.dataSetsA);
                    const len = this.dataSetsA.length;
                    const ids = [];
                    for (let i = 0; i < len; i += 1) {
                        ids.push(this.dataSetsA[i].id);
                    }
                    this.setCheckedKeysA(ids);
                }
            },
            handleCheckAllChangeB(val) {
                this.isIndeterminateB = false;
                if (!val) {
                    if (this.$refs.treeB) {
                        this.$refs.treeB.setCheckedKeys([]);
                    }
                } else {
                    // this.selectDtB = util.deepClone(this.dataSetsB);
                    const len = this.dataSetsB.length;
                    const ids = [];
                    for (let i = 0; i < len; i += 1) {
                        ids.push(this.dataSetsB[i].id);
                    }
                    this.setCheckedKeysB(ids);
                }
            },
            setCheckedKeysA(keys) {
                this.$refs.treeA.setCheckedKeys(keys);
            },
            setCheckedKeysB(keys) {
                this.$refs.treeB.setCheckedKeys(keys);
            },
            resetCheckedA() {
                this.getDefaultDataA();
            },
            resetCheckedB() {
                this.selectDtBLen = 0;
                this.dataSetsBLen = 0;
                this.selectDtB = [];
                this.dataSetsB = [];
                // this.dataSetsB = util.deepClone(this.defaultDataB);
                this.moveToR(util.deepClone(this.defaultDataB));
                if (this.$refs.treeB) {
                    this.$refs.treeB.setCheckedKeys([]);
                }
            },
            getParentNode(sets, id) {
                for (let i = 0; i < sets.length; i += 1) {
                    if (sets[i].id === id) {
                        return sets[i];
                    }
                }
                return {};
            },
            setDtStatus(type, data, dt, f) {
                const sets = data;
                let index = -1;
                let idx = -1;
                let bl = false;
                if (dt.pid === -1) {
                    for (let i = 0; i < sets.length; i += 1) {
                        if (sets[i].id === dt.id) {
                            idx = i;
                            bl = true;
                            break;
                        }
                    }
                    if (f) {
                        if (!bl) {
                            sets.push(util.deepClone(dt));
                            if (type === 'A') {
                                this.selectDtALen += dt.children.length;
                                if (this.selectDtALen > this.dataSetsALen) this.selectDtALen = this.dataSetsALen;
                            } else {
                                this.selectDtBLen += dt.children.length;
                                if (this.selectDtBLen > this.dataSetsBLen) this.selectDtBLen = this.dataSetsBLen;
                            }
                        }
                    } else if (bl) {
                        sets.splice(idx, 1);
                        if (type === 'A') {
                            this.selectDtALen -= dt.children.length;
                            if (this.selectDtALen < 0) this.selectDtALen = 0;
                        } else {
                            this.selectDtBLen -= dt.children.length;
                            if (this.selectDtBLen < 0) this.selectDtBLen = 0;
                        }
                    }
                } else {
                    for (let m = 0; m < sets.length; m += 1) {
                        if (sets[m].id === dt.pid) {
                            index = m;
                            for (let n = 0; n < sets[m].children.length; n += 1) {
                                if (sets[m].children[n].id === dt.id) {
                                    idx = n;
                                    bl = true;
                                    break;
                                }
                            }
                            if (bl) break;
                        }
                    }
                    if (index === -1) {
                        index = 0;
                        if (type === 'A') {
                            sets[index] = util.deepClone(this.getParentNode(this.dataSetsA, dt.pid));
                        } else {
                            sets[index] = util.deepClone(this.getParentNode(this.dataSetsB, dt.pid));
                        }
                        sets[index].children = [];
                    }
                    if (f) {
                        if (!bl) {
                            sets[index].children.push(util.deepClone(dt));
                            if (type === 'A') {
                                this.selectDtALen += 1;
                                if (this.selectDtALen > this.dataSetsALen) this.selectDtALen = this.dataSetsALen;
                            } else {
                                this.selectDtBLen += 1;
                                if (this.selectDtBLen > this.dataSetsBLen) this.selectDtBLen = this.dataSetsBLen;
                            }
                        }
                    } else if (bl) {
                        sets[index].children.splice(idx, 1);
                        if (type === 'A') {
                            this.selectDtALen -= 1;
                            if (this.selectDtALen < 0) this.selectDtALen = 0;
                        } else {
                            this.selectDtBLen -= 1;
                            if (this.selectDtBLen < 0) this.selectDtBLen = 0;
                        }
                    }
                }
                console.log(sets);
            },
            handleCheckChangeA(data, checked, indeterminate) {
                const dt = data;
                if (dt.pid === -1) {
                    if (checked) {
                        if (!indeterminate) {
                            this.setDtStatus('A', this.selectDtA, dt, true);
                        }
                    } else if (!indeterminate) {
                        this.setDtStatus('A', this.selectDtA, dt, false);
                    }
                } else if (checked) {
                    this.setDtStatus('A', this.selectDtA, dt, true);
                } else {
                    this.setDtStatus('A', this.selectDtA, dt, false);
                }
                this.setIndeterminate('A');
            },
            handleCheckChangeB(data, checked, indeterminate) {
                const dt = data;
                if (dt.pid === -1) {
                    if (checked) {
                        if (!indeterminate) {
                            this.setDtStatus('B', this.selectDtB, dt, true);
                        }
                    } else if (!indeterminate) {
                        this.setDtStatus('B', this.selectDtB, dt, false);
                    }
                } else if (checked) {
                    this.setDtStatus('B', this.selectDtB, dt, true);
                } else {
                    this.setDtStatus('B', this.selectDtB, dt, false);
                }
                this.setIndeterminate('B');
            },
            moveToR(dt) {
                let arr = [];
                if (dt) {
                    arr = util.deepClone(dt);
                } else {
                    arr = util.deepClone(this.selectDtA);
                }
                const len1 = arr.length;
                const len2 = this.dataSetsB.length;
                let idx = -1;
                for (let m = 0; m < len1; m += 1) {
                    let bl = false;
                    for (let n = 0; n < len2; n += 1) {
                        if (arr[m].id === this.dataSetsB[n].id) {
                            idx = n;
                            bl = true;
                            break;
                        }
                    }
                    if (!bl) {
                        this.dataSetsB.push(arr[m]);
                    } else {
                        const ch1 = arr[m].children;
                        const ch2 = this.dataSetsB[idx].children;
                        const l1 = ch1.length;
                        const l2 = ch2.length;
                        for (let i = 0; i < l1; i += 1) {
                            let b = false;
                            for (let j = 0; j < l2; j += 1) {
                                if (ch1[i].id === ch2[j].id) {
                                    b = true;
                                    break;
                                }
                            }
                            if (!b) {
                                ch2.push(util.deepClone(ch1[i]));
                            }
                        }
                    }
                }
                const len3 = this.dataSetsA.length;
                for (let m = 0; m < len1; m += 1) {
                    let bl = false;
                    for (let n = 0; n < len3; n += 1) {
                        if (arr[m].id === this.dataSetsA[n].id) {
                            idx = n;
                            bl = true;
                            break;
                        }
                    }
                    if (bl) {
                        const ch1 = arr[m].children;
                        const ch2 = this.dataSetsA[idx].children;
                        const l1 = ch1.length;
                        const l2 = ch2.length;
                        for (let i = 0; i < l1; i += 1) {
                            let ix = -1;
                            let b = false;
                            for (let j = 0; j < l2; j += 1) {
                                if (ch1[i].id === ch2[j].id) {
                                    ix = j;
                                    b = true;
                                    break;
                                }
                            }
                            if (b) {
                                ch2.splice(ix, 1);
                                this.dataSetsALen -= 1;
                                this.selectDtALen -= 1;
                                this.dataSetsBLen += 1;
                            }
                        }
                        if (ch2.length === 0) {
                            this.dataSetsA.splice(idx, 1);
                        }
                    }
                }
                this.selectDtA = [];
                // this.resetCheckedA();
                this.setIndeterminate('A');
            },
            moveToL() {
                const arr = util.deepClone(this.selectDtB);
                const len1 = arr.length;
                const len2 = this.dataSetsA.length;
                let idx = -1;
                for (let m = 0; m < len1; m += 1) {
                    let bl = false;
                    for (let n = 0; n < len2; n += 1) {
                        if (arr[m].id === this.dataSetsA[n].id) {
                            idx = n;
                            bl = true;
                            break;
                        }
                    }
                    if (!bl) {
                        this.dataSetsA.push(arr[m]);
                    } else {
                        const ch1 = arr[m].children;
                        const ch2 = this.dataSetsA[idx].children;
                        const l1 = ch1.length;
                        const l2 = ch2.length;
                        for (let i = 0; i < l1; i += 1) {
                            let b = false;
                            for (let j = 0; j < l2; j += 1) {
                                if (ch1[i].id === ch2[j].id) {
                                    b = true;
                                    break;
                                }
                            }
                            if (!b) {
                                ch2.push(util.deepClone(ch1[i]));
                            }
                        }
                    }
                }
                const len3 = this.dataSetsB.length;
                for (let m = 0; m < len1; m += 1) {
                    let bl = false;
                    for (let n = 0; n < len3; n += 1) {
                        if (arr[m].id === this.dataSetsB[n].id) {
                            idx = n;
                            bl = true;
                            break;
                        }
                    }
                    if (bl) {
                        const ch1 = arr[m].children;
                        const ch2 = this.dataSetsB[idx].children;
                        const l1 = ch1.length;
                        const l2 = ch2.length;
                        for (let i = 0; i < l1; i += 1) {
                            let ix = -1;
                            let b = false;
                            for (let j = 0; j < l2; j += 1) {
                                if (ch1[i].id === ch2[j].id) {
                                    ix = j;
                                    b = true;
                                    break;
                                }
                            }
                            if (b) {
                                ch2.splice(ix, 1);
                                this.dataSetsBLen -= 1;
                                this.selectDtBLen -= 1;
                                this.dataSetsALen += 1;
                            }
                        }
                        if (ch2.length === 0) {
                            this.dataSetsB.splice(idx, 1);
                        }
                    }
                }
                this.selectDtB = [];
                // this.resetCheckedB();
                this.setIndeterminate('B');
            },
            setIndeterminate(type) {
                if (type === 'A') {
                    if (this.selectDtALen === 0) {
                        this.isIndeterminateA = false;
                        this.checkAllA = false;
                    } else if (this.selectDtALen !== this.dataSetsALen) {
                        this.isIndeterminateA = true;
                    } else {
                        this.isIndeterminateA = false;
                        this.checkAllA = true;
                    }
                } else if (type === 'B') {
                    if (this.selectDtBLen === 0) {
                        this.isIndeterminateB = false;
                        this.checkAllB = false;
                    } else if (this.selectDtBLen !== this.dataSetsBLen) {
                        this.isIndeterminateB = true;
                    } else {
                        this.isIndeterminateB = false;
                        this.checkAllB = true;
                    }
                }
            },
            visitPage() {
                const params = {
                    name: 'structure-management',
                    query: {
                        type_id: this.orgTypeId,
                    },
                    hash: `#${this.unitType}`,
                };

                this.$router.push(params);
            },
            handleSizeChange(val) {
                this.tables.unitsList.getData(1, val);
            },
            handleCurrentChange(val) {
                this.tables.unitsList.getData(val);
            },
            toggleSelection(rows) {
                if (rows) {
                    rows.forEach(row => {
                        this.$refs.multipleTable.toggleRowSelection(row);
                    });
                } else {
                    this.$refs.multipleTable.clearSelection();
                }
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
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
            deptPickerInit(row) {
                const that = this;
                // this.deptPickerB.clearData();
                this.deptPickerB.setOrgTypeId(this.orgTypeId);
                this.deptPickerB.setInitParams({
                    dept: {
                        name: row.deptName,
                        id: row.id,
                    },
                    initOrg: true,
                    allDisabled: true,
                }, () => {
                    if (that.$refs.addUnitForm) {
                        that.$refs.addUnitForm.clearValidate();
                    }
                });
            },
            radioChange(txt) {
                this.addUnitForm.scope = txt;
            },
            handleEdit(idx, row) {
                if (row) {
                    this.addUnitForm.deptName = row.deptName;
                    this.addUnitForm.orgId = row.orgId;
                    this.addUnitForm.province = row.provinceName;
                    this.addUnitForm.city = row.cityName;
                    this.addUnitForm.district = row.areaName;
                    this.addUnitForm.location = row.addressDetail;
                    this.addUnitForm.custNo = row.custNo;
                    this.addUnitForm.scope = row.orgAttr === 2 ? '机关' : '部队';
                    this.addUnitForm.address = `${row.provinceName || ''}${row.cityName || ''}${row.areaName || ''}${row.addressDetail || ''}`;

                    this.currentDeptId = row.id;    // 当前编辑的单位id
                    this.currentDeptName = row.deptName;    // 当前编辑的单位id
                    this.editting = true;
                    this.showDialog('editUnit', '编辑单位信息');
                    // 根据部门id获取所在组织链
                    this.sendAddress = [];
                    this.getOrgInfoByDeptId(row.id);

                    if (this.dPicker) {
                        this.dPicker.init();
                    }
                    if (this.deptPickerB) {
                        this.deptPickerInit(row);
                        this.curRow = null;
                    } else {
                        this.curRow = row;
                    }

                    // this.defaultDataB = row.firstCats;
                    const arr = row.firstCats;
                    const len1 = arr.length;
                    const len2 = this.dataSetsA.length;
                    let index = -1;
                    for (let m = 0; m < len1; m += 1) {
                        let bl = false;
                        for (let n = 0; n < len2; n += 1) {
                            if (arr[m].id === this.dataSetsA[n].id) {
                                arr[m].label = this.dataSetsA[n].label;
                                arr[m].pid = -1;
                                index = n;
                                bl = true;
                                break;
                            }
                        }
                        if (bl) {
                            arr[m].children = util.deepClone(arr[m].childrens);
                            delete arr[m].childrens;
                            const ch1 = arr[m].children;
                            const ch2 = this.dataSetsA[index].children;
                            const l1 = ch1.length;
                            const l2 = ch2.length;
                            for (let i = 0; i < l1; i += 1) {
                                for (let j = 0; j < l2; j += 1) {
                                    if (ch1[i].id === ch2[j].id) {
                                        ch1[i].pid = arr[m].id;
                                        ch1[i].label = ch2[j].label;
                                    }
                                }
                            }
                        }
                    }

                    this.defaultDataB = arr;
                    this.moveToR(arr);
                }
            },
            handleDelete(idx, row) {
                if (row) {
                    this.insureDoDelete(row);
                }
            },
            insureDoDelete(data) {
                if (data.length !== 0) {
                    this.$confirm('删除单位将影响到该单位的所有数据，请慎重删除！', '删除提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        this.doDelete(data, () => {
                            this.$message({
                                type: 'success',
                                message: '删除成功!',
                            });
                        }, (msg) => {
                            this.$message({
                                type: 'error',
                                message: msg,
                            });
                        });
                    }).catch(() => {
                    });
                }
            },
            doDelete(data, funcSuccess, funcFail) {
                const that = this;
                if (data) {
                    const ids = [];
                    if (data.constructor === Array) {
                        for (let i = 0; i < data.length; i += 1) {
                            ids[i] = data[i].id;
                        }
                    } else {
                        ids[0] = data.id;
                    }
                    this.$axios.post(APIList.DELETE_UNITS, {
                        deptIds: ids,
                    }).then((response) => {
                        if (response.code === 200) {
                            if (funcSuccess) {
                                funcSuccess();
                            }
                            const pageSize = that.tables.unitsList.result.pageSize;
                            that.tables.unitsList.getData(1, pageSize);
                        } else if (funcFail) {
                            if (response.data) {
                                funcFail(response.data.msg);
                            }
                        }
                    }).catch((response) => {
                        console.error(response);
                    });
                }
            },
            handleRadio(dt, id) {
                this.unitType = id;
                if (this.visible === 'addUnit') {
                    this.addUnitForm.units = [];
                    this.addUnitForm.unitType = '';
                    this.$refs.addUnitForm.validateField('units');
                    this.$refs.addUnitForm.validateField('unitType');
                    this.roleTypes.getData(id);
                }
            },
            itemChanged(dt) {
                this.addUnitForm.org_lv_1 = dt.level.id;
                this.curOrgId = dt.level.id;

                // this.$refs.addUnitForm.validateField('org_lv_1');
            },
            regionChange(dt, bl) {
                this.addUnitForm.address = '';
                let f = false;
                if (bl) {
                    f = dt.lv_1 && dt.lv_2 && dt.lv_4;
                } else {
                    f = dt.lv_1 && dt.lv_2 && dt.lv_3 && dt.lv_4;
                }
                if (f) {
                    this.addUnitForm.address = `${dt.lv_1} ${dt.lv_2} ${dt.lv_3} ${dt.lv_4}`;
                }
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
                // this.downloadURL = '/baseGoods/export';
                const downloadLink = document.createElement('a');
                downloadLink.href = `/department/download?orgTypeId=${this.orgTypeId}`;
                downloadLink.target = '_blank';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            },
            search() {
                const that = this;
                const getOrgLevelData = (data) => {
                    let n = 0;
                    const sets = [];

                    const doRecursion = (dt) => {
                        const org = dt.organization || dt.parentOrganization;
                        if (org && org.parentOrganization) {
                            doRecursion(org);
                        }

                        if (org) {
                            sets[n] = {
                                propName: org.orgName || '',
                                // propName: org.levelName || '',
                            };
                            n += 1;
                        }
                    };
                    doRecursion(data);
                    return sets;
                };
                const resetUnitsData = (dt) => {
                    for (let i = 0; i < dt.length; i += 1) {
                        if (dt[i].organization) {
                            that.tableData[i].orgLevelName = dt[i].organization.levelName || '';
                            // that.tableData[i].orgLevelName = dt[i].orgLevelName;
                        }

                        const set = getOrgLevelData(dt[i]);
                        for (let m = 0; m < set.length; m += 1) {
                            if (that.orgLevelHead[m]) {
                                const key = that.orgLevelHead[m].propName;
                                that.tableData[i][key] = set[m].propName;
                            }
                        }
                    }
                };
                that.curOrgId = that.deptPickerA.getCurrentId();
                const params = {
                    pageNum: 1,
                    // pageSize: that.tables.unitsList.result.pageSize || 10,
                    pageSize: 10,
                    orgTypeId: that.orgTypeId,
                    orgId: that.curOrgId,
                };
                if (that.unitSearchForm.keyword) {
                    params.deptName = that.unitSearchForm.keyword;
                }
                const dt = that.$qs.stringify(params);
                this.$axios.post(APIList.GET_UNITS_BY_KEYWORD, dt).then((response) => {
                    if (response.data.rows) {
                        that.tableData = response.data.rows;
                        that.tables.unitsList.result = response.data;
                        resetUnitsData(response.data.rows);
                    } else {
                        that.tableData = [];
                        that.tables.unitsList.result = {
                            total: 0,
                        };
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            handleChange(file, fileList) {
                this.fileList = fileList.slice(-3);
            },
            beforeAvatarUpload(file) {
                const isXCFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
                const isLt10M = file.size / 1024 / 1024 < 10;
                const length = this.fileList.length - 1;
                if (!isXCFile) {
                    this.$message.error('上传文件只能是 xlsx/xsl 格式!');
                    this.fileList.splice(length, 1);
                }
                if (!isLt10M) {
                    this.$message.error('上传文件大小不能超过 10MB!');
                    this.fileList.splice(length, 1);
                } else {
                    this.close();
                }

                return isXCFile && isLt10M;
            },
            handlerLoad1(obj) {
                this.deptPickerA = obj;  // 组织选择器对象引用
                if (this.deptPickerA) {
                    this.deptPickerA.clearData();
                    if (this.orgTypeId) {
                        // this.deptPickerA.setOrgTypeId(this.orgTypeId);
                    }
                }
            },
            handlerLoad2(obj) {
                this.deptPickerB = obj;  // 组织选择器对象引用
                if (this.deptPickerB) {
                    this.deptPickerB.clearData();
                    this.isEmpty = this.deptPickerB.isEmpty();
                    // if (this.visible === 'editUnit') {
                    //     this.deptPickerB.setInitParams({
                    //         dept: {
                    //             name: this.currentDeptName,
                    //             id: this.currentDeptId,
                    //         },
                    //         initOrg: false,
                    //     });
                    // }
                    if (this.curRow && this.visible === 'editUnit') {
                        this.deptPickerInit(this.curRow);
                    }
                }
            },
            showDialog(type, ttl) {
                const that = this;
                this.ttl = ttl;
                this.dialogVisible = true;
                this.visible = type;
                this.fileList = [];
                if (type === 'addUnit') {
                    this.dTtl = ttl;
                } else {
                    this.dTtl = ttl;
                }
                if (type === 'import') {
                    this.formName = 'fileUploadForm';
                } else if (type === 'addUnit' || type === 'editUnit') {
                    this.formName = 'addUnitForm';
                }
                setTimeout(() => {
                    that.dPicker = this.$refs.dPicker;  // 地址选择器对象引用
                    if (type === 'addUnit') {
                        that.$refs[this.formName].clearValidate();
                        that.dPicker.clearData();
                    }
                }, 200);
            },
            close() {
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
                this.dialogVisible = false;
                this.editting = false;
                this.visible = '';

                this.resetCheckedA();
                this.resetCheckedB();
                this.resetForm(this.formName);

                this.$refs[this.formName].clearValidate();
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            selectUnit() {
                // console.log(this.addUnitForm);
            },
            submitForm(formName) {
                const that = this;
                const address = this.dPicker.getDistData().distData;
                // console.log(address);
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (that.formName === 'addUnitForm') {
                            // 保存修改
                            let msgPrefix = '';
                            let URL = '';
                            let invalid = true;

                            const speSet = util.deepClone(that.dataSetsB);
                            for (let i = 0; i < speSet.length; i += 1) {
                                delete speSet[i].disabled;
                                delete speSet[i].pid;
                                delete speSet[i].label;
                                if (speSet[i].children) {
                                    speSet[i].childrens = util.deepClone(speSet[i].children);
                                    delete speSet[i].children;
                                    if (speSet[i].childrens.length) {
                                        invalid = false;
                                        speSet[i].childrens.map(d => {
                                            const v = d;
                                            delete v.disabled;
                                            delete v.children;
                                            delete v.pid;
                                            delete v.label;
                                        });
                                    } else {
                                        delete speSet[i].childrens;
                                    }
                                }
                            }

                            const params = {
                                orgTypeId: that.orgTypeId,
                                deptName: that.addUnitForm.deptName,
                                provinceName: address.lv_1 || '',
                                cityName: address.lv_2 || '',
                                areaName: address.lv_3 || '',
                                addressDetail: address.lv_4 || '',
                                custNo: that.addUnitForm.custNo,
                                orgAttr: that.addUnitForm.scope === '机关' ? 2 : 1,
                            };
                            if (!invalid) {
                                params.firstCats = speSet;
                            }
                            if (this.editting) {
                                msgPrefix = '编辑';
                                URL = APIList.UPDATE_UNITS;
                                params.id = that.currentDeptId;
                            } else {
                                msgPrefix = '新增';
                                URL = APIList.ADD_UNITS;
                                params.orgId = that.curOrgId;
                            }

                            this.$axios.post(URL, params).then((response) => {
                                if (response.code === 200) {
                                    this.$message({
                                        type: 'success',
                                        message: `${msgPrefix}成功！`,
                                    });

                                    this.close();
                                    const pageSize = that.tables.unitsList.result.pageSize;
                                    that.tables.unitsList.getData(1, pageSize);
                                } else if (response.msg) {
                                    this.$message({
                                        type: 'error',
                                        message: response.msg,
                                    });
                                } else if (response.data) {
                                    this.$message({
                                        type: 'error',
                                        message: response.data.msg,
                                    });
                                }
                            }).catch((response) => {
                                console.error(response);
                            });
                        }
                    } else {
                        // console.log('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
                this.addUnitForm.address = '';
                this.addUnitForm.deptName = '';
                this.addUnitForm.orgId = '';
                this.addUnitForm.province = '';
                this.addUnitForm.city = '';
                this.addUnitForm.district = '';
                this.addUnitForm.location = '';
                this.addUnitForm.custNo = '';
            },
            success(resp) {
                if (resp.code !== 200) {
                    if (resp.msg) {
                        this.$message.error(resp.msg);
                    } else if (resp.data && resp.data.msg) {
                        this.$message.error(resp.data.msg);
                    }
                    this.fileList.splice(this.fileList.length - 1, 1);
                } else {
                    this.dialogVisible = false;
                    this.fileList = [];
                    this.$message.success('导入成功！');
                    this.tables.unitsList.getData(1, this.tables.unitsList.result.pageSize);
                }
            },
            getOrgInfoByDeptId(id) {
                const that = this;
                const getOrgLevelData = (data) => {
                    let n = 0;
                    const sets = [];
                    const doRecursion = (dt) => {
                        const org = dt.organization || dt.parentOrganization;
                        if (org.parentOrganization) {
                            doRecursion(org);
                        }
                        if (org) {
                            // sets[n] = org.levelName || '';
                            sets[n] = org.orgName || '';
                            n += 1;
                        }
                    };
                    doRecursion(data);
                    return sets;
                };
                const param = this.$qs.stringify({
                    id,
                });
                this.$axios.get(`${APIList.GET_ORG_INFO_BY_DEPT_ID}?${param}`, {
                    data: {},
                }).then((response) => {
                    if (response.code === 200 && response.data) {
                        const set = getOrgLevelData(response.data);
                        const len = set.length;
                        for (let m = 0; m < len; m += 1) {
                            that.sendAddress.push(set[m]);
                        }
                        that.setItemWidth();
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            setItemWidth() {
                const itemDefaultWidth = 30;
                const len = this.sendAddress.length;
                let val = (95 - len + 1) / (len);
                if (val > itemDefaultWidth) {
                    val = itemDefaultWidth;
                }
                this.itemWidth = `${val}%`;
            },
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-wrapper {
        padding: 0 30px 40px;
        background-color: #FFF;
    }
    .opr-btns {
        display: inline-block;
        > .el-button {
            // width: 80px;
            margin-left: 5px;

            &:first-child {
                margin-left: 0;
            }
        }
    }
    .el-button--mini, .el-button--mini.is-round {
        padding: 7px 15px;
    }
    .el-transfer-panel__body,
    .el-transfer-panel__list.is-filterable {
        height: auto;
        max-height: 260px;
    }
    .el-transfer-panel {
       vertical-align: top;
    }
    .el-transfer__buttons {
        position: absolute;
        margin-top: -30px;
        top: 50%;
    }
    .el-transfer-panel .el-transfer-panel__empty {
        height: 52px;
        line-height: 45px;
    }
</style>
