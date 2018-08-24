<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="ddt-tools-simulate" style="margin-bottom: 50px;">
        <div class="content-title">
            <h4 class="title-name">分仓模拟<span style="margin-left:15px;font-size:12px;color:#999;">完成模拟时间：{{endTime}}</span>
                <span style="float: right;">
                    <a class="simulate-step current-step" href="javascript:window.history.back();"><b>1</b>数据导入&nbsp;&#9658;</a>
                    <span class="simulate-step current-step"><b>2</b>模拟结果&nbsp;&#9658;</span>
                    <span class="simulate-step"><b>3</b>对比详情</span>
                </span>
            </h4>
        </div>
        <div style="margin: 0;padding: 0 20px 30px;">
            <div style="float:none; padding: 15px 0; overflow: hidden;">
                <h2 style="float:left; font-size: 16px;">模拟结果</h2>
                <div style="float: right;">
                    <a style="font-size: 12px; color: #3B8EDE;" class="icons-download" href="javascript:void(0);" v-on:click="getFile()">下载分仓模拟结果表
                        <span v-if="canDownload" class="loading size-xs"></span>
                    </a>
                </div>
            </div>
            <div style="float:none; overflow: hidden;">
                <div style="position: relative; float: left; width: 220px;">
                    <div class="simulate-list">
                        <ul class="nav-tabs">
                            <li v-for="(item, index) in tabs" :class="{'active': item.active}">
                                <a href="javascript:void(0)" v-on:click="tabTurn(index, item.code)">{{item.name}}</a>
                            </li>
                        </ul>
                        <div class="result-ttl">
                            <span>分仓数量</span><span>票均配送成本</span><span>配送时效</span>
                        </div>
                        <div id="result_list" class="result-list"
                             v-bind:style="{maxHeight: (hasCurrent && isComparingA) ? '336px' : (hasCurrent && isComparingB) ? '300px' : hasCurrent ? '466px' : isComparingA ? '378px' : isComparingB ? '342px' : '507px'}">
                            <div
                                v-if="resultList.length > 0"
                                :class="[{'fixedLine': (idx === fixedIdxA || idx === fixedIdxB)}, {'curLine': (fixedIdx === idx || (idx === defaultIdx && focusOnFifth || (idx === 0 && focusOnFirst)))}]"
                                v-for="(item, idx) in resultList" v-on:mouseenter="hover($event, item, idx);"
                                v-on:mouseleave="leave($event);" v-on:click="makeFixed(item, idx)">
                                <span><b>{{item.combo}}</b></span><span>{{item.avgCost.toFixed(2)}}元</span><span>{{item.avgDeliveryDay.toFixed(2)}}H</span>
                            </div>
                            <div v-if="resultList.length === 0"
                                 style="line-height: 40px; font-size: 14px; color: #999; text-align: center;">暂无模拟结果！
                            </div>
                        </div>
                    </div>

                    <div v-if="hasCurrent" class="simulate-current"
                         v-on:mouseenter="hover($event, currentDt, 1000);" v-on:mouseleave="leave($event);">
                        <span><b>{{currentDt.combo}}</b>现状</span><span>{{currentDt.avgCost.toFixed(2)}}元</span><span>{{currentDt.avgDeliveryDay.toFixed(2)}}H</span>
                    </div>

                    <div v-if="isComparingA || isComparingB" class="compare-box">
                        <div class="compare-ttl">（{{compareList.length}}/2）对比栏<i class="cls" v-on:click="remove()"></i></div>
                        <div class="compare-list">
                            <div v-for="it in compareList"><span>{{it.wsRule !== 'now' ? (it.combo + '仓方案') : '现状'}}</span>
                                <b class="cls" v-on:click="removeItem(it)"></b>
                            </div>
                        </div>
                        <div style="padding: 6px 0; text-align: center;">
                            <button class="m-btn m-btn-blue m-btn-circle m-btn-w-lg" v-on:click="compare()"
                                    style="margin-right: 0;" v-bind:disabled="compareList.length !== 2">开始对比
                            </button>
                        </div>
                    </div>

                    <strong v-show="isHoverA" class="select-anchor" v-bind:style="{top: osTopA + 'px'}" v-on:mouseover="over($event);"
                            v-on:mouseleave="leave($event);">
                        <label class="m-checkbox"><input v-on:click="fix($event, 'A')" type="checkbox"/>加入对比<i></i></label>
                    </strong>
                    <strong v-show="isHoverB" class="select-anchor" v-bind:style="{top: osTopB + 'px'}" v-on:mouseover="over($event);"
                            v-on:mouseleave="leave($event);">
                        <label class="m-checkbox"><input v-on:click="fix($event, 'B')" type="checkbox"/>加入对比<i></i></label>
                    </strong>
                </div>
                <div style="margin-left: 228px; height:587px; border: 1px solid rgb(218, 218, 218); background-color: rgb(247, 251, 255);">
                    <div id="simulate_map" style="height: 587px;"></div>
                </div>
            </div>
        </div>
        <iframe v-bind:src="downloadURL" style="display:none; width:0; height:0;"></iframe>
        <router-view></router-view>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import VModal from '@/components/common/modal/VModal';
    import echarts from 'echarts';
    import cityCoord from '@/assets/js/datas/cityCoord';
    import mapOption from '@/assets/js/mapOption';
    import chinaMapGeo from '@/assets/js/datas/chinaMapGeo.json';
    // import geoCoordMap from '@/assets/js/datas/geoCoordMap';
    import warehouseDt from '@/assets/js/datas/warehouseData';
    // import whData from '@/assets/js/datas/whData';

    let bigWHData = {};
    let beginTime, finishTime, titleName;
    let mapChart;
    let pTp;
    let targetA, targetB;
    let sparkDataA = [];
    let sparkDataB = [];
    let warehouseData = warehouseDt;
    let whDestData;
    let targetCity;

    export default {
        template: '<div></div>',
        components: {
            'v-modal': VModal
        },
        beforeCreate () {
            // let echarts = echarts;
            // console.log(echarts);
            let search = window.location.hash.split('?')[1];
            if (search) {
                search = search.replace(/,/g, '，');
                search = search.replace(/&/g, ',').replace(/=/g, ':');
                search = ('{' + search + '}').replace(/{/g, '{"').replace(/}/g, '"}').replace(/:/g, '":"').replace(/,/g, '","');
                search = JSON.parse(search);
                beginTime = decodeURI(search.beginTime || '');
                finishTime = decodeURI(search.finishTime || '');
                titleName = decodeURI(search.titleName);
            }
        },
        created () {
            this.resultList = [
                {
                    combo: 3,
                    avgCost: 323.3433,
                    avgDeliveryDay: 12.4
                }, {
                    combo: 4,
                    avgCost: 220.129,
                    avgDeliveryDay: 11.5
                }, {
                    combo: 5,
                    avgCost: 143.680,
                    avgDeliveryDay: 9.7
                }
            ];
            this.cityCoord = cityCoord;
            this.mapGeo = chinaMapGeo;
            this.endTime = new Date(finishTime * 1).toLocaleString() || '--';

            this.ajaxSettings = {
                url: '/warehouse/optimal',
                params: {
                    version: beginTime || ''
                },
                error (err) {
                    console.log(err);
                }
            };

            this.initList();
        },
        mounted () {
            let that = this;
            this.vmodal = this.$refs.vmMsg;

            // mapChart = window.echarts.init(document.getElementById('simulate_map'));
            mapChart = echarts.init(document.getElementById('simulate_map'));
            mapChart.on('click', function (params) {
                if (params.componentSubType === 'effectScatter') {
                    targetCity = params.name;
                    that.drawTargetArea(targetCity);
                }
            });
            echarts.registerMap('china', this.mapGeo);
            this.initMap();
            document.getElementById('result_list').addEventListener('scroll', this.wheel);

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 5,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });
        },
        methods: {
            initList () {
                let that = this;

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.length > 0) {
                        that.resetData(data);
                    } else {
                        that.vmodal.failed('获取分仓列表失败！');
                        that.resetData(warehouseData);
                    }
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            resetData (dt) {
                this.dataList[0] = [];
                this.dataList[1] = [];
                for (let i = 0, len = dt.length; i < len; i++) {
                    if (dt[i]['wsRule'] === 'cost') {
                        this.dataList[0].push(dt[i]);
                    } else if (dt[i]['wsRule'] === 'time') {
                        this.dataList[1].push(dt[i]);
                    } else if (dt[i]['wsRule'] === 'now') {
                        this.currentDt = dt[i];
                        this.hasCurrent = true;
                    }
                }

                for (let m = 0, ln = this.dataList[0].length; m < ln; m++) {
                    if (this.dataList[0][m]['combo'] === 5) {
                        this.defaultIdx = m;
                        this.focusOnFirst = false;
                        this.focusOnFifth = true;
                        this.fixedIdx = m;
                        this.showSpark = true;
                    }
                }
                this.resultList = this.dataList[0];

                this.sparkData = this.resultList[this.defaultIdx];
                this.spark(this.sparkData);
            },
            remove () {
                this.isHoverA = false;
                this.isHoverB = false;
                this.isFixedA = false;
                this.isFixedB = false;
                this.isComparingA = false;
                this.isComparingB = false;
                this.hoverIdxA = 10000;
                this.hoverIdxB = 10000;
                this.fixedIdxA = 10000;
                this.fixedIdxB = 10000;
                this.compareList = [];
                sparkDataA = [];
                sparkDataB = [];
            },
            removeItem (dt) {
                let idx = this.matchItem(dt.id);
                if (idx !== -1) {
                    this.compareList.splice(idx, 1);
                }
                if (dt.type === 'A') {
                    this.isHoverA = false;
                    this.isFixedA = false;
                    this.isComparingA = false;
                    this.hoverIdxA = 10000;
                    this.fixedIdxA = 10000;
                    sparkDataA = [];
                }
                if (dt.type === 'B') {
                    this.isHoverB = false;
                    this.isFixedB = false;
                    this.isComparingB = false;
                    this.hoverIdxB = 10000;
                    this.fixedIdxB = 10000;
                    sparkDataB = [];
                }
            },
            drawTargetArea (cities) {
                let dataArr = [];
                let province = [];
                let provinceData = [];
                for (let m = 0, ln = cities.length; m < ln; m++) {
                    let val = {};
                    for (let i = 0, len = whDestData.length; i < len; i++) {
                        let idx = province.indexOf(whDestData[i]['destProvince']);
                        if (cities[m].name === whDestData[i]['startCode'] && idx === -1) {
                            val = {
                                name: whDestData[i]['destProvince'],
                                value: whDestData[i]['numPack']
                            };
                            province.push(whDestData[i]['destProvince']);
                            provinceData.push(val);
                            dataArr.push([{name: cities[m].name}, val]);
                        }

                        if (idx !== -1) {
                            provinceData[idx].value += whDestData[i]['numPack'];
                        }
                    }
                }

                // mapChart.clear();
                // mapChart.setOption(this.setOptions(null, province));

                return dataArr;
            },
            makeFixed (data, idx) {
                this.defaultFixed = false;
                if (this.fixedIdx !== idx) {
                    this.fixedIdx = idx;
                    this.showSpark = true;
                    this.sparkData = data;
                    this.spark(data);
                } else {
                    this.fixedIdx = 10000;
                    this.showSpark = false;
                }
            },
            spark (data) {
                let that = this;
                let _dt = data;
                let dtParamStr = data.wsRule + '_' + data.version + '_' + data.combo;
                let convertData = (dt) => {
                    let res = [];
                    for (let i = 0, len = dt.length; i < len; i++) {
                        let geoCoord = this.cityCoord[dt[i].name];
                        if (geoCoord) {
                            res.push({
                                name: dt[i].name,
                                value: geoCoord.concat(dt[i].value)
                            });
                        }
                    }
                    return res;
                };

                let resetData = (dt) => {
                    let startCity = [];
                    let cities = [];
                    for (let m = 0, ln = dt.length; m < ln; m++) {
                        if (dt[m]['startCode'] && cities.indexOf(dt[m]['startCode']) === -1) {
                            startCity.push({
                                name: dt[m].startCode,
                                value: dt[m].deliveryDay.toFixed(2)
                            });
                            cities.push(dt[m]['startCode']);
                        }
                    }
                    return startCity;
                };

                let setMapData = (dt) => {
                    let sparkDt = resetData(dt) || [];
                    if (!that.isFixedA) {
                        sparkDataA = sparkDt;
                    } else if (that.isFixedA && !that.isFixedB) {
                        sparkDataB = sparkDt;
                    }
                    // if (that.fixedIdx === 10000 || that.showSpark) {
                    if (that.showSpark) {
                        whDestData = dt;
                        mapChart.clear();
                        let cityData = convertData(sparkDt);
                        let dataArr = that.drawTargetArea(cityData);
                        mapChart.setOption(this.setOptions(convertData(sparkDt), dataArr));
                    }
                };

                // 使用缓存的数据
                if (bigWHData[dtParamStr]) {
                    setMapData(bigWHData[dtParamStr]);

                    return false;
                }

                this.ajaxSettings.url = '/warehouse/cityMap';
                this.ajaxSettings.params = {
                    version: data.version,
                    combo: data.combo,
                    wsRule: data.wsRule
                };

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.length > 0) {
                        if (!bigWHData[dtParamStr]) {
                            bigWHData[dtParamStr] = data;
                        }
                        setMapData(bigWHData[dtParamStr]);
                    } else {
                        mapChart.clear();
                        mapChart.setOption(this.setOptions(convertData([]), null, _dt.combo));
                        // that.vmodal.failed('无仓库信息！');
                    }
                };

                this.ajaxSettings.error = (res) => {
                    mapChart.clear();
                    that.vmodal.failed('获取仓库分布失败！');
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            wheel (e) {
                let evt = e || window.event;
                let target = evt.target;

                if (target.className !== 'result-list') {
                    target = target.parentNode;
                }

                let osTp;
                let scH = target.scrollTop;
                let h = target.offsetHeight;
                if (this.isFixedA) {
                    osTp = targetA.offsetTop;
                    this.osTopA = osTp + pTp - scH;
                    this.isHoverA = !(this.osTopA < pTp || this.osTopA > h + pTp - 30);
                }

                if (this.isFixedB) {
                    osTp = targetB.offsetTop;
                    this.osTopB = osTp + pTp - scH;
                    this.isHoverB = !(this.osTopB < pTp || this.osTopB > h + pTp - 30);
                }
            },
            hover (e, dt, idx) {
                let evt = e || window.event;
                evt.stopPropagation();
                let target = evt.target;
                if (target.nodeName.toLowerCase() !== 'div') {
                    target = target.parentNode;
                    if (target.nodeName.toLowerCase() !== 'div') {
                        if (target.nodeName.toLowerCase() !== 'div') {
                            target = target.parentNode;
                        }
                    }
                }
                let pa = target.parentNode;
                let osTp = target.offsetTop;
                let scH = pa.scrollTop;
                pTp = (idx === 1000) ? 2 : 71;

                clearTimeout(this.timer);

                this.showSpark = true;
                if (this.fixedIdx !== idx) {
                    this.spark(dt);
                }

                if (!this.isFixedA && (this.fixedIdxB !== idx && this.fixedIdxA !== idx)) {
                    targetA = target;
                    this.isHoverA = true;
                    this.osTopA = osTp + pTp - scH;
                    this.hoverIdxA = idx;
                }

                if (this.isFixedA && !this.isFixedB && (this.fixedIdxB !== idx && this.fixedIdxA !== idx)) {
                    targetB = target;
                    this.isHoverB = true;
                    this.osTopB = osTp + pTp - scH;
                    this.hoverIdxB = idx;
                }

                if (!this.isFixedA) {
                    dt.type = 'A';
                    this.hoverDtA = dt;
                }

                if (this.isFixedA && !this.isFixedB) {
                    dt.type = 'B';
                    this.hoverDtB = dt;
                }

                this.focusOnFirst = false;
                this.focusOnFifth = false;

                if (idx !== this.hoverIdxB && idx !== this.hoverIdxB) {
                    // mapChart.clear();
                    // mapChart.setOption(this.setOptions(null, []));
                }
            },
            over (e) {
                clearTimeout(this.timer);
            },
            leave (e) {
                let that = this;
                this.timer = setTimeout(() => {
                    if (!that.isFixedA) {
                        that.isHoverA = false;
                    }
                    if (!that.isFixedB) {
                        that.isHoverB = false;
                    }

                    if (that.fixedIdx !== that.hoverIdxA && that.fixedIdx !== that.hoverIdxB) {
                        that.spark(that.sparkData);
                    }

                    if (this.hoverIdxB !== 10000) {
                        this.hoverIdxA = 10000;
                    }

                    if (this.hoverIdxA !== 10000) {
                        this.hoverIdxB = 10000;
                    }

                    if (!this.isFixedB) {
                        // this.hoverIdxB = 10000;
                    }
                }, 200);
            },
            matchItem (id) {
                for (let i = 0, len = this.compareList.length; i < len; i++) {
                    if (id === this.compareList[i]['id']) {
                        return i;
                    }
                }

                return -1;
            },
            fix (e, str) {
                let evt = e || window.event;
                evt.stopPropagation();

                if (str === 'A') {
                    this.isFixedA = !this.isFixedA;

                    if (!this.isFixedA) {
                        this.fixedIdxA = 10000;

                        let idx = this.matchItem(this.hoverDtA.id);
                        if (idx !== -1) {
                            this.compareList.splice(idx, 1);
                        }
                    } else {
                        this.fixedIdxA = this.hoverIdxA;
                        if (this.compareList.length < 2) {
                            this.compareList.push(this.hoverDtA);

                            if (this.compareList.length === 1) {
                                this.isComparingA = true;
                                this.isComparingB = false;
                            } else {
                                this.isComparingA = false;
                                this.isComparingB = true;
                            }
                        }
                    }
                } else {
                    this.isFixedB = !this.isFixedB;

                    if (!this.isFixedB) {
                        this.fixedIdxB = 10000;

                        let idx = this.matchItem(this.hoverDtB.id);
                        if (idx !== -1) {
                            this.compareList.splice(idx, 1);
                        }
                    } else {
                        this.fixedIdxB = this.hoverIdxB;
                        if (this.compareList.length < 2) {
                            if (this.hoverDtB.wsRule === 'now' || this.hoverDtA.combo > this.hoverDtB.combo) {
                                this.compareList.unshift(this.hoverDtB);
                                let pA = sparkDataA;
                                sparkDataA = sparkDataB;
                                sparkDataB = pA;
                            } else {
                                this.compareList.push(this.hoverDtB);
                            }

                            // this.compareList.push(this.hoverDtB);

                            if (this.compareList.length === 1) {
                                this.isComparingA = true;
                                this.isComparingB = false;
                            } else {
                                this.isComparingA = false;
                                this.isComparingB = true;
                            }
                        }
                    }
                }

                if (this.compareList.length === 0) {
                    this.isComparingA = false;
                    this.isComparingB = false;
                }
            },
            // tab标签切换
            tabTurn (idx, code, bl) {
                for (let i = 0, len = this.tabs.length; i < len; i++) {
                    if (this.tabs[i].active && i === idx && !bl) {
                        return;
                    }
                    this.tabs[i].active = false;
                }

                this.tabs[idx].active = true;

                this.focusOnFirst = true;

                // 获取默认5仓的索引号
                for (let m = 0, ln = this.dataList[idx].length; m < ln; m++) {
                    if (this.dataList[idx][m]['combo'] === 5) {
                        this.defaultIdx = m;
                        this.focusOnFifth = true;
                        this.focusOnFirst = false;
                        this.fixedIdx = m;
                        this.showSpark = true;
                    }
                }

                this.resultList = this.dataList[idx];
                this.sparkData = this.resultList[this.defaultIdx];
                this.spark(this.sparkData);
                this.showSpark = false;
            },
            setOptions (dtA, dtB, n) {
                mapOption.series = [];

                // let cities = ['广州', '上海', '北京', '郑州', '成都'];
                let cities = [];

                if (dtA) {
                    for (let i = 0, len = dtA.length; i < len; i++) {
                        cities.push(dtA[i].name);
                        dtA[i].value[2] = null;
                        delete dtA[i].value[2];
                    }
                } else {
                    return mapOption;
                }

                let getDt = (dt, k) => {
                    for (let i = 0, l = dt.length; i < l; i++) {
                        if (dt[i].name === k) {
                            return dt[i];
                        }
                    }
                };

                // cities = cities.splice(0, n || 3);
                cities.map(function (item, idx) {
                    mapOption.series.push({
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        rippleEffect: {
                            scale: 6,
                            period: 6,
                            brushType: 'fill'
                        },
                        itemStyle: {
                            normal: {
                                shadowBlur: 20,
                                shadowColor: 'rgba(29,141,127,.5)',
                                color: 'rgba(3,252,222,.6)'
                            },
                            emphasis: {
                                shadowBlur: 20,
                                color: 'rgba(3,252,222,.6)'
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                formatter: '{b}',
                                position: 'right',
                                distance: 20,
                                textStyle: {
                                    fontSize: 12,
                                    fontWeight: 'normal',
                                    color: '#ccc'
                                }
                            }
                        },
                        tooltip: {
                            show: false
                        },
                        showEffectOn: 'render',
                        symbolSize: 7,
                        zlevel: 2,
                        data: [getDt(dtA, item)] || []
                    }, {// 线
                        name: '',
                        type: 'lines',
                        zlevel: 1,
                        show: false,
                        symbol: ['none', 'circle'], // 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow'线两端的标记类型
                        symbolSize: 5,
                        lineStyle: {
                            normal: {
                                width: 0.2,
                                opacity: 0.2,
                                curveness: 0.2,
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(3,252,222,.7)'
                                }, {
                                    offset: 1,
                                    color: 'rgba(3,252,222,.7)'
                                }], false)
                            }
                        },
                        effect: {
                            show: true,
                            period: 8,
                            symbol: 'pin',
                            constantSpeed: 40,
                            symbolSize: 4,
                            color: 'rgba(3,252,222,.5',
                            trailLength: 0.05,
                            shadowBlur: 2
                        },
                        data: mapOption.convertData(dtB, item)
                    });
                });

                return mapOption;
            },
            initMap () {
                mapChart.setOption(this.setOptions());
            },
            compare () {
                let whNamesA = [];
                let whNamesB = [];
                for (let i = 0, len = sparkDataA.length; i < len; i++) {
                    whNamesA.push(sparkDataA[i].name);
                }
                for (let i = 0, len = sparkDataB.length; i < len; i++) {
                    whNamesB.push(sparkDataB[i].name);
                }

                /* this.$store.commit('shareData', {
                    dataName: 'compareDetails',
                    value: {
                        dataSrc: titleName,
                        versionA: this.compareList[0].version,
                        versionB: this.compareList[1].version,
                        comboA: this.compareList[0].combo,
                        comboB: this.compareList[1].combo,
                        wsRuleA: this.compareList[0].wsRule,
                        wsRuleB: this.compareList[1].wsRule,
                        whNamesA: whNamesA.join('，'),
                        whNamesB: whNamesB.join('，')
                    }
                }); */

                this.$router.push({
                    name: 'compare_detail',
                    query: {
                        dataSrc: titleName,
                        versionA: this.compareList[0].version,
                        versionB: this.compareList[1].version,
                        comboA: this.compareList[0].combo,
                        comboB: this.compareList[1].combo,
                        wsRuleA: this.compareList[0].wsRule,
                        wsRuleB: this.compareList[1].wsRule,
                        whNamesA: whNamesA.join('，'),
                        whNamesB: whNamesB.join('，')
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
                        that.ajaxSettings.url = '/warehouse/download';
                        that.ajaxSettings.params = {
                            version: beginTime
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
                            mapChart.clear();
                            that.vmodal.failed('执行下载失败！');
                        };

                        that.$store.commit('setAjax', this.ajaxSettings);
                        that.$store.dispatch('ajax');
                    } else {
                        // that.vmodal.failed('无仓库信息！');
                    }
                };

                this.ajaxSettings.error = (res) => {
                    mapChart.clear();
                    that.vmodal.failed('执行下载失败！');
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            // 获取文件调取状态
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
                    mapChart.clear();
                    that.canDownload = false;
                    that.vmodal.failed('获取下载状态失败！');
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            // 下载进度
            setProgress (res) {
                console.log(res);
            },
            // 文件下载
            download () {
                let that = this;
                this.ajaxSettings.url = '/download/downloadEnd?r=' + Math.random();
                this.ajaxSettings.params = {};
                this.ajaxSettings.onDownloadProgress = this.setProgress;
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.length > 0) {

                    } else {

                    }
                };

                this.ajaxSettings.error = (res) => {
                    mapChart.clear();
                    that.vmodal.failed('获取仓库分布失败！');
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
                // this.ajaxSettings.onDownloadProgress = null;
            }
        },
        data: () => {
            return {
                cityCoord: {},
                mapGeo: {},
                dataList: [],
                resultList: [],
                compareList: [],
                endTime: '--',
                tabs: [{
                    name: '成本最优',
                    code: 'costing',
                    active: true
                }, {
                    name: '时效最优',
                    code: 'timeliness',
                    active: false
                }],
                timer: null,
                hoverDtA: null,
                hoverDtB: null,
                hoverIdxA: 10000,
                hoverIdxB: 10000,
                fixedIdxA: 10000,
                fixedIdxB: 10000,
                fixedIdx: 10000,
                osTopA: 2500,
                osTopB: 2500,
                isFixedA: false,
                isFixedB: false,
                isHoverA: false,
                isHoverB: false,
                sparkData: [],
                currentDt: {},
                hasCurrent: false,
                isComparingA: false,
                isComparingB: false,
                focusOnFirst: true,
                focusOnFifth: false,
                canDownload: false,
                showSpark: true,
                defaultFixed: true,
                defaultIdx: 0,
                chart: {},
                downloadURL: ''
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .ddt-tools-simulate {
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

        .content-title ~ div .m-btn-default {
            margin-right: 10px;
            margin-left: 0;
            padding-right: 5px;
            padding-left: 5px;
        }

        .nav-tabs {
            display: flex;
            justify-content: space-around;
            padding: 0;
            list-style: none;
            overflow: hidden;
            background-color: #fff;
            border: none;

            > li {
                flex-grow: 1;
                font-size: 15px;

                > a {
                    position: relative;
                    display: block;
                    margin-right: 0;
                    padding: 10px;
                    line-height: 1.42857143;
                    border: none !important;
                    border-radius: 0;
                    color: #666;
                    text-align: center;

                    &:hover {
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

        .result-ttl {
            display: flex;
            justify-content: space-around;
            padding: 7px 0;
            background-color: #E4E7EA;

            span {
                flex-grow: 1;
                flex-basis: 50px;
                text-align: center;
                color: #666;
                font-size: 12px;
                &:first-child,
                &:last-child {
                    flex-grow: .4;
                }
            }
        }

        .result-list {
            position: relative;
            padding: 5px 0;
            overflow-y: auto;

            div {
                display: flex;
                position: relative;
                justify-content: space-around;
                line-height: 30px;
                background-color: #fff;

                > span {
                    flex-grow: 1;
                    flex-basis: 50px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    cursor: default;

                    b {
                        position: relative;
                        z-index: 0;
                        display: inline-block;
                        width: 20px;
                        line-height: 20px;
                        text-align: center;
                        color: #fff;
                        font-size: 12px;

                        &:after {
                            content: '';
                            display: inline-block;
                            position: absolute;
                            top: 0;
                            left: 0;
                            z-index: -1;
                            padding: 10px;
                            border-radius: 10px;
                            background: linear-gradient(to right, #1c80e0 0, #6474f9 100%);
                            font-size: 0;
                        }
                    }
                }
                &:hover {
                    background-color: #e8f3f6;
                }
            }
            .fixedLine {
                background-color: #e8f3f6 !important;
            }
            .curLine {
                background-color: #c1d5ff !important;
            }
        }

        .compare-box {
            margin-top: 10px;
            border: 1px solid #3B8EDE;
            border-radius: 4px;
            overflow: hidden;
        }
        .compare-ttl {
            position: relative;
            padding: 8px 3px;
            background: linear-gradient(to right, #1c80e0 0, #6474f9 100%);
            font-size: 14px;
            color: #fff;
        }
        .compare-list {
            div {
                position: relative;
                padding: 8px;
                border-bottom: 1px solid #ddd;
                font-size: 14px;
                color: #999;
            }
        }
        .simulate-current {
            display: flex;
            line-height: 30px;
            margin-top: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0 0 0 10px;

            > span {
                flex-grow: 1;
                flex-basis: 50px;
                text-align: center;
                color: #666;
                font-size: 12px;
                cursor: default;

                b {
                    position: relative;
                    z-index: 0;
                    display: inline-block;
                    width: 20px;
                    line-height: 20px;
                    margin-right: 3px;
                    text-align: center;
                    color: #fff;
                    font-size: 12px;

                    &:after {
                        content: '';
                        display: inline-block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: -1;
                        padding: 10px;
                        border-radius: 10px;
                        background-color: #FFA200;
                        font-size: 0;
                    }
                }
            }
        }

        .simulate-current.curLine {
            background-color: #EBF3FC;
        }

        .cls {
            display: inline-block;
            position: absolute;
            top: 10px;
            right: 8px;
            padding: 9px 8px 8px 9px;
            border-radius: 10px;
            background-color: #B2B2B2;
            cursor: pointer;

            &:hover {
                background-color: #555;
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
                left: 8px;
                width: 1px;
                height: 13px;
                transform: rotate(45deg);
            }
            &:after {
                top: 8px;
                left: 2px;
                width: 13px;
                height: 1px;
                transform: rotate(45deg);
            }
        }

        i.cls {
            top: 0;
            right: 0;
            background-color: transparent;

            &:hover {
                background-color: transparent;

                &:before, &:after {
                    background-color: #00fffa;
                }
            }
        }

        .select-anchor {
            position: absolute;
            z-index: 10;
            top: 0;
            right: -97px;
            height: 20px;
            padding: 3px 6px 3px 4px;
            border: 1px solid #3B8EDE;
            border-radius: 4px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(59, 142, 222, .3);

            label {
                line-height: 20px;
                float: left;
                padding-left: 28px;
            }
        }

        .simulate-list {
            position: relative;
            border: 1px solid rgb(218, 218, 218);
            border-radius: 4px;
        }

        .loading {
            margin: 0 0 -3px 0;
        }
    }
</style>
