<template lang="pug">
    div
        .cnt-wrapper
            div(style="height: 90px;border-bottom:1.5px solid #eee;margin-bottom:15px;")
                .opr-btns
                    el-button(@click.prevent="showDialog('addUser', '新建发运单')", round, size="large", type="primary", :disabled="btnDisabled")
                        i(class="el-icon-plus", style="margin-right:10px;")   新建发运单
            h5(style="font-size:16px;color:#555;padding:0 0 20px;font-weight:normal;") 待发运清单
            div
                el-table(
                :data="tableData",
                tooltip-effect="dark"
                style="width: 100%",
                size="medium")
                    el-table-column(type="index", label="序号", width="50")
                        template(slot-scope="scope")
                            span {{scope.$index + 1 + (tables.result.pageNum - 1) * tables.result.pageSize}}
                    el-table-column(prop="batchId", label="发运批次号", width="140")
                    el-table-column(prop="receiveCompanyName", label="接收单位", width="260", show-overflow-tooltip=true)
                    el-table-column(prop="createTm", label="创建时间", width="160")
                    el-table-column(prop="remark", label="备注", show-overflow-tooltip=true)
                    el-table-column(label="操作", width="100")
                        template(slot-scope="scope")
                            el-button(
                            style="font-size:14px;",
                            type="text",
                            @click="handlePreview(scope.$index, scope.row)") 查看
                            el-button(
                            style="font-size:14px;",
                            type="text",
                            @click="handlePrint(scope.$index, scope.row)") 打印

                el-pagination(
                style="margin-top:5px;text-align:right;",
                @size-change="handleSizeChange",
                @current-change="handleCurrentChange",
                :current-page="tables.result.pageNum",
                :page-sizes=[10, 20, 30, 40, 50, 100],
                :page-size="tables.result.pageSize",
                background,
                layout="total, sizes, prev, pager, next, jumper",
                :total="tables.result.total")

            el-dialog(
            ref="multipleTable",
            title="发运单",
            :visible.sync="dialogVisible"
            width="1000px",
            :custom-class="'dialog-css'",
            @close="close")
                el-form(
                :model="addWaybillForm", status-icon,
                :rules="rulesWaybill", ref="addWaybillForm", label-width="90px", size="mini")
                    // el-form-item(label="发运批次号")
                        span(style="width:84%;color:#000;font-weight:bold;font-size:16px;") {{addWaybillForm.batchId}}
                    el-form-item(label="寄件单位")
                        el-select(v-for="(it, idx) in sendAddress", :key="idx",
                        v-model="sendAddress[idx]", disabled,
                        :style="{width:'19%', margin: (idx % 2 === 1) ? '0 10px' : '0'}")
                    el-form-item(prop="addresser.address", label="寄件地址", v-if="!editableA")
                        span(style="width:60%;") {{addWaybillForm.addresser.address}}
                        el-button(@click="editAddress('A')", type="text", style="margin-left:20px;font-size:14px;") 修改地址

                    el-form-item(prop="addresser.address", label="寄件地址", v-if="editableA")
                        dist-picker(
                        ref="dPicker",
                        style="width:84%;display:inline-block;",
                        :singleLine="true",
                        :change="regionChange1",
                        :address="addWaybillForm.addresser.address",
                        :province="addWaybillForm.addresser.regions.lv_1",
                        :city="addWaybillForm.addresser.regions.lv_2",
                        :district="addWaybillForm.addresser.regions.lv_3",
                        :location="addWaybillForm.addresser.regions.lv_4")
                        el-button(@click="editAddress('A', true)", type="primary", round, style="margin-left:10px;", size="mini") 确定
                        el-button(@click="editAddress('A', false)", type="default", round, style="margin-left:10px;", size="mini") 取消
                    el-form-item(label="寄件人", prop="addresser.name", style="display:inline-block;width:28%;")
                        el-input(v-model="addWaybillForm.addresser.name", auto-complete="off", placeholder="寄件人")
                    el-form-item(label="电话", prop="addresser.telephone", style="display:inline-block;width:28%;")
                        el-input(v-model="addWaybillForm.addresser.telephone", auto-complete="off", placeholder="电话")

                    el-form-item(label="接收单位类型", prop="userType")
                        el-radio-group(v-model="addWaybillForm.addressee.orgTypeName")
                            el-radio(v-for="(item, idx) in unitTypeList.default",
                            :key="idx", :label="item.orgTypeName", @change="handleRadio(item.orgTypeName, item.id)")

                    el-form-item(prop="addressee.deptId", label="接收单位")
                        // span(v-if="!orgLevel.list.length", style="font-size:13px;color:#ccc;") 该类型中还没有组织，请在对应的“架构管理”中添加。
                        dept-picker(
                        :showOrgTypes="false",
                        :showDeptOptions="true",
                        :loaded="handlerLoad",
                        :change="itemChanged",
                        :config="{width:'100%',itemWidth:'20.2%'}",
                        ref="deptPicker")
                    el-form-item(prop="addressee.address", label="接收地址", v-if="!editableB")
                        span(style="width:60%;") {{addWaybillForm.addressee.address}}
                        el-button(@click="editAddress('B')", type="text", style="margin-left:20px;font-size:14px;")
                            span() {{addWaybillForm.addressee.address ? '修改地址' : '添加地址'}}

                    el-form-item(prop="addressee.address", label="接收地址", v-if="editableB")
                        dist-picker(
                        ref="dPicker",
                        style="width:84%;display:inline-block;",
                        :singleLine="true",
                        :change="regionChange2",
                        :address="addWaybillForm.addressee.address",
                        :province="addWaybillForm.addressee.regions.lv_1",
                        :city="addWaybillForm.addressee.regions.lv_2",
                        :district="addWaybillForm.addressee.regions.lv_3",
                        :location="addWaybillForm.addressee.regions.lv_4")
                        el-button(@click="editAddress('B', true)", type="primary", round, style="margin-left:10px;", size="mini") 确定
                        el-button(@click="editAddress('B', false)", type="default", round, style="margin-left:10px;", size="mini") 取消

                    el-form-item(label="收件人", prop="addressee.name", style="display:inline-block;width:28%;")
                        el-input(v-model="addWaybillForm.addressee.name", auto-complete="off", placeholder="收件人")
                    el-form-item(label="电话", prop="addressee.telephone", style="display:inline-block;width:28%;")
                        el-input(v-model="addWaybillForm.addressee.telephone", auto-complete="off", placeholder="电话")

                div(style="margin: 20px 0 0;padding-top: 10px;border-top: 1px solid #ddd;overflow: hidden;")
                    h5(style="float:left;font-size:16px;color:#555;padding:0 0 10px;font-weight:normal;") 物资清单
                    el-button(@click="addNewOne", type="text", style="float:right;") 新增一条

                div
                    el-table(
                    :data="addWaybillForm.waybillList",
                    tooltip-effect="dark"
                    style="width: 100%",
                    size="mini",)
                        el-table-column(prop="domain", label="专业", width="100")
                            template(slot-scope="scope")
                                span(v-if="!scope.row.editable") {{scope.row.domain}}
                                el-select(v-if="scope.row.editable", v-model="scope.row.domain",
                                @change="handlerChange(1, scope.row.domain)", size="mini", placeholder="必选")
                                    el-option(v-for="(item, idx) in materialData.list_1.data",
                                    :key="idx", :label="item.name", :value="item.name")

                        el-table-column(prop="category", label="类别", width="110")
                            template(slot-scope="scope")
                                span(v-if="!scope.row.editable") {{scope.row.category}}
                                el-select(v-if="scope.row.editable", v-model="scope.row.category",
                                :disabled="!materialData.list_2.selectable",
                                @change="handlerChange(2, scope.row.category)", size="mini", placeholder="必选")
                                    el-option(v-for="(item, idx) in materialData.list_2.data",
                                    :key="idx", :label="item.name", :value="item.name")

                        el-table-column(label="物资名称", width="140")
                            template(slot-scope="scope")
                                span(v-if="!scope.row.editable") {{scope.row.materialName}}
                                el-select(v-if="scope.row.editable", v-model="scope.row.materialName",
                                :disabled="!materialData.list_3.selectable",
                                @change="handlerChange(3, scope.row.materialName)", size="mini", placeholder="必选")
                                    el-option(v-for="(item, idx) in materialData.list_3.data",
                                    :key="idx", :label="item.goodsName", :value="item.goodsName")

                        el-table-column(label="单位", width="90")
                            template(slot-scope="scope")
                                span {{scope.row.unit}}

                        el-table-column(label="发运数量", width="100")
                            template(slot-scope="scope")
                                span(v-if="!scope.row.editable") {{scope.row.count}}
                                el-input-number(v-if="scope.row.editable", v-model="scope.row.count",
                                controls-position="right", :min="1", size="mini", style="width:90px;")

                        el-table-column(prop="remark", label="备注")
                            template(slot-scope="scope")
                                span(v-if="!scope.row.editable") {{scope.row.remark}}
                                el-input(v-if="scope.row.editable", v-model="scope.row.remark", size="mini")

                        el-table-column(label="操作", width="100")
                            template(slot-scope="scope")
                                el-button(
                                v-if="scope.row.editable"
                                style="font-size:13px;",
                                type="text",
                                @click.prevent="handleConfirm(scope.$index, scope.row)") 确定
                                el-button(
                                v-if="scope.row.editable"
                                style="color:#ff4a01;font-size:13px;",
                                type="text",
                                @click.prevent="handleCancel(scope.$index, scope.row)") 取消
                                el-button(
                                v-if="!scope.row.editable"
                                style="font-size:13px;",
                                type="text",
                                @click.prevent="handleEdit(scope.$index, scope.row)") 编辑
                                el-button(
                                v-if="!scope.row.editable"
                                style="color:#ff4a01;font-size:13px;",
                                type="text",
                                @click.prevent="handleDelete(scope.$index, scope.row)") 删除

                div(style="margin: 20px 0 0;overflow: hidden;")
                    h5(style="float:left;font-size:16px;color:#555;padding:0 0 10px;font-weight:normal;") 备注说明

                    el-input(type="textarea", v-model="addWaybillForm.remark", placeholder="备注(100字符以内，100以后会被自动剔除)")

                span(slot="footer", class="dialog-footer", style="margin: 0 20px 0;")
                    el-button(
                        round,
                        style="width: 90px;",
                        :disabled="cancelDisabled",
                        size="small",
                        @click="dialogVisible = false") 取 消
                    el-button(
                        round,
                        style="width: 90px;",
                        type="primary",
                        :disabled="confirmDisabled",
                        size="small",
                        @click="submitForm(formName)") 确 定

            el-dialog(
            ref="printWindow",
            title="发运单",
            :visible.sync="printWindowVisible",
            :width="winWidth",
            :custom-class="'dialog-css-print'",
            @close="close")
                div(style="width:100%;position:relative;")
                    div(v-show="hasLoaded", style="width:70%;text-align:center;margin:0 auto 0;position:relative;bottom:15px;")
                        el-button(type="primary", round, size="small", :disabled="resetDisabled", @click="doPrint", style="width:110px")
                            i(class="el-icon-printer")  打印

                    div(v-if="!hasLoaded", :style="loadStyle")
                        i(class="el-icon-loading", style="margin-right: 20px;")
                        span(style="margin-top:-3px;font-size: 14px;") 加载中...

                    iframe(id="printWindow", :style="ifrStyle", src="/#/print-preview")

                    div(v-show="hasLoaded", style="width:100%;text-align:center;position:relative;bottom:-10px;")
                        el-button(type="primary", round, size="small", :disabled="resetDisabled", @click="doPrint", style="width:110px")
                            i(class="el-icon-printer")  打印

</template>

<script type="text/ecmascript-6">
    import Distpicker from '@/components/common/distpicker/DistPicker';
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;

            const checkName = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入姓名！'));
                } else {
                    const regExp = /(^[a-zA-Z]{1,50}|[\u4e00-\u9fa5]{2,6})$/g;
                    if (!regExp.test(value)) {
                        callback(new Error('姓名格式有误！'));
                    } else {
                        callback();
                    }
                }
            };
            const checkTel = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入手机号码！'));
                } else {
                    const regExp = /(^(13|14|15|16|17|18|19)[0-9]{9}$)|(^(0[1-9]{2,3}-?)?[1-9]{1}[0-9]{6,7}$)/g;
                    if (!regExp.test(value)) {
                        callback(new Error('手机号码格式有误！'));
                    } else {
                        callback();
                    }
                }
            };
            return {
                printWindowVisible: false,
                hasLoaded: false,
                printIfrm: {},
                userInfo: {},
                sendAddress: [],
                recAddress: {
                    a: '',
                    b: '',
                    c: '',
                    d: '',
                    e: '',
                },
                lastRegions1: {
                    lv_1: '',
                    lv_2: '',
                    lv_3: '',
                    lv_4: '',
                },
                lastRegions2: {
                    lv_1: '',
                    lv_2: '',
                    lv_3: '',
                    lv_4: '',
                },
                addWaybillForm: {
                    batchId: '',
                    addresser: {
                        name: '',
                        telephone: '',
                        unitID: '',
                        address: '',
                        regions: {
                            lv_1: '',
                            lv_2: '',
                            lv_3: '',
                            lv_4: '',
                        },
                    },
                    addressee: {
                        name: '',
                        telephone: '',
                        unitID: '',
                        orgTypeId: '',
                        orgTypeName: '',
                        address: '',
                        regions: {
                            lv_1: '',
                            lv_2: '',
                            lv_3: '',
                            lv_4: '',
                        },
                    },
                    units: [],
                    userType: '',
                    remark: '',
                    waybillList: [/* {
                        domain: '',
                        editable: false,
                        unit: '',
                        materialID: '',
                        count: '',
                        category: '',
                        remark: '',
                    } */],
                },
                userSearchForm: {
                    roleType: '',
                    keyword: '',
                },
                rulesWaybill: {
                    addresser: {
                        name: [
                            { required: true, validator: checkName, trigger: 'blur' },
                        ],
                        telephone: [
                            { required: true, validator: checkTel, trigger: 'blur' },
                        ],
                        address: [
                            { required: true, message: '请完善发件人地址！', trigger: ['change', 'blur'] },
                        ],
                    },
                    addressee: {
                        name: [
                            { required: true, validator: checkName, trigger: 'blur' },
                        ],
                        telephone: [
                            { required: true, validator: checkTel, trigger: 'blur' },
                        ],
                        deptId: [
                            { required: true, message: '请选择收件单位！', trigger: 'change' },
                        ],
                        address: [
                            { required: true, message: '请完善收件人地址！', trigger: ['change', 'blur'] },
                        ],
                    },
                },
                orgTypeId: '',
                currentPage: 1,
                multipleSelection: [],
                tableData: [],
                editIndex: null,
                isLoading: false,
                hasNewOne: false,
                editableA: false,
                editableB: false,
                cancelDisabled: false,
                confirmDisabled: false,
                resetDisabled: false,
                fileUpload: {
                    name: '',
                    telephone: '',
                    address: '',
                },
                winWidth: '400px',
                dialogVisible: false,
                visible: '',
                unitTypeList: {
                    default: [],
                    getData() {
                        that.$axios.get(APIList.GET_UNIT_TYPE, {
                            data: {},
                        }).then((response) => {
                            if (response.data.rows) {
                                that.unitTypeList.default = response.data.rows;
                                if (that.unitTypeList.default.length > 0) {
                                    that.orgTypeId = that.unitTypeList.default[0].id;
                                    that.addWaybillForm.addressee.orgTypeName = that.unitTypeList.default[0].orgTypeName;
                                }
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                roleTypes: {
                    list: [],
                    getData() {
                        that.$axios.get(APIList.ROLE_TYPE_LIST, {
                            data: {
                                id: '1234',
                                name: that.unitType,
                            },
                        }).then((response) => {
                            console.log(response);
                            that.roleTypes.list = response.result.roleType;
                        }).catch((response) => {
                            console.log(response);
                        });
                    },
                },
                materialData: {
                    list_1: {
                        selectable: false,
                        data: [],
                    },
                    list_2: {
                        selectable: false,
                        data: [],
                    },
                    list_3: {
                        selectable: false,
                        data: [],
                    },
                    getData() {
                        // 获取物资基础数据
                        that.$axios.post(APIList.GET_MATERIAL_DATA, {}).then((response) => {
                            that.materialData.list_1.data = response.data;
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                tables: {
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    getData(idx, size) {
                        const param = that.$qs.stringify({
                            pageNum: idx,
                            pageSize: size || that.tables.result.pageSize,
                        });
                        that.$axios.get(`${APIList.GET_DESPATCH_LIST}?${param}`, {
                            data: {},
                        }).then((response) => {
                            if (response.data) {
                                that.tableData = response.data.rows || [];
                                that.tables.result = response.data;
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                hide: {
                    position: 'relative',
                    zIndex: '-10',
                },
                loadStyle: {
                    lineHeight: '100px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '20px',
                },
                ifrStyle: {
                    visibility: 'hidden',
                    width: '100%',
                    height: '0px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                },
                btnDisabled: false,
            };
        },
        components: { Distpicker },
        created() {
            this.init();

            // 获取批次号
            // this.$axios.post(APIList.GET_BATCH_CODE, {}).then((response) => {
            //     if (response.code === 200) {
            //         this.addWaybillForm.batchId = response.data;
            //     }
            // }).catch((response) => {
            //     console.error(response);
            // });
        },
        mounted() {
            this.printIfrm = document.getElementById('printWindow');

            // 设置建单按钮状态
            if (this.userInfo) {
                const info = this.userInfo;
                if (info.roleCode === 'MANAGER') {
                    this.btnDisabled = true;
                }
            }
        },
        methods: {
            init() {
                this.tables.getData(1);
                this.unitTypeList.getData();
                this.getUerInfo();
            },
            handleSizeChange(val) {
                this.tables.getData(1, val);
            },
            handleCurrentChange(val) {
                this.tables.getData(val);
            },
            initWaybillForm() {
                this.addWaybillForm.addresser.unitID = this.userInfo.deptId;
                this.addWaybillForm.addresser.deptName = this.userInfo.deptName;
                this.addWaybillForm.addresser.orgTypeId = this.userInfo.orgTypeId;
                this.addWaybillForm.addresser.name = this.userInfo.nickname;
                this.addWaybillForm.addresser.telephone = this.userInfo.mobilePhone;
                this.addWaybillForm.addresser.address = `${this.userInfo.provinceName || ''} ${this.userInfo.cityName || ''} ${this.userInfo.areaName || ''} ${this.userInfo.addressDetail || ''}`;
                this.addWaybillForm.addresser.name = this.userInfo.nickname || '';
                this.addWaybillForm.addresser.regions.lv_1 = this.userInfo.provinceName || '';
                this.addWaybillForm.addresser.regions.lv_2 = this.userInfo.cityName || '';
                this.addWaybillForm.addresser.regions.lv_3 = this.userInfo.areaName || '';
                this.addWaybillForm.addresser.regions.lv_4 = this.userInfo.addressDetail || '';
                this.lastRegions1.lv_1 = this.userInfo.provinceName || '';
                this.lastRegions1.lv_2 = this.userInfo.cityName || '';
                this.lastRegions1.lv_3 = this.userInfo.areaName || '';
                this.lastRegions1.lv_4 = this.userInfo.addressDetail || '';
            },
            getUerInfo() {
                let userInfo = '';
                if (localStorage) {
                    userInfo = localStorage.getItem('user_info');
                }
                if (userInfo) {
                    this.userInfo = JSON.parse(userInfo);  // 使用localStorage的用户信息
                    this.initWaybillForm();
                }
            },
            // 一种触发数据检测的方式，不推荐！
            checkData(dt) {
                const len = dt.length;
                if (len > 0) {
                    if (dt[len - 1].hidden === undefined) {
                        dt.push({
                            hidden: true,
                        });
                    } else {
                        dt.pop();
                    }
                }
            },
            handlerChange(type, name) {
                const getIndex = (dt) => {
                    for (let i = 0; i < dt.length; i += 1) {
                        if (name === dt[i].name || name === dt[i].goodsName) {
                            return i;
                        }
                    }
                    return -1;
                };
                if (type === 1) {
                    const idx = getIndex(this.materialData.list_1.data);
                    // 第一个下拉框值改变后，重置后面的所有值
                    this.addWaybillForm.waybillList[this.editIndex].category = '';
                    this.addWaybillForm.waybillList[this.editIndex].materialName = '';
                    this.addWaybillForm.waybillList[this.editIndex].unit = '';
                    this.materialData.list_2.selectable = true;
                    this.materialData.list_3.selectable = false;

                    // 第一个下拉框值改变后，重置第二个下拉框的列表内容
                    this.materialData.list_2.data = this.materialData.list_1.data[idx].childrens;
                } else if (type === 2) {
                    const idx = getIndex(this.materialData.list_2.data);
                    // 第二个下拉框值改变后，重置后面的所有值
                    this.addWaybillForm.waybillList[this.editIndex].materialName = '';
                    this.addWaybillForm.waybillList[this.editIndex].unit = '';
                    this.materialData.list_3.selectable = true;

                    // 第一个下拉框值改变后，重置第三个下拉框的列表内容
                    this.materialData.list_3.data = this.materialData.list_2.data[idx].goods;
                } else if (type === 3) {
                    const idx = getIndex(this.materialData.list_3.data);
                    const dt = this.materialData.list_3.data[idx];
                    this.addWaybillForm.waybillList[this.editIndex].materialID = dt.id;
                    this.addWaybillForm.waybillList[this.editIndex].unit = dt.goodsUnit;
                    this.checkData(this.addWaybillForm.waybillList);
                    this.checkData(this.addWaybillForm.waybillList);
                    // console.log(id);
                }
            },
            addNewOne() {
                if (this.hasNewOne) {
                    this.$message({
                        type: 'warning',
                        message: '请完成当前的编辑！',
                    });
                } else if (this.editIndex !== null) {
                    this.addWaybillForm.waybillList[this.editIndex].editable = false;
                    this.addWaybillForm.waybillList.push({
                        editable: true,
                        count: 1,
                    });
                    this.hasNewOne = true;
                    this.editIndex = this.addWaybillForm.waybillList.length - 1;
                } else {
                    this.addWaybillForm.waybillList.push({
                        editable: true,
                        count: 1,
                    });
                    this.hasNewOne = true;

                    const len = this.addWaybillForm.waybillList.length;
                    if (this.editIndex === null && this.addWaybillForm.waybillList.length === 1) {
                        this.editIndex = 0;
                    } else {
                        this.editIndex = len - 1;
                    }
                }
            },
            handleEdit(idx, row) {
                if (row) {
                    if (this.hasNewOne) {
                        this.addWaybillForm.waybillList.splice(this.editIndex, 1);
                        this.hasNewOne = false;
                    }
                    this.editIndex = idx;
                    this.addWaybillForm.waybillList[idx].editable = true;
                }
            },
            handleConfirm(idx, row) {
                const warn = (txt) => {
                    this.$message({
                        type: 'warning',
                        message: txt,
                    });
                };
                if (row) {
                    if (!this.addWaybillForm.waybillList[idx].domain) {
                        warn('请选择“专业”');
                    } else if (!this.addWaybillForm.waybillList[idx].category) {
                        warn('请选择“类别”');
                    } else if (!this.addWaybillForm.waybillList[idx].materialName) {
                        warn('请选择“物资名称”');
                    } else if (!this.addWaybillForm.waybillList[idx].count) {
                        warn('请填写“发运数量”');
                    } else {
                        this.addWaybillForm.waybillList[idx].editable = false;
                        this.materialData.list_2.selectable = false;
                        this.materialData.list_3.selectable = false;
                        this.hasNewOne = false;
                        this.editIndex = null;
                    }
                }
            },
            handleCancel(idx, row) {
                if (row) {
                    this.addWaybillForm.waybillList[idx].editable = false;
                    if (this.hasNewOne) {
                        this.addWaybillForm.waybillList.splice(idx, 1);
                        this.hasNewOne = false;
                    }
                    this.editIndex = null;
                }
            },
            getPrintWin(row) {
                const that = this;
                const timer = setInterval(() => {
                    that.printIfrm = document.getElementById('printWindow');

                    if (that.printIfrm) {
                        that.printIfrm.src = `/#/print-preview?id=${row.batchId}`;
                        clearInterval(timer);
                    }
                }, 20);
            },
            // 预览加打印
            handlePreview(idx, row) {
                const that = this;
                if (row) {
                    this.printWindowVisible = true;
                    if (!this.printIfrm) {
                        that.getPrintWin(row);
                    } else {
                        that.printIfrm.src = `/#/print-preview?id=${row.batchId}`;
                    }
                }
                window.initStatus = () => {
                    that.winWidth = '1200px';
                };
                window.setStatusReady = () => {
                    that.hasLoaded = true;
                    that.printIfrm.style.visibility = 'visible';
                };
            },
            // 不预览打印
            handlePrint(idx, row) {
                const that = this;
                if (row) {
                    this.printWindowVisible = true;
                    that.winWidth = '400px';
                    if (!this.printIfrm) {
                        that.getPrintWin(row);
                    } else {
                        that.printIfrm.src = `/#/print-preview?id=${row.batchId}`;
                    }
                    window.initStatus = () => {
                        that.winWidth = '1200px';
                    };
                    window.setStatusReady = () => {
                        that.printWindowVisible = false;
                        that.printIfrm.src = '';
                        that.printIfrm.style.height = '0px';
                        that.doPrint();
                    };
                }
            },
            // 弹出打印预览界面
            doPrint() {
                this.printIfrm.contentWindow.printPreview.print();
            },
            handleDelete(idx, row) {
                if (row) {
                    this.insureDoDelete(idx, row);
                    // this.editIndex = null;
                    // this.hasNewOne = false;
                }
            },
            // 删除确认
            insureDoDelete(idx, data) {
                if (data.length !== 0) {
                    this.$confirm('确定删除吗?', '删除提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        this.addWaybillForm.waybillList.splice(idx, 1);
                        if (this.editIndex > idx) {
                            this.editIndex -= 1;
                        }
                    }).catch(() => {});
                }
            },
            doDelete(funcSuccess, funcFail) {
                setTimeout(() => {
                    if (funcSuccess) {
                        funcSuccess();
                    }
                }, 1000);
                setTimeout(() => {
                    if (funcFail) {
                        funcFail();
                    }
                }, 2000);
            },
            regionChange1(dt, bl) {
                this.addWaybillForm.addresser.regions = dt;
                this.addWaybillForm.addresser.address = '';
                let f = false;
                if (bl) {
                    f = dt.lv_1 && dt.lv_2 && dt.lv_4;
                } else {
                    f = dt.lv_1 && dt.lv_2 && dt.lv_3 && dt.lv_4;
                }
                if (f) {
                    this.addWaybillForm.addresser.address = `${dt.lv_1} ${dt.lv_2} ${dt.lv_3} ${dt.lv_4}`;
                }
            },
            regionChange2(dt, bl) {
                this.addWaybillForm.addressee.regions = dt;
                this.addWaybillForm.addressee.address = '';
                let f = false;
                if (bl) {
                    f = dt.lv_1 && dt.lv_2 && dt.lv_4;
                } else {
                    f = dt.lv_1 && dt.lv_2 && dt.lv_3 && dt.lv_4;
                }
                if (f) {
                    this.addWaybillForm.addressee.address = `${dt.lv_1} ${dt.lv_2} ${dt.lv_3} ${dt.lv_4}`;
                }
            },
            editAddress(type, flg) {
                this.dPicker = this.$refs.dPicker;  // 地址选择器对象引用

                if (type === 'A' && typeof flg === 'undefined') {
                    this.editableA = true;
                } else if (type === 'A' && flg) {
                    this.editableA = false;
                    const address = this.dPicker.getDistData().distData;
                    // 修改后的地址
                    this.addWaybillForm.addresser.regions = address;
                    this.addWaybillForm.addresser.address = `${address.lv_1} ${address.lv_2} ${address.lv_3} ${address.lv_4}`;
                    this.$refs.addWaybillForm.validateField('addresser.address');
                    this.lastRegions1 = address;
                } else {
                    this.editableA = false;
                    this.addWaybillForm.addresser.address = `${this.lastRegions1.lv_1} ${this.lastRegions1.lv_2} ${this.lastRegions1.lv_3} ${this.lastRegions1.lv_4}`;
                    this.addWaybillForm.addresser.regions = this.lastRegions1;
                }

                if (type === 'B' && typeof flg === 'undefined') {
                    this.editableB = true;
                } else if (type === 'B' && flg) {
                    this.editableB = false;
                    const address = this.dPicker.getDistData().distData;
                    // 修改后的地址
                    this.addWaybillForm.addressee.regions = address;
                    this.addWaybillForm.addressee.address = `${address.lv_1} ${address.lv_2} ${address.lv_3} ${address.lv_4}`;
                    this.$refs.addWaybillForm.validateField('addressee.address');
                    this.lastRegions2 = address;
                } else {
                    this.editableB = false;
                    this.addWaybillForm.addressee.address = `${this.lastRegions2.lv_1} ${this.lastRegions2.lv_2} ${this.lastRegions2.lv_3} ${this.lastRegions2.lv_4}`;
                    this.addWaybillForm.addressee.regions = this.lastRegions2;
                }
            },
            handleRadio(name, id) {
                this.clearAddresseeData();
                if (id) {
                    this.addWaybillForm.addressee.deptId = '';
                    this.$refs.addWaybillForm.validateField('addressee.deptId');
                    this.orgTypeId = id;
                    this.deptPicker.clearData();
                    this.deptPicker.setOrgTypeId(id);
                }
                // this.orgLevel.getData();
                // this.orgLevelType.getData('', 0);   // 获取第一单位层级
            },
            handlerLoad(that) {
                this.deptPicker = that;  // 组织选择器对象引用
                if (this.deptPicker) {
                    this.deptPicker.clearData();
                    this.deptPicker.setOrgTypeId(this.orgTypeId);
                }
            },
            clearAddresseeData() {
                this.addWaybillForm.addressee.address = '';
                this.addWaybillForm.addressee.regions = {
                    lv_1: '',
                    lv_2: '',
                    lv_3: '',
                    lv_4: '',
                };
                this.addWaybillForm.addressee.telephone = '';
                this.addWaybillForm.addressee.name = '';
                this.lastRegions2 = this.addWaybillForm.addressee.regions;
                this.$refs.addWaybillForm.clearValidate();
            },
            itemChanged(dt) {
                const that = this;
                this.clearAddresseeData();
                if (dt.dept.id && this.curDeptId !== dt.dept.id) {
                    this.$axios.post(APIList.GET_ADDRESS_BY_DEPTID, {
                        deptId: dt.dept.id,
                    }).then((response) => {
                        if (response.code === 200) {
                            const data = response.data;
                            if (data) {
                                that.addWaybillForm.addressee.address = `${data.provinceName || ''} ${data.cityName || ''} ${data.areaName || ''} ${data.addressDetail || ''}`;
                                that.addWaybillForm.addressee.regions.lv_1 = data.provinceName || '';
                                that.addWaybillForm.addressee.regions.lv_2 = data.cityName || '';
                                that.addWaybillForm.addressee.regions.lv_3 = data.areaName || '';
                                that.addWaybillForm.addressee.regions.lv_4 = data.addressDetail || '';
                                that.addWaybillForm.addressee.telephone = data.mobilePhone || '';
                                that.addWaybillForm.addressee.name = data.nickName || '';

                                that.lastRegions2.lv_1 = data.provinceName || '';
                                that.lastRegions2.lv_2 = data.cityName || '';
                                that.lastRegions2.lv_3 = data.areaName || '';
                                that.lastRegions2.lv_4 = data.addressDetail || '';
                            }
                        } else if (response.msg || response.data.msg) {
                            this.$message({
                                type: 'error',
                                message: response.msg || response.data.msg,
                            });
                        }
                    }).catch((response) => {
                        console.error(response);
                    });
                } else if (!dt.dept.id) {
                    that.addWaybillForm.addressee.address = '';
                        that.addWaybillForm.addressee.regions.lv_1 = '';
                    that.addWaybillForm.addressee.regions.lv_2 = '';
                    that.addWaybillForm.addressee.regions.lv_3 = '';
                    that.addWaybillForm.addressee.regions.lv_4 = '';
                    that.addWaybillForm.addressee.telephone = '';
                    that.addWaybillForm.addressee.name = '';
                }
                this.curDeptId = dt.dept.id;
                this.addWaybillForm.addressee.deptId = dt.dept.id;
                // this.$refs.addWaybillForm.validateField('addressee.deptId');
            },
            getOrgInfoByDeptId(id) {
                const that = this;
                const getOrgLevelData = (data) => {
                    let n = 0;
                    const sets = [];
                    const doRecursion = (dt) => {
                        const org = dt.organization || dt.parentOrganization;
                        if (org.parentOrganization) {
                            doRecursion(org);
                        }
                        if (org) {
                            // sets[n] = org.levelName || '';
                            sets[n] = org.orgName || '';
                            n += 1;
                        }
                    };
                    doRecursion(data);
                    return sets;
                };
                const param = this.$qs.stringify({
                    id,
                });
                this.$axios.get(`${APIList.GET_ORG_INFO_BY_DEPT_ID}?${param}`, {
                    data: {},
                }).then((response) => {
                    if (response.code === 200 && response.data) {
                        const set = getOrgLevelData(response.data);
                        const len = set.length;
                        for (let m = 0; m < len; m += 1) {
                            that.sendAddress.push(set[m]);
                        }
                        that.sendAddress.push(this.userInfo.deptName);
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            showDialog(type, ttl) {
                const that = this;
                this.ttl = ttl;
                this.dialogVisible = true;

                this.sendAddress = [];
                this.formName = 'addWaybillForm';

                setTimeout(() => {
                    that.dPicker = that.$refs.dPicker;  // 地址选择器对象引用
                }, 200);

                // 获取物资基础数据
                that.materialData.getData();

                // 根据部门id获取所在组织链
                that.getOrgInfoByDeptId(this.userInfo.deptId);
            },
            close() {
                this.hasLoaded = false;
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
                this.dialogVisible = false;

                if (this.dPicker) {
                    this.dPicker.resetDistData();
                    this.editableA = false;
                    this.editableB = false;
                }

                if (this.printIfrm) {
                    this.printIfrm.src = '';
                    this.printIfrm.style.visibility = 'hidden';
                    this.printIfrm.style.height = '0px';
                    this.winWidth = '400px';
                }

                this.addWaybillForm.waybillList = [];

                if (this.$refs.addWaybillForm) {
                    this.resetForm('addWaybillForm');
                    this.$refs.addWaybillForm.clearValidate();
                }
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            submitForm(formName) {
                const that = this;
                // console.log(this.addWaybillForm);
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (that.addWaybillForm.waybillList.length) {
                            that.isLoading = true;
                            that.cancelDisabled = true;
                            that.resetDisabled = true;

                            const dt = that.addWaybillForm.waybillList;
                            const dtArr = [];
                            for (let i = 0; i < dt.length; i += 1) {
                                dtArr[i] = {};
                                dtArr[i].batchId = that.addWaybillForm.batchId || '';
                                dtArr[i].goodsId = dt[i].materialID || '';
                                dtArr[i].goodsNum = dt[i].count || '';
                                dtArr[i].remark = dt[i].remark || '';
                            }
                            that.$axios.post(APIList.SAVE_DESPATCH, {
                                // batchId: that.addWaybillForm.batchId,
                                receiveCompanyId: that.addWaybillForm.addressee.deptId,
                                receiveCompanyType: that.orgTypeId,
                                receiver: that.addWaybillForm.addressee.name,
                                receiverAddrArea: that.addWaybillForm.addressee.regions.lv_3,
                                receiverAddrCity: that.addWaybillForm.addressee.regions.lv_2,
                                receiverAddrOther: that.addWaybillForm.addressee.regions.lv_4,
                                receiverAddrProvince: that.addWaybillForm.addressee.regions.lv_1,
                                receiverTel: that.addWaybillForm.addressee.telephone,
                                remark: that.addWaybillForm.remark,
                                sendCompanyId: that.userInfo.deptId,
                                sender: that.addWaybillForm.addresser.name,
                                senderAddrArea: that.addWaybillForm.addresser.regions.lv_3,
                                senderAddrCity: that.addWaybillForm.addresser.regions.lv_2,
                                senderAddrOther: that.addWaybillForm.addresser.regions.lv_4,
                                senderAddrProvince: that.addWaybillForm.addresser.regions.lv_1,
                                senderTel: that.addWaybillForm.addresser.telephone,
                                despatchGoodsList: dtArr,
                            }).then((response) => {
                                if (response.code === 200) {
                                    this.$message({
                                        type: 'success',
                                        message: '创建成功！',
                                    });
                                    that.addWaybillForm.addressee.orgTypeName = that.unitTypeList.default[0].orgTypeName;
                                    that.addWaybillForm.waybillList = [];
                                    that.addWaybillForm.addressee.telephone = '';
                                    that.addWaybillForm.addressee.regions = {
                                        lv_1: '',
                                        lv_2: '',
                                        lv_3: '',
                                        lv_4: '',
                                    };
                                    that.addWaybillForm.remark = '';
                                    that.close();
                                    this.orgTypeId = that.unitTypeList.default[0].id;
                                    this.deptPicker.clearData();
                                    this.deptPicker.setOrgTypeId(this.orgTypeId);
                                    this.tables.getData(1);
                                } else {
                                    this.$message({
                                        type: 'error',
                                        message: response.msg,
                                    });
                                }
                            }).catch((response) => {
                                this.$message({
                                    type: 'error',
                                    message: response.msg,
                                });
                                that.addWaybillForm.waybillList = [];
                                console.error(response);
                            });
                        } else {
                            this.$message({
                                type: 'error',
                                message: '请添加物资清单！',
                            });
                        }
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '请完善相关信息！',
                        });
                        // console.log('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            resetForm(formName) {
                if (this.$refs[formName]) {
                    this.$refs[formName].resetFields();
                }
            },
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-wrapper {
        padding: 20px 30px 40px;
        background-color: #FFF;
    }
    .cnt-header {
        border-bottom: 1.5px solid #4791FF;
        background-color: #f5f5f5;
        h3 {
            padding-left: 30px;
            line-height: 48px;
            font: {
                weight: normal;
                size: 19px;
            };
            color: #565656;
        }
    }
    .form-user-info {
        width: 500px;
    }

    .opr-btns {
        > .el-button {
            display: block;
            margin: 30px auto 0;
            font-size: 16px;
        }
    }

    .lv-desc {
        font: {
            size: 12px;
        }
    }
    .el-form-item--mini.el-form-item {
        margin-bottom: 13px;
    }
    .el-button--mini, .el-button--mini.is-round {
        padding: 7px 15px;
    }
    .el-button.is-round {
        border-radius: 40px;
    }

    .el-dialog .el-dialog__header {
        border-bottom: none;
    }
</style>
