<template lang="pug">
    el-dialog(
    ref="multipleTable",
    title="路由追踪",
    :visible.sync="dialogVisible"
    width="800px",
    :custom-class="'dialog-css'",
    @close="close")
        div(style="position: absolute;top:23px; z-index:100;left:100px;")
            span(style="font-size: 12px; margin-left: 50px;") {{waybillType === 'forwardWaybill' ? '第三方单号' : '顺丰单号'}}：{{orderNumber}}
            span(style="margin-left: 50px; font-size: 12px;") 电话：{{telephone}}

        div(style="margin-top: 5px;")
            div(style="line-height:40px;margin-top:-30px;border-bottom:1px solid #ededed;")
                span(style="display:inline-block;width:180px;text-align: center;font-weight: bold;") 时间
                span(style="display:inline-block;width:20px;") &nbsp;
                span(style="display:inline-block;width:500px;text-align: center;font-weight: bold;") 地点和追踪进度
            div(style="overflow: auto;", :class="{'full-h': !isFull}")
                table(class="path-table")
                    tbody(v-if="routes.length")
                        tr(v-for="(item, idx) in routes")
                            td(width="180") {{isSF ? item.routeDate : (item.forwardTime + ' ' + item.dayWeek)}}
                            td(width="20", :class="{'path-end': status(item, idx)}" style="position:relative;text-align: center;")
                                span(class="path-line")
                                b(:class="['path-points', {'path-arrows': idx !== 0}]")
                                    i
                            td(width="500", v-html="isSF ? item.routeDescribe : item.routingInformation")
                    tbody(v-else)
                        tr
                            td(:colspan="3" style="height: 260px; text-align: center;") 暂无相关路由信息！
</template>

<script type="text/ecmascript-6">
    // import routeData from '@/assets/js/routeData';
    import APIList from '@/assets/datas/APIList.json';

    export default {
        components: {},
        beforeCreate() {
        },
        created() {
            this.dialogVisible = true;
            this.orderNumber = decodeURIComponent(this.$router.history.current.hash.substring(1));
            if (this.orderNumber) {
                this.getRouteInfo();
            }
        },
        mounted() {
        },
        methods: {
            close() {
                this.dialogVisible = false;
                window.history.back();
                // this.$router.prev();
            },
            status(item, idx) {
                const ExpStr = /已签收|被签收|已退回|被退回|已结束|已转寄|被转寄|已关闭|被关闭|拒收|签收|丰巢|快递柜/g;
                const str = this.isSF ? item.routeDescribe : item.routingInformation;
                return (idx === this.routes.length - 1) && (item.isFinish || str.search(ExpStr) !== -1);
            },
            getRouteInfo() {
                const that = this;
                const params = {
                    waybillNo: this.orderNumber || null,
                };

                const param = this.$qs.stringify(params);
                this.$axios.get(`${APIList.GET_EXPRESS_ROUTE}?${param}`, {
                    data: {},
                }).then((response) => {
                    if (response.code === 200 && response.data) {
                        that.routes = response.data.reverse();
                    } else if (response.data) {
                        this.$message({
                            type: 'error',
                            message: response.data.msg,
                        });
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
        },
        computed: {},
        data() {
            return {
                routes: [],
                dialogVisible: true,
                hasNoData: false,
                isFull: false,
                waybillType: '',
                isSF: true,
                telephone: '95338',
            };
        },
    };
</script>

<style lang="scss" type="text/less" scoped>
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
        height: 360px;
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
        padding: 6px;
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
            border-radius: 20px;
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
    .dialog-css .el-dialog__body {
        padding: 10px 30px 30px;
    }
</style>
