<template lang="pug">
    el-dialog(
    ref="multipleTable",
    title="物资详情",
    :visible.sync="dialogVisible"
    width="700px",
    :custom-class="'dialog-css'",
    @close="close")
        div(style="margin-top:-20px;line-height: 40px;")
            span(style="font-size: 14px;") 批次号：{{batchId}}

        el-table(
        :data="tableData",
        tooltip-effect="dark"
        style="width: 100%;",
        size="medium")
            el-table-column(prop="baseGoods.firstCategoryName", label="专业", width="120")
            el-table-column(prop="baseGoods.secondCategoryName", label="类别", width="150")
            el-table-column(prop="baseGoods.goodsName", label="品名", width="90")
            el-table-column(prop="baseGoods.goodsUnit", label="单位")
            el-table-column(prop="goodsNum", label="数量", width="100")
</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            return {
                tableData: [],
                dialogVisible: true,
                hasNoData: false,
            };
        },
        components: {},
        beforeCreate() {
        },
        created() {
            this.dialogVisible = true;
            this.batchId = decodeURIComponent(this.$router.history.current.hash.substring(1));
            if (this.batchId) {
                this.getDespatchInfo();
            }
        },
        mounted() {
        },
        methods: {
            handleSizeChange(val) {
                this.getDespatchInfo(1, val);
            },
            handleCurrentChange(val) {
                this.getDespatchInfo(val);
            },
            close() {
                this.dialogVisible = false;
                window.history.back();
                // this.$router.prev();
            },
            getDespatchInfo() {
                const that = this;
                const params = {
                    batchId: this.batchId || '',
                };

                this.$axios.post(APIList.DESPATCH_GOODS_LIST, params).then((response) => {
                    if (response.code === 200 && response.data) {
                        that.tableData = response.data;
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
    };
</script>

<style lang="scss" type="text/less" scoped>

</style>
