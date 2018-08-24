<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div>
        <div class="v-modal-win">
            <!-- 发送确认 -->
            <div v-show="showModalConfirm" class="vm-win">
                <div class="vm-win-wrapper" :style="{width: vmStyle.width, height: vmStyle.height}">
                    <div class="e-msg-item">
                        <span class="all-bg-warning">!</span>
                    </div>
                    <div class="e-msg-item">
                        <p v-html="htmlStr"></p>
                    </div>
                    <div style="text-align: center;">
                        <button v-on:click="ok()" type="button" class="m-btn m-btn-circle m-btn-blue m-btn-w-md">{{confirmText}}</button>
                        <button v-on:click="remove()" type="button" class="m-btn m-btn-circle m-btn-default m-btn-w-md"
                                style="margin-left:30px;border-color:#3B8EDE;color:#3B8EDE">{{cancelText}}
                        </button>
                    </div>
                </div>
                <div class="vm-veil"></div>
            </div>

            <!-- 发送成功 -->
            <div v-show="showModalSuccess" class="vm-win">
                <div class="vm-win-wrapper" :style="{width: vmStyle.width, height: vmStyle.height}">
                    <div class="e-msg-send">
                        <span class="all-bg-success"><i></i><i></i></span>
                    </div>
                    <div class="e-msg-item">
                        <p><b v-html="htmlStr" style="font-weight: normal;"></b> （<strong style="color: #0074c8">{{timer}}</strong> 秒后自动关闭）
                        </p>
                    </div>
                </div>
                <div class="vm-veil"></div>
            </div>
        </div>
        <div class="v-modal-toast">
            <div v-if="isLoading" class="all-shade" :class="{'fade-out': fadeOut}">
                <div class="all-loading"><img src="../../../assets/image/loading.gif"></div>
            </div>
            <div v-if="isLoaded" class="all-loading" :class="{'fade-out': fadeOut}">
                <div class="v-modal-cls" v-on:click="close('loaded')"><span>&nbsp;</span><span>&nbsp;</span></div>
                <div class="all-msg-success"><span></span><h4 v-html="htmlStr"></h4></div>
            </div>
            <div v-if="isFailed" class="all-loading" :class="{'fade-out': fadeOut}">
                <div class="v-modal-cls" v-on:click="close('failed')"><span>&nbsp;</span><span>&nbsp;</span></div>
                <div class="all-msg-warning"><span></span><h4 v-html="htmlStr"></h4></div>
            </div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';

    let modal = Vue.component('v-modal', {
        template: '#main',
        props: ['vmData'],                      // vmData 为注册方传递过来的数据
        components: {},
        beforeCreate: function (bus) {
        },
        created: function (bus) {
        },
        mounted: function () {
            // console.log(this.$el.style.height);
        },
        methods: {
            confirm (dt) {
                // let that = this;
                this.showModalConfirm = true;
                this.htmlStr = dt.html;
                this.vmStyle.width = dt.style.width;
                this.vmStyle.height = dt.style.height;

                if (dt.confirm) {
                    this.ensure = dt.confirm;
                }
                if (dt.cancel) {
                    this.cancel = dt.cancel;
                    // this.remove(false);
                }
                this.resetHeight();
            },
            success (dt) {
                let that = this;
                this.showModalSuccess = true;
                this.htmlStr = dt.html;
                this.vmStyle.width = dt.style.width;
                this.vmStyle.height = dt.style.height;
                if (dt.shutdownTime) {
                    this.timer = dt.shutdownTime;
                    let _t = setInterval(() => {
                        that.timer--;
                        if (that.timer === 0) {
                            that.showModalSuccess = false;
                            clearInterval(_t);
                        }
                    }, 1000);
                }
            },
            loading (dt) {
                this.isLoading = true;
                this.resetHeight();
            },
            loaded (str) {
                let that = this;
                this.close('loaded');
                setTimeout(function () {
                    that.isLoaded = true;
                }, 100);
                this.htmlStr = str;
                this.resetHeight();
                this.remove(true);
            },
            failed (str) {
                let that = this;
                this.close('failed');
                setTimeout(function () {
                    that.isFailed = true;
                }, 100);
                this.htmlStr = str;
                this.resetHeight();
                this.remove(true);
            },
            close (tar) {
                this.fadeOut = false;
                clearInterval(this.tm);
                if (tar === 'loaded') {
                    this.isLoaded = false;
                } else {
                    this.isFailed = false;
                }
            },
            remove (fl, tar) {
                let that = this;
                this.cancel && this.cancel();
                const TIME_OUT = 5000;
                if (fl) {
                    this.fadeOut = true;
                    this.tm = setTimeout(function () {
                        that.isLoaded = false;
                        that.isFailed = false;
                    }, TIME_OUT);
                } else {
                    this.showModalConfirm = false;
                    this.showModalSuccess = false;
                }
            },
            ok () {
                this.ensure && this.ensure();
            },
            resetHeight () {
                let target = this.$el.childNodes[0].childNodes[0].childNodes[0];
                setTimeout(function () {
                    let h = target.clientHeight;
                    if (h % 2 !== 0) {
                        target.style.height = h + 1 + 'px';
                    }
                }, 200);
            }
        },
        data () {
            return {
                htmlStr: '',
                hasNoData: false,
                visible: false,
                isLoading: false,
                isLoaded: false,
                isFailed: false,
                showModalConfirm: false,
                showModalSuccess: false,
                vmStyle: {
                    width: 700,
                    height: 600
                },
                ensure: null,
                cancel: null,
                fadeOut: false,
                confirmText: '确定',
                cancelText: '取消',
                timer: null,
                tm: null
            };
        }
    });

    export default modal;
</script>

<style lang="less" type="text/less" scoped>
    * {
        font-family: inherit;
    }

    .vm-veil {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.4);
    }

    .vm-win {
        position: relative;
        z-index: 9999;
    }

    .vm-win-wrapper {
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 10;
        width: 600px;
        -webkit-font-smoothing: subpixel-antialiased;
        transform: translate(-50%, -50%) translateZ(0) scale(1.0, 1.0);
        height: 460px;
        padding: 25px 30px;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
    }

    .e-msg-item {
        text-align: center;
        margin-bottom: 35px;

        span {
            display: inline-block;
            //padding: 0 32px;
            padding: 0 25px;
            //font-size: 56px;
            font-size: 46px;
            color: #fff;
            /*background-color: #FF6666;*/
            text-align: center;
            border-radius: 50px;
            font-weight: lighter;
        }

        h4 {
            font-size: 17px;
        }

        p {
            text-align: center;
            font-size: 16px;
            margin-bottom: 30px;
            color: #777;
        }
    }

    .e-msg-send {
        text-align: center;
        margin-bottom: 35px;

        span {
            position: relative;
            display: inline-block;
            padding: 40px;
            background-color: #71D421;
            border-radius: 50px;
            margin-bottom: 18px;

            i {
                position: absolute;
                background-color: #fff;
            }
            i:first-child {
                top: 34px;
                left: 21px;
                width: 5px;
                height: 28px;
                border-top-right-radius: 20px;
                border-top-left-radius: 20px;
                transform: rotate(-45deg);
            }
            i:last-child {
                top: 38px;
                left: 24px;
                width: 47px;
                height: 5px;
                border-top-right-radius: 10px;
                border-bottom-right-radius: 10px;
                transform: rotate(-45deg);
            }
        }

        h4 {
            font-size: 17px;
        }

        p {
            text-align: center;
            font-size: 16px;
            margin-bottom: 30px;
            color: #777;
        }
    }

    .all-bg-success {
        background: linear-gradient(45deg, #8dd519, #46D524);
    }

    .all-bg-warning {
        background: linear-gradient(45deg, #fe812d, #F93941);
    }

    .animated {
        -webkit-animation-duration: 1.5s;
        animation-duration: 1.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both;
    }

    .animated.infinite {
        -webkit-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
    }

    .animated.hinge {
        -webkit-animation-duration: 2s;
        animation-duration: 2s;
    }

    @keyframes fade_out_linear {
        0% {
            opacity: 1;
        }
        100% {
            opacity: 0;
        }
    }

    .fade-out {
        animation: fade_out_linear 1s linear 3s 1 normal forwards;
    }
</style>
