<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="ddt-tools" style="margin-bottom: 50px;">
        <div class="content-title">
            <h4 class="title-name">分仓模拟
                <span style="float: right;">
                    <a class="simulate-step current-step" href="javascript:window.history.go(-2);"><b>1</b>数据导入&nbsp;&#9658;</a>
                    <a class="simulate-step current-step" href="javascript:window.history.back();"><b>2</b>模拟结果&nbsp;&#9658;</a>
                    <span class="simulate-step current-step"><b>3</b>对比详情</span>
                </span>
            </h4>
        </div>
        <div style="padding: 25px 0 22px;">
            <h2 style="font-size: 17px;color:#333;">对比详情</h2>
            <div style="float:none; margin-top: 15px;">
                <div class="detail-list">
                    <label>数据源：</label>
                    <span>{{dataSrc}}</span>
                </div>
                <div class="detail-list">
                    <label>{{whTypeA}}：</label>
                    <span>{{whNamesA}}</span>
                </div>
                <div class="detail-list">
                    <label>{{whTypeB}}：</label>
                    <span>{{whNamesB}}</span>
                </div>
            </div>
        </div>
        <div style="height: 10px; margin: 0 -25px; padding: 0; background-color: #EDF1F5;"></div>
        <div style="padding: 15px 0 30px;">
            <h2 style="margin: 10px 0 25px; font-size: 17px; color: #333;">整体</h2>
            <div style="display: flex; justify-content: space-around; margin: 0 -13px;">
                <div class="data-card blue">
                    <div class="circle-mark blue">{{whTypeA}}</div>
                    <div>{{costingA}}</div>
                    <p>分仓的总体成本（元）</p>
                </div>
                <div class="data-card blue">
                    <div class="circle-mark blue">{{whTypeA}}</div>
                    <div>{{timelinessA}}</div>
                    <p>分仓的平均配送时效（小时）</p>
                </div>
                <div class="data-card yellow">
                    <div class="circle-mark yellow">{{whTypeB}}</div>
                    <div>{{costingB}}</div>
                    <p>分仓的总体成本（元）</p>
                </div>
                <div class="data-card yellow">
                    <div class="circle-mark yellow">{{whTypeB}}</div>
                    <div>{{timelinessB}}</div>
                    <p>分仓的平均配送时效（小时）</p>
                </div>
            </div>
        </div>
        <div style="height: 10px; margin: 0 -25px; padding: 0; background-color: #EDF1F5;"></div>
        <div style="padding: 15px 0 30px;">
            <h2 style="margin: 10px 0 25px; font-size: 17px; color: #333;">成本</h2>
            <div style="display: flex; justify-content: space-around;">
                <div style="flex-basis:350px; flex-grow: 1; border-right: 1px solid #eee;">
                    <div style="float: left; margin-bottom: -10px;" class="circle-mark blue">{{whTypeA}}</div>
                    <div id="pieA" style="margin:-10px 0 0 90px; height: 220px; background-color: #f5fefc;"></div>
                </div>
                <div style="flex-basis:300px; flex-grow: 1; margin-left: 50px;">
                    <div style="float: left; margin-bottom: -10px;" class="circle-mark yellow">{{whTypeB}}</div>
                    <div id="pieB" style="margin:-10px 0 0 100px; height: 220px; background-color: #f5fefc;"></div>
                </div>
            </div>
        </div>
        <div style="height: 10px; margin: 0 -25px; padding: 0; background-color: #EDF1F5;"></div>
        <div style="padding: 15px 0 30px;">
            <h2 style="margin: 10px 0 25px; font-size: 17px; color: #333;">时效</h2>
            <div style="display: flex; justify-content: space-around;">
                <div style="flex-basis:350px; flex-grow: 1; border-right: 1px solid #eee;">
                    <div style="float: left; margin-bottom: -10px;" class="circle-mark blue">{{whTypeA}}</div>
                    <div id="pieC" style="margin:-10px 0 0 90px; height: 220px; background-color: #f5fefc;"></div>
                </div>
                <div style="flex-basis:300px; flex-grow: 1; margin-left: 50px;">
                    <div style="float: left; margin-bottom: -10px;" class="circle-mark yellow">{{whTypeB}}</div>
                    <div id="pieD" style="margin:-10px 0 0 100px; height: 220px; background-color: #f5fefc;"></div>
                </div>
            </div>
        </div>
        <router-view></router-view>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import echarts from 'echarts';
    import VModal from '@/components/common/modal/VModal';

    export default {
        template: '<div></div>',
        components: {
            'v-modal': VModal
        },
        beforeCreate () {},
        created () {
            this.ajaxSettings = {
                url: '/warehouse/loadCost',
                params: {
                    combo: 0,
                    version: '',
                    wsRule: 'now'
                },
                error (err) {
                    console.log(err);
                }
            };

            let search = window.location.hash.split('?')[1];
            if (search) {
                search = search.replace(/&/g, ',').replace(/=/g, ':');
                search = ('{' + search + '}').replace(/{/g, '{"').replace(/}/g, '"}').replace(/:/g, '":"').replace(/,/g, '","');
                search = JSON.parse(search);

                this.dataSrc = decodeURI(search.dataSrc || '顺丰历史数据');
                this.versionA = decodeURI(search.versionA || '--');
                this.versionB = decodeURI(search.versionB || '--');
                this.wsRuleA = decodeURI(search.wsRuleA || '--');
                this.wsRuleB = decodeURI(search.wsRuleB || '--');
                this.whNamesA = decodeURI(search.whNamesA || '--');
                this.whNamesB = decodeURI(search.whNamesB || '--');
                this.comboA = decodeURI(search.comboA || '--') * 1;
                this.comboB = decodeURI(search.comboB || '--') * 1;
            }

            this.getComparedData({
                combo: this.comboA,
                version: this.versionA,
                wsRule: this.wsRuleA
            }, 'A');

            this.getComparedData({
                combo: this.comboB,
                version: this.versionB,
                wsRule: this.wsRuleB
            }, 'B');

            /* this.dataSrc = this.$store.state['compareDetails'].dataSrc;
            this.versionA = this.$store.state['compareDetails'].versionA;
            this.versionB = this.$store.state['compareDetails'].versionB;
            this.wsRuleA = this.$store.state['compareDetails'].wsRuleA;
            this.wsRuleB = this.$store.state['compareDetails'].wsRuleB;
            this.whNamesA = this.$store.state['compareDetails'].whNamesA;
            this.whNamesB = this.$store.state['compareDetails'].whNamesB; */

            if (this.wsRuleA === 'now' || this.wsRuleB === 'now') {
                this.whTypeA = '现状';
                if (this.wsRuleA === 'now') {
                    this.whTypeB = this.comboB + '仓';
                } else {
                    this.whTypeB = this.comboA + '仓';
                }
            } else {
                if (this.comboA <= this.comboB) {
                    this.whTypeA = this.comboA + '仓';
                    this.whTypeB = this.comboB + '仓';
                } else {
                    this.whTypeA = this.comboB + '仓';
                    this.whTypeB = this.comboA + '仓';
                }
            }
        },
        mounted () {
            this.vmodal = this.$refs.vmMsg;
            this.initPieChart();

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 5,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });
        },
        methods: {
            getComparedData (params, type) {
                let that = this;

                // /////////////////////////////整体与成本//////////////////////////
                this.ajaxSettings.url = '/warehouse/loadCost';
                this.ajaxSettings.params = params;
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    let dt = [{
                        name: '调拨成本',
                        value: data.transferCost || 0,
                        unit: '{b}\n{d}%'
                    }, {
                        name: '存储成本',
                        value: data.storageCost || 0,
                        unit: '{b}\n{d}%'
                    }, {
                        name: '配送成本',
                        value: data.deliveryCostWithDiscount || 0,
                        unit: '{b}\n{d}%'
                    }, {
                        name: '操作成本',
                        value: data.operationCost || 0,
                        unit: '{b}\n{d}%'
                    }];

                    if (data) {
                        if (type === 'A') {
                            that.costingA = this.numberFormatter(data.totalCost);
                            that.timelinessA = (data.avgDeliveryDay).toFixed(2);

                            that.initPieChart(dt, 1);
                        } else if (type === 'B') {
                            that.costingB = this.numberFormatter(data.totalCost);
                            that.timelinessB = (data.avgDeliveryDay).toFixed(2);

                            that.initPieChart(dt, 2);
                        }
                    } else {
                        // this.vmodal.failed('获取对比详情失败！');
                        if (type === 'A') {
                            that.initPieChart(dt, 1);
                        } else if (type === 'B') {
                            that.initPieChart(dt, 2);
                        }
                    }
                };
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');

                // ////////////////////////////////时效/////////////////////////////
                this.ajaxSettings.url = '/warehouse/loadDays';
                this.ajaxSettings.params = params;
                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    let dt = [{
                        name: '1天',
                        value: data.deliveryDay1 || 0,
                        unit: '{b}\n{d}%'
                    }, {
                        name: '2天',
                        value: data.deliveryDay2 || 0,
                        unit: '{b}\n{d}%'
                    }, {
                        name: '3天',
                        value: data.deliveryDay3 || 0,
                        unit: '{b}\n{d}%'
                    }, {
                        name: '4天',
                        value: data.deliveryDay4 || 0,
                        unit: '{b}\n{d}%'
                    }];

                    if (data) {
                        if (type === 'A') {
                            that.initPieChart(dt, 3);
                        } else if (type === 'B') {
                            that.initPieChart(dt, 4);
                        }
                    } else {
                        // this.vmodal.failed('获取对比详情失败！');
                        if (type === 'A') {
                            that.initPieChart(dt, 3);
                        } else if (type === 'B') {
                            that.initPieChart(dt, 4);
                        }
                    }
                };
                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
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
            initPieChart (dt, idx) {
                let colorA = ['#00CBD8', '#3D8BEB', '#7627E2', '#0AE3B8'];
                let colorB = ['#FE7849', '#F7467C', '#B232ED', '#FFB800'];

                switch (idx) {
                    case 1:
                        this.setPieChart('pieA', dt, colorA);
                        break;
                    case 2:
                        this.setPieChart('pieB', dt, colorB);
                        break;
                    case 3:
                        this.setPieChart('pieC', dt, colorA);
                        break;
                    case 4:
                        this.setPieChart('pieD', dt, colorB);
                        break;
                    default:
                        break;
                }
            },
            setPieChart (id, dt, color) {
                let that = this;
                let holder = document.getElementById(id);
                if (!holder) return;
                let rateChart = echarts.init(holder);

                let option = {
                    title: {},
                    tooltip: {
                        trigger: 'item',
                        formatter (a, b, c) {
                            if (id === 'pieA' || id === 'pieB') {
                                return that.numberFormatter(a.value) + ' 元';
                            } else {
                                return that.numberFormatter(a.value) + ' 件';
                            }
                        }
                    },
                    legend: {
                        x: '70%',
                        y: 'center',
                        orient: 'vertical',
                        // data: ['高风险客户','中风险客户','低风险客户'],
                        icon: 'circle'
                    },
                    // calculable: true,
                    series: [
                        {
                            name: '',
                            type: 'pie',
                            selectedOffset: 0,
                            legendHoverLink: false,
                            color: color,
                            radius: ['46%', '70%'],
                            center: ['40%', '55%'],
                            itemStyle: {
                                normal: {
                                    borderWidth: 2,
                                    borderColor: '#fff'
                                }
                            },
                            label: {
                                normal: {
                                    show: true,
                                    formatter (val) {
                                        return val.name + ' ( ' + val.percent.toFixed(1) + '% )';
                                    },
                                    textStyle: {
                                        fontSize: 12
                                    }
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                            data: dt
                        }
                    ]
                };

                rateChart.setOption(option);
            }
        },
        data: () => {
            return {
                dataSrc: '',
                costingA: '--',
                costingB: '--',
                timelinessA: '--',
                timelinessB: '--',
                versionA: '',
                versionB: '',
                wsRuleA: '',
                wsRuleB: '',
                whTypeA: '',
                whTypeB: '',
                whNamesA: '',
                whNamesB: ''
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

        .detail-list {
            padding: 5px 0;
            line-height: 20px;
            font-size: 15px;
            color: #666;
        }

        .data-card {
            flex-grow: 1;
            position: relative;
            width: 220px;
            height: 90px;
            margin: 0 13px;
            padding: 15px 0;
            color: #fff;
            text-align: center;
            border-radius: 4px;

            div {
                padding: 15px 0 10px;
                font-size: 31px;
            }
            p {
                font-size: 14px;
            }

            .circle-mark {
                position: absolute;
                top: -20px;
                left: 50%;
                margin-left: -20px;
            }

            .circle-mark.blue {
                &:before {
                    box-shadow: 0 10px 20px rgba(59, 142, 222, .3);
                }
                &:after {
                    box-shadow: 0 2px 3px rgba(59, 142, 222, .5);
                }
            }
            .circle-mark.yellow {
                &:before {
                    box-shadow: 0 10px 20px #EF9A05;
                }
                &:after {
                    box-shadow: 0 2px 3px rgba(255, 162, 0, 0.8);
                }
            }
        }

        .data-card.blue {
            background-color: #3B8EDE;
            box-shadow: 0 5px 15px rgba(59, 142, 222, .3);
        }
        .data-card.yellow {
            background-color: #FFA200;
            box-shadow: 0 5px 15px rgba(255, 181, 53, .5);
        }

        .circle-mark {
            position: relative;
            z-index: 10;
            width: 46px;
            padding: 12px 0 !important;
            font-size: 12px !important;
            color: #fff;
            text-align: center;

            &:before, &:after {
                content: '';
                display: inline-block;
                position: absolute;
                border-radius: 30px;
            }
            &:before {
                z-index: -1;
                top: -4px;
                left: 0;
                padding: 23px;
            }
            &:after {
                z-index: -1;
                top: 0;
                left: 4px;
                padding: 19px;
            }
        }
        .circle-mark.blue {
            &:before {
                background-color: rgba(97, 177, 254, 0.4);
            }
            &:after {
                background: linear-gradient(to bottom, #61B1FE 0, #71B9FF 100%);
            }
        }
        .circle-mark.yellow {
            &:before {
                background-color: rgba(255, 188, 70, 0.4);
            }
            &:after {
                background: linear-gradient(to bottom, #FFB535 0, #FFB637 100%);
            }
        }
    }
</style>
