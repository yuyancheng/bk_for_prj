<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div
        style="position: fixed; top: 50%;left:50%;padding:30px 50px;transform: translate(-50%, -50%); background-color: #fff; box-shadow: 0 0 20px rgba(0,0,0,.3);">
        <form>
            <div><label>用户名：<input type="text" v-model="userName" style="line-height: 26px; border: 1px solid #999;"/></label></div>
            <br/>
            <div><label>密码：<input type="password" v-model="userPwd" style="line-height: 26px; border: 1px solid #999;"/></label></div>
            <br/>
            <div><label>验证码：<input type="text" v-model="captcha" style="line-height: 26px; border: 1px solid #999;"/></label></div>
            <br/>
            <div style="text-align: center;">
                <a class="m-btn m-btn-blue m-btn-circle m-btn-w-ms" v-on:click="submit()">确定</a>
                <router-link class="m-btn m-btn-default m-btn-circle m-btn-w-ms" :to="{ name:'requirement_changes'}">取消</router-link>
            </div>
        </form>
    </div>
</template>

<script type="text/ecmascript-6">
    // import JSEncrypt from '@/assets/js/lib/jsencrypt/jsencrypt';
    // let JSEncrypt = require('@/assets/js/lib/jsencrypt/jsencrypt');

    export default {
        name: 'login',
        created () {
            // let JSEncrypt = require('@/assets/js/lib/jsencrypt/jsencrypt');
            if (window.JSEncrypt) {
                let publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcZtxnTQeGk9bxDeuhvq+nsHcIvAJv94ZVz12QoRGFcpTYqXv6eS5/g3L3BMxSodImvgr1GMXNesP4x8TurXPRfuUngAxlozN1W3sdIw+0Y13ybFsdSJ3c4ByFvsBoieIFe3J6SvYo2oMdAlbGADB6CuA0hureY3sRZdJDLFz0DwIDAQAB';
                this.encr = new window.JSEncrypt();
                this.encr.setPublicKey(publicKey);
            }
        },
        init () {
            console.log('Mine module');
        },
        methods: {
            encrypt (txt) {     // 加密
                if (this.encr) {
                    let base64save = (input) => {
                        input = input || '';
                        return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                    };

                    return base64save(this.encr.encrypt(txt));
                } else {
                    return txt;
                }
            },
            submit () {
                let params = {
                    userName: this.userName,
                    userPwd: this.encrypt(this.userPwd),
                    captcha: this.captcha,
                    channelType: 'dt'
                };
                this.ajaxSettings = {
                    url: '/auth/login',
                    params: params || {},
                    success (res) {
                        let data = res.data;
                        if (data !== null && data.result === 200) {
                            console.log('登录成功！');
                            window.location.href = '/#/logistics/self_service/express_service/requirement_changes';
                        } else if (data !== null && data.result === 401) {
                            console.log('用户名或密码错误！');
                        } else if (data !== null && data.result === 412) {
                            console.log('第一次登录，跳转完善信息页面！');
                        } else if (data !== null && data.result === 205) {
                            console.log.html('验证码错误！');
                        } else if (data !== null && data.result === 403) {
                            console.log.html('用户只允许在顺丰内网登陆！');
                        } else if (data !== null && data.result === 405) {
                            console.log.html('连续输入错误次数超过8次，10分钟内不允许登录!！');
                        }
                    },
                    error (err) {
                        console.log(err);
                    }
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            }
        },
        data () {
            return {
                userName: '',
                userPwd: '',
                captcha: '',
                encr: null
            };
        }
    };

</script>

<style lang="less" type="text/less">
    @-webkit-keyframes fadeInRight {
        from {
            opacity: 0;
            -webkit-transform: translate3d(100%, 0, 0);
            transform: translate3d(100%, 0, 0);
        }

        to {
            opacity: 1;
            -webkit-transform: none;
            transform: none;
        }
    }

    @keyframes fadeInRight {
        from {
            opacity: 0;
            -webkit-transform: translate3d(100%, 0, 0);
            transform: translate3d(100%, 0, 0);
        }

        to {
            opacity: 1;
            -webkit-transform: none;
            transform: none;
        }
    }

    .fadeInRight {
        -webkit-animation-name: fadeInRight;
        animation-name: fadeInRight;
    }
</style>
