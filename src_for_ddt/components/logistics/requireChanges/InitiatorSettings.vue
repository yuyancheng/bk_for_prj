<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="initiator_management">
        <div style="height:159px;border: 1px solid #999;border-radius: 2px;">
            <v-table ref="vtRequireChanges" :vtData="tableDt"></v-table>
        </div>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">

    // import Vue from 'vue';
    import VTable from '@/components/common/table/VTable';
    import VModal from '@/components/common/modal/VModal';

    let itemSelectedIndex;
    let defaultId;

    let vTableParam = {
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
                'orderable': false,
                'position': 'left',
                'render' (dt, idx) {
                    let setStatus = (fl) => {
                        if (fl) {
                            return '<label class="m-radio"><input type="radio" name="receiverListA" checked />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i></i></label>';
                        } else {
                            return '<label class="m-radio"><input type="radio" name="receiverListA" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i></i></label>';
                        }
                    };
                    if (itemSelectedIndex || itemSelectedIndex === 0) {
                        if (idx === itemSelectedIndex) {
                            return setStatus(true);
                        } else {
                            return setStatus(false);
                        }
                    } else {
                        if (dt[0].isDefault || idx === 0) {
                            defaultId = dt[0].id;
                            return setStatus(true);
                        } else {
                            return setStatus(false);
                        }
                    }
                }
            },
            {
                'data': 'contactsName',
                'orderable': false,
                'render' (dt, idx, editable) {
                    if (editable) {
                        return '<input class="inner-edit-form" type="text" style="width: 80px;" id="edit_ipt_0" value="' + dt[1].value + '"/>';
                    } else {
                        return '<div style="width: 82px;">' + dt[1].value + '</div>';
                    }
                }
            }, {
                'data': 'contactsTel',
                'searchable': false,
                'position': 'center',
                'render' (dt, idx, editable) {
                    if (editable) {
                        return '<input class="inner-edit-form" type="text" style="width: 110px;" id="edit_ipt_1" value="' + dt[2].value + '"/>';
                    } else {
                        return '<div style="width: 112px;white-space:nowrap;overflow:hidden;">' + dt[2].value + '</div>';
                    }
                }
            }, {
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render' (dt, idx, editable) {
                    if (editable) {
                        return '<div style="width: 150px;"><i style="cursor:pointer;color:#408aff; font-style: normal;">取消</i><b style="margin-left: 10px; cursor:pointer;color:#f60;">确认修改</b></div>';
                    } else {
                        if (dt[0].isDefault === 0) {
                            return '<div style="width: 150px;"><a>修改</a> <span style="margin-right:5px;cursor:pointer;color:#408aff;">删除</span> <strong style="cursor:pointer;font-weight:normal;color:#f60;">设为默认</strong></div>';
                        } else {
                            return '<div style="width: 150px;"><a>修改</a> <span style="margin-right:5px;cursor:pointer;color:#408aff;">删除</span> <i style="font-style:normal;color:#f60;font-weight:bold;">默认联系人</i></div>';
                        }
                    }
                }
            }
        ],
        'pagination': {
            'pageSize': 3,
            'pointSize': 15
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
        'dataKeys': ['id', 'isDefault'],
        'keyMap': {
            'pageIndex': 'page',
            'pageSize': 'rows',
            'current': 'number',
            'total': 'totalPages'
        }
    };

    export default {
        template: '#main',
        components: {
            'v-table': VTable,
            'v-modal': VModal
        },
        beforeCreate: function (bus) {},
        created: function (bus) {
            vTableParam.itemClick = this.itemClick;
            this.ajaxSettings = {
                url: '/express/saveOrUpdateContacts',
                params: {},
                error (err) {
                    console.error(err);
                }
            };
        },
        mounted: function () {
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$parent.$parent.$refs.vmMsg;
        },
        methods: {
            itemClick (e, dt) {
                let that = this;
                let evt = e || window.event;
                let target = evt.target;
                evt.stopPropagation();

                if (target.type === 'radio') {
                    // itemSelectedIndex = dt.index;
                    this.visitCall && this.visitCall(dt.data[0]);
                }

                if (target.nodeName.toLowerCase() === 'a') {
                    that.vt.reRenderItem(null, dt.index, true);
                }

                if (target.nodeName.toLowerCase() === 'b') {
                    let _dt = {
                        id: dt['data'][0]['id'],
                        contactsName: document.getElementById('edit_ipt_0').value,
                        contactsTel: document.getElementById('edit_ipt_1').value
                    };
                    that.edit(_dt, () => {
                        dt.data[1]['value'] = _dt.contactsName;
                        dt.data[2]['value'] = _dt.contactsTel;
                        that.vt.reRenderItem(dt.data, dt.index, false);
                    });
                }

                if (target.nodeName.toLowerCase() === 'i') {
                    that.vt.reRenderItem(null, dt.index, false);
                }

                if (target.nodeName.toLowerCase() === 'span') {
                    this.vmodal.confirm({
                        html: '您确定要删除吗？',
                        style: {
                            width: '420px',
                            height: '210px'
                        },
                        confirm () {
                            that.ajaxSettings.url = '/express/deleteContacts';
                            that.ajaxSettings.params = {
                                id: dt.data[0].id
                            };

                            that.ajaxSettings.success = (res) => {
                                let data = res.data;
                                if (data && data.code === 0) {
                                    that.vmodal.remove();
                                    that.vmodal.loaded('删除成功！');
                                    that.vt.update(vTableParam);
                                } else {
                                    that.vmodal.failed(data.message);
                                }
                            };

                            that.submit();
                        },
                        cancel () {
                        }
                    });
                }

                if (target.nodeName.toLowerCase() === 'strong') {
                    this.ajaxSettings.url = '/express/settingDefaultContacts';
                    this.ajaxSettings.params = {
                        id: dt.data[0].id
                    };

                    this.ajaxSettings.success = (res) => {
                        let data = res.data;
                        if (data && data.code === 0) {
                            this.vmodal.loaded('设置成功！');
                            that.vt.update(vTableParam);
                        } else {
                            this.vmodal.failed(data.message);
                        }
                    };

                    this.submit();
                }
            },
            setVisitor (func) {
                this.visitCall = func;
            },
            getDefaultValue (func) {
                return {
                    id: defaultId
                };
            },
            submit () {
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            edit (dt, func) {
                if (!/\S/g.test(dt.contactsName)) {
                    this.vmodal.failed('“联系人姓名”不能为空！');
                    return false;
                } else if (!/\D/g.test(dt.contactsName)) {
                    this.vmodal.failed('“联系人姓名”格式有误！');
                    return false;
                }

                if (!/(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)|(^[4|8]00((\d{7})|(-\d{3}-\d{4}))$)/g.test(dt.contactsTel)) {
                    this.vmodal.failed('“联系人电话”格式有误！');
                    return false;
                }

                this.ajaxSettings.params = {
                    id: dt.id,
                    contactsName: dt.contactsName,
                    contactsTel: dt.contactsTel
                };

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.code === 0) {
                        this.vmodal.loaded('修改成功！');
                        func && func();
                    } else {
                        this.vmodal.failed(data.message);
                    }
                };

                this.submit();
            }
        },
        data () {
            return {
                tableDt: vTableParam,
                visitCall: null,
                visible: false
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
