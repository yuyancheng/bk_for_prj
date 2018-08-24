<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>路由追踪<span style="font-size: 12px; margin-left: 50px;">{{waybillType === 'forwardWaybill' ? '第三方单号' : '顺丰单号'}}：{{orderNumber}}</span><span
                    style="margin-left: 50px; font-size: 12px;">电话：{{telephone}}</span></h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="margin-top: 5px;">
                <div style="overflow: auto;" :class="{'full-h': !isFull}">
                    <table class="path-table">
                        <thead>
                        <tr>
                            <td style="width:180px;text-align: center;font-weight: bold;">时间</td>
                            <td style="width:38px;"></td>
                            <td style="text-align: center;font-weight: bold;">地点和追踪进度</td>
                        </tr>
                        </thead>
                        <tbody v-if="!hasNoData">
                        <tr v-for="(item, idx) in routes">
                            <td>{{isSF ? item.routeTime : (item.forwardTime + ' ' + item.dayWeek)}}</td>
                            <td :class="{'path-end': status(item, idx)}" style="position:relative;text-align: center;">
                                <span class="path-line"></span>
                                <b :class="['path-points', {'path-arrows': idx !== 0}]"><i></i></b>
                            </td>
                            <td v-html="isSF ? item.routeAddr : item.routingInformation"></td>
                        </tr>
                        </tbody>
                        <tbody v-else>
                        <tr>
                            <td :colspan="3" style="height: 260px; text-align: center;">暂无相关路由信息！</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="v-veil"></div>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        template: '#main',
        components: {},
        beforeCreate: function (bus) {
            window.onunload = (e) => {
                this.$router.prev();
            };
        },
        created: function (bus) {
            let that = this;
            let search = window.location.hash.split('?')[1].split('&');
            this.waybillType = search[0] && search[0].split('=')[1];
            this.orderNumber = search[1] && search[1].split('=')[1];
            this.telephone = search[2] && search[2].split('=')[1];

            let url = '/route/query';
            let params = {
                waybillNo: this.orderNumber || null
            };
            if (this.waybillType === 'forwardWaybill') {
                url = '/switchTracking/exThirdPartyWaybillRoutingInformation';
                params = {
                    forwardWaybillNo: this.orderNumber || null
                };
                this.telephone = this.telephone || '--';
                this.isSF = false;
            } else {
                this.telephone = '95338';
                this.isSF = true;
            }

            this.ajaxSettings = {
                url: url,
                params: params,
                success (res) {
                    if (!res || !res.data || !res.data.length) {
                        that.hasNoData = true;
                    } else {
                        that.routes = res.data;
                    }
                },
                error (err) {
                    console.error(err);
                }
            };
            this.$store.commit('setAjax', this.ajaxSettings);
            this.$store.dispatch('ajax');
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
        },
        methods: {
            resize (h, el) {
                if (h % 2 !== 0) {
                    el.style.paddingTop = 21 + 'px';
                }

                this.isFull = h > window.innerHeight;
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            },
            status (item, idx) {
                let ExpStr = /已签收|被签收|已退回|被退回|已结束|已转寄|被转寄|已关闭|被关闭/g;
                let str = this.isSF ? item.routeAddr : item.routingInformation;
                return (idx === this.routes.length - 1) && (item.isFinish || str.search(ExpStr) !== -1);
            }
        },
        computed: {},
        data () {
            return {
                routes: [],
                hasNoData: false,
                isFull: false,
                waybillType: '',
                isSF: true,
                telephone: '95338'
            };
        }
    };
</script>

<style lang="less" type="text/less" scoped>
    .v-modal-header {
        background: transparent url(../../../assets/image/ui_img/border_bg_a.png) 0 bottom repeat-x;
    }

    .v-modal-cls {
        position: absolute;
        top: 15px;
        right: 15px;
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

</style>
