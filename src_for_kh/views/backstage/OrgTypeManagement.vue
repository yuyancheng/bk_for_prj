<template lang="pug">
    .org-type-mg
        .cnt-header
            h3 收发单位管理
        .cnt-header(style="background-color:#fff;border:none;")
            el-button(@click.prevent="back", round, size="small", type="text", style="margin-left:20px;")
                i(class="el-icon-back", style="font-size: 16px;") 返 回
            strong(style="font-size:16px;margin-left:15px;font-weight:normal;color:#333;") 组织类型管理
        .cnt-wrapper
            div(style="width:70%;margin:0 auto;")
                el-row(class="unit-list-head")
                    el-col(:span="10")
                        strong.unit-name 组织类型
                    el-col(:span="4", :offset="10")
                        strong.unit-opr 操作

                .unit-level-body(v-if="unitTypeList.default.length === 0 && !hasNewOne", style="font-size:13px;height:51px;line-height:46px;text-align:center;") 暂无数据！
                .unit-level-body(v-if="unitTypeList.default.length !== 0 || hasNewOne")
                    el-row(v-for="(dt, idx) in unitTypeList.default", :key="idx", v-if="dt.id !== '-1'", class="unit-list-wrap")
                        el-col(:span="20")
                            strong.unit-name(v-if="!dt.editable") {{dt.orgTypeName}}
                            strong.unit-name(v-if="dt.editable")
                                el-form(ref="newUnitTypeForm", :model="dt", status-icon, :rules="ruleNewUnitType", label-width="0px")
                                    el-form-item(label="", prop="orgTypeName")
                                        el-input(v-model="dt.orgTypeName", size="small", spellcheck="false")
                        el-col(:span="4")
                            strong.unit-opr(v-if="!dt.editable")
                                el-button(type="text", @click="handleEdit(idx)") 编辑
                                el-button(type="text", @click="handleDelete(idx)") 删除
                            strong.unit-opr(v-if="dt.editable")
                                el-button(type="text", @click="handleConfirm(idx)") 确定
                                el-button(type="text", @click="handleCancel(idx)") 取消

                    el-row(class="unit-list-wrap", v-if="hasNewOne")
                        el-col(:span="20")
                            strong.unit-name
                                el-form(ref="newUnitTypeForm", :model="newUnitType", status-icon, :rules="ruleNewUnitType", label-width="0px")
                                    el-form-item(label="", prop="orgTypeName")
                                        el-input(v-model="newUnitType.orgTypeName", size="small", spellcheck="false", autofocus)
                        el-col(:span="4")
                            strong.unit-opr()
                                el-button(type="text", @click="handleConfirm()") 确定
                                el-button(type="text", @click="handleCancel()") 取消

                div(style="margin-top:10px;")
                    el-button(type="primary", :disabled="hasNewOne", @click="addOrgType()", round) 新增组织类型

</template>

<script type="text/ecmascript-6">
    import area from '@/assets/js/area';
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;
            const checkName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入组织名称！'));
                } else if (!/^[a-zA-Z0-9\u4e00-\u9fa5/_-]+$/g.test(value)) {
                    callback(new Error('只能包含中文、字母、数字、/(斜杠)、-(中划线)、_(下划线)！'));
                } else if (value.length > 20) {
                    callback(new Error('名称长度不能超过20个字符！'));
                } else {
                    setTimeout(() => {
                        callback();
                    }, 50);
                }
            };
            return {
                isNotSpe: true,
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                dTtl: '新增组织',
                ttl: '',
                lastValue: '',
                dialogVisible: false,
                hasNewOne: false,
                editting: false,
                ruleNewUnitType: {
                    dt: {
                        orgTypeName: [
                            { validator: checkName, required: true, trigger: 'blur' },
                        ],
                    },
                    orgTypeName: [
                        { validator: checkName, required: true, trigger: 'blur' },
                    ],
                },
                newUnitType: '',
                visible: '',
                unitTypeList: {
                    default: [],
                    getData() {
                        that.$axios.get(APIList.GET_UNIT_TYPE, {
                            data: {},
                        }).then((response) => {
                            that.unitTypeList.default = (response.data && response.data.rows) || [];
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
            };
        },
        components: {},
        created() {
            this.provinces = area.province;
            this.cities = area.city;
            this.districts = area.district;

            // this.unitType = this.$router.history.current.query.unit || '';
            this.unitType = decodeURIComponent(this.$router.history.current.hash.substring(1)) || '';
            this.init();
        },
        mounted() {},
        watch: {
            unitTypeList: {
                handler(nVal, oVal) {
                    if (nVal !== oVal) {
                        return true;
                    }
                    return false;
                },
                immediate: true,
                deep: true,
            },
        },
        methods: {
            init() {
                this.unitTypeList.getData();
                // console.log(this.$store.state.global.unitTypeList);
            },
            addOrgType() {
                if (this.editting) {
                    this.$message({
                        type: 'warning',
                        message: '请完成当前编辑！',
                    });
                } else if (!this.hasNewOne) {
                    this.hasNewOne = true;
                    this.newUnitType = {
                        orgTypeName: '',
                    };
                }
            },
            handleConfirm(idx) {
                const that = this;
                const form = this.$refs.newUnitTypeForm[0] || this.$refs.newUnitTypeForm;
                form.validate((valid) => {
                    if (valid) {
                        if (!/\S/.test(this.newUnitType.orgTypeName)) {
                            this.$message({
                                type: 'warning',
                                message: '请输入组织名称！',
                            });
                        } else if (idx === undefined) {
                            this.$axios.post(APIList.ADD_UNIT_TYPE, {
                                orgTypeName: this.newUnitType.orgTypeName,
                            }).then((response) => {
                                if (response.code === 200) {
                                    that.newUnitType.id = response.data.id;
                                    that.unitTypeList.default.push(that.newUnitType);
                                    that.newUnitType = '';
                                    that.hasNewOne = false;
                                    this.$message({
                                        type: 'success',
                                        message: '添加成功！',
                                    });
                                } else if (response.data) {
                                    this.$message({
                                        type: 'error',
                                        message: response.data.msg,
                                    });
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: response.msg,
                                    });
                                }
                            }).catch((response) => {
                                console.error(response);
                            });
                        } else {
                            // 保存修改
                            this.$axios.post(APIList.UPDATE_UNIT_TYPE, {
                                id: that.unitTypeList.default[idx].id,
                                orgTypeName: that.unitTypeList.default[idx].orgTypeName,
                            }).then((response) => {
                                if (response.code === 200) {
                                    that.hasNewOne = false;
                                    that.editting = false;
                                    that.unitTypeList.default[idx].editable = false;
                                    that.checkData(that.unitTypeList.default);
                                    this.$message({
                                        type: 'success',
                                        message: '修改成功！',
                                    });
                                } else if (response.data) {
                                    this.$message({
                                        type: 'error',
                                        message: response.data.msg,
                                    });
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: response.msg,
                                    });
                                }
                            }).catch((response) => {
                                console.error(response);
                            });
                        }
                    } else {
                        return false;
                    }
                    return true;
                });
            },
            // 一种触发数据检测的方式，不推荐！
            checkData(dt) {
                const len = dt.length;
                if (dt[len - 1].id !== '-1') {
                    dt.push({
                        id: '-1',
                    });
                } else {
                    dt.pop();
                }
            },
            handleEdit(idx) {
                const unit = this.unitTypeList.default[idx];
                this.lastValue = unit.orgTypeName;
                if (this.hasNewOne || this.editting) {
                    this.$message({
                        type: 'warning',
                        message: '请完成当前编辑！',
                    });
                } else if (!unit.editable) {
                    unit.editable = true;
                    unit.autoFocus = true;
                    this.editting = true;
                    this.checkData(this.unitTypeList.default);
                }
            },
            handleDelete(idx) {
                if (idx !== undefined) {
                    this.insureDoDelete(idx);
                }
            },
            handleCancel(idx) {
                const dt = this.unitTypeList.default;
                if (idx !== undefined) {
                    dt[idx].editable = false;
                    dt[idx].autoFocus = false;
                    dt[idx].orgTypeName = this.lastValue;
                    this.editting = false;

                    this.checkData(dt);
                } else {
                    this.newUnitType = '';
                    this.hasNewOne = false;
                }
            },
            insureDoDelete(idx) {
                if (idx !== undefined) {
                    this.$confirm('确定删除吗?', '删除提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        this.doDelete(idx, () => {
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
            doDelete(idx, funcSuccess, funcFail) {
                const that = this;
                this.$axios.post(APIList.DELETE_ORG_TYPE, {
                    id: this.unitTypeList.default[idx].id,
                }).then((response) => {
                    if (response.code === 200) {
                        that.unitTypeList.default.splice(idx, 1);
                        that.newUnitType = '';
                        that.hasNewOne = false;
                        if (funcSuccess) {
                            funcSuccess();
                        }
                    } else if (funcFail && response.msg) {
                        funcFail(response.msg);
                    } else if (funcFail && response.data) {
                        funcFail(response.data.msg);
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            showDialog(type, ttl) {
                this.ttl = ttl;
                this.dialogVisible = true;

                this.visible = type;
                if (type === 'addUser') {
                    this.dTtl = ttl;
                } else {
                    this.dTtl = ttl;
                }
            },
            back() {
                this.$router.push({
                    name: 'unit-management-list',
                });
                // this.$router.go(-1);
            },
            close() {
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            submitForm(formName) {
                const that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        this.cancelDisabled = true;
                        this.resetDisabled = true;
                    } else {
                        // console.log('error submit!!');
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
    .org-type-mg {
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

        $border_style: 1px solid #999;

        .unit-list-head, .unit-level-body {
            .unit-name {
                text-align: left;
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
                padding-left: 20px;
                font-weight: normal;
            }
        }
        .unit-level-body {

        }
        .unit-list-wrap {
            margin-top: 5px;
            display: table;
            width: 100%;
            height: 46px;
            line-height: 43px;
            border: $border_style;
            background-color: #fafafa;

            strong {
                display: table-cell;
                padding-left: 20px;
                font-weight: normal;
                font-size: 13px;

                button {
                    font-size: 13px;
                    &:nth-child(2) {
                        color: #ff4a01;
                    }
                }
            }
        }
        .el-button.is-round {
            padding: 9px 23px;
        }
        .el-form-item__error {
            width: 340px;
            top: 14px;
            left: 105%;
        }
        .el-form-item {
            margin-bottom: 0;
        }
    }
</style>
