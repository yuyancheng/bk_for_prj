<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="v-modal">
        <div class="v-modal-wrapper" style="overflow-y: auto;">
            <div class="v-modal-header">
                <h2>退回件详情</h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div style="margin-top: 10px;">
                <div style="overflow: auto;" class="full-h">
                    <div style="margin-top: 10px;line-height: 40px;color:#000;font-size:14px;">
                        <span>发起人： {{details.sender.name}}</span>
                        <span style="margin-left:50px;">发起人电话： {{details.sender.phone}}</span>
                    </div>
                    <table class="path-table">
                        <thead>
                        <tr>
                            <td style="width:180px;text-align: center;">收件人/公司名称</td>
                            <td style="text-align: center;">收件地址</td>
                            <td style="width:140px;text-align: center;">收件人电话</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="(item, idx) in details.data">
                            <td>{{item.receiverInfo}}</td>
                            <td>{{item.receiveAddress}}</td>
                            <td>{{item.receivetorPhone}}</td>
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
            this.details = this.$store.state.expressDetails;
        },
        mounted: function () {
        },
        methods: {
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            }
        },
        computed: {},
        data () {
            return {
                details: []
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
        font-size: 14px;
        float: right;
        color: #408aff;

        b {
            font-size: 16px;
            zoom: 1.2;
            font-weight: normal;
        }
    }
    .full-h {
        height: 141px;
    }
    .path-table {
        width: 100%;
        font-size: 14px;
        color:#333;
        thead {
            tr {
                td {
                    padding: 6px 10px;
                    background-color: #eee;
                }
            }
        }
        tbody {
            tr {
                td {
                    padding: 6px 10px;
                    text-align: center;
                }

                &:nth-last-child(2) {
                    .path-line {
                        bottom: -45% !important;
                    }
                }
            }
        }
    }
</style>
