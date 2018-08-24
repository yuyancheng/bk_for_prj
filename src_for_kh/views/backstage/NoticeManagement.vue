<template lang="pug">
    div
        .cnt-header
            h3 文章发布管理
        .cnt-wrapper(v-if="isAdmin")
            div
                .opr-btns
                    el-button(@click.prevent="visitPage('article-edit')", round, size="mini", type="primary") 发布文章
                    el-button(@click.prevent="deleteInBatch", round, size="mini", type="primary") 批量删除
                div(style="float:right;")
                    el-form(label-width="50px", size="small")
                        el-form-item(label="筛选", style="text-align: right;")
                            el-select(v-model="typeId", placeholder="选择类别", style="width:160px;margin-right:10px;")
                                el-option(label="全部类别", value="")
                                el-option(label="规划方案", value="1")
                                el-option(label="政策制度", value="2")
                                el-option(label="经验做法", value="3")
                                el-option(label="合作企业", value="4")
                                el-option(label="通知公告", value="5")
                            el-input(v-model="keyword", auto-complete="on", placeholder="标题关键字", style="width:160px;")
                            el-button(@click.prevent="search", round, size="mini", type="primary", style="width:60px;margin-left:10px;") 搜索
            div
                el-table(
                :data="tableData",
                tooltip-effect="dark"
                style="width: 100%",
                size="medium",
                @selection-change="handleSelectionChange")
                    el-table-column(type="selection", width="50")
                    el-table-column(prop="title", label="标题", show-overflow-tooltip=true)
                        template(slot-scope="scope")
                            div {{scope.row.title.replace(regExp[0], '&').replace(regExp[1], '＂').replace(regExp[2], '＜').replace(regExp[3], '＞')}}
                    el-table-column(prop="type", label="类别", width="140")
                        template(slot-scope="scope")
                            div {{types[scope.row.typeId * 1 - 1]}}
                    // el-table-column(prop="content", show-overflow-tooltip=true, label="文章内容")
                    el-table-column(prop="publishTm", label="发布时间", width="160")
                    el-table-column(label="操作", width="140")
                        template(slot-scope="scope")
                            el-button(
                            style="font-size:13px;",
                            type="text",
                            @click="visitPage('article-edit', scope.row)") 编辑
                            el-button(
                            style="color:#ff4a01;font-size:13px;",
                            type="text",
                            @click="handleDelete(scope.$index, scope.row)") 删除
                el-pagination(
                style="margin-top:5px;text-align:right;",
                @size-change="handleSizeChange",
                @current-change="handleCurrentChange",
                :current-page="tables.result.pageNum",
                :page-sizes=[10, 20, 30, 40, 50, 100],
                :page-size=10,
                background,
                layout="total, sizes, prev, pager, next, jumper",
                :total="tables.result.total")


</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            const that = this;

            return {
                isAdmin: false,
                currentPage: 1,
                tableData: [],
                multipleSelection: [],
                regExp: [new RegExp(/&amp;/gi), new RegExp(/&quot;/gi), new RegExp(/&lt;/gi), new RegExp(/&gt;/gi)],
                isLoading: false,
                cancelDisabled: false,
                confirmDisabled: false,
                typeId: '',
                types: ['规划方案', '政策制度', '经验做法', '合作企业', '通知公告'],
                keyword: '',
                dialogVisible: false,
                tables: {
                    result: {
                        pageSize: 10,
                        pageNum: 1,
                        rows: [],
                    },
                    getData(idx, size) {
                        const params = {
                            pageSize: size || that.tables.result.pageSize,
                            pageNum: idx,
                        };
                        if (that.typeId) {
                            params.typeId = that.typeId;
                        }
                        if (/\S/.test(that.keyword)) {
                            params.titleFuzzy = that.keyword;
                        }
                        const dt = that.$qs.stringify(params);
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
        components: {},
        created() {
            if (!this.$store.state.global.isAdmin) {
                this.isAdmin = false;
                this.$alert('非管理员角色，不能访问此页！', {
                    confirmButtonText: '确定',
                    type: 'warning',
                }).then(() => {
                });
            } else {
                this.isAdmin = true;
                this.init();
            }
        },
        mounted() {},
        methods: {
            init() {
                this.tables.getData(1, this.tables.result.pageSize);
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
                console.log(val);
            },
            handleSizeChange(val) {
                this.tables.getData(1, val);
            },
            handleCurrentChange(val) {
                this.tables.getData(val, this.tables.result.pageSize);
            },
            handleDelete(idx, row) {
                if (row) {
                    this.insureDoDelete([row.id]);
                }
            },
            deleteInBatch() {
                if (this.multipleSelection.length === 0) {
                    this.$message({
                        message: '请选择要删除的项目！',
                        type: 'warning',
                    });
                } else {
                    const ids = [];
                    for (let i = 0; i < this.multipleSelection.length; i += 1) {
                        ids[i] = this.multipleSelection[i].id;
                    }
                    this.insureDoDelete(ids);
                }
            },
            insureDoDelete(data) {
                if (data.length !== 0) {
                    this.$confirm('确定删除吗?', '删除提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                    }).then(() => {
                        this.doDelete(data, () => {
                            this.$message({
                                type: 'success',
                                message: '删除成功!',
                            });
                        }, (msg) => {
                            this.$message({
                                type: 'error',
                                message: msg,
                            });
                        });
                    }).catch(() => {
                    });
                }
            },
            doDelete(data, funcSuccess, funcFail) {
                const that = this;
                that.$axios.post(APIList.ARTICLE_DELETE, {
                    ids: data,
                }).then((response) => {
                    if (response.code === 200 && funcSuccess) {
                        funcSuccess();
                    }
                    that.tables.getData(1, that.tables.result.pageSize);
                }).catch((response) => {
                    if (response.data) {
                        if (funcFail) {
                            funcFail(response.data.msg);
                        }
                    }
                    console.error(response);
                });
            },
            visitPage(href, row) {
                const params = {
                    name: href,
                };

                if (row && row.id) {
                    params.hash = `#${row.id}`;
                }
                this.$router.push(params);
            },
            close() {
                this.isLoading = false;
                this.cancelDisabled = false;
                this.confirmDisabled = false;
                this.resetDisabled = false;
            },
            search() {
                const that = this;
                const params = {
                    pageNum: 1,
                    pageSize: that.tables.result.pageSize || 10,
                };
                if (that.typeId) {
                    params.typeId = that.typeId;
                }
                if (that.keyword) {
                    params.titleFuzzy = that.keyword;
                }
                const dt = that.$qs.stringify(params);
                this.$axios.get(`${APIList.GET_ARTICLES_LIST}?${dt}`, {
                    data: {},
                }).then((response) => {
                    if (response.data.rows) {
                        that.tableData = response.data.rows;
                        that.tables.result = response.data;
                    } else {
                        that.tableData = [];
                        that.tables.result = {
                            total: 0,
                        };
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(() => {
                        done();
                    })
                    .catch(() => {});
            },
            submitForm(formName) {
                const that = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        this.cancelDisabled = true;
                        this.resetDisabled = true;
                    } else {
                        // console.log('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-wrapper {
        padding: 20px 30px 40px;
        background-color: #FFF;
    }
    .cnt-header {
        border-bottom: 1.5px solid #4791FF;
        background-color: #f5f5f5;
        h3 {
            padding-left: 30px;
            line-height: 48px;
            font: {
                weight: normal;
                size: 19px;
            };
            color: #565656;
        }
    }

    .opr-btns {
        display: inline-block;
        > .el-button {
            width: 90px;
        }
    }

</style>
