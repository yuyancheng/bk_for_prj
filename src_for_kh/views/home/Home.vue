<template lang="pug">
    el-container
        el-main(style="background-color: #fff;")
            div(style="position:relative")
                img(src="../../assets/image/pics/kj.jpg", style="width:100%")
                .login-form(v-if="!userCheckedIn")
                    h3(style="padding-bottom:30px;font-size:17px;text-align:center;") 用户登录
                    el-form(ref="formLogin", :model="user", status-icon, :rules="ruleLogin", label-width="0px")
                        el-form-item(label="", prop="username")
                            el-input(v-model="user.username",
                            auto-complete="off", placeholder="用户名", @keyup.native.13="handlerKeyDown($event)", tabindex=1, autofocus)
                        el-form-item(label="", prop="password")
                            el-input(type="password", v-model="user.password",
                            auto-complete="off", placeholder="密码", @keyup.native.13="handlerKeyDown($event)", tabindex=2)

                    span(slot="footer", style="display:block; padding-top:5px;")
                        el-button(
                        type="primary",
                        :loading="isLoading",
                        round,
                        style="width:100%;padding:9px 20px;font-size:14px;",
                        size="mini",
                        @click="submitForm") 登 录

            div(style="background-color: #fff;")
                div(style="margin:10px 15px;")
                    // 滚动公告栏
                    notice-bar

            .top-five-wrap
                .top-five-list(v-for="(list, index) in topFive.lists", :key="index")
                    h3 {{titles[index]}}
                    div(v-if="!list.length", style="padding: 90px 0;color: #999;text-align:center;") 暂无数据！
                    ul(v-if="list.length")
                        li
                            span 排名
                            strong 名称
                            b {{index < 2 ? '发货量' : '收货量'}}
                        li(v-for="(item, idx) in list", :key="idx")
                            span(:style="{color: idx < 3 ? '#2faced' : 'inherit'}") {{idx + 1}}
                            // el-tooltip(effect="dark", :content="item.text", placement="right")
                            strong {{item.name}}
                            b {{item.amount}}
            el-dialog(
            title="用户信息初始化",
            :visible.sync="dialogVisible"
            width="550px",
            padding="20px 40px",
            @close="close",
            class="user-info-modify")
                el-form(ref="formInfo", :model="formInfo", status-icon, :rules="ruleFormInfo", size="small", label-width="100px")
                    el-form-item(label="姓名", prop="name", style="width:95%;")
                        el-input(type="text", v-model="formInfo.name", auto-complete="on", placeholder="输入姓名", @keyup.native.13="save", autofocus)
                    el-form-item(label="手机号码", prop="telephone", style="width:95%;")
                        el-input(type="text", v-model="formInfo.telephone", auto-complete="on", placeholder="输入手机号码", @keyup.native.13="save")
                    el-form-item(label="原密码", prop="originPassword", style="width:95%;")
                        el-input(type="password", v-model="formInfo.originPassword", auto-complete="off", placeholder="输入原密码", @keyup.native.13="save")
                    el-form-item(label="新密码", prop="newPassword", style="width:95%;")
                        el-input(type="password", v-model="formInfo.newPassword", auto-complete="off", placeholder="输入新密码", @keyup.native.13="save")
                        div(style="line-height:22px;color:#999;font-size:12px;") 密码为8~20位字符，其中必须包含数字、字母、符号(@#!%&_.?-$^*)中的至少2种！
                    el-form-item(label="确认密码", prop="rptPassword", style="width:95%;")
                        el-input(type="password", v-model="formInfo.rptPassword", auto-complete="off", placeholder="再次输入新密码", @keyup.native.13="save")

                span(slot="footer", class="dialog-footer")
                    el-button(
                    round, style="min-width: 80px", size="small",
                    :disabled="cancelDisabled", @click="handlerCancel") 取 消
                    el-button(
                    type="primary",
                    round, style="min-width: 80px", size="small",
                    :loading="isLoading",
                    @click="save") 确 定

        el-footer(style="height:auto; padding: 20px 0; background-color:#252934;")
            p(style="line-height:20px;text-align: center;font-size: 13px;color:#999;") 主办：空军后勤部
            p(style="line-height:20px;text-align: center;font-size: 13px;color:#999;") © 2018 by 顺丰科技 all rights reserved
            p(style="line-height:20px;text-align: center;font-size: 13px;color:#999;") 技术支持：顺丰科技
</template>

<script type="text/ecmascript-6">
    import NoticeBar from '@/views/trends/NoticeBar';
    import APIList from '@/assets/datas/APIList.json';
    import logInOut from '@/lib/loginout';
    import Encrypt from '@/lib/encrypt';

    export default {
        name: 'home',
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
                        callback();
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
                        callback();
                    }
                }
            };
            const checkOldPassword = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入原密码！'));
                } else {
                    callback();
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
                        callback();
                    }
                    if (that.formInfo.rptPassword !== '') {
                        that.$refs.formInfo.validateField('rptPassword');
                    }
                }
            };
            const checkRptPassword = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请再次输入新密码！'));
                } else if (value && value !== that.formInfo.newPassword) {
                    callback(new Error('两次输入密码不一致！'));
                } else {
                    callback();
                }
            };
            return {
                userCheckedIn: false,
                isLoading: false,
                cancelDisabled: false,
                dialogVisible: false,
                userInfo: {},
                user: {
                    username: '',
                    password: '',
                },
                ruleLogin: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' },
                    ],
                },
                titles: ['发货量TOP5单位', '发货量TOP5物资', '收货量TOP5单位', '收货量TOP5地区'],
                defaultIndex: 0,
                noticeContent: [],
                topFive: {
                    lists: [[], [], [], []],
                    getData() {
                        that.$axios.post(APIList.TOP_FIVE_LIST, {}).then((response) => {
                            if (response.data) {
                                that.topFive.lists[0] = response.data.sendDept || [];
                                that.topFive.lists[1] = response.data.sendMaterial || [];
                                that.topFive.lists[2] = response.data.receiveDept || [];
                                that.topFive.lists[3] = response.data.receiveArea || [];
                                that.checkData(that.topFive.lists);
                                that.checkData(that.topFive.lists);
                            }
                        }).catch((response) => {
                            console.log(response);
                        });
                    },
                },
                formInfo: {
                    name: '',
                    telephone: '',
                    originPassword: '',
                    newPassword: '',
                    rptPassword: '',
                },
                ruleFormInfo: {
                    name: [
                        { validator: checkName, required: true, trigger: 'blur' },
                    ],
                    telephone: [
                        { validator: checkTel, required: true, trigger: 'blur' },
                    ],
                    originPassword: [
                        { validator: checkOldPassword, required: true, trigger: 'blur' },
                    ],
                    newPassword: [
                        { validator: checkNewPassword, required: true, trigger: 'blur' },
                    ],
                    rptPassword: [
                        { validator: checkRptPassword, required: true, trigger: 'blur' },
                    ],
                },
                sTime: 0,
            };
        },
        created() {
            this.$store.state.setLoginStatus = (bl) => {
                this.userCheckedIn = bl;
            };
            if (localStorage) {
                const userInfo = localStorage.getItem('user_info');
                this.userInfo = JSON.parse(userInfo);
                if (this.userInfo) {
                    this.userCheckedIn = true;
                }
            }
            this.topFive.getData();
        },
        mounted() {},
        components: { NoticeBar },
        methods: {
            handlerKeyDown() {
                this.submitForm();
            },
            // 一种触发数据检测的方式，不推荐！
            checkData(dt) {
                const len = dt.length;
                if (len > 0) {
                    if (dt[len - 1].hidden === undefined) {
                        dt.push({
                            hidden: true,
                        });
                    } else {
                        dt.pop();
                    }
                }
            },
            close() {
                this.isLoading = false;
                this.dialogVisible = false;
                this.$refs.formInfo.clearValidate();
                this.doRedirect();
            },
            handlerCancel() {
                this.dialogVisible = false;
                this.doRedirect();
            },
            doRedirect() {
                this.$router.push({
                    name: 'user-center',
                });
            },
            submitForm() {
                const that = this;
                this.$refs.formLogin.validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        const dt = {
                            username: that.user.username,
                            password: Encrypt.do(that.user.password),
                        };
                        logInOut.login(that, that.$qs.stringify(dt), (info) => {
                            that.isLoading = false;
                            if (info.prompt && info.roleCode !== 'MANAGER') {
                                that.dialogVisible = true;
                            } else {
                                that.doRedirect();
                            }
                        }, () => {
                            that.isLoading = false;
                        });
                    } else {
                        // console.log('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            doUpdate(url, params) {
                const that = this;
                that.$axios.post(url, params).then((response) => {
                    if (response && response.code === 200) {
                        // that.sTime += 1;
                        this.$message({
                            message: '初始化成功！',
                            type: 'success',
                        });
                        this.doRedirect();
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
                    }
                }).catch((response) => {
                    that.isLoading = false;
                    that.cancelDisabled = false;
                    console.error(response);
                });
            },
            save() {
                const that = this;
                // const url1 = APIList.NAME_UPDATE;
                // const url2 = APIList.PHONE_UPDATE;
                // const url3 = APIList.PASSWORD_UPDATE;
                this.$refs.formInfo.validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        that.cancelDisabled = true;
                        this.doUpdate(APIList.USER_INFO_UPDATE, {
                            originPassword: Encrypt.do(that.formInfo.originPassword),
                            nickname: that.formInfo.name,
                            mobilePhone: that.formInfo.telephone,
                            password: Encrypt.do(that.formInfo.newPassword),
                        });
                        // that.isLoading = true;
                        // that.cancelDisabled = true;
                        // this.doUpdate(url1, {
                        //     nickname: that.formInfo.name,
                        // }, 'name');
                        // this.doUpdate(url2, {
                        //     mobilePhone: that.formInfo.telephone,
                        // }, 'telephone');
                        // this.doUpdate(url3, {
                        //     password: Encrypt.do(that.formInfo.newPassword),
                        // }, 'password');
                    } else {
                        console.log('error save!!!');
                        return false;
                    }
                    return true;
                });
            },
            resetForm() {
                this.$refs.formLogin.resetFields();
            },
        },
    };

</script>

<style lang="scss">

    .login-form {
        position: absolute;
        top: 55px;
        right: 110px;
        width: 300px;
        padding: 30px 40px;
        background-color: rgba(255,255,255,.9);
        border-radius: 10px;
        box-shadow: 0 0 8px 3px rgba(0,0,0,.1);
    }
    .top-five-wrap {
        display: flex;
        padding: 0 10px;
        margin: 20px 0 40px;
    }
    .top-five-list {
        display: inline-block;
        width: 303px;
        margin: 0 5px;
        border: 1px solid #ccc;
        border-radius: 10px;
        h3 {
            font-size: 16px;
            padding: 10px 20px;
            color: #666;
            font-weight: normal;
            border-bottom: 1px solid #ccc;
        }
        ul {
            height: 245px;
            li {
                height: 40px;
                margin: 0 10px;
                color: #999;
                border-bottom: 1px solid #ededed;

                span, strong, b {
                    display: inline-block;
                    height: 40px;
                    line-height: 40px;
                    font-weight: normal;
                    font-size: 13px;
                    color: #999;
                    overflow: hidden;
                    white-space:nowrap;
                    text-overflow: ellipsis;
                }
                span {
                    width: 40px;
                    text-align: center;
                }
                strong {
                    width: 180px;
                    padding-left: 5px;
                }
                b {
                    width: 48px;
                    padding-left: 10px;
                }

                &:last-child {
                    border: none;
                }
            }
        }
    }
</style>
