<template lang="pug">
    div(class="multiple-query")
        div
            div
                div(v-if="resultList.length", style="padding: 4px 3px;")
                    div(v-for="(item, idx) in resultList", class="token invalid")
                        span(:style="{color: item.invalid ? '#f60':'#666'}", class="token-label") {{item.value}}
                        a(v-on:click="remove(item, idx)", class="remove") ×
                div(v-show="isInvalid", class="error-tip") {{errorTip}}
                textarea(v-model="queryString", v-on:keyup="keyup($event)",
                v-on:paste="paste()", rows="1", cols="10",
                class="token-input", :placeholder="placeholder")
            span(v-on:click="clear()", class="input-group-addon clear-inputs")
                span(class="el-icon-delete")
</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';
    import util from '@/lib/util';

    const query = Vue.component('multiple-query', {
        template: '#main',
        props: ['vqData'],                      // vmData
        components: {},
        beforeCreate() {
        },
        created() {
            this.thisVDT = this.vqData;
            this.queryString = '';
            this.maxSize = this.thisVDT.maxSize || 50;
            this.validFilter = this.thisVDT.filterRegExp || /^[0-9a-zA-Z]{10,20}$/;
            this.invalidTip = this.thisVDT.invalidTip || '运单号为10-20位字母与数字的任意组合，无效运单号会被自动忽略！';
            this.repeatedTip = this.thisVDT.repeatedTip || '运单号重复！系统将自动去掉重复单号！';
            this.overflowTip = this.thisVDT.overflowTip || `已超过${this.maxSize}条单号，系统将自动截取并显示前${this.maxSize}条的追踪信息！`;
            // this.placeholder = `顺丰单号最多可查询${this.maxSize}条单号，请以非数字或字母符号隔开。`;
            this.placeholder = `输入运单号或发运批次号查询，以逗号隔开，最多查询${this.maxSize}条。`;
        },
        mounted() {},
        methods: {
            resolve() {
                const dt = this.queryString;
                if (dt.length > 0 && encodeURIComponent(dt) !== '%0A') {
                    let arr = [];
                    arr = dt.replace(/^\W+|\W+$/g, '').split(/\W+/g);
                    const len = arr.length;
                    if (len > 0) {
                        let invalid = false;
                        let repeated = false;
                        let overflow = false;

                        for (let i = 0; i < len; i += 1) {
                            const temp = {
                                value: arr[i],
                            };
                            // this.rawArr.push(arr[i]);
                            if (!this.validFilter.test(arr[i].toString())) {
                                temp.invalid = true;
                                // 去除无效数据
                                arr.splice(i, 1, '');
                            }
                            this.resultList.push(temp);
                        }
                        for (let m = 0, l = this.resultList.length; m < l; m += 1) {
                            const result = this.resultList[m].value;
                            if (!this.validFilter.test(result.toString())) {
                                invalid = true;
                            }
                        }
                        // 产生有效数据数组
                        arr = arr.toString().replace(/^\W+|\W+$/g, '').split(/\W+/g);
                        this.rawArr = this.rawArr.concat(arr);
                        // 验证是否有重复数据
                        for (let m = 0, l = this.rawArr.length; m < l; m += 1) {
                            for (let n = m + 1; n < l; n += 1) {
                                if (this.rawArr[m] === this.rawArr[n]) {
                                    repeated = true;
                                }
                            }
                        }
                        this.rawArr = util.unique(this.rawArr); // 去重
                        if (this.rawArr[0] === '') {
                            this.rawArr.shift();
                        }
                        if (this.rawArr[this.rawArr.length - 1] === '') {
                            this.rawArr.pop();
                        }
                        if (this.rawArr.length > this.maxSize) {
                            this.isInvalid = true;
                            overflow = true;
                        }

                        if (this.thisVDT && this.thisVDT.func) {
                            // 传递给回调函数
                            this.thisVDT.func(this.rawArr.slice(0, this.maxSize));    // 截取前n条
                        }
                        if (this.thisVDT && this.thisVDT.doQuery && this.rawArr.length) {
                            this.thisVDT.doQuery();
                        }

                        this.setTip(repeated, invalid, overflow);
                    }
                } else if (this.thisVDT && this.thisVDT.doQuery && this.rawArr.length) {
                    this.thisVDT.doQuery();
                }
                this.queryString = '';
            },
            paste() {
                setTimeout(() => {
                    this.resolve();
                }, 100);
            },
            keyup(e) {
                const that = this;
                const evt = e || window.event;
                const code = evt.keyCode;
                setTimeout(() => {
                    if (code === 13) {
                        that.resolve();
                    } else if (this.thisVDT && this.thisVDT.setQueryCallback) {
                            // 设置取值回调函数
                            this.thisVDT.setQueryCallback(that.resolve);
                        }
                }, 100);
            },
            setTip(repeated, invalid, overflow) {
                if (repeated || invalid || overflow) {
                    this.isInvalid = true;
                    if (invalid) {
                        this.errorTip = this.invalidTip;
                    }
                    if (repeated) {
                        this.errorTip = this.repeatedTip;
                    }
                    if (overflow) {
                        this.errorTip = this.overflowTip;
                    }
                }
            },
            // 移除单条数据
            remove(item, idx) {
                this.resultList.splice(idx, 1);

                let has = false;
                this.rawArr = [];
                for (let i = 0, l = this.resultList.length; i < l; i += 1) {
                    if (this.resultList[i].invalid) {
                        has = true; // 判断是否含有无效数据
                    }
                }
                if (!has) {
                    this.isInvalid = false; // 移除提示
                }
                if (this.resultList.length === 0) {
                    this.clear();
                }

                let invalid = false;
                let repeated = false;
                let overflow = false;

                for (let m = 0, l = this.resultList.length; m < l; m += 1) {
                    const result = this.resultList[m].value;
                    if (!this.validFilter.test(result.toString())) {
                        invalid = true;
                    } else {
                        this.rawArr.push(this.resultList[m].value);
                    }
                    for (let n = m + 1; n < l; n += 1) {
                        const result2 = this.resultList[n].value;
                        const isValid = this.validFilter.test(result2.toString());
                        if (isValid && result === result2) {
                            repeated = true;
                        }
                    }
                }
                if (this.rawArr.length > this.maxSize) {
                    overflow = true;
                }

                if (this.thisVDT && this.thisVDT.func) {
                    this.thisVDT.func(util.unique(this.rawArr).splice(0, this.maxSize));    // 去重，截取前n条
                }

                this.setTip(repeated, invalid, overflow);
            },
            // 清空所以数据
            clear() {
                this.resultList = [];
                this.rawArr = [];
                this.queryString = '';
                this.isInvalid = false;
                if (this.thisVDT && this.thisVDT.clear) {
                    this.thisVDT.clear([]);
                }
            },
        },
        data() {
            return {
                thisVDT: null,
                queryString: '',
                isInvalid: false,
                maxSize: 50,
                rawArr: [],
                resultList: [],
                errorTip: '运单号应为10-20位字母与数字的任意组合！',
            };
        },
    });

    export default query;
</script>

<style lang="scss" type="text/less" scoped>
    //修改输入框提示文本默认样式
    *::-webkit-input-placeholder {
        color: #aaa;
        font-size: 12px;
    }

    *:-moz-placeholder {
        color: #aaa;
        font-size: 12px;
    }

    *:-ms-input-placeholder {
        color: #aaa;
        font-size: 12px;
    }
    .multiple-query {
        border-radius: 4px;
        border: 1px solid #bfbfbf;
        position: relative;
        display: inline-block;
        border-collapse: separate;
        float: left;
        margin-left: 15px;

        &>div{
            display: table;
            width: auto;
            &>div{
                display: table-cell;
                padding-right: 0;
                border: 0px solid transparent;
                padding: 0;
                min-height: 29px;
                position: relative;
                z-index: 2;
                float: left;
                width: 100%;
                margin-bottom: 0;
                -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
                box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);
                -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
                -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
                transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;
            }
        }

        textarea {
            background: none;
            min-width: 60px;
            width: 100%;
            margin-left: -1px;
            font-family: inherit;
            font-size: 13px;
            box-shadow: none;
            padding: 0;
            color: #666;
            outline: none;
            resize: none;
            border: none;
            height: 29px;
            line-height: 29px;
            text-indent: 10px;
            vertical-align: middle;
            border-radius: 3px;
            box-shadow: 1px 1px 7px rgba(0,0,0,.1) inset;
        }

        .input-group-addon {
            display: table-cell;
            padding: 6px 12px;
            font-size: 14px;
            font-weight: 400;
            line-height: 1;
            color: #555;
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 1%;
            white-space: nowrap;
            vertical-align: middle;
            border-left: 0;
            border: 1px solid transparent;
            border-radius: 0;
            cursor: pointer;

            &:hover {
                background-color: #efefef;
            }
        }

        .token.invalid {
            background: none;
            border: 1px solid transparent;
            border-radius: 1px;
        }
        .token {
            box-sizing: border-box;
            display: inline-block;
            border-radius: 3px;
            margin: 4px;
            vertical-align: top;
            cursor: default;
            padding: 0 3px 0 5px;
            height: 24px;
            line-height: 23px;
            background-color: #fff;
            font-size: 13px;
            box-shadow: 0 0 2px rgba(0,0,0,.5);
        }

        .token-label {
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 13px;
            color: #666;
            white-space: nowrap;
        }

        .remove {
            font-family: "Hiragino Sans GB",simsun,"Microsoft YaHei",sans-serif;
            display: inline-block;
            margin-left: 5px;
            line-height: 24px;
            font-size: 16px;
            float: right;
            font-weight: bold;
            color: #000;
            text-shadow: 0 1px 0 #fff;
            outline: none;
            cursor: pointer;
            opacity: 0.2;
            filter: alpha(opacity=20);
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            text-decoration: none;

            &:hover {
                opacity: 0.6;
                filter: alpha(opacity=60);
            }
        }
        .error-tip {
            color: red;
            font-size: 13px;
            padding: 0 0 7px 7px;
        }
    }

</style>
