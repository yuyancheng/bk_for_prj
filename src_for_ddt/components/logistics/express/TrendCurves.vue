<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="v-modal trend-curves">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>{{trendType}}
                    <div style="position: absolute;top:10px;right:40px;z-index: 100;">
                        <vue-datepicker-local v-model="time" format="YYYY-MM-DD" :disabled-date="disabledDate" />
                    </div>
                </h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="margin: -37px -20px -10px -20px;">
                <div id="curve_holder" style="height:340px;overflow: auto;" :class="{'full-h': !isFull}"></div>
            </div>
        </div>
        <div class="v-veil"></div>
    </div>
</template>

<script type="text/ecmascript-6">
    import echarts from 'echarts';
    import utils from '@/assets/js/lib/utils';

    let trendCarve = null;
    let options = {};

    export default {
        template: '#main',
        components: {},
        beforeCreate: function (bus) {
            window.onunload = (e) => {
                this.$router.prev();
            };
        },
        created: function (bus) {
            let search = window.location.hash.split('?')[1].split('&');
            this.typeIndex = search[0] && search[0].split('=')[1];
            this.trendType = decodeURIComponent(search[1] && search[1].split('=')[1]);

            this.ajaxSettings = {
                url: '/',
                params: {},
                error (err) {
                    console.log(err);
                }
            };

            // 添加月结卡号更新回调
            this.$store.commit('setCardNoChangeCallback', this.cardNoChanged);
        },
        mounted: function () {
            let modalWrapper = document.getElementById('modal_wrapper');
            let osh;
            let that = this;
            setTimeout(() => {
                osh = modalWrapper.offsetHeight;
                that.resize(osh, modalWrapper);
            }, 200);
            window.onresize = () => {
                that.resize(osh, modalWrapper);
            };

            trendCarve = echarts.init(document.getElementById('curve_holder'));

            this.initOption();

            this.getLastCompareDate((date) => {
                if (date) {
                    this.time = new Date(date);
                    /* that.refresh(date, (dt) => {
                        if (dt) {
                            that.setCurveOption(dt);
                        } else {
                            that.setDefaultCompare();
                        }
                    }); */
                } else {
                    that.setDefaultCompare();
                }
            });
        },
        watch: {
            time (newVal, oldVal) {
                if (newVal && newVal.getTime() !== oldVal && oldVal.getTime()) {
                    this.refresh(newVal);
                }
            }
        },
        methods: {
            cardNoChanged (dt) {
                this.custCode = dt || '全部';
                this.refresh(this.time);
            },
            resize (h, el) {
                if (h % 2 !== 0) {
                    el.style.paddingTop = 21 + 'px';
                } else {
                    el.style.paddingTop = 20 + 'px';
                }

                this.isFull = h > window.innerHeight;
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            },
            // 数据缓存
            makeDataCache (dt) {
                let _dt = this.cachedData[dt.name];
                if (!_dt) {
                    this.cachedData[dt.name] = dt.value;
                }
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
            setDefaultCompare () {
                let that = this;
                if (this.$store.state.collectData.compare && this.$store.state.collectData.compare.date) {
                    this.time = new Date(this.$store.state.collectData.compare.date);
                }
                if (that.$store.state.collectData.compare && that.$store.state.collectData.compare.data) {
                    if (that.$store.state.collectData.compare.date) {
                        options.legend.data[0] = that.$store.state.collectData.compare.date;
                    }
                    options.series[0].name = options.legend.data[0];
                    let dataCompare = JSON.parse(that.$store.state.collectData.compare.data[that.typeIndex * 1]);
                    dataCompare.splice(0, 1);
                    for (let i = 0, len = dataCompare.length; i < len; i++) {
                        if (dataCompare[i] === null) {
                            dataCompare.splice(i, 1, '无');
                        }
                    }
                    options.series[0].data = dataCompare;
                }
                if (that.$store.state.collectData.today && that.$store.state.collectData.today.data) {
                    let dataToday = JSON.parse(that.$store.state.collectData.today.data[that.typeIndex * 1]);
                    dataToday.splice(0, 1);
                    for (let i = 0, len = dataToday.length; i < len; i++) {
                        if (dataToday[i] === null) {
                            dataToday.splice(i, 1, '无');
                        }
                    }
                    options.series[1].data = dataToday;
                }

                trendCarve.setOption(options);
            },
            setCurveOption (dt) {
                if (dt) {
                    let that = this;
                    let today = dt.today && dt.today.data;
                    let compare = dt.compare && dt.compare.data;
                    let types = ['todayCnt', 'toExcepCnt', 'toBackCnt', 'toSwitchCnt', 'toRejectionCnt'];

                    options.legend.data[0] = utils.dateFormat(compare['lastUpdateTime'], 'yyyy-MM-dd');
                    options.series[0].name = options.legend.data[0];
                    let dataCompare = JSON.parse(compare[types[that.typeIndex]]);
                    let dataToday = JSON.parse(today[types[that.typeIndex]]);
                    dataCompare.splice(0, 1);
                    dataToday.splice(0, 1);
                    for (let i = 0, len = dataCompare.length; i < len; i++) {
                        if (dataCompare[i] === null) {
                            dataCompare.splice(i, 1, '无');
                        }
                    }
                    for (let i = 0, len = dataToday.length; i < len; i++) {
                        if (dataToday[i] === null) {
                            dataToday.splice(i, 1, '无');
                        }
                    }
                    options.series[0].data = dataCompare;
                    options.series[1].data = dataToday;
                }

                trendCarve.clear();
                trendCarve.setOption(options);
            },
            refresh (date, func) {
                let dateStr = utils.dateFormat(date, 'yyyy-MM-dd');
                if (this.makeDataCache[dateStr]) {
                    this.setCurveOption(this.makeDataCache[dateStr]);
                } else {
                    let that = this;
                    that.ajaxSettings.url = '/express/waybill/realtime/summary';
                    that.ajaxSettings.params = {
                        custCode: this.custCode,
                        compare_date: dateStr
                    };
                    this.ajaxSettings.success = (res) => {
                        if (res) {
                            let dt = res.data && res.data.data;
                            if (!dt) {
                                that.setDefaultCompare();
                                that.setCurveOption();
                                that.vmodal.failed('获取实时动态汇总失败！');
                            }
                            if (!func) {
                                that.setCurveOption(dt);
                            } else {
                                func(dt);
                            }
                        }
                    };
                    this.ajaxSettings.error = (res) => {
                        that.setCurveOption();
                    };

                    this.$store.commit('setAjax', this.ajaxSettings);
                    this.$store.dispatch('ajax');
                }
            },
            status (item, idx) {
                return (idx === this.routes.length - 1) && item.isFinish;
            },
            initOption () {
                // let that = this;
                let colors = ['#a6a6a6', '#5793F3'];

                options = {
                    color: colors,
                    tooltip: {
                        trigger: 'none',
                        axisPointer: {
                            type: 'cross'
                        }
                    },
                    legend: {
                        data: ['--', utils.dateFormat(new Date(), 'yyyy-MM-dd')]
                    },
                    grid: {
                        top: 50,
                        right: 20,
                        bottom: 20,
                        left: 60
                    },
                    xAxis: [
                        {
                            type: 'category',
                            axisTick: {
                                alignWithLabel: true
                            },
                            axisLine: {
                                onZero: true,
                                lineStyle: {
                                    color: colors[1]
                                }
                            },
                            axisPointer: {
                                label: {
                                    formatter: function (params) {
                                        return '件量  ' + params.value +
                                            (params.seriesData.length ? '：' + params.seriesData[0].data : '');
                                    }
                                }
                            },
                            data: ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']
                        },
                        {
                            type: 'category',
                            show: false,
                            axisTick: {
                                alignWithLabel: true
                            },
                            axisLine: {
                                onZero: true,
                                lineStyle: {
                                    color: colors[0]
                                }
                            },
                            axisPointer: {
                                label: {
                                    formatter: function (params) {
                                        return '件量  ' + params.value +
                                            (params.seriesData.length ? '：' + params.seriesData[0].data : '');
                                    }
                                }
                            },
                            data: ['02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00']
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ],
                    series: [
                        {
                            name: '--',
                            type: 'line',
                            xAxisIndex: 1,
                            smooth: true,
                            data: []
                        },
                        {
                            name: utils.dateFormat(new Date(), 'yyyy-MM-dd'),
                            type: 'line',
                            smooth: true,
                            data: []
                        }
                    ]
                };
            },
            disabledDate (time) {
                return (time.getTime() + 14 * 86400000 < new Date().getTime() || time > new Date());
            }
        },
        data () {
            return {
                routes: [],
                hasNoData: false,
                isFull: false,
                trendCarve: null,
                options: {},
                time: new Date(),
                typeIndex: 0,
                trendType: '',
                cachedData: {},
                lastComparedDate: '',
                custCode: '全部'
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .trend-curves {
        .datepicker {
            float: left;
            margin-right: 10px;
            min-width: auto;
            input {
                width: 150px;
                height: 30px;
                border-radius: 4px;
                border-color: #C7C7C7;
                background-color: #fff;
            }
        }
        &.v-modal {
            overflow: visible !important;
        }
        .v-modal-wrapper {
            padding-top: 10px;
        }
        .v-modal-header {
            background: none;
        }

        .v-modal-cls {
            position: absolute;
            top: 15px;
            right: 15px;
            z-index: 1000;
            display: inline-block;
            cursor: pointer;
        }

        .page-link {
            font-size: 12px;
            float: right;
            color: #408aff;

            b {
                font-size: 16px;
                zoom: 1.2;
                font-weight: normal;
            }
        }

        .full-h {
            height: 320px;
        }

        .path-table {
            width: 100%;
            font-size: 12px;

            tbody {
                tr {
                    td {
                        padding: 6px 10px;
                    }

                    &:nth-last-child(2) {
                        .path-line {
                            bottom: -45% !important;
                        }
                    }

                    &:nth-child(1) {
                        .path-points {
                            display: inline-block;
                            padding: 7px;
                            border-radius: 10px;
                            background-color: #408aff;

                            i {
                                display: none;
                            }
                        }

                        .path-line {
                            top: 50%;
                            content: '';
                            position: absolute;
                            bottom: -1px;
                            left: 19px;
                            width: 2px;
                            height: auto;
                            background-color: #408aff;
                            font-size: 0;
                            -ms-transform: rotate(0);
                            transform: rotate(0);
                        }
                    }

                }
            }
        }

        .path-line {
            display: inline-block;
            position: absolute;
            top: -2px;
            bottom: -1px;
            z-index: 0;
            left: 19px;
            width: 2px;
            background-color: #408aff;
            font-size: 0;
        }

        .path-points {
            display: inline-block;
            position: relative;
            padding: 7px;
            border-radius: 10px;
            background-color: #408aff;
            margin: 0 !important;
        }

        .path-arrows {
            i {
                position: absolute;
                top: 4px;
                left: 4px;
                z-index: 1;
                padding: 2px;
                font-size: 0;
                border-bottom: 1px solid #fff;
                border-left: 1px solid #fff;
                -webkit-transform: rotate(-45deg);
                -ms-transform: rotate(-45deg);
                transform: rotate(-45deg);
            }
        }

        .path-end {
            .path-points {
                padding: 9px;
                border-radius: 10px;
                background-color: #22c474;
                margin-top: 3px;

                i {
                    position: absolute;
                    top: 5px;
                    left: 3px;
                    z-index: 1;
                    padding: 2px 5px;
                    font-size: 0;
                    border-bottom: 2px solid #fff;
                    border-left: 2px solid #fff;
                    -webkit-transform: rotate(-45deg);
                    -ms-transform: rotate(-45deg);
                    transform: scaleX(0.9) rotate(-45deg);
                }
            }

            .path-line {
                bottom: 40%;
            }
        }
    }
</style>
