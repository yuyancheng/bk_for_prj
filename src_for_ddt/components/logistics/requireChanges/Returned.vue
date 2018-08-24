<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>我要退回</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div>
                <h3>选择发起人
                    <router-link class="page-link" :to="{ name: 'initiator_management'}">发起人管理 <b>»</b></router-link>
                </h3>
                <div style="border: 1px solid #999;border-radius: 2px;">
                    <v-table ref="vtRequireChanges" :vtData="tableDtA"></v-table>
                </div>
                <div style="overflow: hidden;">
                    <div style="float: left"><h3>我要退回的运单号</h3></div>
                    <div style="float: right;font-size:14px;padding-top: 10px;">
                        <label> 付款方式：<select v-model="payType"
                                             style="width: 100px;border: 1px solid #999; height: 30px; margin-right: 20px;border-radius: 2px;">
                            <option value="到付">到付</option>
                            <option value="第三方支付">第三方支付</option>
                        </select></label>
                        <label> 产品类型：<select v-model="proType"
                                             style="width: 100px;border: 1px solid #999; height: 30px;border-radius: 2px;">
                            <option value="顺丰特惠">顺丰特惠</option>
                            <option value="顺丰标快">顺丰标快</option>
                        </select></label>
                    </div>
                </div>
                <div
                    style="position:relative;border: 1px solid #aaa; padding: 5px 6px; min-height:50px;  max-height:84px; overflow: auto; outline: none;border-radius: 2px;"
                    v-on:click="click()">
                    <span class="order-mark" spellcheck="false" v-for="(item, idx) in orderNumbers" v-on:click="stopProp($event)" v-on:mouseup="mouseUp()"
                          :class="{'invalid': item.isInvalid}">{{item.value}}<i class="mark-cls" v-on:click="markRemove(idx)">&nbsp;</i></span>
                    <input v-on:paste="paste()" v-on:blur="blur()" v-on:focus="focus()" v-on:keydown="keyDown()"
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
                <h3>选择退回地址
                    <router-link class="page-link" :to="{ name: 'address_management'}">退回地址管理 <b>»</b></router-link>
                </h3>
                <div style="border: 1px solid #999;border-radius: 2px;">
                    <v-table ref="vtRequireChanges" :vtData="tableDtB"></v-table>
                </div>
                <div style="font-size: 14px; margin: 20px 0;"><label><span>备注(非必填)：</span>
                    <input v-model="remark"
                           style="width:533px; height:30px; padding: 0 5px;border:1px solid #999;border-radius: 2px;font-family: inherit;"/></label>
                </div>
            </div>
            <div style="text-align: center;margin-top: 20px;">
                <button class="m-btn m-btn-blue m-btn-circle m-btn-w-md" v-on:click="save()" :disabled="isDisabled">确定</button>
                <a class="m-btn m-btn-default m-btn-circle m-btn-w-md" v-on:click="cancel()"
                   href="javascript:void(0)">取消</a>
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
    // import VModal from '@/components/common/modal/VModal';

    let itemSelectedIndexA;
    let itemSelectedIndexB;
    let defaultIdA;
    let defaultIdB;
    let defaultAddrData;

    let vTableParamA = {
        'data': [],
        'dataURL': '/express/findContacts',
        'params': {
            'page': 1,
            'rows': 3
        },
        'draw': 0,
        'displayStart': 0,
        'lengthMenu': [5, 10, 15, 20],
        'language': '',
        'searching': false,
        'processing': true,
        'columns': [
            {
                'data': 'contactsName',
                'orderable': false,
                'position': 'left',
                'render' (dt, idx) {
                    let setStatus = (fl) => {
                        if (fl) {
                            return '<label class="m-radio"><input type="radio" name="receiverListA" checked />' + dt[0].value + '<i></i></label>';
                        } else {
                            return '<label class="m-radio"><input type="radio" name="receiverListA" />' + dt[0].value + '<i></i></label>';
                        }
                    };
                    if (itemSelectedIndexA || itemSelectedIndexA === 0) {
                        if (idx === itemSelectedIndexA) {
                            return setStatus(true);
                        } else {
                            return setStatus(false);
                        }
                    } else {
                        if (dt[0].isDefault || idx === 0) {
                            defaultIdA = dt[0].id;
                            return setStatus(true);
                        } else {
                            return setStatus(false);
                        }
                    }
                }
            }, {
                'data': 'contactsTel',
                'searchable': false
            }
        ],
        'pagination': {
            'pageSize': 3,
            'pointSize': 20
        },
        'dataReady' (res) {
            let dt = {
                total: res.data && res.data.data && res.data.data.totalPages,
                size: res.data && res.data.data && res.data.data.size,
                data: res.data && res.data.data && res.data.data.content
            };

            return dt;
        },
        'created': this.done,
        'keyMap': {
            'pageIndex': 'page',
            'pageSize': 'rows',
            'current': 'number',
            'total': 'totalPages'
        },
        'dataKeys': ['id', 'isDefault']
    };
    let vTableParamB = {
        'thead': ['收件人/公司名称', '收件地址', '座机/手机'],
        'data': [],
        'dataURL': '/express/findAddress',
        'params': {
            'page': 1,
            'rows': 3
        },
        'draw': 0,
        'displayStart': 0,
        'lengthMenu': [5, 10, 15, 20],
        'language': '',
        'searching': false,
        'processing': true,
        'columns': [
            {
                'data': 'addressee',
                'orderable': false,
                'render' (dt, idx) {
                    let setStatus = (fl) => {
                        if (fl) {
                            return '<label class="m-radio" style="width: 100px"><input type="radio" name="receiverListB" checked />' + dt[0].value + '<i></i></label>';
                        } else {
                            return '<label class="m-radio" style="width: 100px"><input type="radio" name="receiverListB" />' + dt[0].value + '<i></i></label>';
                        }
                    };
                    if (itemSelectedIndexB || itemSelectedIndexB === 0) {
                        if (idx === itemSelectedIndexB) {
                            return setStatus(true);
                        } else {
                            return setStatus(false);
                        }
                    } else {
                        if (dt[0].isDefault || idx === 0) {
                            defaultAddrData = dt;
                            defaultIdB = dt[0].id;
                            return setStatus(true);
                        } else {
                            return setStatus(false);
                        }
                    }
                }
            }, {
                'data': 'address',
                'orderable': false,
                'position': 'left'
            }, {
                'data': 'contactInfo',
                'searchable': false,
                'position': 'left'
            }
        ],
        'pagination': {
            'pageSize': 3,
            'pointSize': 10
        },
        'dataReady' (res) {
            let dt = {
                total: res.data && res.data.data && res.data.data.totalPages,
                size: res.data && res.data.data && res.data.data.size,
                data: res.data && res.data.data && res.data.data.content
            };

            return dt;
        },
        'created': this.done,
        'keyMap': {
            'pageIndex': 'page',
            'pageSize': 'rows',
            'current': 'number',
            'total': 'totalPages'
        },
        'dataKeys': ['id', 'isDefault']
    };

    export default {
        template: '#main',
        components: {
            'v-table': VTable,
            'v-modal': VModal
        },
        beforeCreate: function (bus) {
            window.onunload = (e) => {
                this.$router.prev();
            };
        },
        created: function (bus) {
            vTableParamA.itemClick = this.itemClickA;
            vTableParamB.itemClick = this.itemClickB;

            this.ajaxSettings = {
                url: '/express/newReturnComplain',
                params: {},
                error (err) {
                    console.error(err);
                }
            };
        },
        mounted: function () {
            // this.vmodal = this.$refs.vmMsg;
            this.vmodal = this.$parent.$refs.vmMsg;

            let modalWrapper = document.getElementById('modal_wrapper');
            let osh;
            let that = this;
            setTimeout(() => {
                osh = modalWrapper.offsetHeight;
                this.resize(osh, modalWrapper);
            }, 200);
            window.onresize = () => {
                that.resize(osh, modalWrapper);
            };

            this.resetHeight();
        },
        methods: {
            resize (h, el) {
                if (h % 2 !== 0) {
                    el.style.paddingTop = 21 + 'px';
                }

                this.isFull = h > window.innerHeight;
            },
            itemClickA (e, dt) {
                let evt = e || window.event;
                let target = evt.target;
                evt.stopPropagation();
                if (target.nodeName.toLowerCase() === 'input') {
                    itemSelectedIndexA = dt.index;
                    this.paramSet.initiatorId = dt.data[0].id;
                }
            },
            itemClickB (e, dt) {
                let evt = e || window.event;
                let target = evt.target;
                evt.stopPropagation();
                if (target.nodeName.toLowerCase() === 'input') {
                    itemSelectedIndexB = dt.index;
                    this.addrData = dt.data;
                    this.paramSet.addressId = dt.data[0].id;
                }
            },
            doSave () {
                let that = this;
                this.paramSet.payType = this.payType;
                this.paramSet.proType = this.proType;
                this.paramSet.remark = this.remark;
                this.paramSet.orderNumbers = this.tempOrders.toString();

                if (!this.paramSet.initiatorId) {
                    this.paramSet.initiatorId = defaultIdA;
                    if (!this.paramSet.initiatorId) {
                        this.vmodal.failed('请选择发起人！');
                        return false;
                    }
                }
                if (!this.paramSet.addressId) {
                    this.paramSet.addressId = defaultIdB;
                    if (!this.paramSet.addressId) {
                        this.vmodal.failed('请选择退回地址！');
                        return false;
                    }
                }
                // console.log(this.paramSet);
                if (!this.paramSet.orderNumbers) {
                    this.vmodal.failed('请输入有效运单号！');
                    return false;
                }

                this.isDisabled = true;

                this.ajaxSettings.params = {
                    contactsId: this.paramSet.initiatorId,
                    addressId: this.paramSet.addressId,
                    paymentType: this.paramSet.payType,
                    productType: this.paramSet.proType,
                    waybills: this.paramSet.orderNumbers,
                    remark: this.paramSet.remark
                };
                // console.log(this.ajaxSettings.params);

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.code === 0) {
                        let _dt = JSON.parse(data.data);
                        let _len = _dt.success && _dt.success.length;
                        let _ln = _dt.failures && _dt.failures.length;
                        if (_dt.failures && _dt.failures.length > 0) {
                            this.isDisabled = false;
                            that.vmodal.failed('您的退回请求已发起，其中成功发起 ' + _len + ' 个，<br/>失败 ' + _dt.failures.length + ' 个！');
                            let fArr = [];
                            for (let i = 0; i < _ln; i++) {
                                fArr[i] = {
                                    value: _dt.failures[i],
                                    isInvalid: true
                                };
                            }
                            that.clear();
                            that.orderNumbers = fArr;
                            that.$parent.tabTurn(0, 'returned', true);
                        } else {
                            that.vmodal.loaded('退回发起成功！');
                            that.$parent.tabTurn(0, 'returned', true);
                            that.$router.prev();
                        }
                    } else {
                        this.isDisabled = false;
                        that.vmodal.failed('退回失败！<br/><br/>' + data.message);
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

                // if (idxs.length > 0) {
                if (len > 0) {
                    let repeatStr = '';
                    let addrStr = '';
                    let telStr = '';
                    let size = 40;

                    if (that.addrData === null) {
                        that.addrData = defaultAddrData;
                    }
                    let addr = that.addrData[1].value;
                    let tel = that.addrData[2].value;

                    let spStr = '';
                    let spSize = Math.floor((size - addr.length) / 2);

                    for (let i = 0; i < spSize; i++) {
                        spStr += '&nbsp;';
                    }

                    if (idxs.length > 0) {
                        repeatStr = '（包括' + idxs.length + '个重复单号）';
                    }
                    let hdStr = '<td colspan="3" style="text-align:center;">您确定将此' + len + '个单号' + repeatStr + '，退回到如下地址吗？<br/><br/></td>';
                    if (that.addrData[1].value !== undefined) {
                        addrStr = '<tr><td>' + spStr + '</td><td style="text-align:left;font-size:14px;">' + addr + '</td><td>' + spStr + '</td></tr>';
                    }
                    if (that.addrData[2].value !== undefined) {
                        telStr = '<tr><td>' + spStr + '</td><td style="text-align:left;font-size:14px;">联系电话：' + tel + '</td><td>' + spStr + '</td></tr>';
                    }
                    let tabStr = '<table style="width:100%;"><thead>' + hdStr + '</thead><tbody>' + addrStr + telStr + '</tbody></table>';
                    that.vmodal.confirm({
                        // html: '共 ' + len + ' 个单号，<br/>包括 ' + idxs.length + ' 个重复的单号！',
                        html: tabStr,
                        style: {
                            width: '510px',
                            height: '270px'
                        },
                        confirm (dt) {
                            that.doSave();
                            that.vmodal.remove();
                        },
                        cancel () {
                        }
                    });
                } else {
                    that.doSave();
                }
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            },
            cancel () {
                this.close();
            },
            // 捕获粘贴事件
            paste (e) {
                let that = this;
                let clipboardData = (event.clipboardData || window.clipboardData); // 获取剪贴板对象
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
                evt.stopPropagation();
                this.orderIpt = evt.target;
                that.visible = true;
            },
            resetHeight () {
                let target = this.$el.childNodes[0];
                let h = target.clientHeight;
                if (h % 2 !== 0) {
                    target.style.height = h + 1 + 'px';
                }
            }
        },
        data () {
            return {
                tableDtA: vTableParamA,
                tableDtB: vTableParamB,
                province: [],
                city: [],
                area: [],
                orderIpt: null,
                isFocused: false,
                orderNumbers: [],
                orders: [],
                tempOrders: [],
                numList: '',
                hasNoData: false,
                visible: true,
                remark: '',
                payType: '到付',
                proType: '顺丰特惠',
                paramSet: {
                    orderNumbers: ''
                },
                isFull: false,
                isDisabled: false,
                timer: null,
                addrData: null
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .v-modal-header {
        background: transparent url(../../../assets/image/ui_img/border_bg_a.png) 0 bottom repeat-x;
    }

    .address-list {
        div {
            margin-bottom: 10px;
        }
        label {
            display: inline-block;
            font-size: 14px;
            text-align: left;
            margin: 0 10px 0 0;
            span {
                display: inline-block;
                width: 70px;
                margin-left: 5px;
            }
            input {
                border: 1px solid #999;
                line-height: 20px;
                padding: 5px;
                border-radius: 2px;
                color: #333;
            }
            select {
                border: 1px solid #999;
                line-height: 32px;
                height: 32px;
                border-radius: 2px;
                color: #333;
                float: left;
                margin-right: 5px;
            }
            textarea {
                padding: 5px;
                border-radius: 2px;
                border: 1px solid #999;
                resize: none;
                color: #333;
            }
        }
    }

    .v-modal-cls {
        position: absolute;
        top: 15px;
        right: 15px;
        display: inline-block;
        cursor: pointer;
    }

    table {
        tbody {
            td {
                a {
                    margin: 0 3px;
                    color: #408aff;
                    cursor: pointer;
                }
                b {
                    margin: 0 3px;
                    color: #f60;
                    font-weight: normal;
                }
            }
        }

        label {
            margin-bottom: 0 !important;
        }
    }

    tbody {
        :first-child {
            td {
                border-top: 1px solid #fff !important;
            }
        }
        :last-child {
            td {
                border-bottom: 1px solid #fff !important;
            }
        }
    }

    .page-link {
        font-size: 12px;
        float: right;
        color: #408aff;

        b {
            font-size: 16px;
            zoom: 1.2;
            font-weight: normal;
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

        i {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: -3px;
            margin-left: 4px;
            text-align: center;
            font-size: 10px;
            color: #659dfe;
            cursor: pointer;
            user-select: none;

            &:before {
                content: 'X';
            }

            &:hover {
                color: #f60;
            }
        }
    }

    .m-radio > span:after {
        left: 5px;
        top: 5px;
    }

    .invalid {
        color: #f60;
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
