<template lang="pug">
    div
        .cnt-header
            h3 发运信息管理
        .cnt-wrapper(v-if="isAdmin")
            div
                .opr-btns
                    span(style="margin-right: 20px;") 发运信息导入记录
                    el-button(@click.prevent="showDialog", round,
                    :loading="isLoading",
                    size="mini", type="primary") 导入
            div
                el-table(
                :data="tableData",
                tooltip-effect="dark"
                style="width: 100%",
                size="medium")
                    el-table-column(prop="importFileName", label="数据包名称", width="300")
                    el-table-column(prop="status", label="当前状态")
                        template(slot-scope="scope")
                            .import-status(:class="scope.row.fileKey || importFinished ? (scope.row.status === 1 ? 'import-success' : 'import-fail') : ''")
                                .import-progress
                                    span(:style="{width: !scope.row.fileKey ? importProgress : '100%'}")
                                    b(v-if="!importFinished && !scope.row.fileKey") {{importProgress}}
                                i(v-if="importFinished || scope.row.fileKey", :class="scope.row.status === 1 ? 'el-icon-check' : 'el-icon-close'")

                    el-table-column(prop="importTime", label="导入时间", width="160")

            el-dialog(
            ref="multipleTable",
            :title="ttl",
            :visible.sync="dialogVisible"
            width="600px",
            padding="20px 40px",
            @close="close")
                el-form(v-if="!showImportResult", :model="fileUpload", :rules="ruleFileUpload", label-width="120px")
                    el-form-item(label="导入数据包", style="width:90%;")
                        el-upload(
                        class="upload-demo",
                        action="/despatchData/importData",
                        :on-change="handleChange",
                        :on-progress="handleProgress",
                        :on-success="success",
                        :on-error="error",
                        :file-list="fileList",
                        :before-upload="beforeAvatarUpload")
                            el-button(size="mini", type="primary", round) 点击上传
                            div(slot="tip", class="el-upload__tip", style="line-height:20px;") 只能上传zip压缩包文件，且不超过10Mb.

                div(v-if="showImportResult")
                    div(style="line-height:30px;font-size:16px;margin-top:-20px;")
                        span(style="color:#00b30c;") 导入成功：{{numbersOfSuccess}} 条
                        span(style="color:#ff0000;margin-left:50px;") 导入失败：{{numbersOfError}} 条
                    el-table(
                    :data="resultTableData",
                    tooltip-effect="dark"
                    class="import-fail-result",
                    style="width: 100%,padding:15px 20px",
                    size="mini")
                        el-table-column(prop="num", label="编号", width="60")
                        el-table-column(prop="reason", label="失败原因")

                    el-pagination(
                    style="margin-top:5px;text-align:right;",
                    @size-change="handleSizeChange2",
                    @current-change="handleCurrentChange2",
                    :current-page="importFailedResult.pageNum",
                    :page-sizes=[10, 20, 30, 40, 50],
                    :page-size="importFailedResult.pageSize",
                    background,
                    layout="total, sizes, prev, pager, next, jumper",
                    :total="importFailedResult.total")

                span(slot="footer", class="dialog-footer", v-if="showImportResult")
                    el-button(round, style="min-width: 80px", type="primary", size="small", @click="dialogVisible = false") 确 定

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
                resultData: [],
                resultTableData: [],
                ttl: '导入数据包',
                importProgress: '1%',
                importFinished: true,
                importFailedResult: {
                    pageNum: 1,
                    pageSize: 10,
                    total: 0,
                },
                numbersOfSuccess: 0,
                numbersOfError: 0,
                isLoading: false,
                confirmDisabled: false,
                dialogVisible: false,
                showImportResult: false,
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
                        });
                        that.$axios.get(`${APIList.DESPATCH_INFO_IMPORT_LIST}?${dt}`, {
                            data: {},
                        }).then((response) => {
                            that.tableData = response.data.rows;
                            that.tables.result = response.data;
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                fileList: [],
                ruleFileUpload: {
                    fileList: [
                        { required: true, message: '请选择要导入的文件！', trigger: 'change' },
                    ],
                },
                fileUpload: {},
            };
        },
        components: {},
        created() {
            if (!this.$store.state.global.isAdmin) {
                this.isAdmin = false;
                this.$confirm('非管理员角色，不能访问此页！', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                }).catch(() => {
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
            handleSizeChange(val) {
                this.importFailedResult.pageSize = val;
            },
            handleCurrentChange(val) {
                this.importFailedResult.pageNum = val;
            },
            handleSizeChange2(val) {
                this.importFailedResult.pageSize = val;
                this.resultTableData = this.resultData.slice(0, val);
            },
            handleCurrentChange2(val) {
                this.resultTableData = this.resultData.slice((val - 1) * this.importFailedResult.pageSize, val * this.importFailedResult.pageSize);
            },
            beforeAvatarUpload(file) {
                const date = new Date();
                const dateStr = date.toLocaleDateString().replace(/\/(?!1[0-9]|2[0-9]|3[0-9])/g, '-0').replace(/\/(?=1[0-9]|2[0-9]|3[0-9])/g, '-');
                this.dialogVisible = false;
                this.importFinished = false;
                // const isZipFile = file.type === 'application/zip';
                const isZipFile = file.name.substr(-4, 4) === '.zip';
                const isLt10M = file.size / 1024 / 1024 <= 10;
                if (!isZipFile) {
                    this.$message.error('上传文件只能是zip格式!');
                    const length = this.fileList.length - 1;
                    this.fileList.splice(length, 1);
                    this.importFinished = true;
                    this.isLoading = false;
                } else if (!isLt10M) {
                    this.importFinished = true;
                    this.$message.error('上传文件大小不能超过10MB!');
                    this.fileList.splice(length, 1);
                    this.isLoading = false;
                } else {
                    this.isLoading = true;
                    this.tableData.unshift({
                        importFileName: file.name,
                        status: 2,
                        importTime: `${dateStr} ${date.toTimeString().substr(0, 8)}`,
                    });
                    this.close();
                }

                return isZipFile && isLt10M;
            },
            handleChange(file, fileList) {
                this.fileList = fileList.slice(-5);
            },
            handleProgress(evt) {
                this.importProgress = `${(evt.percent * 1).toFixed(2)}%`;
                // if (evt.percent === 100) {
                //     this.importFinished = true;
                // }
            },
            success(resp) {
                if (resp.code !== 200) {
                    if (resp.msg) {
                        this.$message.error(resp.msg);
                    } else if (resp.data && resp.data.msg) {
                        this.$message.error(resp.data.msg);
                    }
                    this.importProgress = '100%';
                    this.importFinished = true;
                    // const len = this.tableData.length;
                    this.tableData[0].fileKey = Math.random();
                    this.isLoading = false;
                } else {
                    this.importProgress = '100%';
                    this.importFinished = true;
                    this.dialogVisible = true;
                    this.ttl = '导入结果';
                    this.showImportResult = true;
                    const dt = resp.data;
                    if (dt.errorList) {
                        for (let i = 0; i < dt.errorList.length; i += 1) {
                            this.resultData.push({
                                num: i + 1,
                                reason: dt.errorList[i],
                            });
                        }
                        const endIdx = this.importFailedResult.pageSize;
                        this.resultTableData = this.resultData.slice(0, endIdx);
                        this.importFailedResult.total = this.resultData.length;
                    }
                    this.numbersOfError = dt.numbersOfError || 0;
                    this.numbersOfSuccess = (dt.numbersOfSuccess * 1 > 0 ? dt.numbersOfSuccess : 0);
                    // const len = this.tableData.length;
                    this.tableData[0].status = 1;
                    this.tableData[0].fileKey = Math.random();
                    this.isLoading = false;
                    if (this.numbersOfSuccess === 0) {
                        this.tableData.splice(0, 1);
                    }
                }
                this.fileList = [];
            },
            error(resp) {
                this.importProgress = '100%';
                this.importFinished = true;
                // const len = this.tableData.length;
                this.tableData[0].status = 2;
                if (resp.msg) {
                    this.$message.error(resp.msg);
                } else if (resp.data && resp.data.msg) {
                    this.$message.error(resp.data.msg);
                }
            },
            showDialog() {
                this.dialogVisible = true;
                this.fileList = [];
            },
            finished() {
                this.$refs.fileUploadForm.validate((valid) => {
                    if (valid) {
                        this.close();
                    } else {
                        // console.log('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            close() {
                this.dialogVisible = false;
                this.showImportResult = false;
                this.resultTableData = [];
                this.resultData = [];
                this.ttl = '导入数据包';
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
        padding-bottom: 20px;
        .el-button {
            width: 90px;
        }
    }

    $progress-default-color: #3bb4f2;
    .import-status {
        b {
            font-size: 11px;
            color: $progress-default-color;
            font-weight: normal;
            margin-left: 5px;
        }
    }
    .import-progress {
        display: inline-block;
        width: 200px;
        height: 12px;
        line-height: 12px;
        margin-right: 10px;
        white-space: nowrap;
        span {
            float: left;
            width: 50%;
            height: 12px;
            background-color: $progress-default-color;
            border-radius: 10px;
        }
    }
    $status-success-color: #00b30c;
    $status-fail-color: #ff0000;
    .import-success {
        span {
            background-color: $status-success-color;
            width: 100%;
        }
        .el-icon-check {
            color: $status-success-color;
            font-weight: bold;
            font-size: 20px;
            position: relative;
            bottom: -2px;
        }
    }
    .import-fail {
        span {
            background-color: $status-fail-color;
            width: 100%;
        }
        .el-icon-close {
            color: $status-fail-color;
            font-weight: bold;
            font-size: 20px;
            position: relative;
            bottom: -2px;
        }
    }

</style>
