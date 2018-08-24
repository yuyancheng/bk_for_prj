<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="realtime-trends">
        <div class="content-title fixed">
            <h4 class="title-name" style="display: inline-block">今日快件动态
                <i v-on:mouseenter="hover()" v-on:mouseleave="leave()" class="question-mark"
                    b-model='{"title": "", "body": "<table class=\"b-table\"><thead><tr><td>指标</td><td>详解</td></tr></thead><tbody><tr><td>1、今日已发件</td><td>该集团卡号下，今日已经揽收的快件；</td></tr><tr><td>2、今日产生异常件</td><td>指今日被标记为超时未签收、超时无状态更新及今日产生派送异常的快件总和（去重）；</td></tr><tr><td>3、今日产生退回件</td><td>任何原因导致的退回都包括在内；</td></tr><tr><td>4、今日转寄第三方</td><td>指在今日交由第三方寄送的快件；</td></tr><tr><td>5、今日产生拒收/拒付件</td><td>指快件在今日被标记为拒收/拒付件的快件。</td></tr></tbody></table>"}'>?</i>
                <time class="update-time">数据更新于{{updateTime}}</time>
            </h4>
        </div>
        <div class="waybill-status">
            <div v-for="(item, idx) in statusData">
                <h3>{{item.ttl}}<span v-if="item.dt && item.dt != 0 && item.dt !== '--'" class="trends-curve" v-on:click="openCurveMap(item, idx)"></span></h3>
                <div>{{item.dt}}</div>
            </div>
        </div>
        <hr class="division-line"/>
        <div>
            <ul class="nav-tabs">
                <li v-for="(item, index) in tabs" :class="{'active': item.active}">
                    <a href="javascript:void(0)" v-on:click="tabTurn(index)">{{item.name}}</a>
                </li>
            </ul>
            <div>
                <div style="float: right;padding: 10px 20px 10px 10px;">
                    <div style="width:140px;float:right;">
                        <button class="m-btn m-btn-blue m-btn-circle m-btn-w-xs" v-on:click="query()">查询</button>
                        <a style="font-size: 12px; color: #3B8EDE;" class="icons-download" href="javascript:void(0);" v-on:click="getFile()">导出
                            <span v-if="canDownload" class="loading size-xs"></span>
                        </a>
                    </div>
                    <v-query ref="vQuery" :vqData="queryDt"></v-query>
                </div>
            </div>
            <div class="order-table">
                <v-table ref="vtRequireChanges" :vtData="tableDt"></v-table>
            </div>
        </div>
        <router-view></router-view>
        <router-view name="login"></router-view>
        <v-modal ref="vmMsg"></v-modal>
        <v-bubble ref="vBubble"></v-bubble>
        <iframe v-bind:src="downloadURL" style="display:none; width:0; height:0;"></iframe>
    </div>
</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';
    import VTable from '@/components/common/table/VTable';
    import VModal from '@/components/common/modal/VModal';
    import VBubble from '@/components/common/modal/Bubble';
    import MultipleQuery from '@/components/common/logistics/MultipleQuery';
    import DatePicker from '@/assets/js/lib/datepicker/src';
    import data from '@/assets/js/tdata';
    import utils from '@/assets/js/lib/utils';

    Vue.use(DatePicker);

    let vtdata = data;

    let statusData = [{
        ttl: '今日已发件',
        dt: '--'
    }, {
        ttl: '今日产生异常件',
        dt: '--'
    }, {
        ttl: '今日产生退回件',
        dt: '--'
    }, {
        ttl: '今日转寄第三方件',
        dt: '--'
    }, {
        ttl: '今日拒收/拒付件',
        dt: '--'
    }];

    let tHeads = [
        ['序号', '顺丰单号', '寄件时间', '异常类型', '发货城市', '收货城市'],
        ['序号', '顺丰单号', '寄件时间', '退回单号', '退回时间', '退回状态'],
        ['序号', '顺丰单号', '寄件时间', '转寄公司', '转寄第三方单号', '转寄时间', '发货城市', '收货城市'],
        ['序号', '顺丰单号', '寄件时间', '拒收/拒付时间', '发货城市', '收货城市']
    ];

    let columns = [[
        {
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                return idx + 1;
            }
        }, {
            'data': 'waybill',
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[1]['value'] !== null && dt[1]['value'] !== undefined) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[1]['value'] + '</a>';
                } else {
                    return '';
                }
            }
        }, {
            'data': 'consignedTime',
            'searchable': false,
            'sortType': 'DESC',
            'position': 'center',
            'render' (dt, idx) {
                if (dt[2]['value'] !== null && dt[2]['value'] !== undefined) {
                    return dt[2]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'typeName',
            'searchable': false,
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[3]['value'] !== null && dt[3]['value'] !== undefined) {
                    return dt[3]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'sourceName',
            'searchable': false,
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[4]['value'] !== null && dt[4]['value'] !== undefined) {
                    return dt[4]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'destName',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[5]['value'] !== null && dt[5]['value'] !== undefined) {
                    return dt[5]['value'];
                } else {
                    return '';
                }
            }
        }], [{  // 2
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                return idx + 1;
            }
        }, {
            'data': 'waybill',
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[1]['value'] !== null && dt[1]['value'] !== undefined) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[1]['value'] + '</a>';
                } else {
                    return '';
                }
            }
        }, {
            'data': 'consignedTime',
            'sortType': 'DESC',
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[2]['value'] !== null && dt[2]['value'] !== undefined) {
                    return dt[2]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'backNewWaybill',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[3]['value'] !== null && dt[3]['value'] !== undefined) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[3]['value'] + '</a>';
                } else {
                    return '';
                }
            }
        }, {
            'data': 'returnTime',
            'searchable': false,
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[4]['value'] !== null && dt[4]['value'] !== undefined) {
                    return dt[4]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'describle',
            'searchable': false,
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[5]['value'] !== null && dt[5]['value'] !== undefined) {
                    return dt[5]['value'];
                } else {
                    return '';
                }
            }
        }], [{  // 3
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                return idx + 1;
            }
        }, {
            'data': 'waybill',
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[1]['value'] !== null && dt[1]['value'] !== undefined) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[1]['value'] + '</a>';
                } else {
                    return '';
                }
            }
        }, {
            'data': 'consignedTime',
            'sortType': 'DESC',
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[2]['value'] !== null && dt[2]['value'] !== undefined) {
                    return dt[2]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'companyName',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[3]['value'] !== null && dt[3]['value'] !== undefined) {
                    return dt[3]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'forwardWaybill',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[4]['value'] !== null && dt[4]['value'] !== undefined) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[4]['value'] + '</a>';
                } else {
                    return '';
                }
            }
        }, {
            'data': 'forwardTime',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[5]['value'] !== null && dt[5]['value'] !== undefined) {
                    return dt[5]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'sourceName',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[6]['value'] !== null && dt[6]['value'] !== undefined) {
                    return dt[6]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'destName',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[7]['value'] !== null && dt[7]['value'] !== undefined) {
                    return dt[7]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'telphone',
            'orderable': false,
            'searchable': false,
            'hidden': true
        }], [{  // 4
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                return idx + 1;
            }
        }, {
            'data': 'waybill',
            'orderable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[1]['value'] !== null && dt[1]['value'] !== undefined) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[1]['value'] + '</a>';
                } else {
                    return '';
                }
            }
        }, {
            'data': 'consignedTime',
            'sortType': 'DESC',
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[2]['value'] !== null && dt[2]['value'] !== undefined) {
                    return dt[2]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'barSanTime',
            'sortType': 'DESC',
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[3]['value'] !== null && dt[3]['value'] !== undefined) {
                    return dt[3]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'sourceName',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[4]['value'] !== null && dt[4]['value'] !== undefined) {
                    return dt[4]['value'];
                } else {
                    return '';
                }
            }
        }, {
            'data': 'destName',
            'orderable': false,
            'searchable': false,
            'position': 'center',
            'render' (dt, idx) {
                if (dt[5]['value'] !== null && dt[5]['value'] !== undefined) {
                    return dt[5]['value'];
                } else {
                    return '';
                }
            }
        }]
    ];

    let vTableParam = {
        'thead': ['序号', '顺丰单号', '寄件时间', '异常类型', '发货城市', '收货城市'],
        // 'data': [],
        'dataURL': '/express/waybill/realtime/detail',
        'params': {
            'custCode': '全部',
            'page_no': 1,
            'page_size': 10,
            'sortField': ['consignedTime'],
            'sortType': ['DESC'],
            'type': 'except'
        },
        'draw': 0,
        'displayStart': 0,
        'lengthMenu': [5, 10, 15, 20, 50],
        'language': '',
        'searching': false,
        'processing': true,
        'columns': columns[0],
        'pagination': {
            'pageSize': 10,
            'pointSize': 14
        },
        'autoRender': false,
        'dataReady' (res) {
            let dt = {
                total: res.data && res.data.data && res.data.data.total,
                size: res.data && res.data.data && res.data.data.size,
                data: res.data && res.data.data && res.data.data.list
            };

            return dt;
        },
        'created': this.done,
        'dataKeys': ['complainId'],
        'keyMap': {
            'pageIndex': 'page_no',
            'pageSize': 'page_size',
            'current': 'number',
            'total': 'totalPages'
        }
    };
    let targetParam = vTableParam;

    export default {
        template: '<div></div>',
        components: {
            'v-table': VTable,
            'v-modal': VModal,
            'v-bubble': VBubble,
            'v-query': MultipleQuery
        },
        beforeCreate () {
            if (!targetParam.dataURL) {
                targetParam.data = vtdata[0];
            }
        },
        created () {
            let that = this;
            this.queryDt = {
                func (dt) {
                    that.queryKey = dt;
                    that.queryKey = dt;
                },
                setQueryCallback (fun) {
                    that.getQueryKey = fun;
                },
                clear () {
                    that.queryKey = [];
                    that.query();
                },
                maxSize: null,
                filterRegExp: null,
                invalidTip: null,
                repeatedTip: null,
                overflowTip: null
            };

            targetParam.itemClick = this.itemClick;

            this.ajaxSettings = {
                url: '/',
                params: {},
                error (err) {
                    console.log(err);
                }
            };

            // 更新导航菜单
            this.$store.commit('refreshMenu');

            // 添加月结卡号更新回调
            this.$store.commit('setCardNoChangeCallback', this.cardNoChanged);
        },
        mounted () {
            let that = this;
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$refs.vmMsg;
            this.tabs[0].active = false;
            this.vbubble = this.$refs.vBubble;
            this.vquery = this.$refs.vQuery;

            this.getLastCompareDate((date) => {
                if (date) {
                    that.lastCompareDate = date;
                }
                that.initStatusData();
            });

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 1,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });

            let search = window.location.hash.split('?')[1];
            let queryName = search && search.split('=')[0];
            let rtTab = search && search.split('=')[1].substring(0, 1);

            if (queryName === 'rtTab') {
                this.tabTurn(rtTab * 1 || 0);
            } else {
                this.tabTurn(0);
            }
        },
        methods: {
            cardNoChanged (dt) {
                this.custCode = dt || '全部';
                this.initStatusData();
                vTableParam.params.custCode = this.custCode;
                this.vt.update(vTableParam);
            },
            numberFormatter (num) {
                let str = num + '';
                let len = str.length;
                if (num >= 1000) {
                    str = str.split('').reverse().join('').replace(/\d{3}/g, function (dt, idx, s) {
                        return idx < len - 3 ? dt + ',' : dt;
                    });
                } else {
                    return str;
                }

                return str.split('').reverse().join('');
            },
            // 数组去重，仅针对基本数据类型
            unique: function (obj, idxs) {
                if (!obj || obj.constructor !== Array) {
                    return obj;
                }

                let dt = {};
                let arr = [];
                let len = obj.length;
                for (let i = 0; i < len; i++) {
                    if (idxs && idxs.constructor === Array && dt['key_' + obj[i]] === obj[i]) {
                        idxs.push(i);
                    }
                    dt['key_' + obj[i]] = obj[i];
                }

                for (let k in dt) {
                    arr.push(dt[k]);
                }

                return arr;
            },
            itemClick (e, dt) {
                let evt = e || window.event;
                let target = evt.target;
                evt.stopPropagation();

                if (target.nodeName.toLowerCase() === 'a') {
                    let query = {
                        'name': dt['data'][target.parentNode.id * 1]['name'],
                        'waybillNo': dt['data'][target.parentNode.id * 1]['value']
                    };
                    if (dt['data'][dt['data'].length - 1]['value'] === 'telphone') {
                        if (dt['data'][dt['data'].length - 1]['value']) {
                            query.telephone = dt['data'][dt['data'].length - 1]['value'];
                        }
                    }
                    this.$router.push({
                        name: 'trends_express_route',
                        query: query
                    });
                }
            },
            tabTurn (idx, code, bl) {
                vTableParam.columns = columns[idx];
                vTableParam.thead = tHeads[idx];
                for (let i = 0, len = this.tabs.length; i < len; i++) {
                    if (this.tabs[i].active && i === idx && !bl) {
                        return;
                    }
                    this.tabs[i].active = false;
                }
                if (!vTableParam.dataURL) {
                    vTableParam.data = vtdata[idx];
                } else {
                    vTableParam.params.type = this.tabs[idx].code;
                    vTableParam.params.custCode = this.custCode;
                }
                this.tabs[idx].active = true;
                this.vt.update(vTableParam);
            },
            resetData (dt) {
                let today = dt.today && dt.today.data;
                let compare = dt.compare && dt.compare.data;
                let getTotal = (arr) => {
                    let sum = 0;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let m = parseInt(arr[i]);
                        if (!isNaN(m)) {
                            sum += arr[i] * 1;
                        }
                    }
                    return sum;
                };

                let getVal = (arr) => {
                    let m = 0;
                    for (let i = arr.length - 1; i > 0; i--) {
                        m = parseInt(arr[i]);
                        if (!isNaN(m) && m !== 0) {
                            break;
                        }
                    }
                    return m;
                };

                this.statusData[0].dt = this.numberFormatter(getTotal(JSON.parse(today['todayCnt'])));
                this.statusData[1].dt = this.numberFormatter(getVal(JSON.parse(today['toExcepCnt'])));
                this.statusData[2].dt = this.numberFormatter(getVal(JSON.parse(today['toBackCnt'])));
                this.statusData[3].dt = this.numberFormatter(getVal(JSON.parse(today['toSwitchCnt'])));
                this.statusData[4].dt = this.numberFormatter(getVal(JSON.parse(today['toRejectionCnt'])));

                if (today['lastUpdateTime']) {
                    this.updateTime = today['lastUpdateTime'].replace(/-|\s/g, function (a, b, c) {
                        if (b === 4) return '年';
                        if (b === 7) return '月';
                        if (a === ' ') return '日 ';
                    });
                } else {
                    this.updateTime = '--';
                }

                this.collectData = {
                    today: {
                        data: [today['todayCnt'], today['toExcepCnt'], today['toBackCnt'], today['toSwitchCnt'], today['toRejectionCnt']],
                        date: today['lastUpdateTime']
                    },
                    compare: {
                        data: [compare['todayCnt'], compare['toExcepCnt'], compare['toBackCnt'], compare['toSwitchCnt'], compare['toRejectionCnt']],
                        date: compare['lastUpdateTime']
                    }
                };
            },
            // 获取上次对比日期
            getLastCompareDate (func) {
                let that = this;
                that.ajaxSettings.url = '/express/waybill/realtime/lastcomparedate';
                that.ajaxSettings.params = {};
                this.ajaxSettings.success = (res) => {
                    if (res) {
                        let data = res.data && res.data.data;
                        if (!data) {
                            that.vmodal.failed('获取上次对比日期失败！');
                        }
                        if (func) {
                            func(data);
                        }
                    }
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            initStatusData () {
                let that = this;
                that.ajaxSettings.url = '/express/waybill/realtime/summary';
                that.ajaxSettings.params = {
                    custCode: that.custCode,
                    compare_date: utils.dateFormat(new Date(that.lastCompareDate), 'yyyy-MM-dd')
                };
                this.ajaxSettings.success = (res) => {
                    if (res) {
                        let data = res.data && res.data.data;
                        if (data) {
                            that.resetData(data);
                        } else {
                            that.vmodal.failed('获取今日快件动态汇总失败！');
                        }
                    }
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            // 运单查询
            query (params) {
                if (this.queryKey.length === 0) {
                    this.getQueryKey && this.getQueryKey();
                }
                if (this.queryKey.length) {
                    if (vTableParam.dataURL) {
                        let keys = this.unique(this.queryKey);
                        /* for (let i = 0, len = keys.length; i < len; i++) {
                            if (!/\S/.test(keys[i])) {
                                keys.splice(i, 1);
                            }
                        } */
                        if (keys.length > 50) {
                            this.vmodal.failed('查询的运单数不能超过50个！');
                            return;
                        }
                        vTableParam.params['waybills'] = keys;
                    }
                } else {
                    vTableParam.params['waybills'] = null;
                }

                this.vt.update(vTableParam);
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
            },
            onConfirm (e) {
            },
            openCurveMap (dt, idx) {
                this.$store.commit('shareData', {
                    dataName: 'collectData',
                    value: this.collectData
                });
                this.$router.push({
                    name: 'trend_curves',
                    query: {
                        'idx': idx,
                        'type': dt['ttl']
                    }
                });
            },
            getFile (dt) {
                let that = this;
                that.canDownload = true;
                this.ajaxSettings.url = '/download/downloadStart?r=' + Math.random();
                this.ajaxSettings.params = {};
                this.ajaxSettings.success = (res) => {
                    let data = res.data;

                    if (data.result !== false) {
                        that.ajaxSettings.url = '/express/waybill/realtime/export';
                        that.ajaxSettings.params = {
                            custCode: that.custCode,
                            type: vTableParam.params.type,
                            sortType: vTableParam.params.sortType || null,
                            sortField: vTableParam.params.sortField || null,
                            waybills: that.queryKey.length ? [that.queryKey] : null
                        };
                        that.ajaxSettings.success = (res) => {
                            let data = res.data;
                            if (data) {
                                that.getDownloadStatus();
                            } else {
                                // that.vmodal.failed('无仓库信息！');
                            }
                        };

                        that.ajaxSettings.error = (res) => {
                            that.vmodal.failed('执行导出失败！');
                        };

                        that.$store.commit('setAjax', this.ajaxSettings);
                        that.$store.dispatch('ajax');
                    } else {
                        // that.vmodal.failed('无仓库信息！');
                    }
                };

                this.ajaxSettings.error = (res) => {
                    that.vmodal.failed('执行导出失败！');
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            getDownloadStatus (n) {
                let that = this;
                this.ajaxSettings.url = '/download/downloadStatus?r=' + Math.random();
                this.ajaxSettings.params = {
                    requestDBFlag: ''
                };
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.fileStates === -1) {
                        that.vmodal.failed('文件下载失败！');
                        that.canDownload = false;
                        return false;
                    } else if (data && data.fileStates === 3) {
                        // that.download();
                        that.canDownload = false;
                        that.downloadURL = '/download/downloadEnd?r=' + Math.random();
                    } else {
                        if (!n) {
                            n = 1;
                        }
                        if (n === 20) {
                            that.canDownload = false;
                            that.vmodal.failed('文件下载失败！');
                            return false;
                        } else {
                            n++;
                        }

                        window.setTimeout(function () {
                            that.getDownloadStatus(n);
                        }, 2000);
                    }
                };

                this.ajaxSettings.error = (res) => {
                    that.canDownload = false;
                    that.vmodal.failed('获取下载状态失败！');
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            }
        },
        data: () => {
            return {
                tableDt: vTableParam,
                tabs: [{
                    name: '今日产生异常件',
                    active: true,
                    code: 'except'
                }, {
                    name: '今日产生退回件',
                    active: false,
                    code: 'back'
                }, {
                    name: '今日转寄第三方件',
                    active: false,
                    code: 'switch'
                }, {
                    name: '今日产生拒收/拒付件',
                    active: false,
                    code: 'reject'
                }],
                mShow: true,
                updateTime: '--',
                statusData: statusData,
                canDownload: false,
                downloadURL: '',
                queryKey: '',
                collectData: {},
                lastCompareDate: new Date().getTime() - 86400000,
                custCode: '全部'
            };
        }
    };
</script>

<style lang="less" type="text/less">
    @import '../../../assets/js/lib/datepicker/dist/vue-datepicker-local.css';

    .realtime-trends {

        .datepicker-range {
            min-width: auto;
            input {
                border-radius: 4px;
                border-color: #999;
                background-color: #fff;
            }
        }
        .datepicker-popup {
            right: 0;
        }
        .ipt-query {
            line-height: 20px;
            padding: 5px;
            border: 1px solid #bbb;
            border-radius: 4px;
        }
        .m-btn-w-xs {
            min-width: inherit;
            margin: 0 10px;
            line-height: 1.22857143;
        }
        .loading {
            margin: 0 0 -3px 0;
        }
        .trends-curve {
            display: inline-block;
            width: 22px;
            height: 19px;
            margin-bottom: -2px;
            margin-left: 10px;
            background: transparent url(../../../assets/image/icon/chart-bar.png) center center no-repeat;
            cursor: pointer;
        }
        .content-title {
            border-bottom: 1px solid #3B8EDE;
            padding: 0;
            height: 50px;
            box-sizing: border-box;
            background-color: #EDF1F5;

            h4 {
                margin: 0;
                display: inline-block;
                line-height: 1em;
                font-size: 18px;
                color: #09f;
                padding: 16px 0 16px 0;
            }

            & ~ div {
                margin: 0 28px 0;
                padding: 30px 0 0;
                overflow: visible;

                ~ div {
                    > div {
                        float: none !important;
                    }
                }

                > div {
                    &:nth-child(1) {
                        float: left;
                    }
                }

                > div {
                    &:nth-child(2) {
                        float: right;
                    }
                }

                .m-btn {
                    padding-right: 18px;
                    padding-left: 18px;
                }

                .m-btn-blue {
                    margin-right: 15px;
                }
                .m-btn-default {
                    margin-left: 15px;
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

        .nav-tabs {
            padding-left: 0;
            margin-bottom: -1px;
            list-style: none;
            overflow: hidden;

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
                    border: 1px solid transparent;
                    border-radius: 4px 4px 0 0;
                    color: #666;

                    &:hover {
                        background-color: #f7f7f7;
                        border: 1px solid #ddd;
                        border-bottom-color: transparent;
                        color: #3BA1DE;
                        opacity: .9;
                    }
                }

                &.active > a, &.active > a :focus, &.active > a:hover {
                    cursor: default;
                    background-color: #fff;
                    border: 1px solid #ddd;
                    border-bottom-color: transparent;
                    color: #3BA1DE;
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

        ////////////////////////////////////////////////////////////

        .update-time {
            font-size: 12px;
            color: #999;
            margin-left: 15px;
        }
        .division-line {
            height: 10px;
            margin: 0 -20px;
            background-color: #EDF1F5;
            border: none;
        }
        .waybill-status {
            display: flex;
            justify-content: space-around;
        }
        .waybill-status {
            > div {
                position: relative;
                height: 71px;
                flex-grow: 1;
                flex-basis: 25%;
                padding: 10px 0 10px 85px;

                h3 {
                    line-height: 22px;
                    font-size: 12px;
                    color: #999;
                }

                div {
                    line-height: 28px;
                    font-size: 18px;
                    color: #333;
                }
            }
        }

        .waybill-status {
            > div:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                display: inline-block;
                width: 71px;
                height: 71px;
                background: transparent url(../../../assets/image/logistics/waybill_icons_a.png) 0 0 no-repeat;
            }
        }
        .waybill-status {
            > div {
                &:nth-child(1):before {
                    background-position: 0 0;
                }
                &:nth-child(2):before {
                    background-position: -71px 0;
                }
                &:nth-child(3):before {
                    background-position: -142px 0;
                }
                &:nth-child(4):before {
                    background-position: -213px 0;
                }
                &:nth-child(5):before {
                    background-position: -284px 0;
                }
            }
        }

        .multiple-query {
            display: block !important;
            float: none !important;
            margin-right: 150px !important;
            margin-left: 0 !important;

            &>div {
                width: auto !important;
            }
        }
    }
</style>
