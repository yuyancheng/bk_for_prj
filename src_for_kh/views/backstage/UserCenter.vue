<template lang="pug">

    .cnt-wrapper
        div(style="margin-bottom: 30px;")
            h3 用户中心
        div
            el-form(ref="userInfoForm", v-model="userInfo", label-width="90px", class="form-user-info")
                el-form-item(label="用 户 名：")
                    el-input(v-model="userInfo.userID", readonly=true, style="width: 80%;")
                el-form-item(label="姓　　名：")
                    el-input(v-model="userInfo.name", readonly=true, style="width: 80%;margin-right:20px;")
                    el-button(@click.prevent="showDialog('name', '修改姓名')", type="text") 修改
                el-form-item(label="手机号码：")
                    el-input(v-model="userInfo.telephone", readonly=true, style="width: 80%;margin-right:20px;")
                    el-button(@click.prevent="showDialog('telephone', '修改手机号码')", type="text") 修改
                el-form-item(label="用户类型：")
                    el-input(v-model="userInfo.userType", readonly=true, style="width: 80%;")
                el-form-item(label="组织类型：")
                    el-input(v-model="userInfo.unitType", readonly=true, style="width: 80%;")
                el-form-item(label="单　　位：")
                    el-input(v-model="userInfo.unit", readonly=true, style="width: 80%;")
                el-form-item(label="收件地址：")
                    el-input(v-model="userInfo.address", readonly=true, style="width: 80%;margin-right:20px;")
                    el-button(@click.prevent="showDialog('address', '修改收件地址')", type="text", v-if="userInfo.roleCode !== 'MANAGER'") 修改
                el-form-item(label="密　　码：")
                    span(style="display:inline-block; width: 80%;margin:0 6px 0 14px;") {{userInfo.prompt ? '初始密码' : '已设置'}}
                    el-button(@click.prevent="showDialog('password', '修改密码')", type="text") 修改
                el-form-item(label="月结卡号：")
                    el-input(v-model="userInfo.mCard", readonly=true, style="width: 80%;margin-right:20px;")
                    <!--el-button(@click.prevent="showDialog('mCard', '查看月结卡号')", type="text") 查看-->

        el-dialog(
        :title="dTtl",
        :visible.sync="dialogVisible"
        width="500px",
        padding="20px 40px",
        @close="close",
        class="user-info-modify")
            .form-ttl(v-if="visible!=='mCard'", style="margin-bottom:10px;") {{ttl}}

            el-form(ref="formName", v-if="visible==='name'", :model="formInfo", status-icon, :rules="ruleName", label-width="0px")
                el-form-item(label="", prop="name")
                    el-input(type="text", v-model="formInfo.name", auto-complete="on", placeholder="输入姓名", @keyup.native.13="submitForm(formName)", autofocus)
            el-form(ref="formTel", v-if="visible==='telephone'", :model="formInfo", status-icon, :rules="ruleTel", label-width="0px")
                el-form-item(label="", prop="telephone")
                    el-input(type="text", v-model="formInfo.telephone", auto-complete="on", placeholder="输入手机号码", @keyup.native.13="submitForm(formName)", autofocus)

            el-form(ref="formAddr", v-if="visible==='address'", :model="formInfo", :rules="ruleAddress", label-width="0", size="mini")
                el-form-item(label="", prop="address")
                    dist-picker(
                    v-if="visible==='address'",
                    ref="dPicker",
                    :change="regionChange",
                    v-model="formInfo.address",
                    :address="formInfo.address",
                    :province="formInfo.regions.lv_1",
                    :city="formInfo.regions.lv_2",
                    :district="formInfo.regions.lv_3",
                    :location="formInfo.regions.lv_4")

            el-form(ref="formPWD", v-if="visible==='password'", :model="pwd", status-icon, :rules="rulePWD", label-width="0px")
                el-form-item(label="", prop="password")
                    el-input(type="password", v-model="pwd.password", auto-complete="off", placeholder="输入原密码", @keyup.native.13="submitForm(formName)", autofocus)
                el-form-item(label="", prop="newPassword")
                    el-input(type="password", v-model="pwd.newPassword", auto-complete="off", placeholder="输入新密码", @keyup.native.13="submitForm(formName)")
                    div(style="line-height:22px;color:#999;font-size:12px;") 密码为8~20位字符，其中必须包含数字、字母、符号(@#!%&_.?-$^*)中的至少2种！
                el-form-item(label="", prop="rptPassword")
                    el-input(type="password", v-model="pwd.rptPassword", auto-complete="off", placeholder="再次输入新密码", @keyup.native.13="submitForm(formName)")

            div(v-if="visible==='mCard'")
                el-table(:data="tableData", height="220", border, size="mini", style="width: 100%")
                    el-table-column(prop="order", label="序号")
                    el-table-column(prop="number", label="月结卡号")
                    el-table-column(prop="time", sortable, label="添加时间", width="220")

            span(slot="footer", class="dialog-footer")
                el-button(
                    v-if="visible==='name'||visible==='password'||visible==='telephone'||visible==='address'",
                    :disabled="cancelDisabled", round, style="min-width: 80px", size="small",
                    @click="dialogVisible = false") 取 消
                el-button(
                    v-if="visible==='mCard'", round, style="min-width: 80px", size="small",
                    @click="dialogVisible=false") 关 闭
                el-button(
                    v-if="visible==='name'||visible==='password'||visible==='telephone'||visible==='address'",
                    type="primary",
                    :disabled="confirmDisabled", round, style="min-width: 80px", size="small",
                    :loading="isLoading",
                    @click="submitForm(formName)") 确 定
</template>

<script type="text/ecmascript-6">
    // import VDistpicker from 'v-distpicker';
    import Distpicker from '@/components/common/distpicker/DistPicker';
    import APIList from '@/assets/datas/APIList.json';
    import Encrypt from '@/lib/encrypt';

    export default {
        data() {
            const that = this;
            const checkName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入姓名！'));
                } else {
                    const regExp = /(^[a-zA-Z]{1,50}|[\u4e00-\u9fa5]{2,6})$/g;
                    if (!regExp.test(value)) {
                        callback(new Error('姓名格式有误！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 200);
                    }
                }
            };
            const checkTel = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入手机号码！'));
                } else {
                    const regExp = /(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)/g;
                    if (!regExp.test(value)) {
                        callback(new Error('手机号码格式有误！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 200);
                    }
                }
            };
            const checkPassword = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入原密码！'));
                } else {
                    setTimeout(() => {
                        callback();
                    }, 200);
                }
            };
            const checkNewPassword = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入新密码！'));
                } else {
                    const reg = new RegExp('^((?=.*\\d)(?=.*[A-Za-z])|(?=.*\\d)(?=.*[@#!%&_\\.\\?\\-\\$\\^\\*])|(?=.*[A-Za-z])(?=.*[@#!%&_\\.\\?\\-\\$\\^\\*]))[\\dA-Za-z@#!%&_\\.\\?\\-\\$\\^\\*]{2,}$');
                    if (!reg.test(value)) {
                        callback(new Error('密码格式错误！'));
                    } else if (value.length < 8 || value.length > 20) {
                        callback(new Error('密码长度必须为8~20位！'));
                    } else {
                        setTimeout(() => {
                            callback();
                        }, 200);
                    }
                    if (that.pwd.rptPassword !== '') {
                        that.$refs.formPWD.validateField('rptPassword');
                    }
                }
            };
            const checkRptPassword = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请再次输入新密码！'));
                } else if (value && value !== that.pwd.newPassword) {
                    callback(new Error('两次输入密码不一致！'));
                } else {
                    setTimeout(() => {
                        callback();
                    }, 200);
                }
            };
            const checkValue = (rule, value, callback) => {
                if (!value) {
                    if (rule.field === 'address') {
                        const address = that.dPicker.getDistData().distData;
                        if (/\S/.test(address.lv_4)) {
                            callback(new Error('请选择正确的地址！'));
                        } else {
                            callback(new Error('请输入接收地址！'));
                        }
                    }
                } else if (rule.field === 'address' && !/\S{1,50}/.test(value)) {
                    callback(new Error('请输入正确的地址！'));
                } else {
                    setTimeout(() => {
                        callback();
                        that.isLoading = false;
                    }, 200);
                }
            };

            return {
                currentPage: 1,
                tableData: [],
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                pwd: {
                    password: '',
                    newPassword: '',
                    rptPassword: '',
                },
                formInfo: {
                    name: '',
                    telephone: '',
                    address: '',
                    regions: {
                        lv_1: '', lv_2: '', lv_3: '', lv_4: '',
                    },
                },
                userInfo: {
                    userID: '--',
                    name: '--',
                    telephone: '--',
                    userType: '--',
                    unitType: '--',
                    unit: '--',
                    address: '--',
                    mCard: '--',
                    regions: {
                        lv_1: '', lv_2: '', lv_3: '', lv_4: '',
                    },
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: '',
                    fullPath: '',
                    getData() {
                        const setUserInfo = (dt) => {
                            const address = `${dt.provinceName || ''}${dt.cityName || ''}${dt.areaName || ''}${dt.addressDetail || ''}`;
                            that.userInfo.userID = dt.username || '--';
                            that.userInfo.prompt = dt.prompt;
                            that.userInfo.roleCode = dt.roleCode || '';
                            that.userInfo.name = dt.nickname || '--';
                            that.userInfo.userType = dt.roleCode === 'MANAGER' ? '超级管理员' : (dt.deptPurview === 2 ? '管理员' : '普通用户') || '--';
                            that.userInfo.unit = dt.deptName || '--';
                            that.userInfo.telephone = dt.mobilePhone || '--';
                            that.userInfo.address = address || '--';
                            that.userInfo.regions.lv_1 = dt.provinceName || '';
                            that.userInfo.regions.lv_2 = dt.cityName || '';
                            that.userInfo.regions.lv_3 = dt.areaName || '';
                            that.userInfo.regions.lv_4 = dt.addressDetail || '';
                            that.userInfo.password = dt.password;
                            that.userInfo.mCard = (dt.custNoList && dt.custNoList[0]) || '--';

                            if (dt.orgTypeId) {
                                that.$axios.get(APIList.GET_UNIT_TYPE, {
                                    data: {},
                                }).then((response) => {
                                    const typeList = response.data.rows;
                                    for (let i = 0; i < typeList.length; i += 1) {
                                        if (dt.orgTypeId === typeList[i].id) {
                                            that.userInfo.unitType = typeList[i].orgTypeName || '--';
                                            break;
                                        }
                                    }
                                }).catch((response) => {
                                    console.error(response);
                                });
                            }
                        };
                        that.$axios.get(APIList.USER_ACCOUNT_GETINFO, {
                            data: {},
                        }).then((response) => {
                            if (response.code === 200) {
                                const data = response.data;
                                if (data) {
                                    setUserInfo(data);
                                    // 保存用户信息到localStorage
                                    if (localStorage) {
                                        localStorage.setItem('user_info', JSON.stringify(data));
                                    }
                                }
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                dTtl: '用户信息修改',
                ttl: '',
                levelStatusText: '不安全',
                safeLv: {
                    lv_1: false,
                    lv_2: false,
                    lv_3: false,
                },
                dialogVisible: false,
                visible: {
                    name: true,
                    telephone: false,
                    address: false,
                    password: false,
                    mCard: false,
                },
                tables: {
                    mCard: {
                        result: {
                            pageSize: 10,
                            pageNum: 1,
                            rows: [],
                        },
                        getData(idx) {
                            that.$axios.post(APIList.USER_MCARD, {
                                id: '123',
                                pageIndex: idx,
                            }).then((response) => {
                                // console.log(response);
                                that.tableData = response.result.rows;
                                that.tables.mCard.result = response.result;
                            }).catch((response) => {
                                console.error(response);
                            });
                        },
                    },
                },
                ruleTel: {
                    telephone: [
                        { validator: checkTel, required: true, trigger: 'blur' },
                    ],
                },
                ruleName: {
                    name: [
                        { validator: checkName, required: true, trigger: 'blur' },
                    ],
                },
                ruleAddress: {
                    address: [
                        { validator: checkValue, required: true, trigger: ['blur', 'change'] },
                    ],
                },
                rulePWD: {
                    password: [
                        { validator: checkPassword, required: true, trigger: 'blur' },
                    ],
                    newPassword: [
                        { validator: checkNewPassword, required: true, trigger: 'blur' },
                    ],
                    rptPassword: [
                        { validator: checkRptPassword, required: true, trigger: 'blur' },
                    ],
                },
            };
        },
        components: { Distpicker },
        created() {
            this.init();
        },
        mounted() {},
        methods: {
            init() {
                this.userInfo.getData(1);
                // this.tables.mCard.getData(1);
            },
            showDialog(type, ttl) {
                const that = this;
                this.ttl = ttl;
                this.dialogVisible = true;

                this.visible = type;
                if (type === 'mCard') {
                    this.dTtl = '查看月结卡号';
                } else {
                    this.dTtl = '用户信息修改';
                }
                if (type === 'name') {
                    this.formName = 'formName';
                    this.formInfo.name = this.userInfo.name;
                } else if (type === 'telephone') {
                    this.formName = 'formTel';
                    this.formInfo.telephone = this.userInfo.telephone;
                } else if (type === 'password') {
                    this.formName = 'formPWD';
                } else if (type === 'address') {
                    this.formName = 'formAddr';
                    this.formInfo.address = this.userInfo.address;
                    this.formInfo.regions.lv_1 = this.userInfo.regions.lv_1;
                    this.formInfo.regions.lv_2 = this.userInfo.regions.lv_2;
                    this.formInfo.regions.lv_3 = this.userInfo.regions.lv_3;
                    this.formInfo.regions.lv_4 = this.userInfo.regions.lv_4;
                    if (this.dPicker) {
                        // this.dPicker.resetDistData();
                        // this.$refs[this.formName].clearValidate();
                    }
                } else if (type === 'mCard') {
                    this.formName = 'formMCard';
                }
                if (!that.dPicker) {
                    setTimeout(() => {
                        that.dPicker = that.$refs.dPicker;  // 地址选择器对象引用
                    }, 200);
                }
            },
            close() {
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
                this.dialogVisible = false;
                this.resetForm(this.formName);
                this.$refs[this.formName].clearValidate();
                // this.$refs[this.formName].resetFields();
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            regionChange(dt) {
                this.formInfo.regions = dt;
            },
            submitForm(formName) {
                const that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        this.cancelDisabled = true;
                        this.resetDisabled = true;
                        // let addressData = {};
                        let url = '';
                        const params = {};

                        if (that.visible === 'name') {
                            // 修改姓名
                            url = APIList.NAME_UPDATE;
                            params.nickname = that.formInfo.name;
                        } else if (that.visible === 'telephone') {
                            // 修改手机号
                            url = APIList.PHONE_UPDATE;
                            params.mobilePhone = that.formInfo.telephone;
                        } else if (that.visible === 'password') {
                            // 修改密码
                            url = APIList.PASSWORD_UPDATE;
                            params.originPassword = Encrypt.do(that.pwd.password);
                            params.password = Encrypt.do(that.pwd.newPassword);
                            that.pwd.password = '';
                            that.pwd.newPassword = '';
                            that.pwd.rptPassword = '';
                        } else if (that.visible === 'address') {
                            // 修改地址
                            // addressData = that.dPicker.getDistData();
                            url = APIList.USER_ADDRESS_UPDATE;
                            params.provinceName = this.formInfo.regions.lv_1;
                            params.cityName = this.formInfo.regions.lv_2;
                            params.areaName = this.formInfo.regions.lv_3;
                            params.addressDetail = this.formInfo.regions.lv_4;
                        }

                        that.$axios.post(url, params).then((response) => {
                            if (response && response.code === 200) {
                                this.$message({
                                    message: '修改成功！',
                                    type: 'success',
                                });
                                if (that.visible === 'name') {
                                    that.userInfo.name = that.formInfo.name;
                                } else if (that.visible === 'telephone') {
                                    that.userInfo.telephone = that.formInfo.telephone;
                                } else if (that.visible === 'address') {
                                    // that.userInfo.regions = addressData.distData;
                                    that.userInfo.address = `${this.formInfo.regions.lv_1}${this.formInfo.regions.lv_2}${this.formInfo.regions.lv_3}${this.formInfo.regions.lv_4}`;
                                }
                                that.userInfo.getData(1);
                                that.close();
                            } else {
                                if (response.data) {
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
                                that.isLoading = false;
                                that.cancelDisabled = false;
                                that.$refs[that.formName].clearValidate();
                            }
                        }).catch((response) => {
                            that.isLoading = false;
                            that.cancelDisabled = false;
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
        },
    };

</script>

<style lang="scss" type="text/scss">

    .cnt-wrapper {
        padding: 20px 30px 40px;

        background-color: #fff;
    }

    .form-user-info {
        width: 700px;
    }

    .pwd-safe-lv {
        display: inline-block;
        overflow: hidden;
    }

    .pwd-safe-lv-1, .pwd-safe-lv-2, .pwd-safe-lv-3 {
        float: left;
        width: 33.333333%;
        height: 10px;
    }

    .pwd-safe-lv-1 {
        background-color: $error-color-red;
    }

    .pwd-safe-lv-2 {
        background-color: $warn-color-orange;
    }

    .pwd-safe-lv-3 {
        background-color: $safe-color-green;
    }

    .lv-desc {
        font: {
            size: 12px;
        }
    }
    .user-info-modify {
        .sf-dist-picker {
            .el-input {
                margin-top: 15px;
            }
        }
    }
</style>
