<template lang="pug">
    div
        .cnt-header(style="background-color:#fff;border:none;")
            el-button(@click.prevent="back()", round, size="small", type="text", style="margin-left:20px;")
                i(class="el-icon-back", style="font-size: 16px;") 返 回
            strong(style="font-size:16px;margin-left:15px;font-weight:normal;color:#333;") {{unitType}}-架构管理
        .cnt-wrapper
            div
                el-form(ref="roleSearchForm", label-width="40px", size="small", style="width: 100%;")
                    el-form-item(label="筛选")
                        dept-picker(
                        :showOrgTypes="false",
                        :showDeptOptions="false",
                        :loaded="handlerLoad",
                        :change="itemChanged",
                        :config="{width:'79%',itemWidth:'16%'}",
                        ref="deptPicker")
                        el-button(@click.prevent="search", round, size="mini",
                        type="primary", style="width:65px;margin-left:10px;") 查 询
                        el-button(@click.prevent="fileList=[];dialogVisible2=true", round, size="mini", type="primary") 导入组织架构
            div
                .unit-list-head
                    strong.unit-expand
                    strong.unit-name 组织名称
                    strong.unit-lv 组织级别
                    strong.unit-num 组织序号
                    strong.unit-opr 操作
                .unit-level-body
                    .unit-level.unit-level-1(v-if="!tableData.length", style="text-align:center;")
                        .unit-list-wrap
                            span(style="font-size: 14px;color:#999;margin-right:20px;") 暂无数据！
                            el-button(type="text", @click="handleEdit('', 'new', tableData)",
                            v-if="!tableData.length && !searching") 创建一条
                    .unit-level.unit-level-1(v-if="tableData.length !== 0 && !dt_1.hidden", :is="", v-for="(dt_1, idx) in tableData")
                        .unit-list-wrap
                            strong
                                el-button(@click="expand(dt_1, compObj)")
                                    i(:class="((dt_1.subs && dt_1.subs.length) || !dt_1.hasNoSub)?(dt_1.unfolded?'el-icon-remove':'el-icon-circle-plus'):''")
                            strong.unit-name {{dt_1.orgName}}
                            strong.unit-lv {{dt_1.levelName}}
                            strong.unit-num(v-if="isNotSpe") {{dt_1.sequence}}
                            strong.unit-opr
                                el-button(type="text", @click="handleEdit(dt_1, 'new', tableData)") 增加
                                el-button(type="text", @click="handleEdit(dt_1)") 编辑
                                el-button(type="text", @click="handleDelete(dt_1, idx)") 删除

                        .unit-list-wrap(
                        v-show="dt_1.unfolded",
                        v-if="dt_1.subs && dt_1.subs.length !== 0",
                        :is="it.component",
                        :dt1="it.dt1",
                        :compArr="it.compArr",
                        :expand="it.expand",
                        :handleEdit="it.handleEdit",
                        :handleDelete="it.handleDelete",
                        :isNotSpe="it.isNotSpe",
                        v-for="it in compObj"
                        )

            el-dialog(
            ref="multipleTable",
            :title="dTtl",
            :visible.sync="dialogVisible"
            custom-class="structure-management",
            width="600px",
            padding="20px 40px",
            @close="close")
                el-form(
                :model="editOrgForm", status-icon,
                :rules="rulesOrgForm", ref="editOrgForm", label-width="130px", size="small")
                    el-form-item(label="增加级别", v-if="!editting")
                        el-radio-group(v-model="editOrgForm.scope")
                            el-radio(label="在同级增加", @click.native.prevent="radioChange('在同级增加')")
                            el-radio(label="在子级增加", @click.native.prevent="radioChange('在子级增加')", :disabled="tableData.length === 0")
                    el-form-item(label="组织名称", prop="orgName")
                        el-input(v-model="editOrgForm.orgName", auto-complete="off", placeholder="输入组织名称", style="width:84%;")
                    el-form-item(label="组织序号", prop="sequence")
                        el-input-number(v-model="editOrgForm.sequence",
                        controls-position="right", :min="1", size="mini", placeholder="输入组织序号", style="width:84%;text-align:left;")
                    el-form-item(label="组织级别", prop="levelName", v-if="showLevelName || tableData.length === 0")
                        el-input(v-model="editOrgForm.levelName", auto-complete="off", placeholder="输入组织级别", :disabled="levelIptDisabled", style="width:84%;")

                span(slot="footer", class="dialog-footer")
                    el-button(
                        :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                        @click="dialogVisible = false") 取 消
                    el-button(
                        type="primary",
                        :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                        :loading="isLoading",
                        @click="submitForm('editOrgForm')") 确 定

            el-dialog(
            ref="multipleTable2",
            title="导入组织架构",
            :visible.sync="dialogVisible2"
            width="700px",
            padding="20px 40px")
                el-form(ref="fileUploadForm", :model="fileUpload", status-icon, :rules="ruleFileUpload", label-width="140px")
                    el-form-item(label="从模板文件导入", prop="fileList", style="width:90%;")
                        el-upload(
                        class="upload-demo",
                        :action="`/organization/upload?orgTypeId=${orgTypeId}`",
                        :on-change="handleChange",
                        :on-success="success",
                        :file-list="fileList",
                        :before-upload="beforeAvatarUpload")
                            el-button(size="small", type="primary", round) 点击上传
                            div(slot="tip", class="el-upload__tip", style="line-height:20px;") 只能上传xlsx/xls文件，且不超过10Mb.
                                a(@click="downTemplate", style="margin-left:20px;color:blue") 下载模板文件
                                // a(:href="`/organization/downloadDesignateOrg?orgTypeId=${orgTypeId}`", target="_blank", style="margin-left:20px;color:blue") 下载模板文件
</template>

<script type="text/ecmascript-6">
    import Vue from 'vue/dist/vue.js';
    import APIList from '@/assets/datas/APIList.json';

    // const aCompt = Vue.extend({
    //     props: ['dt1', 'compArr', 'expand', 'handleEdit', 'handleDelete', 'isNotSpe'],
    //     template: '<div>{{isNotSpe}}</div>',
    // });

    const compt = Vue.extend({
        props: ['dt1', 'compArr', 'expand', 'handleEdit', 'handleDelete', 'isNotSpe'],
        template: `
            <div>
                <div class="unit-level unit-level-2" v-if="dt1.subs.length !== 0 && !dt2.hidden" v-for="(dt2, idx) in dt1.subs">
                    <div class="unit-list-wrap">
                        <strong>
                            <button @click="expand(dt2, compArr)">
                                <i :class="((dt2.subs && dt2.subs.length) || !dt2.hasNoSub)?(dt2.unfolded?'el-icon-remove':'el-icon-circle-plus'):''"></i>
                            </button>
                        </strong>
                        <strong class="unit-name">{{dt2.orgName}}</strong>
                        <strong class="unit-lv">{{dt2.levelName}}</strong>
                        <strong class="unit-num" v-if="isNotSpe">{{dt2.sequence}}</strong>
                        <strong class="unit-opr">
                            <button type="text" @click.prevent="handleEdit(dt2, 'new', dt1.subs)">增加</button>
                            <button type="text" @click.prevent="handleEdit(dt2)">编辑</button>
                            <button type="text" @click.prevent="handleDelete(dt2, idx, dt1)">删除</button>
                        </strong>
                    </div>
                    <div class="unit-list-wrap" v-show="dt2.unfolded" v-if="dt2.subs && dt2.subs.length !== 0">
                        <div class="unit-level.unit-level-3" :is="item.comp" v-for="(item, idx) in compArr"></div>
                    </div>
                </div>
            </div>
            `,
    });

    /* eslint-disable no-param-reassign */
    export default {
        data() {
            const that = this;
            // const regExp1 = /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/g;
            // const regExp2 = /^\d+$/g;
            const checkValue = (rule, value, callback) => {
                if (!value) {
                    if (rule.field === 'orgName') {
                        callback(new Error('请输入组织名称！'));
                    } else if (rule.field === 'sequence') {
                        callback(new Error('请输入组织序号！'));
                    } else if (rule.field === 'levelName') {
                        callback(new Error('请输入组织级别！'));
                    }
                } else if (rule.field === 'orgName') {
                    if (!/^[a-zA-Z0-9\u4e00-\u9fa5/_-]+$/g.test(`${value}`)) {
                        callback(new Error('只能包含中文、字母、数字、/(斜杠)、-(中划线)、_(下划线)！'));
                    } else if (`${value}`.length > 30) {
                        callback(new Error('长度不能超过30个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else if (rule.field === 'sequence') {
                    if (!/^\d+$/g.test(`${value}`)) {
                        callback(new Error('只能包含数字！'));
                    } else if (`${value}`.length > 10) {
                        callback(new Error('长度不能超过10个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else if (rule.field === 'levelName') {
                    if (!/^[a-zA-Z0-9\u4e00-\u9fa5/_-]+$/g.test(`${value}`)) {
                        callback(new Error('只能包含中文、字母、数字、/(斜杠)、-(中划线)、_(下划线)！'));
                    } else if (`${value}`.length > 20) {
                        callback(new Error('长度不能超过20个字符！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 50);
                    }
                } else {
                    setTimeout(() => {
                        callback();
                        that.isLoading = false;
                    }, 200);
                }
            };

            return {
                compObj: [],
                tableData: [],
                isNotSpe: true,
                editting: false,
                needLevelName: false,
                showLevelName: false,
                searchDisabled: true,
                levelIptDisabled: false,
                editOrgForm: {
                    orgName: '',
                    orgNum: '',
                    orgLevel: '',
                    scope: '在同级增加',
                },
                fileUpload: {
                    name: '',
                    telephone: '',
                    address: '',
                },
                roleSearchForm: [
                    {
                        roleType: '',
                    },
                    {
                        roleType: '',
                    },
                    {
                        roleType: '',
                    },
                    {
                        roleType: '',
                    },
                ],
                orgLevelType: {
                    levelIds: [],
                    curOrgId: '',
                    keyword: '',
                    getData(id, idx) {
                        const setFilterList = (dt) => {
                            if (that.unitSearchForm.unitFilters[idx || 0]) {
                                const len = that.unitSearchForm.unitFilters[idx].length;
                                that.unitSearchForm.unitFilters[idx].splice(0, len);
                                for (let i = 0; i < dt.length; i += 1) {
                                    that.unitSearchForm.unitFilters[idx || 0].push({
                                        id: dt[i].id,
                                        name: dt[i].orgName,
                                        order: dt[i].sequence,
                                        parentId: dt[i].parentOrgId,
                                        orgTypeId: dt[i].orgTypeId,
                                    });
                                }
                            }
                        };
                        if (that.orgTypeId) {
                            if (idx === 0) {
                                const data = that.$qs.stringify({
                                    orgTypeId: that.orgTypeId,
                                });
                                that.$axios.get(`${APIList.GET_TOP_ORG_LEVEL}?${data}`, {
                                    data: {},
                                }).then((response) => {
                                    const dt = response.data;
                                    if (dt.constructor === Array) {
                                        setFilterList(dt);
                                    }
                                    if (dt && dt.length > 0) {
                                        that.tableData = response.data;
                                    }
                                }).catch((response) => {
                                    console.error(response);
                                });
                            } else {
                                const data = that.$qs.stringify({
                                    orgId: id,
                                });
                                that.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${data}`, {
                                    data: {
                                        orgId: id,
                                    },
                                }).then((response) => {
                                    const dt = response.data;
                                    if (dt.constructor === Array) {
                                        setFilterList(dt);
                                    }
                                }).catch((response) => {
                                    console.error(response);
                                });
                            }
                        }
                    },
                },
                rulesOrgForm: {
                    orgName: [
                        { validator: checkValue, required: true, trigger: 'blur' },
                    ],
                    sequence: [
                        { validator: checkValue, required: true, trigger: 'blur' },
                    ],
                    levelName: [
                        { validator: checkValue, required: true, trigger: 'blur' },
                    ],
                },
                searching: false,
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                dTtl: '新增组织',
                ttl: '',
                subLevelName: '',
                subLevel: {},
                dialogVisible: false,
                dialogVisible2: false,
                visible: '',
                unitSearchForm: {
                    unitFilters: [],
                    curOrgId: [],
                    getData(id) {
                        const orgTypeList = [];
                        const makeLists = (dt) => {
                            if (dt.subLevel && dt.subLevel.levelName) {
                                makeLists(dt.subLevel);
                            }
                            orgTypeList.push([]);
                            that.unitSearchForm.unitFilters = orgTypeList;
                        };
                        const data = that.$qs.stringify({
                            orgTypeId: id,
                        });
                        that.$axios.get(`${APIList.GET_ORG_LEVEL}?${data}`, {
                            data: {},
                        }).then((response) => {
                            const dt = response.data;
                            if (dt && dt.levelName) {
                                that.orgFirstLevelId = dt.id;
                                makeLists(dt);
                                that.orgLevelType.getData(that.orgFirstLevelId, 0);
                                // that.tables.getData();
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                tables: {
                    hasNoData: false,
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    getData() {
                        const data = that.$qs.stringify({
                            orgTypeId: that.orgTypeId,
                        });
                        that.$axios.get(`${APIList.GET_TOP_ORG_LEVEL}?${data}`, {
                            data: {},
                        }).then((response) => {
                            if (response.data && response.data.length > 0) {
                                that.tableData = response.data;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                fileList: [],
                ruleFileUpload: {
                    fileList: [
                        { message: '请选择文件！', required: true, trigger: 'change' },
                    ],
                },
            };
        },
        components: { 'a-compt': compt },
        created() {
            this.unitType = decodeURIComponent(this.$router.history.current.hash.substring(1)) || '';
            this.orgTypeId = decodeURIComponent(this.$router.history.current.query.type_id || '');
            this.init();
        },
        mounted() {
        },
        methods: {
            init() {
                // this.unitSearchForm.getData(this.orgTypeId);
                this.tables.getData();
            },
            orgLevelChange(idx, id) {
                this.orgLevelType.levelIds.splice(idx - 1, 100);
                if (id) {
                    this.orgLevelType.levelIds.push(id);
                    this.curOrgId = id;
                    this.orgLevelType.getData(id, idx);
                } else if (idx > 1) {
                    this.curOrgId = this.orgLevelType.levelIds[idx - 2];
                } else {
                    this.curOrgId = '';
                }
                const dt = this.unitSearchForm.curOrgId;
                for (let i = idx; i < dt.length; i += 1) {
                    this.unitSearchForm.curOrgId[i] = '';
                }
            },
            search() {
                const that = this;
                if (!this.curOrgId) {
                    this.orgLevelType.getData('', 0);
                } else {
                    const data = that.$qs.stringify({
                        orgId: that.curOrgId,
                    });
                    this.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${data}`, {
                        data: {},
                    }).then((response) => {
                        const list = response.data;
                        if (list) {
                            that.tableData = list;
                            that.searching = true;
                        }

                        that.checkData();
                    }).catch((response) => {
                        console.error(response);
                    });
                }
            },
            insertCom(compObj, dt1, comArr) {
                compObj.push({
                    component: 'a-compt',
                    dt1,
                    compArr: comArr,
                    expand: this.expand,
                    handleEdit: this.handleEdit,
                    handleDelete: this.handleDelete,
                    isNotSpe: this.isNotSpe,
                });
            },
            expand(dt, arr) {
                const that = this;
                const data = dt;
                if (data.unfolded === undefined) {
                    data.unfolded = true;
                } else {
                    data.unfolded = !data.unfolded;
                }

                if (data.unfolded && (!data.subs || (data.subs.length !== 0 && !data.loaded))) {
                    const param = that.$qs.stringify({
                        orgId: dt.id,
                    });
                    this.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${param}`, {
                        data: {},
                    }).then((response) => {
                        const list = response.data;
                        if (list.length > 0) {
                            if (data.subs) {
                                data.subs = data.subs.concat(list);
                            } else {
                                data.subs = list;
                            }
                            that.insertCom(arr, dt, []);
                        } else {
                            // data.subs = [];
                            data.hasNoSub = true;
                        }
                        data.loaded = true;

                        that.checkData();
                    }).catch((response) => {
                        console.error(response);
                    });
                } else {
                    this.checkData();
                }
            },
            // 一种触发数据检测的方式，不推荐！
            checkData() {
                const len = this.tableData.length;
                if (len > 0) {
                    if (this.tableData[len - 1].hidden === undefined) {
                        this.tableData.push({
                            hidden: true,
                        });
                    } else {
                        this.tableData.pop();
                    }
                }
            },
            radioChange(txt) {
                const that = this;
                this.editOrgForm.scope = txt;
                if (txt === '在子级增加') {
                    that.showLevelName = true;
                    that.levelIptDisabled = false;
                    this.curParentId = this.curOrg.id;
                    if (!this.curOrg.subs || this.curOrg.subs.length === 0) {
                        const data = that.$qs.stringify({
                            levelId: this.curOrg.levelId || that.subLevelId,
                        });
                        // this.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${data}`, {
                        this.$axios.get(`${APIList.GET_SUB_LEVEL}?${data}`, {
                            data: {},
                        }).then((response) => {
                            const dt = response.data;
                            that.showLevelName = true;
                            if (!dt) {
                                that.levelIptDisabled = false;
                                that.subLevelName = '';
                            } else {
                                that.levelIptDisabled = true;
                                that.subLevelName = dt.levelName;
                                that.editOrgForm.levelName = dt.levelName;
                                that.subLevelId = dt.id;
                                that.subLevel[this.curOrg.levelId] = dt;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    } else {
                        that.levelIptDisabled = true;
                        that.editOrgForm.levelName = this.curOrg.subs[0].levelName;
                        that.subLevelName = this.curOrg.subs[0].levelName;
                        that.subLevelId = this.curOrg.subs[0].id;
                    }
                    this.needLevelName = true;
                } else {
                    this.curParentId = this.curOrg.parentOrgId;
                    this.needLevelName = false;
                    that.showLevelName = false;
                }
            },
            handleEdit(dt, type, arr) {
                if (type === 'new') {
                    this.dTtl = '增加组织';
                    this.editting = false;
                    // this.editOrgForm.scope = '在同级增加';
                    this.editOrgForm.sequence = 1;
                    this.editOrgForm.orgName = '';
                    this.editOrgForm.levelName = '';
                    if (dt) {
                        this.curParentId = dt.parentOrgId;
                    } else {
                        this.curParentId = '';
                    }
                } else {
                    this.dTtl = '编辑组织';
                    this.editting = true;
                    this.editOrgForm = dt;
                    this.editOrgForm = {
                        id: dt.id,
                        orgTypeId: dt.orgTypeId,
                        orgName: dt.orgName,
                        sequence: dt.sequence,
                        levelName: dt.levelName,
                    };
                }
                this.curOrg = dt || '';
                this.curCellection = arr;
                this.showDialog();
            },
            handleDelete(dt, idx, parent) {
                if (dt) {
                    this.insureDoDelete(dt, idx, parent);
                }
            },
            insureDoDelete(data, idx, parent) {
                if (data.length !== 0) {
                    this.$confirm('确定删除吗?', '删除提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        this.doDelete({ data, idx, parent }, () => {
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
            doDelete(param, funcSuccess, funcFail) {
                const that = this;
                this.searching = false;
                const pm = param;
                const dt = pm.data;
                this.$axios.post(APIList.DELETE_ORG_LEVEL, {
                    orgId: dt.id,
                }).then((response) => {
                    if (response.code === 200 && funcSuccess) {
                        funcSuccess();
                        if (pm.parent) {
                            if (pm.parent.subs) {
                                pm.parent.subs.splice(pm.idx, 1);
                                if (pm.parent.subs.length === 0) {
                                    pm.parent.hasNoSub = true;
                                }
                            }
                        } else {
                            that.tableData.splice(pm.idx, 1);
                        }
                        if (that.tableData.length === 0) {
                            that.deptPicker.clearData();
                        }
                        that.checkData();
                        // that.unitSearchForm.getData(that.orgTypeId);
                    } else if (funcFail) {
                        if (response.data) {
                            funcFail(response.data.msg);
                        } else {
                            funcFail(response.msg);
                        }
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            showDialog() {
                this.dialogVisible = true;
            },
            back() {
                this.$router.push({
                    name: 'unit-management-list',
                    query: {
                        type_id: this.orgTypeId,
                    },
                    hash: `#${this.unitType}`,
                });
                // window.history.back();
            },
            close() {
                this.dialogVisible = false;
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
                this.needLevelName = false;
                this.showLevelName = false;
                this.editOrgForm.scope = '在同级增加';

                this.resetForm('editOrgForm');
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            itemChanged(dt) {
                if (dt) {
                    this.curOrgId = dt.level.id;
                    this.searchDisabled = false;
                } else {
                    this.curOrgId = '';
                }
            },
            handlerLoad(that) {
                this.deptPicker = that;  // 组织选择器对象引用
            },
            submitForm(formName) {
                const that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        this.cancelDisabled = true;
                        this.resetDisabled = true;

                        if (that.editting) {
                            this.$axios({
                                method: 'post',
                                url: APIList.UPDATE_ORG_LEVEL,
                                data: {
                                    id: that.editOrgForm.id,
                                    orgName: that.editOrgForm.orgName,
                                    sequence: that.editOrgForm.sequence,
                                },
                            }).then((response) => {
                                if (response.code === 200) {
                                    that.curOrg.orgName = that.editOrgForm.orgName;
                                    that.curOrg.sequence = that.editOrgForm.sequence;
                                    that.checkData();
                                    that.$message({
                                        type: 'success',
                                        message: '编辑成功!',
                                    });
                                    that.editOrgForm.scope = '在同级增加';
                                    that.close();
                                } else {
                                    that.isLoading = false;
                                    that.cancelDisabled = false;
                                    if (response.data) {
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
                                }
                            }).catch((response) => {
                                that.isLoading = false;
                                that.cancelDisabled = false;
                                console.error(response);
                            });
                        } else {
                            let levelName = '';
                            const params = {
                                orgName: that.editOrgForm.orgName,
                                orgTypeId: that.orgTypeId,
                                parentOrgId: that.curParentId,
                                sequence: that.editOrgForm.sequence,
                            };
                            if (that.showLevelName || that.tableData.length === 0) {
                                levelName = that.editOrgForm.levelName;
                                params.levelName = levelName;
                            } else if (!that.showLevelName) {
                                levelName = that.curOrg.levelName;
                            } else if (that.subLevelName) {
                                levelName = that.subLevelName;
                            }
                            this.$axios.post(APIList.ADD_ORG_LEVEL, params).then((response) => {
                                if (response.code === 200) {
                                    that.$message({
                                        type: 'success',
                                        message: '增加成功!',
                                    });
                                    that.editOrgForm.scope = '在同级增加';
                                    const thisId = response.data && response.data.id;
                                    const levelId = response.data && response.data.levelId;
                                    const orgData = {
                                        id: thisId || '',
                                        parentOrgId: that.curParentId,
                                        orgTypeId: that.orgTypeId,
                                        orgName: that.editOrgForm.orgName,
                                        sequence: that.editOrgForm.sequence,
                                        hasNoSub: true,
                                        loaded: true,
                                        unfolded: true,
                                        levelId,
                                        levelName,
                                    };
                                    if (that.needLevelName) {
                                        if (that.curOrg.subs) {
                                            that.curOrg.subs.push(orgData);
                                        } else if (that.curOrg.unfolded) {
                                            that.curOrg.hasNoSub = false;
                                            that.curOrg.subs = [orgData];
                                        } else {
                                            that.curOrg.hasNoSub = false;
                                            that.expand(that.curOrg);
                                        }
                                        // that.checkData();
                                    } else if (that.curCellection) {
                                        that.curCellection.push(orgData);
                                    }
                                    if (that.tableData.length === 1) {
                                        that.deptPicker.setOrgTypeId(that.orgTypeId);
                                    }
                                    that.checkData();
                                    that.close();
                                } else {
                                    that.isLoading = false;
                                    that.cancelDisabled = false;
                                    if (response.data) {
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
                                }
                            }).catch((response) => {
                                that.isLoading = false;
                                that.cancelDisabled = false;
                                console.error(response);
                            });
                        }
                    } else {
                        // console.error('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
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
                    this.resetForm('fileUploadForm');
                    this.dialogVisible2 = false;
                }

                return isXCFile && isLt10M;
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
                    this.resetForm('fileUploadForm');
                    this.dialogVisible2 = false;
                    this.fileList = [];
                    this.$message.success('导入成功！');
                    this.tables.getData();
                }
            },
            downTemplate() {
                const that = this;
                // 导出到文件
                that.$axios.get(`/organization/downloadDesignateOrg?orgTypeId=${this.orgTypeId}`, {
                    responseType: 'blob',
                }).then((response) => {
                    if (response.status === 200) {
                        that.doExport(response.data);
                    } else if (response.msg || response.data.msg) {
                        that.$message({
                            type: 'error',
                            message: response.msg || response.data.msg,
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
                    downloadLink.setAttribute('download', '组织模板.xls');
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            },
        },
    };

</script>

<style lang="scss" type="text/scss">

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

    $border_style: 1px solid #999;

    .unit-lv-0, .unit-lv-1, .unit-lv-2, .unit-lv-3, .unit-lv-4, .unit-lv-5 {

        &::before {
            display: none;
        }

        .el-table__expanded-cell {
            padding: 0 0 0 40px !important;
            border: none !important;
        }

        table {

            td {
                padding: 4px 0;
                border-top: $border_style;
                border-bottom: $border_style;
                background-color: #fefefe;
            }

            tr {
                td:first-child {
                    border-left: $border_style;
                }
                td:last-child {
                    border-right: $border_style;
                }

                &:hover {
                    background-color: #fefefe !important;
                }
            }

            tfoot {
                display: none;
            }
        }

        .el-table__body {
            tr:nth-of-type(even) {
                td {
                    background-color: inherit;
                }
            }
        }
    }
    .unit-lv-1 {
        .el-button--text {
            font-size: 14px;
        }
    }


    .unit-list-head, .unit-level-body {
        .unit-expand {
            width: 42px;
            height: 34px;
        }
        .unit-name {
            padding-left: 5px;
            text-align: left;
        }
        .unit-lv {
            width: 200px;
            text-align: center;
        }
        .unit-num {
            width: 140px;
            text-align: center;
        }
        .unit-opr {
            width: 120px;
            text-align: center;
        }
    }
    .unit-list-head {
        display: table;
        width: 100%;
        line-height: 40px;
        background-color: #E5E5E5;

        strong {
            display: table-cell;
            font-weight: normal;
        }
    }
    .unit-level-body {
        .unit-expand {
            background-color: #e7e7e7;
            cursor: pointer;
        }
    }
    .unit-level-body {
        strong {
            position: relative;
            display: table-cell;
            border-top: 1px solid #999;
            border-bottom: 1px solid #999;
            background-color: #fafafa;
            font-weight: normal;
            font-size: 13px;

            button {
                font-size: 13px;
            }
        }
        .unit-opr {
            button{
                &:last-child {
                    color:#ff4a01;
                }
            }
        }
    }
    .unit-list-wrap {
        display: table;
        width: 100%;
        height: 42px;
        line-height: 42px;

        & > .unit-level {
            display: table;
            width: 100%;
        }
        strong:first-child {
            width: 42px;
            border: none;

            button {
                position: absolute;
                width: 42px;
                height: 44px;
                cursor: pointer;
                border: {
                    top: 1px solid #999;
                    right: none;
                    bottom: 1px solid #999;
                    left: 1px solid #999;
                    radius: 0;
                };
                background-color: transparent;
                text-align: center;

                &:before {
                    display: none;
                }
                i {
                    margin-left: -8px;
                    font-size: 18px;
                }
            }
        }
        strong:last-child {
            border-right: 1px solid #999;
        }
    }
    .unit-level-2 {
        strong:first-child {
            padding-left: 44px;
        }
    }
    .unit-level-3 {
        strong:first-child {
            padding-left: 88px;
        }
    }
    .unit-level-4 {
        strong:first-child {
            padding-left: 132px;
        }
    }
    .unit-level-5 {
        strong:first-child {
            padding-left: 180px;
        }
    }
    .unit-level {
        margin-top: 5px;
    }

</style>
