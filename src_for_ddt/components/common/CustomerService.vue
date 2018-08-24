<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div id="message_box" class="ddt-toolbar-wrap" :class="{'ddt-toolbar-open':isOpened}">
        <div class="ddt-toolbar">
            <div class="ddt-toolbar-panels">
                <div class="ddt-toolbar-panel">
                    <h3 class="ddt-tbar-panel-header J-panel-header">
							<span class="title">
								<i class="com-home"></i><em class="title">留言反馈</em>
							</span>
                        <span class="com-home close-panel" v-on:click="close()"></span>
                    </h3>

                    <!-- 留言反馈form  start -->
                    <form id="addMBForm" method="post" action="">
                        <div class="online_body">
                            <div style="height: 200px;">
                                <textarea class="online_tarea" v-model="message" maxlength="300"
                                          placeholder="亲爱的用户：您可在这里直接反馈您遇到的问题或者意见建议，我们将会及时关注您的反馈，不断优化产品，为您提供更好的服务！（300字以内）"></textarea>
                            </div>
                            <p style="text-align: center;margin: 10px 5px;font-size: 12px;">您可留下您的联系方式，方便我们与您联系！</p>
                            <div class="ly_input_box">
                                <input type="text" name="email" placeholder="邮箱/QQ号码（选填）" v-model="QQOrMail">
                                <span class="ly_input_err">{{QQOrMailErr}}</span>
                            </div>
                            <div class="ly_input_box">
                                <input type="text" placeholder="手机号码（选填）" v-model="telephone">
                                <span class="ly_input_err">{{telephoneErr}}</span>
                            </div>
                            <div class="ly_input_box">
                                <input type="text" placeholder="验证码 (必填)：" v-model="authCode" autocomplete="off"
                                       style="width:150px;margin-top:0;"/>
                                <a href="javascript:;" title="点击换一张"><img :src="autoCodeSrc" style="height: 32px;" v-on:click="refresh()"></a><br/>
                                <span class="ly_input_err" id="code_err">{{codeErr}}</span>
                            </div>
                            <div class="bt-box" style="text-align: left; margin-left: 16px;">
                                <button id="addMessage" type="button" class="bt_fsly" v-on:click="submit()">提&nbsp;&nbsp;交</button>
                            </div>
                        </div>
                    </form>
                    <!-- 留言反馈form  end -->

                    <div class="com-home tip-box">
                        <i></i>
                    </div>
                </div>
            </div>
            <div class="ddt-toolbar-tabs">
                <!--<div class="ddt-toolbar-tab ddt-tbar-tab-help">
                    <a href="/page/helpcenter/faq.html"><i class="com-home tab-ico"></i></a>
                    <em class="tab-text">常见问题 </em>
                </div>-->
                <div class="ddt-toolbar-tab ddt-tbar-tab-qrCode">
                    <i class="tab-ico oneIco"></i>
                    <em class="tab-text">关注我们</em>
                    <div id="qrCode_box" class="qrCode_box">
                        <div class="qrCode_img_box"></div>
                        <div style="padding: 10px;font-size: 12px;text-align: center;">关注我们 顺丰数据灯塔</div>
                        <div class="qr_box_rt"></div>
                    </div>
                </div>
                <div class="ddt-toolbar-tab ddt-tbar-tab-message" v-on:click="openWin()">
                    <i class="tab-ico twoIco"></i>
                    <em class="tab-text">点击反馈</em>
                </div>
                <div class="ddt-toolbar-tab ddt-tbar-tab-toTop" v-on:click="scrollToTop()">
                    <i class="tab-ico fourIco"></i>
                    <em class="tab-text">返回顶部</em>
                </div>
                <div class="ddt-toolbar-tab ddt-tbar-tab-zxkf" v-on:click="serviceOnLine()">
                    <i class="tab-ico threeIco"></i>
                    <em class="tab-text">在线客服</em>
                </div>
            </div>
        </div>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';
    import utils from '@/assets/js/lib/utils';
    import VModal from '@/components/common/modal/VModal';

    let Nav = Vue.component('custome-service', {
        template: '',
        components: {
            'v-modal': VModal
        },
        beforeCreate: function () {
        },
        created: function () {
            this.ajaxSettings = {
                url: '/',
                params: {},
                error (err) {
                    console.log(err);
                }
            };
        },
        mounted: function () {
            this.vmodal = this.$refs.vmMsg;
        },
        methods: {
            checkPath () {
            },
            refresh () {
                this.authCode = '';
                this.codeErr = '';
                this.autoCodeSrc = '/res/rpatchca.png?' + Math.random();
            },
            submit () {
                let that = this;
                this.QQOrMailErr = '';
                this.telephoneErr = '';
                this.codeErr = '';

                let params = {
                    sysCode: 1
                };

                let mail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
                let qq = /^[1-9][0-9]{4,10}$/;

                let QQOrMail = utils.trim(this.QQOrMail);

                if (/\S/g.test(QQOrMail) && !mail.test(QQOrMail) && !qq.test(QQOrMail)) {
                    this.QQOrMailErr = '请输入正确的邮箱或QQ号码';
                    return false;
                } else if (qq.test(QQOrMail)) {
                    params.qq = QQOrMail;
                } else if (mail.test(QQOrMail)) {
                    params.email = QQOrMail;
                }

                let telephone = utils.trim(this.telephone);

                if (telephone.length > 0) {
                    if (((telephone / 1) + '').length !== 11 || telephone % 1 !== 0) {
                        this.telephoneErr = '请输入正确的手机号码';
                        return false;
                    } else {
                        params.telphone = telephone;
                    }
                }

                let authCode = utils.trim(this.authCode);

                if (!/\S/.test(authCode)) {
                    this.codeErr = '请输入验证码';
                    return false;
                } else {
                    params.captcha = authCode;
                }

                this.QQOrMailErr = '';
                this.telephoneErr = '';
                this.codeErr = '';

                let message = utils.trim(this.message);

                if (/\S/.test(message)) {
                    this.ajaxSettings.url = '/messageBoard/savaMessageBoard';
                    this.ajaxSettings.params = params;
                    params.remark = message;
                    this.ajaxSettings.success = (res) => {
                        let data = res.data;
                        if (data) {
                            if (data === 'captcha_error') {
                                this.vmodal.failed('验证码错误！');
                            } else if (!data.code || data.code === 0) {
                                this.vmodal.loaded('提交成功！');

                                that.message = '';
                                that.QQOrMail = '';
                                that.telephone = '';
                                that.authCode = '';

                                that.isOpened = false;
                            } else {
                                this.vmodal.failed(data.message);
                            }
                        } else {
                            this.vmodal.failed('提交失败！');
                        }
                    };

                    this.$store.commit('setAjax', this.ajaxSettings);
                    this.$store.dispatch('ajax');
                } else {
                    this.vmodal.failed('留言不能为空！');
                }
            },
            serviceOnLine () {
                let that = this;

                let _url = 'http://sf-ocs.sf-express.com:8080/live800/chatClient/chatbox.jsp?companyID=8935&enterurl=&info';
                let userName = 'tourist';
                let companyName = '';
                let skillId = 72;
                let configID = 73;

                that.ajaxSettings.url = '/auth/findUserNameAndAccountCompany';
                that.ajaxSettings.params = {};
                this.ajaxSettings.success = (res) => {
                    if (res) {
                        let data = res.data;
                        if (JSON.stringify(data) !== '{}') {
                            userName = data.userName;
                            if (undefined !== data.accountCompany) {
                                companyName = data.accountCompany;
                            }
                            if (data['skillId']) {
                                skillId = data['skillId'];
                                configID = data['configId'];
                            }

                            _url += '=userId=' + userName + '&loginname=' + userName + '&name=' + userName + '&memo=' + companyName + '&skillId=' + skillId + '&configID=' + configID;
                            window.open(_url, '', 'top=100,left=100,width=900,height=700');
                        }
                    }
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            openWin () {
                this.isOpened = !this.isOpened;
            },
            close () {
                this.isOpened = false;

                this.QQOrMailErr = '';
                this.telephoneErr = '';
                this.codeErr = '';

                this.authCode = '';
            },
            scrollToTop () {
                document.documentElement.scrollTop = document.body.scrollTop = 0;
            }
        },
        data () {
            return {
                folderActiveIndex: null,
                activeIndex: null,
                indexLiteral: null,
                literal: {},
                visible: false,
                isOpened: false,
                message: '',
                QQOrMail: '',
                telephone: '',
                authCode: '',
                QQOrMailErr: '',
                telephoneErr: '',
                codeErr: '',
                autoCodeSrc: '/res/rpatchca.png'
            };
        }
    });

    export default Nav;
</script>

<style lang="less" type="text/less">

</style>
