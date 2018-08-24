<template lang="pug">
    .cnt-wrapper
        div
            el-table(
            :data="tableData",
            tooltip-effect="dark"
            style="width: 100%",
            size="medium")
                el-table-column(type="index", label="序号", width="50")
                    template(slot-scope="scope")
                        span {{scope.$index + 1 + (tables.result.pageNum - 1) * tables.result.pageSize}}
                el-table-column(prop="title", label="名称", show-overflow-tooltip=true)
                    template(slot-scope="scope")
                        a(style="cursor:pointer;",
                        @click="visitPage(scope.row.id)") {{scope.row.title.replace(regExp[0], '&').replace(regExp[1], '＂').replace(regExp[2], '＜').replace(regExp[3], '＞')}}
                el-table-column(prop="publishTm", label="发布日期", width="180")

            el-pagination(
            style="margin-top:5px;text-align:right;",
            @size-change="handleSizeChange",
            @current-change="handleCurrentChange",
            :current-page="tables.result.pageNum",
            :page-sizes=[10, 20, 30, 40, 50, 100],
            :page-size="tables.result.pageSize",
            background,
            layout="total, sizes, prev, pager, next, jumper",
            :total="tables.result.total")

</template>

<script type="text/ecmascript-6" scoped>
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;
            return {
                currentPage: 1,
                regExp: [new RegExp(/&amp;/gi), new RegExp(/&quot;/gi), new RegExp(/&lt;/gi), new RegExp(/&gt;/gi)],
                tableData: [],
                tables: {
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    getData(idx, size) {
                        const dt = that.$qs.stringify({
                            pageSize: size || that.tables.result.pageSize,
                            pageNum: idx,
                            typeId: 3,
                        });
                        that.$axios.get(`${APIList.GET_ARTICLES_LIST}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            that.tableData = response.data.rows;
                            that.tables.result = response.data;
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
            };
        },
        mounted() {
            this.$parent.$parent.$parent.showDetails = false;
            this.init();
        },
        methods: {
            init() {
                this.tables.getData(1, this.tables.result.pageSize);
            },
            handleSizeChange(val) {
                this.tables.getData(1, val);
            },
            handleCurrentChange(val) {
                this.tables.getData(val, this.tables.result.pageSize);
            },
            visitPage(id) {
                this.$router.push({
                    name: 'trends-details',
                    hash: `#${id}`,
                });
            },
        },
    };

</script>

<style lang="scss" type="text/scss">

</style>
