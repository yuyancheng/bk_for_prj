<template lang="pug">
    div(style="white-space:nowrap;padding:10px 30px 10px 10px;background-color:#ECF8FD;border-radius:30px;")
        span.notice-icon 通知公告
        marquee.notice-srcollbar(
        id="marquee",
        @click="visitPage",
        align="left", behavior="scroll", direction="right",
        height="20", vspace="0", loop="-1", :scrollamount="speed * 5",
        scrolldelay="0",
        onMouseOut="this.start()",
        onMouseOver="this.stop()") {{noticeContent}}

</template>

<script type="text/ecmascript-6">
    import APIList from '@/assets/datas/APIList.json';
    import Vue from 'vue';

    export default Vue.component('notice-bar', {
        data() {
            return {
                noticeId: '',
                speed: '',
                noticeContent: '',
                regExp: [new RegExp(/&amp;/gi), new RegExp(/&quot;/gi), new RegExp(/&lt;/gi), new RegExp(/&gt;/gi)],
            };
        },
        created() {
            this.init();
        },
        mounted() {
        },
        methods: {
            init() {
                const that = this;
                // const attrs = this.$vnode.data.attrs;
                const dt = that.$qs.stringify({
                    pageSize: 1,
                    pageNum: 1,
                });
                that.$axios.get(`${APIList.GET_NOTICE}?${dt}`, {
                    data: {},
                }).then((response) => {
                    if (response.data && response.data.rows && response.data.rows[0]) {
                        that.noticeContent = response.data.rows[0].title || '';
                        that.noticeId = response.data.rows[0].id || '';
                        that.speed = response.data.rows[0].speed || '';
                        const marquee = document.getElementById('marquee');
                        if (marquee) {
                            document.getElementById('marquee').start();
                        }
                    }
                }).catch((response) => {
                    console.error(response);
                });
            },
            visitPage() {
                this.$router.push({
                    name: 'trends-details',
                    hash: `#${this.noticeId}`,
                });
            },
        },
    });
</script>

<style lang="scss" type="text/scss">
    .notice-icon {
        float:left;
        padding-right: 10px;
        padding-left: 15px;
        width:80px;
        background: {
            image: url(../../assets/image/icon2/alarm.png);
            position: right center;
            repeat: no-repeat;
            size: 24px;
        };
        font-size:14px;
    }
    .notice-srcollbar {
        display: block;
        margin-left: 110px;
        cursor: pointer;
    }
</style>
