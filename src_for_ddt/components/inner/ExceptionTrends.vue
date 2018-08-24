<template lang="pug">
    .exception-trends
        .content-title.fixed
            h4.title-name(style="display: inline-block") 异动分析
                i(v-on:mouseenter="hover()", v-on:mouseleave="leave()", class="question-mark",
                b-model='{"title": "", "body": "<table class=\'b-table\'><thead><tr><td>指标</td><td>详解</td></tr></thead><tbody><tr><td>未完成快件跟踪</td><td>近14天发的件，还未被签收的件总和；</td></tr><tr><td>转寄第三方</td><td>近14天发的件中，发生过转寄第三方且还未被签收的件总和；</td></tr><tr><td>转寄/退回</td><td>近14天发的件中，发生的转寄/退回且还未被签收的件总和；</td></tr><tr><td>在途</td><td>近14天发的件中，没有发生“转寄/退回”和“转寄第三方”且未被签收的件总和；</td></tr><tr><td>派送中</td><td>近14天发的件中，当前正在派送的件总和。</td></tr></tbody></table>"}') ?
                time(class="update-time") 数据更新于{{updateTime}}
        .main
            .items(v-for="item in [{name:'名称1', value:123}, {name:'名称2', value:234}]")
                .items-head
                    h3 日均发件量
                .items-body
                    .item
                        .item-icon
                        .item-text
                            .item-text-desc {{item.name}}
                            .item-text-num {{item.value}}
        hr.division-line
        div
            div(style="height: 40px;padding:0;")
                h4(class="title-name", style="display: inline-block") 未完成快件明细
            div
                div(style="float: left;padding: 10px 20px 10px 10px;")
        router-view
        v-modal(ref="vmMsg")
        v-bubble(ref="vBubble")
        iframe(v-bind:src="downloadURL", style="display:none; width:0; height:0;")
</template>

<script type="text/ecmascript-6">
    // import Vue from 'vue';
    import VModal from '@/components/common/modal/VModal';
    import VBubble from '@/components/common/modal/Bubble';
    // import utils from '@/assets/js/lib/utils';

    export default {
        template: '<div></div>',
        components: {
            'v-modal': VModal,
            'v-bubble': VBubble
        },
        beforeCreate () {
        },
        created () {
            let that = this;
            this.queryDt = {
                func (dt) {
                    that.queryKey = dt;
                },
                setQueryCallback (fun) {
                    that.getQueryKey = fun;
                },
                clear () {
                    that.queryKey = [];
                    that.query();
                },
                maxSize: 50,
                filterRegExp: null,
                invalidTip: null,
                repeatedTip: null,
                overflowTip: null
            };

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
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$refs.vmMsg;
            this.vbubble = this.$refs.vBubble;
            // this.vquery = this.$refs.vQuery;

            // this.initStatusData();

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 1,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });

            this.getTodayTotal();
        },
        methods: {
            cardNoChanged (dt) {
                this.custCode = dt || '全部';
                // this.initStatusData();
                this.getTodayTotal();
            },
            numberFormatter (num) {
                return (num + '').replace(/\d(?=(\d{3},?)+$)/g, '$&,');
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
                    if (dt['data'][dt['data'].length - 1]['name'] === 'telphone') {
                        if (dt['data'][dt['data'].length - 1]['value']) {
                            query.telephone = dt['data'][dt['data'].length - 1]['value'];
                        }
                    }
                    this.$router.push({
                        name: 'waybill_express_route',
                        query: query
                    });
                }
            },
            // 获取总量
            getTodayTotal () {
            },
            initStatusData () {
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
            getFile (dt) {
            },
            getDownloadStatus (n) {
            }
        },
        data: () => {
            return {
                updateTime: '--',
                downloadURL: ''
            };
        }
    };
</script>

<style lang="less" type="text/less">
    .exception-trends {
        .m-btn-w-xs {
            min-width: inherit;
            margin: 0 10px;
            line-height: 1.22857143;
        }
        .loading {
            margin: 0 0 -3px 0;
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
                background: transparent url(../../assets/image/logistics/waybill_icons_a.png) 0 0 no-repeat;
            }
        }
        .waybill-status {
            > div {
                &:nth-child(1):before {
                    background-position: 0 0;
                }
                &:nth-child(2):before {
                    background-position: -213px 0;
                }
                &:nth-child(3):before {
                    background-position: -142px 0;
                }
                &:nth-child(4):before {
                    background-position: -355px 0;
                }
                &:nth-child(5):before {
                    background-position: -426px 0;
                }
            }
        }
    }
</style>
