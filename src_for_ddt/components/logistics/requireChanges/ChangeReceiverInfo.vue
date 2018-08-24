<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="change_receiver_info" class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>我要更改收方信息</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="height: 495px; overflow-y: auto;">
                <h3>选择发起人
                    <router-link class="page-link" :to="{ name: 'initiator_management'}">发起人管理 <b>»</b></router-link>
                </h3>
                <v-initiator-management ref="vInitiatorManagement"></v-initiator-management>
                <h3>更改收方信息</h3>
                <div class="address-list">
                    <div>
                        <label><span>运单号：</span><input v-model="orderNumber" style="width:220px;font-family: inherit;"/></label>
                    </div>
                    <div>
                        <label><span>变更后收方联系人：</span><input v-model="afterChangeContact" style="width:220px;font-family: inherit;"/></label>
                    </div>
                    <div>
                        <label><span>变更后收方联系方式：</span><input v-model="afterChangeTel" style="width:220px;font-family: inherit;"/></label>
                    </div>
                    <div>
                        <label><span style="vertical-align: top;">备注：</span><textarea v-model="remark" style="width:220px;height:72px;font-family: inherit;"></textarea></label>
                    </div>
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
                url: '/express/newChangeAddresseeInfoComplain',
                params: {},
                error (err) {
                    console.log(err);
                }
            };
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
            submit () {
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            save () {
                let that = this;
                if (!this.initiatorId) {
                    this.initiatorId = this.vi.getDefaultValue().id;
                    if (!this.initiatorId) {
                        this.vmodal.failed('请选择发起人！');
                        return false;
                    }
                }
                if (!/\S/g.test(this.orderNumber)) {
                    this.vmodal.failed('运单号不能为空！');
                    return false;
                } else if (!/^[0-9a-zA-Z]{10,20}$/g.test(this.orderNumber)) {
                    this.vmodal.failed('运单号应为10-20位字母与数字的任意组合！');
                    return false;
                }
                if (!/\S/g.test(this.afterChangeContact) && !/\S/g.test(this.afterChangeTel)) {
                    this.vmodal.failed('“收方联系人与联系方式”不能同时为空！');
                    return false;
                }
                if (/\S/g.test(this.afterChangeContact) && !/\D/g.test(this.afterChangeContact)) {
                    this.vmodal.failed('“变更后收方联系人”格式有误！');
                    return false;
                }

                if (/\S/g.test(this.afterChangeTel) && !/(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)|(^[4|8]00((\d{7})|(-\d{3}-\d{4}))$)/g.test(this.afterChangeTel)) {
                    this.vmodal.failed('“变更后收方联系方式”格式有误！');
                    return false;
                }

                this.isDisabled = true;

                this.ajaxSettings.params = {
                    contactsId: this.initiatorId,
                    waybill: this.orderNumber,
                    afterChangeContact: this.afterChangeContact,
                    afterChangeTel: this.afterChangeTel,
                    remark: this.remark.replace(/\r\t/g, '\n')
                };

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.code === 0) {
                        that.vmodal.loaded('更改成功！');
                        that.$parent.tabTurn(3, 'changing', true);
                        that.$router.prev();
                    } else {
                        this.isDisabled = false;
                        that.vmodal.failed(data.message);
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
            }
        },
        data () {
            return {
                orderIpt: null,
                initiatorId: '',
                orderNumber: '',
                afterChangeTel: '',
                afterChangeContact: '',
                remark: '',
                numList: [],
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

    #change_receiver_info {
        .v-modal-wrapper {
            width: 480px;
        }

        .v-table-wrapper {
            height: 117px;
        }
        .address-list {
            label {
                span {
                    width: 145px;
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
