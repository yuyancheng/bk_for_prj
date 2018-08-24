<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="demand_forward" class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>我要转寄</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="height: 637px; overflow-y: auto;">
                <h3>选择发起人
                    <router-link class="page-link" :to="{ name: 'initiator_management'}">发起人管理 <b>»</b></router-link>
                </h3>
                <v-initiator-management ref="vInitiatorManagement"></v-initiator-management>
                <h3>我要转寄</h3>
                <div class="address-list">
                    <div>
                        <label>
                            <span>付款方式：</span>
                            <label class="m-radio"><input v-model="payType" type="radio" name="settle_accounts" value="到付"
                                                          checked/>到付<i></i></label>
                            <label class="m-radio"><input v-model="payType" type="radio" name="settle_accounts"
                                                          value="第三方结算"/>第三方结算<i></i></label>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span style="float: left;margin-top: 5px;">产品类型：</span>
                            <select v-model="proType" :value="proType" style="width:172px;height:31px;font-family: inherit;">
                                <option>顺丰标快</option>
                                <option>顺丰特惠</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span style="float: left;margin-top: 5px;"><i style="color: #f00;float:left;">&nbsp;&nbsp;&nbsp;*</i>运单号：</span>
                            <input v-model="orderNumber" type="text" style="width:160px;font-family: inherit;"/>
                        </label>
                    </div>
                    <div>
                        <label>
                            <span><i style="color: #f00;float:left;">&nbsp;&nbsp;&nbsp;*</i>收件人：</span><input v-model="contact"
                                                                                                              style="width:113px;font-family: inherit;"/>
                        </label>
                        <label>公司名称：<input v-model="company" style="width:161px;font-family: inherit;"/></label>
                    </div>
                    <div>
                        <label>
                            <span style="float: left;margin-top: 5px;"><i style="color: #f00;float:left;">*</i>联系电话：</span>
                            <input v-model="telephone" placeholder="座机/手机" style="width:370px;font-family: inherit;"/>
                        </label>
                    </div>
                    <div>
                        <label><span style="float: left;margin-top: 5px;"><i style="color: #f00;float:left;">*</i>收件地址：</span>
                            <select v-on:change="addressChanged($event, 0)" v-model="addrProvince"
                                    :style="{width:isSpecial ? '188px' : '124px', fontFamily: 'inherit'}">
                                <option v-for="item in province" :value="item.name">{{item.name}}</option>
                            </select>
                            <select v-on:change="addressChanged($event, 1)" v-model="addrCity"
                                    style="width:124px;font-family: inherit;" v-if="!isSpecial">
                                <option v-for="item in city" :value="item.name">{{item.name}}</option>
                            </select>
                            <select v-on:change="addressChanged($event, 2)" v-model="addrDistrict"
                                    :style="{width:isSpecial ? '189px' : '124px', fontFamily: 'inherit'}">
                                <option v-for="item in district" :value="item.name">{{item.name}}</option>
                            </select>
                        </label>
                        <div style="margin-left:85px;margin-top: 5px;"><label>
                            <input v-model="address" style="width:370px;height: 22px;font-family: inherit;"/></label>
                        </div>
                    </div>
                    <div>
                        <label>
                            <span style="float: left;margin-top: 5px;">备注：</span>
                            <input v-model="remark" style="width:370px;font-family: inherit;"/>
                        </label>
                    </div>
                    <p style="margin-top: 5px; padding:0 23px 0 20px; font-size: 12px; color: #999;">
                        温馨提示：同城转寄，需加收10元服务费，跨城转寄需取消代收货款服务方可安排。若该流向无所选产品类型，默认为另一种产品类型。</p>
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
    import InitiatorSettings from '@/components/logistics/requireChanges/InitiatorSettings';
    import area from '@/assets/js/area';

    let provinces = area.province;
    let cities = area.city;
    let districts = area.district;

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
                url: '/express/newForwardComplain',
                params: {},
                error (err) {
                    console.log(err);
                }
            };

            this.setDefaultArea();
        },
        mounted: function () {
            this.vi = this.$refs.vInitiatorManagement;
            this.vmodal = this.$parent.$refs.vmMsg;
            // delete this.vi.vt['vtData']['columns'][0]['data'];

            this.vi.setVisitor(this.update);
            this.initiatorId = this.vi.getDefaultValue().id;

            let modalWrapper = document.getElementById('modal_wrapper');
            let osh = modalWrapper.offsetHeight;
            this.resize(osh, modalWrapper);
            let that = this;
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
            submit () {
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            save () {
                let that = this;
                if (!/\S/g.test(this.orderNumber)) {
                    this.vmodal.failed('运单号不能为空！');
                    return false;
                } else if (!/^[0-9a-zA-Z]{10,20}$/g.test(this.orderNumber)) {
                    this.vmodal.failed('运单号应为10-20位字母与数字的任意组合！');
                    return false;
                }
                if (!/\S/g.test(this.contact)) {
                    this.vmodal.failed('“联系人姓名”不能为空！');
                    return false;
                } else if (!/\D/g.test(this.contact)) {
                    this.vmodal.failed('“联系人姓名”格式有误！');
                    return false;
                }

                if (!/\S/g.test(this.telephone)) {
                    this.vmodal.failed('“联系电话”不能为空！');
                    return false;
                } else if (!/(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)|(^[4|8]00((\d{7})|(-\d{3}-\d{4}))$)/g.test(this.telephone)) {
                    this.vmodal.failed('“联系电话”格式有误！');
                    return false;
                }

                if (!/\S/g.test(this.address)) {
                    this.vmodal.failed('“联系人地址”不能为空！');
                    return false;
                } else if (!/\D/g.test(this.address)) {
                    this.vmodal.failed('“联系人地址”格式有误！');
                    return false;
                }

                if (!this.initiatorId) {
                    this.initiatorId = this.vi.getDefaultValue().id;
                    if (!this.initiatorId) {
                        this.vmodal.failed('请选择发起人！');
                        return false;
                    }
                }

                this.isDisabled = true;

                this.ajaxSettings.params = {
                    contactsId: this.initiatorId,
                    addressee: this.contact,
                    corporate: this.company,
                    waybill: this.orderNumber,
                    paymentType: this.payType,
                    productType: this.proType,
                    address: this.addrProvince + this.addrCity + this.addrDistrict + this.address,
                    contactInfo: this.telephone,
                    remark: this.remark
                };

                // console.log(this.ajaxSettings.params);

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.code === 0) {
                        that.vmodal.loaded('转寄成功！');
                        that.$parent.tabTurn(2, 'forward', true);
                        that.$router.prev();
                    } else {
                        this.isDisabled = false;
                        this.vmodal.failed(data.message);
                    }
                };

                this.submit();
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            },
            cancel () {
                this.close();
            },
            setDefaultArea () {
                let city = [];
                let district = [];
                let cId;
                let pId = provinces[0].id;
                this.addrProvince = provinces[0].name;
                if (provinces[0].remark === '直辖市' || provinces[0].remark === '特别行政区') {
                    this.isSpecial = true;
                }
                for (let i = 0, len = cities.length; i < len; i++) {
                    if (cities[i].pid === pId) {
                        city.push({
                            id: cities[i].id,
                            name: cities[i].name
                        });
                    }
                }
                if (this.isSpecial) {
                    cId = city[0].id;
                    for (let i = 0, len = districts.length; i < len; i++) {
                        if (districts[i].cid === cId) {
                            district.push({
                                id: districts[i].id,
                                name: districts[i].name
                            });
                        }
                    }
                    this.district = district;
                    this.addrDistrict = district[0].name;
                }
            },
            addressChanged (e, idx) {
                let evt = e || window.event;
                let target = evt.target;

                let pId, cId;
                let city = [];
                let district = [];

                switch (idx) {
                    case 0:
                        for (let i = 0, len = provinces.length; i < len; i++) {
                            if (target.value === provinces[i].name) {
                                pId = provinces[i].id;
                                if (provinces[i].remark === '直辖市' || provinces[i].remark === '特别行政区') {
                                    this.isSpecial = true;
                                } else {
                                    this.isSpecial = false;
                                }
                            }
                        }

                        for (let i = 0, len = cities.length; i < len; i++) {
                            if (cities[i].pid === pId) {
                                city.push({
                                    id: cities[i].id,
                                    name: cities[i].name
                                });
                            }
                        }

                        for (let i = 0, len = cities.length; i < len; i++) {
                            if (city[0].name === cities[i].name) {
                                cId = cities[i].id;
                            }
                        }

                        for (let i = 0, len = districts.length; i < len; i++) {
                            if (districts[i].cid === cId) {
                                district.push({
                                    id: districts[i].id,
                                    name: districts[i].name
                                });
                            }
                        }

                        this.district = district;
                        this.city = city;
                        break;
                    case 1:
                        for (let i = 0, len = cities.length; i < len; i++) {
                            if (target.value === cities[i].name) {
                                cId = cities[i].id;
                            }
                        }
                        for (let i = 0, len = districts.length; i < len; i++) {
                            if (districts[i].cid === cId) {
                                district.push({
                                    id: districts[i].id,
                                    name: districts[i].name
                                });
                            }
                        }
                        this.district = district;
                        break;
                    default:
                        break;
                }
            }
        },
        data () {
            return {
                province: provinces,
                city: [],
                district: [],
                initiatorId: '',
                payType: '到付',
                proType: '顺丰标快',
                contact: '',
                company: '',
                telephone: '',
                orderNumber: '',
                address: '',
                remark: '',
                addrProvince: '',
                addrCity: '',
                addrDistrict: '',
                orderIpt: null,
                isSpecial: false,
                hasNoData: false,
                isDisabled: false,
                isFull: false
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .v-modal-header {
        background: transparent url(../../../assets/image/ui_img/border_bg_a.png) 0 bottom repeat-x;
    }

    #demand_forward {
        .v-modal-wrapper {
            width: 480px;
        }
        .v-table-wrapper {
            height: 117px;
        }
        .address-list {
            label {
                span {
                    width: 80px;
                    text-align: right;
                }
                input ~ span {
                    width: 18px;
                }
            }
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

</style>
