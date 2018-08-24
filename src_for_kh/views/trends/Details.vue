<template lang="pug">
    div
        .top-header
            h3
                el-button(@click.prevent="back()", round, size="small", type="text", style="padding-left:0;")
                    i(class="el-icon-back", style="font-size: 16px;") 返 回
                span
        .publish-header(style="background-color:#fff;border:none;")
            div(style="padding:40px 0 20px") {{title}}
        .publish-info(style="padding: 0 60px;font-size: 13px;color:#999;text-align:center;")
            span 作者：{{author}}
            span(style="margin-left: 50px;") 发布时间：{{publishTime}}
        .publish-wrapper
            div(style="font-size: 15px;color:#333;text-indent:2em;", v-html="content")
</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';

    export default {
        data() {
            return {
                articleId: '',
                title: '--',
                author: '--',
                content: '--',
                publishTime: '--',
            };
        },
        components: {},
        created() {
            this.articleId = decodeURIComponent(this.$router.history.current.hash.substring(1)) || '';
            this.init();
        },
        mounted() {
            this.$parent.$parent.$parent.showDetails = true;
        },
        watch: {},
        methods: {
            init() {
                if (this.articleId) {
                    this.getArticleDetails();
                }
            },
            back() {
                window.history.back();
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
                        // 初始化
                        that.content = (dt.content.replace(/&amp;/gi, '&').replace(/&quot;/gi, '＂').replace(/&lt;/gi, '＜').replace(/&gt;/gi, '＞')) || '--';
                        that.author = dt.authorName || '--';
                        that.publishTime = dt.publishTm || '--';
                        that.title = (dt.title.replace(/&amp;/gi, '&').replace(/&quot;/gi, '＂').replace(/&lt;/gi, '＜').replace(/&gt;/gi, '＞')) || '--';
                    } else if (response.msg) {
                        that.$message({
                            message: response.msg,
                            type: 'error',
                        });
                    }
                }).catch((response) => {
                    this.$message({
                        message: response.msg,
                        type: 'error',
                    });
                });
            },
        },
    };

</script>

<style lang="scss" type="text/scss">
    $border_style: 1px solid #dcdfe6;
    .top-header {
        border-bottom: 1.5px solid #4791FF;
        background-color: #f5f5f5;
        h3 {
            padding-left: 30px;
            line-height: 48px;
            font: {
                weight: normal;
                size: 16px;
            };
            color: #565656;
        }
    }
    .publish-header {
        text-align: center;
        font: {
            weight: normal;
            size: 18px;
        };
    }
    .publish-wrapper {
        padding: 40px 60px 60px;
        background-color: #FFF;
        p {
            line-height: 28px;
            text-indent: 2em;
        }
        img {
            max-width: 100%;
        }
    }
</style>
