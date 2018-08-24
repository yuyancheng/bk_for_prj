<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="ddt-tools" style="position:relative;margin-bottom: 50px;">
        <div class="content-title no-bdr">
            <h4 class="title-name">分仓模拟
                <span style="float: right;">
                    <span class="simulate-step current-step"><b>1</b>数据导入&nbsp;&#9658;</span>
                    <span class="simulate-step"><b>2</b>模拟结果&nbsp;&#9658;</span>
                    <span class="simulate-step"><b>3</b>对比详情</span>
                </span>
            </h4>
        </div>
        <ul class="nav-tabs">
            <li v-for="(item, index) in tabs" :class="{'active': item.active}">
                <a href="javascript:void(0)" v-on:click="tabTurn(index, item.code)">{{item.name}}</a>
            </li>
        </ul>

        <div v-if="hasNoAuth && !tabs[0].hasAuth" class="has-no-auth-tip">您还不是顺丰的入仓用户,<br/>暂时无法使用该功能！</div>

        <div>
            <h2 style="font-size: 17px;color:#333;">参数设置</h2>
            <p style="margin-top: 5px;font-size: 12px;color:#888;">我们将根据您在顺丰1-3年的历史件量数据情况进行分仓模拟测算</p>
            <div style="margin-top: 20px;">
                <i style="color: #f00;">*</i><label for="dt_period" style="font-size: 15px;color: #7c7c7c;">调拨周期
                <i v-on:mouseenter="hover()" v-on:mouseleave="leave()" class="question-mark"
                   b-model='{"title": "", "body": "最近一次调拨补货距离上一次所需间隔的平均天数。"}'>?</i>：</label>
                <select id="dt_period" v-model="period" class="form-control w-md" style="margin-right: 10px;">
                    <option value="7">7天</option>
                    <option value="14">14天</option>
                    <option value="21">21天</option>
                    <option value="30">30天</option>
                </select>
                <i style="color: #f00;">*</i><label for="dt_days" style="font-size: 15px;color: #7c7c7c;">安全库存天数
                <i v-on:mouseenter="hover()" v-on:mouseleave="leave()" class="question-mark"
                   b-model='{"title": "", "body": "平均安全库存可以满足的销售周转天数。"}'>?</i>：</label>
                <select id="dt_days" v-model="days" class="form-control w-md" style="margin-right: 10px;">
                    <option value="2">2天</option>
                    <option value="3">3天</option>
                    <option value="5">5天</option>
                    <option value="7">7天</option>
                </select>
                <label for="dt_city" style="font-size: 15px;color: #7c7c7c;">主仓所在城市：</label>
                <select id="dt_city" v-model="city" class="form-control w-md">
                    <option value="">选择城市</option>
                    <option v-for="item in whCities">{{item}}</option>
                </select>
            </div>
            <div style="margin-top: 18px;">
                <div style="float: left; width: 120px; line-height: 26px; font-size: 15px; color: #7c7c7c;">需要保留的分仓：</div>
                <div style="margin-left: 124px;">
                    <div style="display: inline-block;">
                        <a v-for="item in cities" class="m-btn m-btn-default m-btn-w-ms m-btn-active">{{item.name}}<i
                            v-on:click="remove(item)"></i></a>
                    </div>
                    <div style="display: inline-block; margin-left: 10px;">
                        <router-link class="tools-city-add" :to="{ name:'adding_cities'}"><i class="circle-btn-add"></i>添加</router-link>
                        <span style="margin-left: 5px; color: #999; font-size: 12px;">最多可添加10个</span>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="tabs[1].active">
            <h2 style="font-size: 17px;color:#333;">数据上传</h2>
            <form id="uploadForm">
                <div style="margin-top: 20px;">
                    <i style="color: #f00;">*</i><label for="dt_period" style="font-size: 15px;color: #7c7c7c;">流向件量信息
                    <i v-on:mouseenter="hover()" v-on:mouseleave="leave()" class="question-mark"
                       b-model='{"title": "", "body": "建议您提供最近一年的商品流向件量数据。"}'>?</i>：</label>
                    <a class="m-btn m-btn-circle-blue m-btn-circle m-btn-w-ms" style="margin-right: 20px; color: #3B8EDE;"
                       href="/rptWsRun/exportExcel" target="_self">下载模板</a>

                    <!--<v-upload ref="vUpload" :vuData="uploadData">-->
                    <span id="load_control" class="load-control">
                        <input type="file" v-on:change="fileSelected($event)" :disabled="stepB"
                               accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
                        <a v-bind:style="{zIndex: isLoading ? 2 : 0}" :class="{'disabled':processing || disabled}">
                            <b>上传{{isLoading ? ('中(' + loadSize + '%)') : ''}}</b>
                            <span v-bind:style="{width: loadSize + '%'}"></span>
                        </a>
                    </span>
                    <!--</v-upload>-->

                    <span v-if="processing" class="load-process"><i class="loading size-xs" style="margin-bottom: -3px;"></i>{{statuStr}}</span>
                    <span v-if="hasLoaded" class="load-success">{{statuStr}}</span>
                    <span v-if="hasError" class="load-error">提示：{{errorStr}}</span>
                </div>
            </form>
        </div>
        <div style="margin-top: 25px; padding: 30px 0; border-top: 1px solid rgb(234, 234, 234); text-align: center;">
            <button class="m-btn m-btn-blue m-btn-circle m-btn-w-ms" v-bind:disabled="tabs[1].active && isDisabled" v-on:click="simulate()"
                    style="border:3px solid #9DC6EE;">开始模拟
            </button>
        </div>

        <div style="height: 10px; margin: 0; padding: 0; background-color: #EDF1F5;"></div>
        <div>
            <h2 style="margin: 10px 0 17px; font-size: 17px; color: #333;">模拟计算历史数据</h2>
            <div>
                <v-table ref="vtRequireChanges" :vtData="tableDt"></v-table>
            </div>
        </div>

        <!-- 发送确认 -->
        <div v-show="showModalConfirm" class="vm-win">
            <div class="vm-win-wrapper" style="width: 380px; height: 200px;">
                <div style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                    <h2 style="font-size: 17px; color: #444;">消息提示</h2>
                </div>
                <div style="padding: 20px 0; text-align: center;">
                    <p style="line-height: 24px; font-size: 15px; color: #777;">预计在<span style="color: #e78936;">3小时</span>后完成计算！<br/>届时可以在下方的“模拟计算历史记录”中查<br/>看模拟结果。
                    </p>
                </div>
                <div style="text-align: center;">
                    <button v-on:click="iGetIt()" type="button" class="m-btn m-btn-circle m-btn-blue m-btn-w-md">我知道了</button>
                </div>
            </div>
            <div class="vm-veil"></div>
        </div>

        <router-view></router-view>
        <v-bubble ref="vBubble"></v-bubble>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import VTable from '@/components/common/table/VTable';
    import VModal from '@/components/common/modal/VModal';
    import VUpload from '@/components/common/loadfile/Upload';
    import VBubble from '@/components/common/modal/Bubble';
    import data from '@/assets/js/tdata';
    import axios from 'axios';

    let vtdata = data;

    // vTable配置参数
    let vTableParam = {
        'thead': ['序号', '开始模拟时间', '完成模拟时间', '上传附件', '导入数据（条）', '可用数据（条）', '查看模拟结果'],
        // 'data': [],
        'dataURL': '/rptWsRun/findRptWsRunLog',
        'params': {
            'page': 1,
            'rows': 10
        },
        'draw': 0,
        'displayStart': 0,
        'lengthMenu': [5, 10, 15, 20, 50],
        'language': '',
        'searching': false,
        'processing': true,
        'columns': [
            {
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render' (dt, idx) {
                    return idx + 1;
                }
            }, {
                'data': 'beginTime',
                'orderable': false,
                'position': 'center'
            }, {
                'data': 'finishTime',
                'orderable': false,
                'position': 'center'
            }, {
                'data': 'titleName',
                'searchable': false,
                'position': 'center'
            }, {
                'data': 'inputNums',
                'position': 'center'
            }, {
                'data': 'validDataNums',
                'position': 'center'
            }, {
                'data': 'runStatus',
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render' (dt, idx) {
                    if (dt[6] && dt[6]['value'] === 'run') {
                        return '<a class="m-btn m-btn-circle-blue m-btn-circle m-btn-w-ms paused">进行中</a>';
                    } else if (dt[6] && dt[6]['value'] === 'finish') {
                        let href = '#/tools/data_import/simulation_result';
                        let className = 'm-btn m-btn-circle-blue m-btn-circle m-btn-w-ms';
                        let beginTime = encodeURI(new Date(dt[1]['value']).getTime() / 1000);
                        let finishTime = encodeURI(new Date(dt[2]['value']).getTime());
                        let titleName = encodeURI(dt[3]['value']);
                        let param = '?beginTime=' + (beginTime || '') +
                            (finishTime && !isNaN(finishTime) ? '&finishTime=' + finishTime : '') +
                            (titleName && titleName !== 'null' ? '&titleName=' + titleName : '');

                        return '<a href="' + href + param + '" class="' + className + '">模拟结果</a>';
                    } else if (dt[6] && dt[6]['value'] === 'error') {
                        return '<span class="load-error" title="服务繁忙，请稍后再试！">报错提醒</span>';
                    } else {
                        return '--';
                    }
                }
            }
        ],
        'pagination': {
            'pageSize': 10,
            'pointSize': 15
        },
        'dataReady' (res) {
            return {
                total: res && res.data && res.data.size,
                index: res && res.data && res.data.currPage,
                data: res && res.data && res.data.list
            };
        },
        'created': this.done,
        'dataKeys': ['complainId'],
        'keyMap': {
            'pageIndex': 'page',
            'pageSize': 'rows',
            'current': 'number',
            'total': 'totalPages'
        }
    };

    export default {
        template: '<div></div>',
        components: {
            'v-table': VTable,
            'v-modal': VModal,
            'v-upload': VUpload,
            'v-bubble': VBubble
        },
        beforeCreate () {
            if (!vTableParam.dataURL) {
                vTableParam.data = vtdata[0];
            }
        },
        created () {
            this.ajaxSettings = {
                url: '/rptWsRun/findCityName',
                params: {},
                error (err) {
                    console.log(err);
                }
            };

            this.estimateUserType();
            this.getWHCity();

            // 更新导航菜单
            // this.$store.commit('refreshMenu');
        },
        mounted () {
            // let that = this;
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$refs.vmMsg;
            this.vbubble = this.$refs.vBubble;
            this.vupload = this.$refs.vUpload;
            this.tabs[0].active = true;

            this.isTaskExists();

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 1,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });
        },
        methods: {
            remove (dt) {
                for (let i = 0, len = this.cities.length; i < len; i++) {
                    if (dt.id === this.cities[i].id) {
                        this.cities.splice(i, 1);
                        break;
                    }
                }
            },
            // 判别是否有正在计算的模拟
            isTaskExists (func) {
                // 请求api
                this.ajaxSettings.url = '/rptWsRun/ifExistsTask';
                this.ajaxSettings.params = {};

                // 请求成功回调
                this.ajaxSettings.success = (res) => {
                    if (!res.data.success) {
                        this.disabled = true;
                        this.hasError = true;
                        this.errorStr = res.data.message;
                        this.stepB = true;
                    } else {
                        if (func) {
                            func();
                        }
                    }
                };
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            // 判别是否为入仓用户
            estimateUserType () {
                // 请求api
                this.ajaxSettings.url = '/rptWsRun/ifSfClient';

                // 请求参数
                this.ajaxSettings.params = {};
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data) {
                        this.tabs[0].hasAuth = true;
                    } else {
                        this.tabs[0].hasAuth = false;
                        this.tabs[0].active = false;
                        this.tabs[1].active = true;
                        // this.vmodal.failed('判别是否为入仓用户失败！');
                    }
                };
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            // 获取主仓城市列表
            getWHCity () {
                this.ajaxSettings.url = '/rptWsRun/findCityName';
                this.ajaxSettings.params = {};
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.length > 0) {
                        this.whCities = data;
                    } else {
                        this.vmodal.failed('获取主仓所在城市失败！');
                    }
                };
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            // 执行模拟
            simulate () {
                let that = this;
                let codes = [];

                for (let i = 0, len = this.cities.length; i < len; i++) {
                    codes.push(this.cities[i].code);
                }

                // 请求api
                this.ajaxSettings.url = '/rptWsRun/getSimulation';

                // 请求参数
                this.ajaxSettings.params = {
                    transferPeriod: this.period,               // 调拨周期
                    safeStoragePeriod: this.days,             // 安全库存天数
                    sourceWh: this.city,                       // 主仓所在城市
                    warehouseMust: codes.join(','),             // 需保留的分仓,code
                    type: this.tabs[0].active ? 1 : 2
                };

                // console.log(this.ajaxSettings.params);

                this.showModalConfirm = true;   // 展示“消息提示”框
                // 请求成功回调
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data === 'SUCCESS') {
                        that.isDisabled = true;
                        // this.showModalConfirm = true;
                    } else {
                        if (this.tabs[0].active) {
                            that.isDisabled = false;
                        }
                        // this.vmodal.failed('模拟失败！<br/><br/>' + data.msg);
                    }
                };
                // 请求报错回调
                this.ajaxSettings.error = (res) => {
                    let data = res.data;
                    if (data) {
                        // this.vmodal.failed('模拟失败！<br/><br/>' + data.msg);
                    }
                };
                // 执行请求
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');

                this.isDisabled = true;     // 点击按钮后，置状态为disabled，防止连续提交

                // 当为第一个tab页时，5秒后取消disabled状态
                setTimeout(() => {
                    if (this.tabs[0].active) {
                        that.isDisabled = false;
                    }
                }, 5000);
            },
            // tab翻页
            tabTurn (idx, code, bl) {
                let that = this;
                for (let i = 0, len = this.tabs.length; i < len; i++) {
                    if (this.tabs[i].active && i === idx && !bl) {
                        return;
                    }
                    this.tabs[i].active = false;
                }
                if (!vTableParam.dataURL) {
                    vTableParam.data = vtdata[idx];
                } else {
                    // vTableParam.params.type = idx + 1;
                }

                if (!this.tabs[idx].hasAuth) {
                    this.hasNoAuth = true;
                    this.tabs[1].active = true;

                    setTimeout(() => {
                        that.hasNoAuth = false;
                    }, 5000);
                } else {
                    this.hasNoAuth = false;
                    this.tabs[idx].active = true;   // 激活当前tab

                    // 激活第二个tab时，模拟按钮默认状态disabled
                    if (this.tabs[1].active) {
                        this.isDisabled = true;
                    }
                    this.vt.update(vTableParam);    // 刷新下方表格
                }
            },
            iGetIt () {
                let that = this;
                // 当为第二个tab页时，执行模拟后还原所以默认项
                this.cities = [];
                this.disabled = false;
                this.processing = false;
                this.hasLoaded = false;
                this.period = 7;
                this.days = 2;
                this.city = '';
                document.getElementById('uploadForm').reset();

                setTimeout(() => {
                    that.showModalConfirm = false;
                    that.vt.update(vTableParam);
                }, 300);
            },
            // 上传进度回调
            setProgress (res) {
                // console.log(res);
                let that = this;
                let percent = (res.loaded / res.total) * 100;
                that.isLoading = true;
                this.loadSize = percent.toFixed(0);
                if (percent >= 100) {
                    that.disabled = true;
                    that.processing = true;
                    that.statuStr = '正在写入数据...';
                    setTimeout(() => {
                        that.isLoading = false;
                        that.loadSize = 0;
                    }, 1500);
                }
            },
            fileSelected (e) {
                let that = this;
                this.statuStr = '';
                this.errorStr = '';
                this.isTaskExists(function () {
                    that.upLoad(e);
                });
            },
            // 选择上传文件
            upLoad (e) {
                let that = this;
                let evt = e || window.event;
                let target = evt.target || evt.srcElement;
                // let files = target.files;
                let file = target.files[0];
                let nameStr = file.name.split('.');
                let surfix = nameStr[nameStr.length - 1].toLocaleString();
                let form = new FormData();      // 定义上传的表单

                that.disabled = false;
                that.processing = false;
                that.hasLoaded = false;

                // 判别文件的相关属性
                if (surfix !== 'xlsx') {
                    this.hasError = true;
                    this.errorStr = '您所上传的文件格式不正确，请修正为xlsx文件格式后重新上传！';
                    this.isDisabled = true;
                    return false;
                } else if ((file.size / 1024 / 1024).toFixed(2) > 10) {
                    this.hasError = true;
                    this.errorStr = '文件大小不能超过10M，系统无法为您分配足够的计算资源！';
                    this.isDisabled = true;
                    return false;
                } else {
                    this.hasError = false;
                }

                // ////////////////////////////上传配置/////////////////////////////

                /* for (let i = 0; i < files.length; i++) {
                    form.append('file[' + i + ']', files[i], files[i].name);
                } */

                form.append('file', file, file.name);

                /* this.ajaxSettings.url = '/rptWsRun/importFile';
                this.ajaxSettings.config = {
                    headers: {'Content-Type': 'multipart/form-data'}
                };
                this.ajaxSettings.data = form;  // 注入表单数据
                this.ajaxSettings.onUploadProgress = this.setProgress;  // 上传进度回调
                this.ajaxSettings.success = (res) => {
                    this.ajaxSettings.onUploadProgress = null;
                    let data = res.data;
                    if (data && data.success) {
                        that.hasLoaded = true;
                        that.isDisabled = false;
                    } else {
                        that.hasError = true;
                        that.errorStr = data.msg || data.message;
                        that.isDisabled = true;
                    }
                };

                this.ajaxSettings.error = (res) => {
                    that.hasError = true;
                    that.errorStr = res.msg || data.message;
                    that.isDisabled = true;
                };

                // 执行上传请求
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
                this.$store.commit('setAjax', {
                    data: null,
                    config: null
                }); */

                let getVerifyStatus = () => {
                    let config = {
                        timeout: 0
                    };
                    that.statuStr = '正在校验数据...';
                    axios.post('/rptWsRun/verifyTemporary', {}, config).then(res => {
                        let data = res.data;
                        if (data) {
                            switch (data.code * 1) {
                                case 100:
                                    that.disabled = false;
                                    that.processing = false;
                                    that.hasLoaded = true;
                                    that.statuStr = '数据上传成功！';
                                    that.isDisabled = false;

                                    that.isLoading = false;
                                    that.loadSize = 0;
                                    that.stepA = true;
                                    that.stepB = false;

                                    break;
                                case 105:
                                    setTimeout(() => {
                                        getVerifyStatus();
                                    }, 2000);

                                    break;
                                default:
                                    // 101,102,103,104
                                    that.disabled = false;
                                    that.processing = false;
                                    that.hasLoaded = false;
                                    that.hasError = true;
                                    that.errorStr = data.msg || data.message;
                                    that.isDisabled = true;

                                    that.isLoading = false;
                                    that.loadSize = 0;
                                    that.stepA = true;
                                    that.stepB = false;
                                    break;
                            }
                        }
                    }, (res) => {
                        that.disabled = false;
                        that.processing = false;
                        that.hasLoaded = false;
                        that.hasError = true;
                        that.errorStr = res.msg || data.message;
                        that.isDisabled = true;
                    });
                };

                let config = {
                    headers: {'Content-Type': 'multipart/form-data'},
                    timeout: 0,
                    onUploadProgress: this.setProgress
                };
                axios.post('/rptWsRun/importFile', form, config).then(res => {
                    let data = res.data;
                    if (data && data.success) {
                        that.stepA = false;
                        that.stepB = true;

                        getVerifyStatus();
                    } else {
                        that.hasError = true;
                        that.errorStr = data.msg || data.message;
                        that.isDisabled = true;
                    }
                }, (res) => {
                    that.disabled = false;
                    that.processing = false;
                    that.hasLoaded = false;
                    that.hasError = true;
                    that.errorStr = res.msg || data.message;
                    that.isDisabled = true;
                });

                target.select();
                document.selection && document.selection.clear();
            },
            // 指标气泡提示
            hover (e) {
                let evt = e || window.event;
                let target = evt.target || evt.srcElement;
                let dt = target.getAttribute('b-model') || '{}';
                this.vbubble.setData(dt, evt);
            },
            leave (e) {
                this.vbubble.remove();
            }
        },
        data: () => {
            return {
                tableDt: vTableParam,
                uploadData: {
                    url: '/marketing/importFile'
                },
                period: 7,
                days: 2,
                city: '',
                showModalConfirm: false,
                tabs: [{
                    name: '顺丰历史数据',
                    code: 'returned',
                    active: true
                }, {
                    name: '自行导入数据',
                    code: 'resend',
                    active: false
                }],
                stepA: true,
                stepB: false,
                isDisabled: true,
                cities: [],
                whCities: [],
                isLoading: false,
                disabled: false,
                processing: false,
                hasLoaded: false,
                hasNoAuth: false,
                hasError: false,
                errorStr: '',
                loadSize: 0
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .ddt-tools {
        .content-title {
            border-bottom: 1px solid #3B8EDE;
            padding: 0;
            height: 50px;
            box-sizing: border-box;
            background-color: #EDF1F5;

            h4 {
                margin: 0;
                display: block;
                line-height: 1em;
                font-size: 18px;
                color: #09f;
                padding: 16px 0 16px 0;
            }

            .simulate-step {
                margin-right: 5px;
                font-size: 12px;
                color: #999;

                b {
                    margin-right: 7px;
                    padding: 0 5px 1px;
                    border-radius: 10px;
                    background-color: #999;
                    color: #fff;
                }
            }

            .current-step {
                color: #3B8EDE;
                b {
                    background-color: #3B8EDE;
                    color: #fff;
                }
            }
        }

        .content-title.fixed {
            position: fixed;
            top: 60px;
            right: 20px;
            left: 200px;
            z-index: 50;

            ~ div {
                margin-top: 110px;
                ~ div {
                    margin-top: 0;
                }
            }
        }

        .content-title.no-bdr {
            border: none;
        }

        .content-title ~ div .m-btn-default {
            margin-right: 10px;
            margin-left: 0;
            padding-right: 5px;
            padding-left: 5px;
        }

        .nav-tabs {
            padding-left: 0;
            margin-bottom: -1px;
            list-style: none;
            overflow: hidden;
            border-bottom: 1px solid #3B8EDE;
            background-color: #EDF1F5;

            &:before {
                display: table;
                content: " ";
            }

            &:after {
                clear: both;
            }

            > li {
                position: relative;
                float: left;
                font-size: 15px;

                > a {
                    position: relative;
                    display: block;
                    padding: 10px 25px;
                    margin-right: 2px;
                    line-height: 1.42857143;
                    border-radius: 4px 4px 0 0;
                    border: none !important;
                    color: #666;

                    &:hover {
                        border: 1px solid #3B8EDE;
                        border-bottom-color: transparent;
                        opacity: .9;
                    }
                }

                &.active > a, &.active > a :focus, &.active > a:hover {
                    cursor: default;
                    background-color: #3B8EDE;
                    color: #fff;
                    opacity: 1;
                }
            }
        }

        .order-table {
            margin-bottom: 30px;
            padding: 10px 10px 5px;
            border: 1px solid #ddd;
        }

        .waybill {
            &:hover {
                text-decoration: underline;
            }
        }

        .form-control {
            padding: 5px 0 5px 5px;
            border: 1px solid #c3c3c3;
            border-radius: 4px;
            font-family: inherit;
        }

        .w-md {
            width: 160px;
        }
        .tools-city-add {
            font-size: 12px;
            color: #3B8EDE;
            cursor: pointer;
        }
        .circle-btn-add {
            display: inline-block;
            position: relative;
            padding: 8px 7px 7px 8px;
            border: 1px solid #3B8EDE;
            border-radius: 20px;
            margin-right: 5px;
            vertical-align: bottom;

            &:before, &:after {
                content: '';
                position: absolute;
                display: inline-block;
                background-color: #3B8EDE;
                font-size: 0;
            }
            &:before {
                top: 3px;
                left: 7px;
                width: 1px;
                height: 9px;
            }
            &:after {
                top: 7px;
                left: 3px;
                width: 9px;
                height: 1px;
            }
        }

        .m-btn-active {
            position: relative;
            i {
                display: inline-block;
                position: absolute;
                top: -6px;
                right: -6px;
                padding: 7px 6px 6px 7px;
                border-radius: 10px;
                background-color: #909090;
                cursor: pointer;

                &:hover {
                    background-color: #222;
                }

                &:before, &:after {
                    content: '';
                    position: absolute;
                    display: inline-block;
                    background-color: #fff;
                    font-size: 0;
                }
                &:before {
                    top: 2px;
                    left: 6px;
                    width: 1px;
                    height: 9px;
                    transform: rotate(45deg);
                }
                &:after {
                    top: 6px;
                    left: 2px;
                    width: 9px;
                    height: 1px;
                    transform: rotate(45deg);
                }
            }
        }

        .v-table thead td {
            padding: 15px 10px;
        }

        .v-table {
            td {
                color: #666;
            }
            .division-line {
                height: 13px;
            }
            tbody {
                tr {
                    .m-btn-circle-blue {
                        margin-top: -4px;
                        margin-bottom: -4px;
                        border-color: #40A5FF;
                        color: #40A5FF;
                    }
                }
            }
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
            transform: translate(-50%, -50%);
            height: 460px;
            padding: 15px 30px;
            background-color: #fff;
            border-radius: 4px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
        }
        .load-control {
            position: relative;
            display: inline-block;

            input {
                position: absolute;
                z-index: 1;
                top: -4px;
                left: 0;
                width: 100%;
                height: 35px;
                opacity: 0;
                cursor: pointer;
            }
            a {
                position: relative;
                margin-right: 0;
                overflow: hidden;
                display: inline-block;
                width: 110px;
                line-height: 1.42857143;
                padding: 7px 0 6px;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                border-radius: 20px;
                background-color: #3B8EDE;
                box-sizing: inherit;
                font-family: inherit;
                font-size: 14px;
                z-index: 0;

                &.disabled {
                    background-color: #ccc;
                }
            }
            b {
                position: relative;
                z-index: 1;
                color: #fff;
                font-size: 14px;
            }
            span {
                position: absolute;
                z-index: 0;
                top: 0;
                left: 0;
                width: 35%;
                height: 100%;
                background-color: #62A5E5;
            }
        }
        .load-success, .load-process, .load-error {
            display: inline-block;
            line-height: 20px;
            padding-left: 24px;
            margin-left: 5px;
            font-size: 14px;
            color: #666;
        }
        .load-success {
            background: transparent url(../../assets/image/icon/ico_success.png) no-repeat;
        }
        .load-error {
            background: transparent url(../../assets/image/icon/ico_error.png) no-repeat;
        }
        .has-no-auth-tip {
            position: absolute;
            top: 82px;
            left: 35px;
            width: 135px;
            padding: 8px 10px;
            line-height: 20px;
            border-radius: 4px;
            color: #fff;
            font-size: 12px;
            background-color: rgba(0, 0, 0, .55);
        }
        .m-btn.disabled,
        .m-btn[disabled] {
            border-color: #ccc !important;
        }
        .m-btn.disabled:hover,
        .m-btn[disabled]:hover {
            border-color: #ccc !important;
        }
        input[type=file]:disabled {
            cursor: not-allowed;
        }
    }
</style>
