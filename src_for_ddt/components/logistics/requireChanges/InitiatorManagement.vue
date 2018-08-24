<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="initiator_management" class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>发起人管理</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="height: 353px; overflow-y: auto;">
                <h3>选择联系人</h3>
                <v-initiator-management ref="vInitiatorManagement"></v-initiator-management>
                <h3>添加联系人</h3>
                <div class="address-list">
                    <div>
                        <label><span>联系人姓名：</span><input v-model="username" style="width:220px;font-family: inherit;"/></label>
                    </div>
                    <div>
                        <label><span>联系人电话：</span><input v-model="telephone" style="width:220px;font-family: inherit;"/></label>
                    </div>
                </div>
            </div>
            <div style="text-align: center;margin-top: 20px;">
                <button class="m-btn m-btn-blue m-btn-circle m-btn-w-md" v-on:click="save()" :disabled="isDisabled">添加</button>
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
                url: '/express/saveOrUpdateContacts',
                params: {},
                error (err) {
                    console.log(err);
                }
            };
        },
        mounted: function () {
            this.vi = this.$refs.vInitiatorManagement;
            this.vmodal = this.$parent.$refs.vmMsg;

            // this.vi.vt['vtData']['columns'][0]['data'] = null;
            // this.vi.vt['vtData']['columns'][0]['hidden'] = true;

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
                if (!/\S/g.test(this.username)) {
                    this.vmodal.failed('“联系人姓名”不能为空！');
                    return false;
                } else if (!/\D/g.test(this.username)) {
                    this.vmodal.failed('“联系人姓名”格式有误！');
                    return false;
                }

                if (!/(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[0-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)|(^[4|8]00((\d{7})|(-\d{3}-\d{4}))$)/g.test(this.telephone)) {
                    this.vmodal.failed('“联系人电话”格式有误！');
                    return false;
                }

                this.isDisabled = true;

                this.ajaxSettings.params = {
                    contactsName: this.username,
                    contactsTel: this.telephone
                };

                this.ajaxSettings.success = (res) => {
                    this.isDisabled = false;
                    let data = res.data;
                    if (data && data.code === 0) {
                        that.vmodal.loaded('添加成功！');
                        that.vi.vt.update();
                        that.username = '';
                        that.telephone = '';
                    } else {
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
                username: '',
                telephone: '',
                hasNoData: false,
                isDisabled: false,
                isFull: false
            };
        }
    };
</script>

<style lang="less" type="text/less">
    b, strong, i {
        font-style: normal;
        font-weight: normal;
        font-family: inherit;
    }

    .v-modal-header {
        background: transparent url(../../../assets/image/ui_img/border_bg_a.png) 0 bottom repeat-x;
    }

    #initiator_management {
        .v-modal-wrapper {
            width: 480px;
        }
        .v-table-wrapper {
            height: 117px;
        }
        .address-list {
            label {
                span {
                    width: 90px;
                }
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

</style>
