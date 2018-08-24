<template lang="pug">
    div
        .cnt-header
            h3 用户管理
        .cnt-wrapper(v-if="isAdmin")
            div
                .opr-btns
                    el-button(@click.prevent="handleAdd", round, size="mini", type="primary") 新增用户
                    el-button(@click.prevent="showDialog('import', '批量导入用户')", round, size="mini", type="primary") 批量导入
                    el-button(@click.prevent="deleteInBatch", round, size="mini", type="primary") 批量删除
                    el-button(@click.prevent="exportInBatch", round, size="mini", type="primary") 导 出
                div(style="float:right;")
                    el-form(ref="userSearchForm", label-width="50px", size="small")
                        el-form-item(label="筛选", style="text-align: right;")
                            el-select(
                            v-model="userSearchForm.curRoleId", placeholder="选择类型", style="width:160px;margin-right:10px;")
                                el-option(label="请选择", value="")
                                el-option(v-for="(it, idx) in unitTypeList.default", :key="idx", :label="it.orgTypeName", :value="it.id")
                            el-input(v-model="userSearchForm.keyword", auto-complete="on", @keyup.native.13="search", placeholder="用户名 / 姓名", style="width:160px;")
                            el-button(@click.prevent="search", round, size="mini", type="primary", style="width:60px;margin-left:10px;") 搜索
            div
                el-table(
                :data="tableData",
                tooltip-effect="dark"
                style="width: 100%",
                size="medium",
                @selection-change="handleSelectionChange")
                    el-table-column(type="selection", width="50")
                    el-table-column(prop="username", label="用户名", width="120")
                    el-table-column(prop="nickname", label="姓名", width="120")
                    el-table-column(prop="mobilePhone", label="手机号码", width="120")
                    el-table-column(prop="orgTypeName", label="组织类型", width="110")
                    el-table-column(prop="deptPurview", label="用户角色", width="90")
                        template(slot-scope="scope")
                            span {{scope.row.deptPurview === 1 ? '普通用户' : '管理员'}}
                    el-table-column(prop="deptName", label="单位名称")
                    el-table-column(label="操作", width="190")
                        template(slot-scope="scope")
                            el-button(
                            v-if="!scope.row.status",
                            style="color:#008400;font-size:13px;",
                            type="text",
                            @click="setStatus(scope.$index, scope.row)") 启用
                            el-button(
                            v-if="scope.row.status",
                            style="color:#ff6600;font-size:13px;",
                            type="text",
                            @click="setStatus(scope.$index, scope.row)") 停用
                            el-button(
                            style="font-size:13px;",
                            type="text",
                            @click="handleEdit(scope.$index, scope.row)") 编辑
                            el-button(
                            style="color:#ff4a01;font-size:13px;",
                            type="text",
                            @click="handleDelete(scope.$index, scope.row)") 删除
                            el-button(
                            style="font-size:13px;",
                            type="text",
                            @click="resetPWD(scope.$index, scope.row)") 重置密码
                el-pagination(
                style="margin-top:5px;text-align:right;",
                @size-change="handleSizeChange",
                @current-change="handleCurrentChange",
                :current-page="tables.userList.result.pageNum",
                :page-sizes=[10, 20, 30, 40, 50, 100],
                :page-size=10,
                background,
                layout="total, sizes, prev, pager, next, jumper",
                :total="tables.userList.result.total")

            el-dialog(
            ref="multipleTable",
            :title="dTtl",
            :visible.sync="dialogVisible1"
            width="600px",
            padding="20px 40px",
            @close="close")
                el-form(ref="fileUploadForm", v-if="visible==='import'", :model="fileUpload", status-icon, :rules="ruleFileUpload", label-width="120px")
                    el-form-item(label="组织类型", prop="userType", style="width:90%;")
                        el-radio-group(v-model="addUserForm.userType")
                            el-radio(v-for="(item, idx) in unitTypeList.default",
                            :key="idx", :label="item.orgTypeName", @change="handleRadio(item.orgTypeName, item.id)")
                    el-form-item(label="导入用户数据", prop="fileList", style="width:90%;")
                        el-upload(
                            class="upload-demo",
                            :action="importURL || `/user/mg/import?orgTypeId=${orgTypeId}`",
                            :on-change="handleChange",
                            :on-success="success",
                            :file-list="fileList",
                            :before-upload="beforeAvatarUpload")
                            el-button(size="mini", type="primary", round) 点击上传
                            div(slot="tip", class="el-upload__tip", style="line-height:20px;") 只能上传xlsx/xls，且不超过10Mb.
                                a(:href="`/user/mg/template?orgTypeId=${orgTypeId}`", target="_blank", style="margin-left:20px;color:blue") 下载模板文件

            el-dialog(
            ref="multipleTable",
            :title="dTtl",
            :visible.sync="dialogVisible2"
            width="700px",
            padding="20px 40px",
            @close="close")
                el-form(
                :model="addUserForm", v-if="visible==='addUser' || visible==='editUser'", status-icon,
                :rules="rulesUserInfo", ref="addUserForm", label-width="90px", size="small")
                    el-form-item(label="用户名", prop="userName")
                        el-input(v-model="addUserForm.userName", auto-complete="off", placeholder="输入用户名", :disabled="visible==='editUser'", style="width:94%;")
                        div(v-if="visible!=='editUser'", style="line-height:22px;color:#999;font-size:12px;") 用户名必须为4~20位字符，其中可包含数字、字母、连接符( - )及下划线( _ )
                    el-form-item(label="组织类型", prop="userType")
                        el-radio-group(v-model="addUserForm.userType")
                            el-radio(v-for="(item, idx) in unitTypeList.default",
                            :key="idx", :label="item.orgTypeName", @change="handleRadio(item.orgTypeName, item.id)")
                    el-form-item(label="单位所属", prop="curLevelId")
                        dept-picker(
                        v-model="currentUserInfo",
                        :showOrgTypes="false",
                        :showDeptOptions="false",
                        :loaded="handlerLoad",
                        :change="itemChanged",
                        :rowSize=3,
                        :config="{width:'94.3%',itemWidth:'45%'}",
                        ref="deptPicker")
                    el-form-item(label="单位名称", prop="dept")
                        el-select(v-model="addUserForm.dept", placeholder="选择单位名称", style="width:94%;")
                            el-option(v-for="(it, idx) in departments.list", :key="idx", :label="it.deptName", :value="it.id")
                        div(style="line-height:22px;color:#999;font-size:12px;") 修改后，会同时清空该用户在“态势”大屏中的配置数据
                    el-form-item(label="用户角色", prop="resource")
                        el-radio-group(v-model="addUserForm.userAuth")
                            // el-radio(v-for="(item, idx) in userRoleList.list", :key="idx", :label="item.name")
                            el-radio(label="普通用户")
                            el-radio(label="管理员")
                        div(v-if="visible==='editUser'", style="line-height:22px;color:#999;font-size:12px;") 修改后，会同时清空该用户在“态势”大屏中的配置数据

                span(slot="footer", class="dialog-footer")
                    el-button(
                    :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                    @click="dialogVisible2 = false") 取 消
                    el-button(
                    type="primary",
                    :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                    :loading="isLoading",
                    @click="submitForm(formName)") 确 定
</template>

<script type="text/ecmascript-6">
    import Distpicker from '@/components/common/distpicker/DistPicker';
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;
            const checkName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入用户名！'));
                } else if (!/^[0-9A-Za-z_\\-]{4,20}$/.test(value)) {
                    callback(new Error('用户名格式有误！'));
                } else {
                    callback();
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
                isAdmin: false,
                userInfo: {
                    userName: '',
                    userId: '',
                },
                currentUserInfo: {},
                addUserForm: {
                    userName: '',
                    userType: '',
                    curLevelId: '',
                    dept: '',
                    userAuth: '普通用户',
                },
                userRoleList: {
                    list: [],
                    getData() {
                        that.$axios.get(APIList.USER_ROLE_LIST, {
                            data: {},
                        }).then((response) => {
                            if (response.code === 200 && response.data && response.data.length) {
                                for (let i = 0; i < response.data.length; i += 1) {
                                    that.userRoleList.list.push({
                                        id: response.data[i].id,
                                        name: response.data[i].roleName,
                                        code: response.data[i].roleCode,
                                    });
                                }
                                that.addUserForm.userAuth = that.userRoleList.list[0].name;
                            } else {
                                that.$message({
                                    message: response.msg,
                                    type: 'error',
                                });
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                userSearchForm: {
                    roleType: '',
                    curRoleId: '',
                    keyword: '',
                    getData() {
                        const dt = that.$qs.stringify({
                            userId: that.userInfo.id,
                        });
                        that.$axios.get(`${APIList.GET_USER_ROLE}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            const data = response.data;
                            if (data) {
                                that.userSearchForm.userFilters[0] = [data];
                                that.tables.userList.getData(1, that.tables.userList.result.pageSize);
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                rulesUserInfo: {
                    userName: [
                        { validator: checkName, required: true, trigger: 'blur' },
                    ],
                    curLevelId: [
                        { required: true, message: '请选择单位所属！', trigger: 'change' },
                    ],
                    dept: [
                        { required: true, message: '请选择单位名称！', trigger: 'change' },
                    ],
                },
                currentDeptName: '',
                currentDeptId: '',
                unitType: '',
                currentPage: 1,
                multipleSelection: [],
                tableData: [],
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                typeChanged: false,
                fileUpload: {
                    name: '',
                    telephone: '',
                    address: '',
                },
                dTtl: '新增用户',
                ttl: '',
                dialogVisible1: false,
                dialogVisible2: false,
                visible: '',
                importURL: '',
                unitTypeList: {
                    default: [],
                    getData() {
                        that.$axios.get(APIList.GET_UNIT_TYPE, {
                            data: {},
                        }).then((response) => {
                            that.unitTypeList.default = response.data.rows;
                            that.addUserForm.userType = that.unitTypeList.default[0].orgTypeName;
                            if (that.unitTypeList.default.length > 0) {
                                that.orgTypeId = that.unitTypeList.default[0].id;
                            }
                            // that.orgLevel.getData();
                            // that.departments.getData();
                            // that.orgLevelType.getData('', 0);   // 获取第一单位层级
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                orgLevel: {
                    list: [],
                    curOrgId: [],
                    getData() {
                        const orgTypeList = [];
                        const makeLists = (dt) => {
                            if (dt.subLevel && dt.subLevel.levelName) {
                                makeLists(dt.subLevel);
                            }
                            orgTypeList.push([]);
                            that.orgLevel.list = orgTypeList;
                        };
                        const dt = that.$qs.stringify({
                            orgTypeId: that.orgTypeId,
                        });

                        that.$axios.get(`${APIList.GET_ORG_LEVEL}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            const data = response.data;
                            if (data && data.levelName) {
                                that.orgFirstLevelId = data.id;
                                makeLists(data);
                                that.orgLevelType.getData('', 0);   // 获取第一单位层级
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                orgLevelType: {
                    levelTypes: [],
                    curOrgId: '',
                    keyword: '',
                    getData(id, idx) {
                        const setFilterList = (dt) => {
                            if (that.orgLevel.list[idx || 0]) {
                                const len = that.orgLevel.list[idx].length;
                                that.orgLevel.list[idx].splice(0, len);
                                for (let i = 0; i < dt.length; i += 1) {
                                    that.orgLevel.list[idx || 0].push({
                                        id: dt[i].id,
                                        name: dt[i].orgName,
                                        order: dt[i].sequence,
                                        parentId: dt[i].parentOrgId,
                                        orgTypeId: dt[i].orgTypeId,
                                    });
                                }
                            }
                        };
                        if (idx === 0) {
                            const param = that.$qs.stringify({
                                orgTypeId: that.orgTypeId,
                            });
                            that.$axios.get(`${APIList.GET_TOP_ORG_LEVEL}?${param}`, {
                                data: {},
                            }).then((response) => {
                                const dt = response.data;
                                if (dt.constructor === Array) {
                                    setFilterList(dt);
                                    // that.departments.getData();
                                }
                            }).catch((response) => {
                                console.error(response);
                            });
                        } else {
                            const param = that.$qs.stringify({
                                orgId: id,
                            });
                            that.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${param}`, {
                                data: {},
                            }).then((response) => {
                                const dt = response.data;
                                if (dt.constructor === Array) {
                                    setFilterList(dt);
                                }
                            }).catch((response) => {
                                console.error(response);
                            });
                        }
                    },
                },
                departments: {
                    list: [],
                    getData(id) {
                        const param = that.$qs.stringify({
                            pageSize: 10000,
                            pageNum: 1,
                            orgId: id,
                        });
                        that.$axios.get(`${APIList.GET_UNITS_BY_ORG}?${param}`, {
                            data: {},
                            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        }).then((response) => {
                            // resetUnitsData(response.data.rows);
                            that.departments.list = response.data.rows;
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                tables: {
                    userList: {
                        result: {
                            pageSize: 10,
                            pageNum: 1,
                            rows: [],
                        },
                        getData(idx, size) {
                            const dt = that.$qs.stringify({
                                pageSize: size || that.tables.userList.result.pageSize,
                                pageNum: idx,
                                orgTypeId: that.userSearchForm.curRoleId,
                                nickname: that.userSearchForm.keyword,
                            });
                            that.$axios.get(`${APIList.USER_MNG_LIST}?${dt}`, {
                                data: {},
                            }).then((response) => {
                                that.tableData = response.data.rows;
                                that.tables.userList.result = response.data;
                            }).catch((response) => {
                                console.error(response);
                            });
                        },
                    },
                },
                fileList: [],
                ruleFileUpload: {
                    fileList: [
                        { validator: checkFileName, required: true, trigger: 'change' },
                    ],
                },
            };
        },
        components: { Distpicker },
        created() {
            if (!this.$store.state.global.isAdmin) {
                this.isAdmin = false;
                this.$message('非管理员角色，不能访问此页！', {
                    confirmButtonText: '确定',
                    type: 'error',
                }).then(() => {
                });
            } else {
                this.isAdmin = true;
                if (localStorage) {
                    const userInfo = localStorage.getItem('user_info');
                    if (userInfo) {
                        this.userInfo = JSON.parse(userInfo);
                    }
                }
                this.init();
            }
        },
        mounted() {},
        methods: {
            init() {
                // this.userSearchForm.getData();
                this.tables.userList.getData(1);
                this.unitTypeList.getData();
                // this.userRoleList.getData();    // 获取用户角色列表
            },
            handleSizeChange(val) {
                this.tables.userList.getData(1, val);
            },
            handleCurrentChange(val) {
                this.tables.userList.getData(val);
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
            search() {
                this.tables.userList.getData(1, this.tables.userList.result.pageSize);
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
                console.log(val);
            },
            deleteInBatch() {
                if (this.multipleSelection.length === 0) {
                    this.$message({
                        message: '请选择要删除的数据！',
                        type: 'warning',
                    });
                } else {
                    const ids = [];
                    for (let i = 0; i < this.multipleSelection.length; i += 1) {
                        ids[i] = this.multipleSelection[i].id;
                    }
                    this.insureDoDelete(ids);
                }
            },
            setStatus(idx, row) {
                const that = this;
                if (row) {
                    this.$confirm(`确定要${row.status ? '停用' : '启用'}吗?`, '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        that.$axios.post(APIList.USER_SET_STATUS, {
                            userId: row.id,
                            status: (row.status + 1) % 2,
                        }).then((response) => {
                            if (response.code === 200) {
                                that.$message({
                                    message: `${row.status ? '已停用' : '已启用'}`,
                                    type: `${row.status ? 'error' : 'success'}`,
                                });
                                this.tables.userList.getData(1);
                            } else {
                                that.$message({
                                    message: response.msg,
                                    type: 'error',
                                });
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    }).catch(() => {});
                }
            },
            handleAdd() {
                const that = this;
                this.showDialog('addUser', '新增用户');
                if (this.deptPicker) {
                    this.deptPicker.clearData();
                    this.deptPicker.setOrgTypeId(this.orgTypeId);
                    this.deptPicker.setInitParams({
                        initOrg: false,
                    }, () => {
                        that.$refs.addUserForm.clearValidate();
                    });
                }
            },
            deptPickerInit(row) {
                const that = this;
                this.deptPicker.clearData();
                this.deptPicker.setOrgTypeId(this.orgTypeId);
                this.deptPicker.setInitParams({
                    dept: {
                        name: row.deptName,
                        id: row.deptId,
                    },
                    initOrg: true,
                }, () => {
                    if (!that.typeChanged) {
                        that.addUserForm.dept = row.deptId;
                    }
                    that.$refs.addUserForm.clearValidate();
                });
            },
            handleEdit(idx, row) {
                if (row) {
                    this.showDialog('editUser', '编辑用户信息');
                    this.addUserForm.userName = row.username;
                    this.addUserForm.id = row.id;
                    this.addUserForm.userType = row.orgTypeName;
                    this.addUserForm.dept = row.deptName;
                    this.addUserForm.userAuth = row.deptPurview === 1 ? '普通用户' : '管理员';

                    this.orgTypeId = row.orgTypeId;
                    this.currentDeptName = row.deptName;
                    this.currentDeptId = row.deptId;

                    this.curRow = row;
                    if (this.deptPicker) {
                        this.deptPickerInit(row);
                    }
                }
            },
            handleDelete(idx, row) {
                if (row) {
                    this.insureDoDelete([row.id]);
                }
            },
            resetPWD(idx, row) {
                if (row) {
                    this.$confirm('确定重置吗?', '重置密码', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        const that = this;
                        that.$axios.post(APIList.USER_RESET_PASSWORD, {
                            userId: row.id,
                            username: row.username,
                        }).then((response) => {
                            if (response.code === 200) {
                                this.$message({
                                    type: 'success',
                                    message: '已重置！',
                                });
                            } else if (response.msg || response.data) {
                                this.$message({
                                    type: 'error',
                                    message: response.msg || response.data.msg,
                                });
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    }).catch(() => {
                    });
                }
            },
            insureDoDelete(data) {
                if (data.length !== 0) {
                    this.$confirm('确定删除吗?', '删除提示', {
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
                that.$axios.post(APIList.USER_DELETE, data).then((response) => {
                    if (response.code === 200 && funcSuccess) {
                        funcSuccess();
                    }
                    that.tables.userList.getData(1, that.tables.userList.result.pageSize);
                }).catch((response) => {
                    if (funcFail) {
                        funcFail(response.msg);
                    }
                    console.error(response);
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
                // this.downloadURL = '/baseGoods/export';
                const downloadLink = document.createElement('a');
                const paramStr = `orgTypeId=${this.userSearchForm.curRoleId || ''}&nickname=${this.userSearchForm.keyword || ''}`;
                downloadLink.href = `/user/mg/export?${paramStr}`;
                downloadLink.target = '_blank';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            },
            changeTip() {
                this.$message({
                    message: '修改后，同时会清空该用户在态势大屏中的配置数据！',
                    type: 'warning',
                });
            },
            handleRadio(name, id) {
                if (id) {
                    this.orgTypeId = id;
                    this.importURL = `${APIList.USER_IMPORT}?orgTypeId=${id}`;
                    this.typeChanged = true;
                }
                if (this.visible === 'addUser' || this.visible === 'editUser') {
                    this.addUserForm.unitType = '';
                    this.addUserForm.curLevelId = '';
                    this.addUserForm.dept = '';

                    if (id) {
                        if (this.curRow && id === this.curRow.orgTypeId) {
                            this.typeChanged = false;
                            this.deptPickerInit(this.curRow);
                            // this.currentDeptId = this.curRow.deptId;
                        } else {
                            this.deptPicker.clearData();
                            this.deptPicker.setOrgTypeId(id);
                            this.departments.list = [];
                        }
                    }
                }
            },
            itemChanged(dt) {
                if (dt) {
                    this.addUserForm.curLevelId = dt.level.id;
                    if (dt.level.id) {
                        this.departments.getData(dt.level.id);
                    }
                }
                this.addUserForm.dept = '';
                this.departments.list = [];
            },
            handlerLoad(that) {
                this.deptPicker = that;  // 组织选择器对象引用
                if (this.deptPicker) {
                    // this.deptPicker.clearData();
                    // this.deptPicker.setOrgTypeId(this.orgTypeId);
                    if (this.curRow && this.visible === 'editUser') {
                        this.deptPickerInit(this.curRow);
                    } else if (this.visible === 'addUser') {
                        this.deptPicker.setOrgTypeId(this.orgTypeId);
                    }
                }
            },
            handleChange(file, fileList) {
                this.fileList = fileList.slice(-5);
            },
            beforeAvatarUpload(file) {
                const isXCFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
                const isLt10M = file.size / 10240 / 10240 < 2;
                if (!isXCFile) {
                    this.$message.error('上传文件只能是 xlsx/xsl 格式!');
                    const length = this.fileList.length - 1;
                    this.fileList.splice(length, 1);
                }
                if (!isLt10M) {
                    this.$message.error('上传文件大小不能超过 10MB!');
                }

                return isXCFile && isLt10M;
            },
            showDialog(type, ttl) {
                this.ttl = ttl;
                this.fileList = [];
                this.visible = type;
                if (type === 'addUser') {
                    this.dTtl = ttl;
                } else {
                    this.dTtl = ttl;
                }
                if (type === 'import') {
                    this.formName = 'fileUploadForm';
                    this.dialogVisible1 = true;
                } else if (type === 'addUser' || type === 'editUser') {
                    this.formName = 'addUserForm';
                    this.dialogVisible2 = true;
                }
            },
            close() {
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
                this.typeChanged = false;
                this.dialogVisible1 = false;
                this.dialogVisible2 = false;

                this.curRow = null;
                this.orgTypeId = this.unitTypeList.default[0].id;
                this.addUserForm.userType = this.unitTypeList.default[0].orgTypeName;

                if (this.visible === 'addUser' || this.visible === 'editUser') {
                    this.addUserForm.userName = '';
                    // this.addUserForm.units = [];
                    this.addUserForm.dept = '';
                    this.addUserForm.curLevelId = '';
                    this.addUserForm.userAuth = '普通用户';
                    this.$refs.addUserForm.clearValidate();
                    this.currentDeptId = '';
                }
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            selectUnit(id, idx) {
                // 清空该层级后面的所有层级数据
                for (let i = idx + 1; i < this.orgLevel.list.length; i += 1) {
                    this.addUserForm.units[i] = '';
                    // this.orgLevel.list[i] = [];
                }
                this.addUserForm.dept = '';
                this.orgLevelType.getData(id, idx + 1);   // 获取下级单位层级
                let orgId = id;
                if (!orgId && idx > 0) {
                    orgId = this.addUserForm.units[idx - 1];
                }
                this.departments.getData(orgId);
            },
            submitForm(formName) {
                const that = this;
                console.log(this.addUserForm);
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let url = '';
                        let ttlS = '';
                        let ttlF = '';
                        const param = {};
                        if (that.visible === 'addUser' || that.visible === 'editUser') {
                            // const roles = that.userRoleList.list;
                            // let roleId = '';
                            // for (let i = 0; i < roles.length; i += 1) {
                            //     if (roles[i].name === that.addUserForm.userAuth) {
                            //         roleId = roles[i].id;
                            //         break;
                            //     }
                            // }
                            param.username = that.addUserForm.userName;
                            param.deptPurview = that.addUserForm.userAuth === '普通用户' ? 1 : 2;
                            param.deptId = that.addUserForm.dept;
                        }
                        if (that.visible === 'addUser') {
                            url = APIList.USER_ADD;
                            ttlS = '添加成功！';
                            ttlF = '添加失败！';
                        } else if (that.visible === 'editUser') {
                            url = APIList.USER_UPDATE;
                            param.id = that.addUserForm.id;
                            ttlS = '编辑成功！';
                            ttlF = '编辑失败！';
                        }
                        that.$axios.post(url, param).then((response) => {
                            if (response.code === 200) {
                                this.$message({
                                    message: ttlS,
                                    type: 'success',
                                });
                                that.close();
                                that.addUserForm.userType = that.unitTypeList.default[0].orgTypeName;
                                this.orgTypeId = that.unitTypeList.default[0].id;
                                this.deptPicker.clearData();
                                this.deptPicker.setOrgTypeId(this.orgTypeId);
                                this.tables.userList.getData(1, this.tables.userList.result.pageSize);
                            } else if (response.data) {
                                this.$message({
                                    message: response.data.msg,
                                    type: 'error',
                                });
                            } else {
                                this.$message({
                                    message: response.msg,
                                    type: 'error',
                                });
                            }
                        }).catch((response) => {
                            this.$message({
                                message: ttlF,
                                type: 'error',
                            });
                            console.error(response);
                        });
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
            success(resp) {
                if (resp.code !== 200) {
                    if (resp.msg) {
                        this.$message.error(resp.msg);
                    } else if (resp.data && resp.data.msg) {
                        this.$message.error(resp.data.msg);
                    }
                    this.fileList.splice(this.fileList.length - 1, 1);
                } else {
                    this.dialogVisible1 = false;
                    this.fileList = [];
                    this.$message.success('导入成功！');
                    this.tables.userList.getData(1);
                }
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
    .el-radio {
        line-height: 30px;
        margin: 0 15px 0 0;
    }
</style>
