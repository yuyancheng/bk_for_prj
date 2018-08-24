<template lang="pug">
    div
        el-container
            el-header(style="position:relative;z-index:1000;width:1280px; margin:0 auto; padding: 0;")
                head-nav
            el-main(style="position:absolute;top:0px;left:0;right:0;bottom:0;padding-top:60px;")
                router-view(style="width:1280px; height:100%; margin:0 auto; background-color: #FFF;")
            el-dialog(
            ref="loginDialog",
            append-to-body=true,
            title="用户登录",
            :visible.sync="loginDialogVisible"
            width="400px",
            padding="20px 40px",
            @close="close")

                el-form(ref="formLogin", :model="user", status-icon, :rules="ruleLogin", label-width="0px")
                    el-form-item(label="", prop="username")
                        el-input(v-model="user.username", auto-complete="off", placeholder="用户名", @keyup.native.13="handlerKeyDown", autofocus)
                    el-form-item(label="", prop="password")
                        el-input(type="password", v-model="user.password", auto-complete="off", placeholder="密码", @keyup.native.13="handlerKeyDown")

                span(slot="footer", class="dialog-footer")
                    el-button(
                    style="width:80px",
                    :disabled="cancelDisabled", round, size="small",
                    @click="loginDialogVisible = false") 取 消
                    el-button(
                    style="width:80px",
                    type="primary",
                    :disabled="confirmDisabled", round, size="small",
                    :loading="isLoading",
                    @click="submitForm") 登 录
</template>

<script type="text/ecmascript-6">
    import Navigator from '@/components/common/nav/Navigator';
    import logInOut from '@/lib/loginout';
    import Encrypt from '@/lib/encrypt';
    // import APIList from '@/assets/datas/APIList.json';

    export default {
        name: 'home',
        components: {
            'head-nav': Navigator,
        },
        data() {
            return {
                loginDialogVisible: false,
                cancelDisabled: false,
                confirmDisabled: false,
                isLoading: false,
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
            };
        },
        created() {
        },
        mounted() {
            this.$store.commit('shareData', {
                dataName: 'loginForm',
                value: this,
            });
        },
        methods: {
            show() {
                this.loginDialogVisible = true;
            },
            handleClose(done) {
                this.$confirm('确认关闭？').then(() => {
                    done();
                }).catch(() => {});
            },
            handlerKeyDown() {
                this.submitForm();
            },
            close() {
                this.loginDialogVisible = false;
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;

                // window.history.back();
            },
            submitForm() {
                const that = this;
                this.confirmDisabled = false;

                this.$refs.formLogin.validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        const dt = that.$qs.stringify({
                            username: that.user.username,
                            // password: that.user.password,
                            password: Encrypt.do(that.user.password),
                        });
                        logInOut.login(that, dt, () => {
                            that.loginDialogVisible = false;
                            that.isLoading = false;
                            that.cancelDisabled = false;
                            that.confirmDisabled = false;
                            that.resetDisabled = false;

                            // window.location.reload(); // 使用弹出框登录后，刷新页面
                            that.$router.go({
                                name: that.$router.history.current.name,
                                force: false,
                            });
                        }, () => {
                            that.isLoading = false;
                            that.confirmDisabled = false;
                        });
                    } else {
                        // console.log('error submit!!');
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
    .el-main {
        .el-container {
            min-height: 100%;
            // height: 100%;
        }
    }
    .el-aside, .el-main {
        overflow: inherit;
    }
</style>
