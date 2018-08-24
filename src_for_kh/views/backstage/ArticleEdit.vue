<template lang="pug">
    div
        .cnt-header
            h3 文章发布管理
        .cnt-header(style="background-color:#fff;border:none;")
            el-button(@click.prevent="back()", round, size="small", type="text", style="margin-left:20px;")
                i(class="el-icon-back", style="font-size: 16px;") 返 回
            strong(style="font-size:16px;margin-left:15px;font-weight:normal;color:#333;") 内容编辑
        .cnt-wrapper
            el-form(
            ref="articleForm",
            :model="articleForm", status-icon,
            :rules="rulesArticleForm", label-width="130px", size="small")
                el-form-item(label="标题", prop="title")
                    el-input(v-model="articleForm.title", auto-complete="on", placeholder="标题长度不超过50个字符", style="width:90%;")

                el-form-item(label="文章类型", prop="typeId")
                    el-select(
                    @change="handlerSelect",
                    v-model="articleForm.typeId", placeholder="选择文章类型", style="width:40%;")
                        el-option(label="规划方案", value="1")
                        el-option(label="政策制度", value="2")
                        el-option(label="经验做法", value="3")
                        el-option(label="合作企业", value="4")
                        el-option(label="通知公告", value="5")

                el-form-item(v-if="isNotice", label="滚动速度", style="width:90%;")
                    el-radio-group(v-model="articleForm.speed")
                        el-radio(label="快")
                        el-radio(label="中")
                        el-radio(label="慢")

                el-form-item(v-if="!isNotice", label="是否置顶", prop="top", style="width:90%;")
                    el-radio-group(v-model="articleForm.top")
                        el-radio(label="置顶")
                        el-radio(label="不置顶")

                el-form-item(v-if="!isNotice", label="内容", prop="content", style="width:91%;")
                    quill-editor(
                    v-model="articleForm.content",
                    ref="myQuillEditor",
                    :options="editorOption",
                    @blur="onEditorBlur($event)",
                    @focus="onEditorFocus($event)",
                    @ready="onEditorReady($event)")

                el-form-item(v-if="isNotice", label="内容", prop="content", style="width:91%;")
                    el-input(v-model="articleForm.content", type="textarea", placeholder="输入公告内容")

                el-form-item(label="")
                    el-button(type="primary", :disabled="confirmDisabled",
                    :loading="isLoading", @click="submitForm", round,
                    style="min-width: 80px", size="small",) 发 布

</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';
    import quillEditor from 'vue-quill-editor';
    // import { quillRedefine } from 'vue-quill-editor';
    import APIList from '@/assets/datas/APIList.json';
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';

    Vue.use(quillEditor);

    export default {
        data() {
            const checkTitle = (rule, value, callback) => {
                if (!value) {
                    callback(new Error('请输入文章标题！'));
                } else if (value.length > 50) {
                    callback(new Error('标题不能超过50个字符！'));
                } else {
                    callback();
                }
            };
            return {
                articleId: '',
                isNotice: false,
                editting: false,
                isLoading: false,
                confirmDisabled: false,
                articleForm: {
                    title: '',
                    typeId: '',
                    content: '',
                    top: '置顶',
                    speed: '中',
                },
                rulesArticleForm: {
                    title: [
                        { validator: checkTitle, required: true, trigger: 'blur' },
                    ],
                    typeId: [
                        { required: true, message: '请选择类型！', trigger: 'change' },
                    ],
                    content: [
                        { required: true, message: '请输入内容！', trigger: 'blur' },
                    ],
                },
                editorOption: {
                    width: '90%',
                    placeholder: '此处编辑内容...',
                },
            };
        },
        components: {},
        created() {
            this.articleId = decodeURIComponent(this.$router.history.current.hash.substring(1)) || '';
            this.init();
        },
        mounted() {},
        watch: {},
        methods: {
            init() {
                if (this.articleId) {
                    this.editting = true;
                    this.getArticleDetails();
                }
            },
            onEditorBlur() {
            },
            onEditorFocus() {
            },
            onEditorReady() {
            },
            back() {
                this.$router.push({
                    name: 'notice-management',
                });
                // window.history.back();
            },
            handlerSelect() {
                this.isNotice = this.articleForm.typeId === '5';
                if (this.isNotice) {
                    this.articleForm.content = '';
                }
            },
            // 根据id获取文章内容
            getArticleDetails() {
                const that = this;
                const params = that.$qs.stringify({
                    id: that.articleId,
                });
                that.$axios.get(`${APIList.GET_ARTICLE_BY_ID}?${params}`, {
                    data: {},
                }).then((response) => {
                    if (response.code === 200) {
                        const dt = response.data;
                        const speed = ['慢', '中', '快'];
                        // 初始化编辑数据
                        that.articleForm = {
                            title: dt.title.replace(/&amp;/gi, '&').replace(/&quot;/gi, '＂').replace(/&lt;/gi, '＜').replace(/&gt;/gi, '＞'),
                            typeId: `${dt.typeId}`,
                            content: dt.content.replace(/&amp;/gi, '&').replace(/&quot;/gi, '＂').replace(/&lt;/gi, '＜').replace(/&gt;/gi, '＞'),
                            top: dt.top === 1 ? '置顶' : '不置顶',
                            speed: speed[dt.speed * 1 - 1],
                        };
                        // 公告类型，显示对应的界面
                        if (that.articleForm.typeId && (that.articleForm.typeId * 1) === 5) {
                            that.isNotice = true;
                        }
                        // this.$refs.articleForm.clearValidate();
                    } else if (response.msg) {
                        that.$message({
                            message: response.msg,
                            type: 'error',
                        });
                    }
                    that.isLoading = false;
                }).catch((response) => {
                    this.$message({
                        message: response.msg,
                        type: 'error',
                    });
                });
            },
            submitForm() {
                const that = this;
                this.$refs.articleForm.validate((valid) => {
                    if (valid) {
                        that.isLoading = true;
                        const pTop = this.articleForm.top === '置顶' ? 1 : 2;
                        let url = APIList.ARTICLE_PUBLISH;
                        let speed = 2;
                        if (this.articleForm.speed === '慢') {
                            speed = 1;
                        } else if (this.articleForm.speed === '快') {
                            speed = 3;
                        }
                        const param = {
                            content: this.articleForm.content,
                            title: this.articleForm.title,
                            speed,
                            top: pTop,
                            typeId: this.articleForm.typeId,
                        };
                        if (this.editting) {
                            url = APIList.ARTICLE_UPDATE;
                            param.id = this.articleId * 1;
                        }
                        that.$axios.post(url, param).then((response) => {
                            if (response.code === 200) {
                                this.$message({
                                    message: that.editting ? '编辑成功！' : '发布成功！',
                                    type: 'success',
                                });
                                // 发布或编辑成功后，返回到列表页面
                                that.back();
                            } else if (response.data) {
                                this.$message({
                                    message: response.data.msg,
                                    type: 'error',
                                });
                            } else {
                                this.$message({
                                    message: response.msg,
                                    type: 'error',
                                });
                            }
                            that.isLoading = false;
                        }).catch((response) => {
                            this.$message({
                                message: response.msg,
                                type: 'error',
                            });
                        });
                    } else {
                        // console.warn('error submit!!');
                        return false;
                    }
                    return true;
                });
            },
            resetForm() {
                this.$refs.articleForm.resetFields();
            },
        },
    };

</script>

<style lang="scss" type="text/scss">

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

    $border_style: 1px solid #dcdfe6;

    .ql-toolbar.ql-snow, .ql-container.ql-snow {
        border: $border_style;
    }
    .ql-toolbar.ql-snow {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }
    .ql-container.ql-snow {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    .ql-editor {
        min-height: 300px;
    }
    .el-textarea__inner {
        min-height: 200px !important;
    }
</style>
