<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="demand_resend" class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>我要再派</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div>
                <h3>选择发起人
                    <router-link class="page-link" :to="{ name: 'initiator_management'}">发起人管理 <b>»</b></router-link>
                </h3>
                <v-initiator-management ref="vInitiatorManagement"></v-initiator-management>
                <h3>我要再派运单号</h3>
                <div
                    style="position:relative;border: 1px solid #aaa; padding: 5px 6px; min-height:50px;  max-height:84px; overflow: auto; outline: none;border-radius: 2px;"
                    v-on:click="click($event)">
                    <span class="order-mark" spellcheck="false" v-for="(item, idx) in orderNumbers" v-on:click="stopProp($event)" v-on:mouseup="mouseUp()"
                          :class="{'invalid': item.isInvalid}">{{item.value}}<i class="mark-cls" v-on:click="markRemove(idx)">&nbsp;</i></span>
                    <input v-on:paste="paste($event)" v-on:blur="blur()" v-on:focus="focus($event)" v-on:keydown="keyDown($event)"
                           v-model="numList" :class="[{'normal':!isFocused}, {'focused':isFocused}]"/>
                    <p v-show="visible && orderNumbers.length===0"
                       style="color: #999;text-align:center;font-size:14px;line-height:50px;position:absolute;z-index:0;left:0;right:0;">
                        点击此处并粘贴（单号以空格或逗号分隔，50个以内）</p>
                </div>
                <p style="margin-top: 5px;font-size: 12px; color: #999;">
                    <button v-on:click="clear()" class="clear-btn">清空</button>
                    <span>
                        温馨提示：<br/>1、如果该流向没有顺丰特惠，自动选择顺丰标快；2、以上单号中，<span style="color:#f60;">红色</span>为无效单号。<br/>
                        发起失败的原因主要有以下三种:<br/>
                        1、该运单不属于该用户的月结账号，无权限发起；
                        2、该运单已发起过；
                        3、需求发起失败。
                    </span>
                </p>
                <h3>备注</h3>
                <div style="font-size: 14px; margin: 0 0 20px;">
                    <textarea v-model="remark"
                              style="width:471px; height:54px; padding: 4px 5px;border:1px solid #999;border-radius: 2px;font-family: inherit;"></textarea>
                </div>
            </div>
            <div style="text-align: center;margin-top: 20px;">
                <button class="m-btn m-btn-blue m-btn-circle m-btn-w-md" v-on:click="save()" :disabled="isDisabled">确定</button>
                <a class="m-btn m-btn-default m-btn-circle m-btn-w-md" v-on:click="cancel()" href="javascript:void(0)">取消</a>
            </div>
        </div>
        <div class="v-veil"></div>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">

    // import Vue from 'vue';
    import VTable from '@/components/common/table/VTable';
    import VModal from '@/components/common/modal/VModal';
    import utils from '@/assets/js/lib/utils';
    import InitiatorSettings from '@/components/logistics/requireChanges/InitiatorSettings';

    export default {
        template: '#main',
        components: {
            'v-table': VTable,
            'v-modal': VModal,
            'v-initiator-management': InitiatorSettings
        },
        beforeCreate: function (bus) {
            window.onunload = (e) => {
                this.$router.prev();
            };
        },
        created: function (bus) {
            this.ajaxSettings = {
                url: '/express/newAgainSendComplain',
                params: {},
                error (err) {
                    console.log(err);
                }
            };
        },
        mounted: function () {
            let that = this;
            this.vi = this.$refs.vInitiatorManagement;
            this.vmodal = this.$parent.$refs.vmMsg;

            // delete this.vi.vt['vtData']['columns'][0]['data'];

            this.vi.setVisitor(this.update);
            this.initiatorId = this.vi.getDefaultValue().id;

            let modalWrapper = document.getElementById('modal_wrapper');
            let osh = modalWrapper.offsetHeight;
            this.resize(osh, modalWrapper);
            window.onresize = () => {
                that.resize(osh, modalWrapper);
            };
        },
        methods: {
            resize (h, el) {
                if (h % 2 !== 0) {
                    el.style.paddingTop = 21 + 'px';
                }

                this.isFull = h > window.innerHeight;
            },
            update (dt) {
                this.initiatorId = dt.id;
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            },
            cancel () {
                this.close();
            },
            submit () {
                let that = this;
                if (!this.initiatorId) {
                    this.initiatorId = this.vi.getDefaultValue().id;
                    if (!this.initiatorId) {
                        this.vmodal.failed('请选择发起人！');
                        return false;
                    }
                }

                if (this.orders.length === 0) {
                    this.vmodal.failed('“请输入有效运单号！');
                    return false;
                }

                this.isDisabled = true;

                this.ajaxSettings.params = {
                    contactsId: this.initiatorId,
                    waybills: this.tempOrders.toString(),
                    remark: this.remark.replace(/\r\t/g, '\n')
                };

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.code === 0) {
                        let _dt = JSON.parse(data.data);
                        let _len = _dt.success && _dt.success.length;
                        let _ln = _dt.failures && _dt.failures.length;
                        if (_dt.failures && _dt.failures.length > 0) {
                            this.isDisabled = false;
                            that.vmodal.failed('您的再派请求已发起，其中成功发起 ' + _len + ' 个，<br/>失败 ' + _dt.failures.length + ' 个！');
                            let fArr = [];
                            for (let i = 0; i < _ln; i++) {
                                fArr[i] = {
                                    value: _dt.failures[i],
                                    isInvalid: true
                                };
                            }
                            that.clear();
                            that.orderNumbers = fArr;
                            that.$parent.tabTurn(1, 'resend', true);
                        } else {
                            that.vmodal.loaded('再派发起成功！');
                            that.$parent.tabTurn(1, 'resend', true);
                            that.$router.prev();
                        }
                    } else {
                        this.isDisabled = false;
                        that.vmodal.failed('再派失败！<br/><br/>' + data.message);
                    }
                };
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            save () {
                let that = this;
                let idxs = [];
                let len = this.orders.length;
                this.tempOrders = utils.unique(this.orders, idxs);

                if (idxs.length > 0) {
                    that.vmodal.confirm({
                        html: '共 ' + len + ' 个单号，<br/>包括 ' + idxs.length + ' 个重复的单号！',
                        style: {
                            width: '510px',
                            height: '240px'
                        },
                        confirm (dt) {
                            that.submit();
                            that.vmodal.remove();
                        },
                        cancel () {
                        }
                    });
                } else {
                    that.submit();
                }
            },
            // 捕获粘贴事件
            paste (e) {
                let that = this;
                let evt = e || window.event;
                let clipboardData = (evt.clipboardData || window.clipboardData); // 获取剪贴板对象
                let nums = clipboardData.getData('text');   // 获取剪贴板文本
                const MAX_SIZE = 50;

                nums = nums.split(/\s+|,+|[-]+|_+|\.+|\/+/);
                let _num = [];

                for (let i = 0, len = nums.length; i < len; i++) {
                    if (/\S+/g.test(nums[i])) {
                        let _mark = {};
                        _mark['value'] = nums[i];
                        if (!/^[0-9a-zA-Z]{10,20}$/.test(nums[i])) {
                            _mark['isInvalid'] = true;
                        } else {
                            this.orders.push(nums[i]);
                        }
                        _num.push(_mark);
                    }
                }
                let len = this.orderNumbers.length;
                let ln = _num.length;
                if (len < MAX_SIZE) {
                    if (len + ln <= MAX_SIZE) {
                        this.orderNumbers = this.orderNumbers.concat(_num);
                    } else {
                        this.orderNumbers = this.orderNumbers.concat(_num.slice(0, MAX_SIZE - len));
                    }
                } else {
                    that.vmodal.failed('单号总数已超过' + MAX_SIZE + '！');
                }

                setTimeout(() => {
                    that.numList = '';
                }, 20);
            },
            markRemove (idx) {
                let val = this.orderNumbers[idx].value;
                this.orderNumbers.splice(idx, 1);
                for (let i = 0, len = this.orders.length; i < len; i++) {
                    if (val === this.orders[i]) {
                        this.orders.splice(i, 1);
                        break;
                    }
                }
            },
            clear () {
                this.orderNumbers = [];
                this.orders = [];
                this.numList = '';
                this.visible = true;
            },
            keyDown (e) {
                let evt = e || window.event;
                let code = evt.keyCode;
                let val = evt.target.value;

                clearInterval(this.timer);

                if (code === 17 || code === 86) {
                    evt.target.value = '';
                    return false;
                }

                if (code === 8 && val.length === 0) {
                    if (this.orderNumbers.length > 0 && this.orderNumbers.pop().value === this.orders[this.orders.length - 1]) {
                        this.orders.pop();
                    }
                }

                this.timer = setInterval(() => {
                    let val = evt.target.value;
                    if (code === 13 && /\S/g.test(val)) {
                        evt.target.value = '';
                        const bl = /^[0-9a-zA-Z]{10,20}$/.test(val);
                        this.numList = '';
                        this.orderNumbers.push({
                            value: val,
                            isInvalid: !bl
                        });
                        if (bl) {
                            this.orders.push(val);
                        }
                    }
                }, 13);
            },
            stopProp (e) {
                let evt = e || window.event;
                evt.stopPropagation();
                this.stopFocus = false;
            },
            mouseUp (e) {
                this.stopFocus = true;
            },
            click (e) {
                let that = this;
                this.isFocused = true;
                this.visible = false;
                setTimeout(() => {
                    if (that.orderIpt && !that.stopFocus) {
                        that.orderIpt.focus();
                    } else {
                        this.stopFocus = false;
                    }
                }, 20);
            },
            focus (e) {
                let evt = e || window.event;
                evt.stopPropagation();
                this.orderIpt = evt.target;
            },
            blur (e) {
                let that = this;
                let evt = e || window.event;
                this.orderIpt = evt.target;
                that.visible = true;
            }
        },
        data () {
            return {
                province: [],
                city: [],
                area: [],
                orderIpt: null,
                isFocused: false,
                initiatorId: '',
                orderNumbers: [],
                orders: [],
                tempOrders: [],
                numList: [],
                hasNoData: false,
                visible: true,
                stopFocus: false,
                paramSet: {
                    orderNumbers: ''
                },
                isFull: false,
                isDisabled: false,
                timer: null,
                remark: ''
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .v-modal-header {
        background: transparent url(../../../assets/image/ui_img/border_bg_a.png) 0 bottom repeat-x;
    }

    #demand_resend {
        .v-modal-wrapper {
            width: 480px;
        }
        .v-table-wrapper {
            height: 117px;
        }
    }

    .order-mark {
        float: left;
        border: 1px solid #ddd;
        border-radius: 2px;
        background-color: #eee;
        padding: 1px 5px;
        margin: 4px 2px 4px 3px;
        font-size: 12px;
    }

    .m-radio > span:after {
        left: 5px;
        top: 5px;
    }

    .invalid {
        color: #f60;
    }

    .clear-btn {
        float: right;
        font-size: 12px;
        padding: 2px 4px;
        border: 1px solid #bbb;
        border-radius: 2px;
        background-color: #f9f9f9;
        outline: none;
        cursor: pointer;
        &:active {
            padding: 3px 3px 1px 5px;
            box-shadow: inset 1px 1px 3px rgba(0, 0, 0, .3);
        }
    }

    .focused {
        float: left;
        line-height: 14px;
        margin: 4px 0 0 0;
        border: 1px solid transparent;
        width: 100px;
        font-size: 14px;
    }

    .normal {
        position: absolute;
        z-index: 1;
        width: 98%;
        height: 80%;
        background-color: transparent;
    }
</style>
