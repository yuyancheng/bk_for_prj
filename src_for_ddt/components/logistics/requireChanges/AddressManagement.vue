<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="address_management" class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>退回地址管理</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="height: 479px; margin-top: 20px; overflow-y: auto; overflow-x: hidden;">
                <div style="border: 1px solid #aaa;">
                    <v-table ref="vtRequireChanges" :vtData="tableDt"></v-table>
                </div>
                <h3 style="padding: 15px 5px;font-size: 16px;color: #999;">添加退回地址</h3>
                <div class="address-list">
                    <div><label><i
                        style="color: #f00;">*</i><span>收件人：</span><input v-model="contact"
                                                                          style="width:160px;font-family: inherit;"/></label><label>公司名称：<input
                        v-model="company"
                        style="width:160px;font-family: inherit;"/></label></div>
                    <div><label><i style="color: #f00;">*</i><span>联系电话：</span><input placeholder="座机/手机"
                                                                                      v-model="telephone"
                                                                                      style="width:412px;font-family: inherit;"/></label>
                    </div>
                    <div>
                        <label><i style="color: #f00;float:left;">*</i><span style="float:left;">收件地址：</span>
                            <select v-on:change="addressChanged($event, 0)" v-model="addrProvince"
                                    :style="{width:isSpecial ? '210px' : '138px', fontFamily: 'inherit'}">
                                <option v-for="item in province" :value="item.name">{{item.name}}</option>
                            </select>
                            <select v-on:change="addressChanged($event, 1)" v-model="addrCity"
                                    style="width:138px;font-family: inherit;" v-if="!isSpecial">
                                <option v-for="item in city" :value="item.name">{{item.name}}</option>
                            </select>
                            <select v-on:change="addressChanged($event, 2)" v-model="addrDistrict"
                                    :style="{width:isSpecial ? '210px' : '138px', fontFamily: 'inherit'}">
                                <option v-for="item in district" :value="item.name">{{item.name}}</option>
                            </select>
                        </label>
                        <div style="margin-left:81px;margin-top: 5px;"><label>
                            <input v-model="address" style="width:590px;height: 22px;font-family: inherit;"/></label>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: center;margin-top: 20px;">
                <button class="m-btn m-btn-blue m-btn-circle m-btn-w-md" v-on:click="save()" :disabled="isDisabled">添加</button>
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
    import area from '@/assets/js/area';

    let provinces = area.province;
    let cities = area.city;
    let districts = area.district;

    // 表格配置参数表
    let vTableParam = {
        'thead': ['收件人/公司名称', '收件地址', '座机/手机', '操作'],
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
                'render' (dt, idx, editable) {
                    if (editable) {
                        if (dt[0].value.split('/').length > 1) {
                            return '<input class="inner-edit-form" type="text" style="width: 118px;" id="edit_ipt_' + idx + '0" value="' + dt[0].value + '"/>';
                        } else {
                            return '<input class="inner-edit-form" type="text" style="width: 118px;" id="edit_ipt_' + idx + '0" value="' + dt[0].value + '/' + dt[1].value + '"/>';
                        }
                    } else {
                        if (dt[0].value.split('/').length > 1) {
                            return '<div style="width: 120px;">' + dt[0].value + '</div>';
                        } else {
                            return '<div style="width: 120px;">' + dt[0].value + '/' + dt[1].value + '</div>';
                        }
                    }
                }
            }, {
                'data': 'corporate',
                'orderable': false,
                'hidden': true
            }, {
                'data': 'address',
                'orderable': false,
                'render' (dt, idx, editable) {
                    let addrStr = dt[2].value;
                    if (editable) {
                        let province;
                        let city;
                        let district;
                        let provinceStr = '';
                        let cityStr = '';
                        let districtStr = '';

                        let idxA = addrStr.indexOf('省');
                        let idxB = addrStr.indexOf('自治区');
                        let idxC = addrStr.indexOf('特别行政区');

                        let idxD = addrStr.indexOf('市');
                        let idxE = addrStr.indexOf('自治州');
                        let idxF = addrStr.indexOf('地区');
                        let idxG = addrStr.indexOf('盟');

                        let idxH = addrStr.indexOf('区');
                        let idxI = addrStr.indexOf('县');
                        let idxJ = addrStr.indexOf('旗');
                        let idxK = addrStr.indexOf('市');

                        let pIndex, pLen;
                        let cIndex, cLen;
                        let dIndex, dLen;
                        if (idxA !== -1) {
                            pIndex = idxA;
                            pLen = 1;
                        } else if (idxB !== -1) {
                            pIndex = idxB;
                            pLen = 3;
                        } else if (idxC !== -1) {
                            pIndex = idxC;
                            pLen = 5;
                        } else {
                            pIndex = -1;
                        }

                        if (idxD !== -1) {
                            cIndex = idxD;
                            cLen = 1;
                        } else if (idxE !== -1) {
                            cIndex = idxE;
                            cLen = 3;
                        } else if (idxF !== -1) {
                            cIndex = idxF;
                            cLen = 2;
                        } else if (idxG !== -1) {
                            cIndex = idxG;
                            cLen = 1;
                        } else {
                            cIndex = -1;
                        }

                        if (idxH !== -1) {
                            dIndex = idxH;
                            dLen = 1;
                        } else if (idxI !== -1) {
                            dIndex = idxI;
                            dLen = 1;
                        } else if (idxJ !== -1) {
                            dIndex = idxJ;
                            dLen = 1;
                        } else if (idxK !== -1) {
                            dIndex = idxK;
                            dLen = 1;
                        } else {
                            dIndex = -1;
                        }

                        if (dIndex !== -1) {
                            if (idxF !== -1) {
                                dIndex = addrStr.substring(idxF + pLen).indexOf('区');
                            } else if (idxB !== -1) {
                                dIndex = addrStr.substring(idxB + pLen).indexOf('区');
                            } else if (idxC !== -1) {
                                dIndex = addrStr.substring(idxC + pLen).indexOf('区');
                            }
                        }

                        province = addrStr.substring(0, pIndex + pLen);
                        city = addrStr.substring(pIndex + pLen, cIndex + cLen);
                        district = addrStr.substring(cIndex + cLen, dIndex + dLen);

                        let addressStr = (dIndex !== -1 ? addrStr.substring(dIndex + dLen) : '');

                        let pId, cId;
                        let isMunicipality = false;
                        let isSpecialZone = false;

                        for (let i = 0, len = provinces.length; i < len; i++) {
                            if ((province || city) !== provinces[i].name) {
                                provinceStr += '<option value="' + provinces[i].name + '">' + provinces[i].name + '</option>';
                            } else {
                                if (provinces[i].remark === '直辖市') {
                                    isMunicipality = true;
                                }
                                if (provinces[i].remark === '特别行政区') {
                                    isSpecialZone = true;
                                }
                                provinceStr += '<option value="' + provinces[i].name + '" selected>' + provinces[i].name + '</option>';
                                pId = provinces[i].id;
                            }
                        }

                        for (let i = 0, len = cities.length; i < len; i++) {
                            if (cities[i].pid === pId) {
                                if (city !== cities[i].name) {
                                    cityStr += '<option value="' + cities[i].name + '">' + cities[i].name + '</option>';
                                } else {
                                    cityStr += '<option value="' + cities[i].name + '" selected>' + cities[i].name + '</option>';
                                    cId = cities[i].id;
                                }
                            }
                        }

                        for (let i = 0, len = districts.length; i < len; i++) {
                            if (districts[i].cid === cId) {
                                if (district !== districts[i].name) {
                                    districtStr += '<option value="' + districts[i].name + '">' + districts[i].name + '</option>';
                                } else {
                                    districtStr += '<option value="' + districts[i].name + '" selected>' + districts[i].name + '</option>';
                                }
                            }
                        }

                        let iptStr = '<input class="inner-edit-form" type="text" style="width: 280px;" id="edit_ipt_' + idx + '1" value="' + addressStr + '"/>';

                        if (!isMunicipality) {
                            if (!isSpecialZone) {
                                provinceStr = '<select class="inner-edit-form" style="width: 90px; margin-bottom: 5px;" id="edit_sel_' + idx + '0">' + provinceStr + '</select>';
                                cityStr = '<select class="inner-edit-form" style="width: 100px; margin: 0 0 5px -1px;" id="edit_sel_' + idx + '1">' + cityStr + '</select>';
                                districtStr = '<select class="inner-edit-form" style="width: 100px; margin: 0 0 5px -1px;" id="edit_sel_' + idx + '2">' + districtStr + '</select>';

                                return provinceStr + cityStr + districtStr + iptStr;
                            } else {
                                provinceStr = '<select class="inner-edit-form" style="width: 288px; margin-bottom: 5px;" id="edit_sel_' + idx + '0">' + provinceStr + '</select>';

                                return provinceStr + iptStr;
                            }
                        } else {
                            provinceStr = '<select class="inner-edit-form" style="width: 150px; margin-bottom: 5px;" id="edit_sel_' + idx + '0">' + provinceStr + '</select>';
                            districtStr = '<select class="inner-edit-form" style="width: 139px; margin: 0 0 5px -1px;" id="edit_sel_' + idx + '2">' + districtStr + '</select>';

                            return provinceStr + districtStr + iptStr;
                        }
                    } else {
                        return '<div style="width: 290px;">' + addrStr + '</div>';
                    }
                }
            }, {
                'data': 'contactInfo',
                'searchable': false,
                'render' (dt, idx, editable) {
                    if (editable) {
                        return '<input class="inner-edit-form" type="text" style="width: 108px;" id="edit_ipt_' + idx + '2" value="' + dt[3].value + '"/>';
                    } else {
                        return '<div style="width: 110px;">' + dt[3].value + '</div>';
                    }
                }
            }, {
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render' (dt, idx, editable) {
                    if (editable) {
                        return '<div style="width: 136px;"><i style="cursor:pointer;color:#408aff; font-style: normal;">取消</i><b style="margin-left: 10px; cursor:pointer;color:#f60;">确认修改</b></div>';
                    } else {
                        if (dt[0].isDefault === 0) {
                            return '<div style="width: 136px;"><a>修改</a> <span style="margin-right:5px;cursor:pointer;color:#408aff;">删除</span> <strong style="cursor:pointer;font-weight:normal;color:#f60;">设为默认</strong></div>';
                        } else {
                            return '<div style="width: 140px;"><a>修改</a> <span style="margin-right:5px;cursor:pointer;color:#408aff;">删除</span> <i style="font-style:normal;color:#f60;font-weight:bold;">默认地址</i></div>';
                        }
                    }
                }
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

            if (res && typeof res === 'object' && res.constructor === Array) {
                dt = res;
            } else if (res && res.data && typeof res.data === 'object' && res.data.constructor === Array) {
                dt = res.data;
            } else if (res && res.data && res.data.list && typeof res.data.list === 'object' && res.data.list.constructor === Array) {
                dt = res.data.list;
            }

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
            vTableParam.itemClick = this.itemClick;
            this.ajaxSettings = {
                url: '/express/saveOrUpdateAddress',
                params: {},
                error (err) {
                    console.log(err);
                }
            };

            this.setDefaultArea();
        },
        mounted: function () {
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$parent.$refs.vmMsg;

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
            itemClick (e, dt) {
                let that = this;
                let evt = e || window.event;
                let target = evt.target;
                evt.stopPropagation();
                if (target.nodeName.toLowerCase() === 'a') {
                    console.log(dt);
                    this.vt.reRenderItem(null, dt.index, true);
                }

                if (target.nodeName.toLowerCase() === 'select') {
                    target.onchange = (e) => {
                        let ev = e || window.event;
                        let tar = ev.target;
                        let val = tar.value;
                        if (tar.id === 'edit_sel_' + dt.index + '0') {
                            dt.data[1]['value'] = val;
                        } else if (tar.id === 'edit_sel_' + dt.index + '1') {
                            dt.data[1]['value'] = document.getElementById('edit_sel_' + dt.index + '0').value + val;
                        }
                        that.vt.reRenderItem(dt.data, dt.index, true);
                    };
                }

                if (target.nodeName.toLowerCase() === 'b') {
                    let iptContactValue = document.getElementById('edit_ipt_' + dt.index + '0').value.split('/');
                    let selP = document.getElementById('edit_sel_' + dt.index + '0');
                    let selC = document.getElementById('edit_sel_' + dt.index + '1');
                    let selD = document.getElementById('edit_sel_' + dt.index + '2');
                    let address = selP.value + ((selC && selC.value) || '') + selD.value + document.getElementById('edit_ipt_' + dt.index + '1').value;
                    let _dt = {
                        id: dt['data'][0]['id'] || '',
                        addressee: iptContactValue[0] || '',
                        corporate: iptContactValue[1] || '',
                        address: address || '',
                        contactInfo: document.getElementById('edit_ipt_' + dt.index + '2').value || ''
                    };
                    this.edit(_dt, () => {
                        dt.data[0]['value'] = _dt.addressee + '/' + _dt.corporate;
                        dt.data[1]['value'] = _dt.address;
                        dt.data[2]['value'] = _dt.contactInfo;
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
                            that.ajaxSettings.url = '/express/deleteAddress';
                            that.ajaxSettings.params = {
                                id: dt.data[0].id
                            };

                            that.ajaxSettings.success = (res) => {
                                let data = res.data;
                                if (data && data.code === 0) {
                                    that.vmodal.remove();
                                    that.vmodal.loaded('删除成功！');
                                    that.vt.update();
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
                    this.ajaxSettings.url = '/express/settingDefaultAddress';
                    this.ajaxSettings.params = {
                        id: dt.data[0].id
                    };

                    this.ajaxSettings.success = (res) => {
                        let data = res.data;
                        if (data && data.code === 0) {
                            this.vmodal.loaded('设置成功！');
                            this.vt.update();
                        } else {
                            this.vmodal.failed(data.message);
                        }
                    };

                    this.submit();
                }
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
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
            },
            submit () {
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            save () {
                if (!/\S/g.test(this.contact)) {
                    this.vmodal.failed('“联系人姓名”不能为空！');
                    return false;
                }
                if (!/\S/g.test(this.address)) {
                    this.vmodal.failed('“联系人地址”不能为空！');
                    return false;
                } else if (!/\D/g.test(this.address)) {
                    this.vmodal.failed('“联系人地址”格式有误！');
                    return false;
                }
                if (!/\S/g.test(this.telephone)) {
                    this.vmodal.failed('“联系电话”不能为空！');
                    return false;
                } else if (!/(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)|(^[4|8]00((\d{7})|(-\d{3}-\d{4}))$)/g.test(this.telephone)) {
                    this.vmodal.failed('“联系电话”格式有误！');
                    return false;
                }

                this.isDisabled = true;

                this.ajaxSettings.url = '/express/saveOrUpdateAddress';

                this.ajaxSettings.params = {
                    addressee: this.contact,
                    corporate: this.company,
                    address: this.addrProvince + this.addrCity + this.addrDistrict + this.address,
                    contactInfo: this.telephone
                };

                // console.log(this.ajaxSettings.params);

                this.ajaxSettings.success = (res) => {
                    this.isDisabled = false;
                    let data = res.data;
                    if (data && data.code === 0) {
                        this.vmodal.loaded('添加成功！');
                        this.vt.update();
                        this.contact = '';
                        this.company = '';
                        this.address = '';
                        this.telephone = '';
                        // this.addrProvince = '';
                        // this.addrCity = '';
                        // this.addrDistrict = '';
                    } else {
                        this.vmodal.failed(data.message);
                    }
                };

                this.submit();
            },
            edit (dt, func) {
                if (!/\S/g.test(dt.contactsName)) {
                    this.vmodal.failed('“联系人姓名”不能为空！');
                    return false;
                } else if (!/\D/g.test(dt.contactsName)) {
                    this.vmodal.failed('“联系人姓名”格式有误！');
                    return false;
                }

                if (!/\S/g.test(dt.address)) {
                    this.vmodal.failed('“联系人地址”不能为空！');
                    return false;
                } else if (!/\D/g.test(dt.address)) {
                    this.vmodal.failed('“联系人地址”格式有误！');
                    return false;
                }

                if (!/\S/g.test(dt.contactInfo)) {
                    this.vmodal.failed('“联系方式”不能为空！');
                    return false;
                } else if (!/(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)|(^[4|8]00((\d{7})|(-\d{3}-\d{4}))$)/g.test(dt.contactInfo)) {
                    this.vmodal.failed('“联系方式”格式有误！');
                    return false;
                }

                this.ajaxSettings.params = {
                    id: dt.id,
                    addressee: dt.addressee,
                    corporate: dt.corporate,
                    address: dt.address,
                    contactInfo: dt.contactInfo
                };

                this.ajaxSettings.url = '/express/saveOrUpdateAddress';
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.code === 0) {
                        this.vmodal.loaded('修改成功！');
                        func && func();
                    } else {
                        this.vmodal.failed(data.message);
                    }
                };

                this.ajaxSettings.error = (res) => {
                    this.vmodal.failed('修改失败！');
                };

                this.submit();
            },
            cancel () {
                this.close();
            }
        },
        data () {
            return {
                tableDt: vTableParam,
                province: provinces,
                city: [],
                district: [],
                contact: '',
                company: '',
                telephone: '',
                address: '',
                addrProvince: '',
                addrCity: '',
                addrDistrict: '',
                hasNoData: false,
                isSpecial: false,
                isFull: false,
                isDisabled: false
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .v-modal-header {
        background: transparent url(../../../assets/image/ui_img/border_bg_a.png) 0 bottom repeat-x;
    }

    #address_management {
        .v-modal-wrapper {
            width: 760px;
        }
        .v-table-wrapper {
            height: 214px;
            overflow-y: auto;
        }
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

    .inner-edit-form {
        width: 140px;
        height: 22px;
        line-height: 22px;
        padding: 0 3px;
        border: 1px solid #3B8EDE;
        background-color: #fff;
    }

    select.inner-edit-form {
        height: 24px;
        padding: 0;
    }
</style>
