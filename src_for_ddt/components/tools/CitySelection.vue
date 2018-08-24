<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml" xmlns:v-bind="http://www.w3.org/1999/xhtml">
    <div id="city_selection" class="v-modal">
        <div id="modal_wrapper" class="v-modal-wrapper" :class="{'self-adapt':isFull}" style="overflow-y: auto;">
            <div>
                <h2>添加城市<span style="margin-left: 5px; color: #999; font-size: 12px;">最多可选10个</span></h2>
                <div class="v-modal-cls" v-on:click="close()"><span>&nbsp;</span><span>&nbsp;</span></div>
            </div>
            <div v-if="cities.length === 0" style="line-height: 61px; text-align: center; font-size: 15px; color: #666;">暂无可选择城市！</div>
            <div v-else>
                <div class="city-sets">
                    <div v-for="item in cities">
                        <div class="city-char">{{item.char}}</div>
                        <div class="city-list">
                            <a v-for="dt in item.cities" :class="['m-btn m-btn-default m-btn-w-ms', {'m-btn-active': dt.selected}]"
                               v-on:click="click(dt)">{{dt.name}}</a>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="city-selected-text">已选</div>
                    <div class="city-selected-list">
                        <a v-for="item in selected" class="m-btn m-btn-default m-btn-w-ms m-btn-active">{{item.name}}<i
                            v-on:click="remove(item)"></i></a>
                    </div>
                </div>
            </div>
            <div style="text-align: center;margin-top: 20px;">
                <button class="m-btn m-btn-blue m-btn-circle m-btn-w-md" v-on:click="save()">确定</button>
            </div>
        </div>
        <div class="v-veil"></div>
    </div>
</template>

<script type="text/ecmascript-6">

    // import Vue from 'vue';
    // import utils from '@/assets/js/lib/utils';
    // import cities from '@/assets/js/cityData';

    export default {
        template: '#main',
        components: {},
        beforeCreate: function (bus) {
            window.onunload = (e) => {
                this.$router.prev();
            };
        },
        created: function (bus) {
            this.ajaxSettings = {
                url: '/rptWsRun/findWsWarehouseInfo',
                params: {},
                error (err) {
                    console.log(err);
                }
            };
            for (let i = 0, len = this.$parent.cities.length; i < len; i++) {
                this.selected.push(this.$parent.cities[i]);
            }

            if (!this.tempSet || this.tempSet.length === 0) {
                this.getData();
            } else {
                this.cities = this.tempSet;
                this.checkStatus();
            }
        },
        mounted: function () {
            let that = this;
            this.vmodal = this.$parent.vmodal;

            let modalWrapper = document.getElementById('modal_wrapper');
            let osh = modalWrapper.offsetHeight;
            this.resize(osh, modalWrapper);
            window.onresize = () => {
                that.resize(osh, modalWrapper);
            };
        },
        methods: {
            resize (h, el) {
                if (h % 2 !== 0) {
                    el.style.paddingTop = 21 + 'px';
                }

                this.isFull = h > window.innerHeight;
            },
            close (dt) {
                window.onunload = null;
                this.$router.prev();
            },
            cancel () {
                this.close();
            },
            getData () {
                let that = this;

                this.ajaxSettings.success = (res) => {
                    let data = res.data;
                    if (data && data.length > 0) {
                        this.resetData(data);
                    } else {
                        that.vmodal.failed('获取城市失败！');
                    }
                };

                this.$store.commit('setAjax', this.ajaxSettings);
                this.$store.dispatch('ajax');
            },
            resetData (dt) {
                let data = {};
                let cities = [];
                let char = '';

                for (let i = 0, len = dt.length; i < len; i++) {
                    char = dt[i]['cityPy'];
                    if (!data[char]) {
                        data[char] = {
                            char: char,
                            cities: [{
                                name: dt[i].cityName,
                                code: dt[i].cityCode
                            }]
                        };
                    } else {
                        data[char]['cities'].push({
                            name: dt[i].cityName,
                            code: dt[i].cityCode
                        });
                    }
                }

                for (let k in data) {
                    cities.push(data[k]);
                }

                this.checkStatus(cities);
            },
            save () {
                let tempSet = [];
                for (let i = 0, len = this.selected.length; i < len; i++) {
                    tempSet.push(this.selected[i]);
                }
                this.$parent.cities = tempSet;
                this.$router.prev();
            },
            checkStatus (dt) {
                for (let m = 0, ln = dt.length; m < ln; m++) {
                    for (let n = 0, l = dt[m].cities.length; n < l; n++) {
                        for (let i = 0, len = this.selected.length; i < len; i++) {
                            if (this.selected[i].code === dt[m].cities[n].code) {
                                dt[m].cities[n].selected = true;
                                break;
                            } else {
                                dt[m].cities[n].selected = false;
                            }
                        }
                    }
                }

                this.tempSet = dt;
                this.cities = dt;
            },
            click (dt) {
                if (!dt.selected) {
                    if (this.selected.length >= 10) {
                        this.vmodal.failed('最多可选10个城市！');
                        return;
                    }
                    dt.selected = true;
                    this.selected.push(dt);
                } else {
                    dt.selected = false;
                    this.remove(dt);
                }
            },
            // 移除选择的城市，并取消备选框中的选中状态
            remove (dt) {
                for (let i = 0, len = this.selected.length; i < len; i++) {
                    if (dt.code === this.selected[i].code) {
                        this.selected.splice(i, 1);
                        break;
                    }
                }
                for (let m = 0, len = this.cities.length; m < len; m++) {
                    for (let n = 0, ln = this.cities[m].cities.length; n < ln; n++) {
                        if (dt.code === this.cities[m].cities[n].code) {
                            this.cities[m].cities[n].selected = false;
                            return;
                        }
                    }
                }
            },
            clear () {
                this.orderNumbers = [];
                this.orders = [];
                this.numList = '';
                this.visible = true;
            }
        },
        data () {
            return {
                cities: [],
                selected: [],
                isFull: false
            };
        }
    };
</script>

<style lang="less" type="text/less" scoped>
    #city_selection {
        .v-modal-wrapper {
            width: 528px;
            padding-bottom: 20px;
        }
    }

    .m-btn {
        margin: 0 10px 10px 0 !important;
        padding-right: 10px !important;
        padding-left: 10px !important;
    }

    .city-sets {
        max-height: 241px;
        margin-bottom: 20px;
        padding: 20px 0 10px;
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        overflow-y: auto;
    }

    .city-char {
        float: left;
        width: 30px;
        line-height: 30px;
        color: #999;
        font-size: 16px;
        vertical-align: middle;
    }

    .city-list {
        margin-left: 30px;
    }

    .city-selected-text {
        float: left;
        width: 30px;
        line-height: 30px;
        color: #333;
        font-size: 12px;
        vertical-align: middle;
    }

    .city-selected-list {
        min-height: 40px;
        margin-left: 30px;
    }

    .m-btn-active {
        position: relative;
        i {
            display: inline-block;
            position: absolute;
            top: -6px;
            right: -6px;
            padding: 7px 6px 6px 7px;
            border-radius: 10px;
            background-color: #909090;
            cursor: pointer;

            &:hover {
                background-color: #222;
            }

            &:before, &:after {
                content: '';
                position: absolute;
                display: inline-block;
                background-color: #fff;
                font-size: 0;
            }
            &:before {
                top: 2px;
                left: 6px;
                width: 1px;
                height: 9px;
                transform: rotate(45deg);
            }
            &:after {
                top: 6px;
                left: 2px;
                width: 9px;
                height: 1px;
                transform: rotate(45deg);
            }
        }
    }
</style>
