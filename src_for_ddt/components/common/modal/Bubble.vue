<template id="main" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div class="bubble-wrapper" v-bind:style="bubbleStyle" v-show="visible">
        <span></span>
        <div v-bind:style="{MaxWidth: cntMaxW + 'px'}">
            <h4 v-html="title"></h4>
            <p v-html="body"></p>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';

    let modal = Vue.component('v-modal', {
        template: '#main',
        props: ['vmData'],                      // vmData 为注册方传递过来的数据
        components: {},
        beforeCreate: function (bus) {
        },
        created: function (bus) {
        },
        mounted: function () {
        },
        methods: {
            setData (val, evt) {
                this.visible = true;
                if (val.indexOf('#') === 0) {
                    this.cntMaxW = 560;
                } else if (val.indexOf('{') === 0) {
                    val = JSON.parse(val);
                    this.cntMaxW = 320;
                } else {
                    this.cntMaxW = 320;
                }

                if (val && val.title) {
                    this.title = val.title;
                }
                if (val && val.body) {
                    this.body = val.body;
                }

                let ww = window.outerWidth;
                let w = this.$el.clientWidth;
                let top = evt.clientY + 30;
                let left = evt.clientX - 65;

                if (left + w > ww) {
                    left = evt.clientX - w;
                } else {
                }

                this.bubbleStyle = {'top': top + 'px', 'left': left + 'px'};
            },
            remove () {
                this.visible = false;
            }
        },
        data () {
            return {
                title: '',
                body: '',
                visible: false,
                bubbleStyle: {},
                cntMaxW: 320
            };
        }
    });

    export default modal;
</script>

<style lang="less" type="text/less">
    .bubble-wrapper {
        display: table;
        position: fixed;
        z-index: 10000;
        top: 45px;
        padding: 10px !important;
        border: 1px solid #0089FF;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 4px 4px 14px rgba(0, 137, 255, .3);
        overflow: visible !important;

        & > span {
            position: absolute;
            top: -5px;
            left: 30px;
            padding: 4px;
            border-top: 1px solid #0089FF;
            border-right: 1px solid #0089FF;
            transform: rotate(-45deg);
            background-color: #fff;
        }
        & > div {
            min-width: 200px;
            line-height: 22px;
            font-size: 12px;

            & > h4 {
                margin: 0;
                padding: 0;
                line-height: 26px;
                font-weight: bold;
                font-size: 13px;
            }

            & > p {
                color: #666;
                margin-bottom: 0;
            }
        }
    }
    .b-table {
        border-collapse: collapse;
    }
    .b-table thead td {
        border: 1px solid #D6D6D6 !important;
        background-color: #eee;
        padding: 5px 8px;
        color: #333;
        font-family: inherit;
        min-width: 90px;
    }
    .b-table tbody td {
        border: 1px solid #D6D6D6 !important;
        padding: 5px 8px;
        color: #666;
        font-size: 12px;
        font-family: inherit;
        background-color: #fff;
    }
</style>
