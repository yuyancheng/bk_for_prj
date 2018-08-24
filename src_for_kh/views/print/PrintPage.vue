<template lang="pug">
    .cnt-wrapper
        div
            div(style="margin-bottom:20px;")
                h2(style="text-align:center;font-size:15px;") 发运单
            div(style="margin-bottom:30px;text-align:center;")
                strong(style="color:#f00;font-size:14px;") 快递小哥请注意：请把发运批次号填入到发件信息的“托寄物”中去

        div(style="font-size:13px;padding-bottom:10px;border-bottom: 1px solid #999;")
            el-row(:gutter="20")
                el-col(:span="8")
                    div(class="grid-content bg-purple")
                        span 发运批次号：
                        strong(style="font-size:14px;color:#4791FF") {{tables.result.batchId}}
                el-col(:span="8")
                    div(class="grid-content bg-purple")
                        span 创建时间：
                        strong(style="font-weight:normal;color:#666") {{tables.result.createTm}}
                el-col(:span="8")
                    div(class="grid-content bg-purple", v-if="!previewMode")
                        span 打印时间：
                        strong(style="font-weight:normal;color:#666") {{tables.result.printTm}}

        div(style="font-size:13px;padding:10px 0;")
            el-row(:gutter="20", style="margin-bottom:20px;")
                el-col(:span="14")
                    div(class="grid-content bg-purple")
                        span 寄件地址：
                        strong(style="font-weight:normal;font-size:14px;color:#666") {{tables.result.senderFullAddress}}
                el-col(:span="5")
                    div(class="grid-content bg-purple")
                        span 寄件人：
                        strong(style="font-weight:normal;font-size:14px;color:#666") {{tables.result.sender}}
                el-col(:span="5")
                    div(class="grid-content bg-purple")
                        span 电话：
                        strong(style="font-weight:normal;font-size:14px;color:#666") {{tables.result.senderTel}}
            el-row(:gutter="20", style="margin-bottom:20px;")
                el-col(:span="14")
                    div(class="grid-content bg-purple")
                        span 接收地址：
                        strong(style="font-weight:normal;font-size:14px;color:#666") {{tables.result.receiverFullAddress}}
                el-col(:span="5")
                    div(class="grid-content bg-purple")
                        span 收件人：
                        strong(style="font-weight:normal;font-size:14px;color:#666") {{tables.result.receiver}}
                el-col(:span="5")
                    div(class="grid-content bg-purple")
                        span 电话：
                        strong(style="font-weight:normal;font-size:14px;color:#666") {{tables.result.receiverTel}}

        h5(style="font-size:16px;color:#333;padding:0 0 20px;font-weight:normal;") 物资清单

        div
            el-table(
            :data="tableData",
            tooltip-effect="dark"
            style="width: 100%",
            size="medium")
                el-table-column(prop="baseGoods.firstCategoryName", label="专业", width="80")
                el-table-column(prop="baseGoods.secondCategoryName", label="类别", width="100")
                el-table-column(prop="baseGoods.goodsName", label="物资名称", width="120")
                el-table-column(prop="baseGoods.goodsUnit", label="单位", width="140")
                el-table-column(prop="goodsNum", label="发运数量", width="80")
                el-table-column(prop="remark", label="备注")

            div(style="margin: 20px 0 0;padding-top:20px;border-top:1px solid #999;")
                h5(style="font-size:16px;color:#555;padding:0 0 10px;font-weight:normal;") 备注说明
                p(style="margin: 10px 0 0;overflow: hidden;") {{tables.result.remark}}

</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;
            return {
                currentPage: 1,
                tableData: [],
                batchId: '',
                previewMode: true,
                isLoading: false,
                hasNewOne: false,
                resetDisabled: false,
                tables: {
                    result: {
                        id: '',
                        batchId: '',
                        receiver: '',
                        receiverFullAddress: '',
                        receiverTel: '',
                        remark: '',
                        sender: '',
                        senderFullAddress: '',
                        senderTel: '',
                        printTm: '',
                        despatchGoodsList: [],
                    },
                    getData() {
                        that.$axios.post(APIList.GET_DESPATCH_PRINT, that.$qs.stringify({
                            batchId: that.batchId,
                        })).then((response) => {
                            that.tableData = response.data.despatchGoodsList;
                            that.tables.result = response.data;

                            setTimeout(() => {
                                that.init();
                            }, 500);
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
            };
        },
        components: {},
        created() {
            this.batchId = decodeURIComponent(this.$router.history.current.query.id || '');
            this.tables.getData(1);
        },
        mounted() {
            if (window.parent.initStatus) {
                window.parent.initStatus();
            }
        },
        methods: {
            init() {
                const that = this;
                const pIfr = window.parent.document.getElementById('printWindow');
                if (pIfr) {
                    pIfr.style.height = `${window.document.body.offsetHeight}px`;
                }

                // 数据加载完成，可以打印
                window.printPreview = {};
                window.printPreview.print = () => {
                    const docTtl = window.document.title;
                    const code = that.tables.result.batchId;
                    window.document.title = `${docTtl} 批次号(${code})`;
                    that.previewMode = false;
                    window.print();
                    that.previewMode = true;
                    // setTimeout(() => {
                    //     window.print();
                    //     that.previewMode = true;
                    // }, 100);
                };

                if (window.parent.setStatusReady) {
                    window.parent.setStatusReady();
                }
            },
            handleSizeChange(val) {
                this.tables.getData(val);
            },
            handleCurrentChange(val) {
                this.tables.getData(val);
            },
        },
    };

</script>

<style lang="scss" type="text/scss">
    @page {
        size: auto;
        margin: 0;
    }
    html, body {
        height: auto;
        min-width: auto;
    }
    body {
        width: 100%;
        background-color: #fff;
        font-size: 14px;
    }
    .cnt-wrapper {
        padding: 50px 20px 40px;
        background-color: #FFF;
    }
</style>
