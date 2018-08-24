<template lang="pug">
    .spe-wrap
        .cnt-header(style="background-color:#fff;border:none;")
            el-button(@click.prevent="back()", round, size="small", type="text", style="margin-left:20px;")
                i(class="el-icon-back", style="font-size: 16px;") 返 回
            strong(style="font-size:16px;margin-left:15px;font-weight:normal;color:#333;") 专业管理
        .cnt-wrapper
            div
                el-form(ref="roleForm", label-width="40px", size="small", style="width: 100%;")
                    el-form-item(label="", style="display:inline-block; width:60%;")
                        el-button(@click.prevent="dialogVisible=true", round, size="mini", type="primary", style="margin-left:-40px;") 添加专业
                    el-form-item(label="筛选", style="display:inline-block; width:40%;")
                        el-input(v-model="speName", auto-complete="off", placeholder="专业名称", style="width:79%;")
                        el-button(@click.prevent="search", round, size="mini", type="primary", style="width:65px;margin-left:10px;") 查 询
            div
                .unit-list-head
                    // strong.unit-name 专业ID
                    // strong.unit-lv 专业ID
                    strong.unit-num 专业名称
                    strong.unit-opr 操作
                .unit-level-body
                    .unit-level(v-if="!tableData.length", style="text-align:center;")
                        .unit-list-wrap
                            span(style="font-size: 14px;color:#999;margin-right:20px;") 暂无数据！
                    .unit-level(v-if="tableData.length !== 0 && !dt.hidden", v-for="(dt, idx) in tableData", :key="idx")
                        .unit-list-wrap
                            // strong.unit-name {{dt_1.orgName}}
                            // strong.unit-lv {{dt_1.levelName}}
                            strong.unit-num(v-if="dt.editable")
                                el-form(ref="newSpeForm", :model="dt", status-icon, :rules="rulesSpeForm", label-width="0px")
                                    el-form-item(label="", prop="speName")
                                        el-input(v-model="dt.speName", auto-complete="off", placeholder="专业名称", size="mini", style="width:200px;")
                            strong.unit-num(v-if="!dt.editable") {{dt.speName}}
                            strong.unit-opr(v-if="!dt.editable")
                                el-button(type="text", @click="handleEdit(idx)") 编辑
                                el-button(type="text", @click="handleDelete(idx)") 删除
                            strong.unit-opr(v-if="dt.editable")
                                el-button(type="text", @click="handleConfirm(idx)", :disabled="invalid") 确定
                                el-button(type="text", @click="handleCancel(idx)") 取消

            el-dialog(
            title="新增专业",
            :visible.sync="dialogVisible"
            custom-class="structure-management",
            width="500px",
            padding="20px 40px",
            @close="close")
                el-form(
                :model="editSpeForm", status-icon, :rules="rulesSpeForm", ref="editSpeForm", label-width="120px", size="small")
                    el-form-item(label="专业名称", prop="speName")
                        el-input(v-model="editSpeForm.speName", auto-complete="off", placeholder="输入专业名称", style="width:84%;")
                span(slot="footer", class="dialog-footer")
                    el-button(
                        :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                        @click="dialogVisible = false") 取 消
                    el-button(
                        type="primary",
                        :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                        :loading="isLoading",
                        @click="submitForm('editSpeForm')") 确 定
</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;
            const checkValue = (rule, value, callback) => {
                if (!value) {
                    that.invalid = true;
                    callback(new Error('请输入专业名称！'));
                } else if (!/^[a-zA-Z0-9\u4e00-\u9fa5/_-]+$/g.test(`${value}`)) {
                    that.invalid = true;
                    callback(new Error('只能包含中文、字母、数字、/(斜杠)、-(中划线)、_(下划线)！'));
                } else if (`${value}`.length > 20) {
                    that.invalid = true;
                    callback(new Error('长度不能超过20个字符！'));
                }  else {
                    setTimeout(() => {
                        that.invalid = false;
                        callback();
                    }, 50);
                }
            };
            return {
                tableData: [],
                editting: false,
                searchDisabled: true,
                levelIptDisabled: false,
                invalid: false,
                editSpeForm: {
                    id: '',
                    speName: '',
                },
                rulesSpeForm: {
                    speName: [
                        { validator: checkValue, required: true, trigger: 'blur' },
                    ],
                    dt: {
                        speName: [
                            { validator: checkValue, required: true, trigger: 'blur' },
                        ],
                    },
                },
                searching: false,
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                dTtl: '新增组织',
                ttl: '',
                speName: '',
                subLevelName: '',
                subLevel: {},
                dialogVisible: false,
                dialogVisible2: false,
                currentIndex: '',
                visible: '',
                tables: {
                    hasNoData: false,
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    getData() {
                        const dt = that.$qs.stringify({
                            pageNum: 1,
                            pageSize: 10000,
                        });
                        that.$axios.get(`${APIList.SPECIALITY_QUERY}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            if (response.data && response.data.rows) {
                                that.tableData = [];
                                response.data.rows.map(v => {
                                    that.tableData.push({
                                        id: v.id,
                                        speName: v.name,
                                    });
                                });
                                // that.tableData = response.data.rows;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
            };
        },
        components: {},
        created() {
            this.init();
        },
        mounted() {
        },
        methods: {
            init() {
                this.tables.getData();
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
            search() {
                const that = this;
                const params = {
                    pageNum: 1,
                    pageSize: 10000,
                };
                if (/\S/g.test(that.speName)) {
                    params.nameFuzzy = that.speName;
                }
                const dt = that.$qs.stringify(params);
                that.$axios.get(`${APIList.SPECIALITY_QUERY}?${dt}`, {
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
            },
            handleEdit(idx) {
                if (typeof this.currentIndex === 'number') {
                    this.handleCancel(this.currentIndex);
                }
                this.lastValue = this.tableData[idx].speName;
                this.tableData[idx].editable = true;
                this.currentIndex = idx;
                this.checkData();
            },
            handleConfirm(idx) {
                const that = this;
                this.$axios({
                    method: 'post',
                    url: APIList.SPECIALITY_CATEGORY_UPDATE,
                    data: {
                        id: that.tableData[this.currentIndex].id,
                        name: that.tableData[this.currentIndex].speName,
                    },
                }).then((response) => {
                    if (response.code === 200) {
                        that.$message({
                            type: 'success',
                            message: '编辑成功!',
                        });
                        that.tableData[idx].editable = false;
                        that.checkData();
                    }
                }).catch((response) => {
                    that.isLoading = false;
                    that.cancelDisabled = false;
                    console.error(response);
                });
            },
            handleCancel(idx) {
                this.tableData[idx].editable = false;
                this.tableData[idx].speName = this.lastValue;
                this.checkData();
            },
            handleDelete(idx) {
                this.insureDoDelete(idx);
            },
            insureDoDelete(idx) {
                this.$confirm('确定删除吗?', '删除提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    this.currentIndex = idx;
                    this.doDelete(this.tableData[idx].id, () => {
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
            },
            doDelete(id, funcSuccess, funcFail) {
                const that = this;
                this.$axios.post(APIList.SPECIALITY_CATEGORY_DEL, {
                    id,
                }).then((response) => {
                    if (response.code === 200 && funcSuccess) {
                        funcSuccess();
                        that.tableData.splice(this.currentIndex, 1);
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
                    name: 'category-management-list',
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

                this.resetForm('editSpeForm');
            },
            submitForm(formName) {
                const that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        this.cancelDisabled = true;
                        this.resetDisabled = true;
                        const params = {
                            name: that.editSpeForm.speName,
                        };
                        this.$axios.post(APIList.SPECIALITY_ADD, params).then((response) => {
                            if (response.code === 200) {
                                that.$message({
                                    type: 'success',
                                    message: '增加成功!',
                                });
                                const thisId = response.data && response.data.id;
                                const orgData = {
                                    id: thisId || '',
                                    speName: that.editSpeForm.speName,
                                };
                                that.tableData.push(orgData);
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
        },
    };

</script>

<style lang="scss" type="text/scss">
.spe-wrap {
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
            }
        ;
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
        .unit-name {
            padding-left: 5px;
            text-align: left;
        }
        .unit-lv {
            width: 200px;
            text-align: center;
        }
        .unit-num {
            width: 75%;
            padding-left: 80px;
            // text-align: center;
        }
        .unit-opr {
            width: 25%;
            text-align: center;
        }
    }
    .unit-list-head {
        display: table;
        width: 100%;
        line-height: 40px;
        background-color: #E5E5E5;
        border: {
            bottom: 1px solid #999;
        }
    ;

        strong {
            display: table-cell;
            font-weight: normal;
        }
    }
    .unit-level-body {
        strong {
            position: relative;
            display: table-cell;
            border-bottom: 1px solid #ccc;
            background-color: #fafafa;
            font-weight: normal;
            font-size: 13px;

            button {
                font-size: 13px;
            }
        }
        .unit-opr {
            button {
                &:last-child {
                    color: #ff4a01;
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
        .el-form-item {
            margin-bottom: 0;
        }
    }
    .unit-level-body {
        .el-form-item__error {
            width: 340px;
            top: 12px;
            left: 32%;
        }
    }
}
</style>
