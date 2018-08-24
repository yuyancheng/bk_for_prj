<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <div class="content-title fixed">
            <h4 class="title-name">{{title}}
            </h4>
        </div>
        <div>
            <div>
                需求类型：
                <router-link class="m-btn m-btn-blue m-btn-circle m-btn-w-ms" :to="{ name:'returned'}">我要退回</router-link>
                <router-link class="m-btn m-btn-blue m-btn-circle m-btn-w-ms" :to="{ name:'demand_resend'}">我要再派</router-link>
                <router-link class="m-btn m-btn-blue m-btn-circle m-btn-w-ms" :to="{ name:'demand_forward'}">我要转寄</router-link>
                <router-link class="m-btn m-btn-blue m-btn-circle m-btn-w-md" :to="{ name:'change_receiver_info'}">我要更改收方信息</router-link>
            </div>
            <div>
                <router-link class="m-btn m-btn-default m-btn-circle m-btn-w-ms" :to="{ name:'initiator_management'}">发起人管理</router-link>
                <router-link class="m-btn m-btn-default m-btn-circle m-btn-w-ms" :to="{ name:'address_management'}">退回地址管理</router-link>
            </div>
        </div>
        <div>
            <ul class="nav-tabs">
                <li v-for="(item, index) in tabs" :class="{'active': item.active}">
                    <!--<router-link :to="{name:'requirement_changes', query: {type: item.code}}" v-on:click="tabTurn(index)">{{item.name}}</router-link>-->
                    <a href="javascript:void(0)" v-on:click="tabTurn(index, item.code)">{{item.name}}</a>
                </li>
            </ul>
            <div class="order-table">
                <v-table ref="vtRequireChanges" :vtData="tableDt"></v-table>
            </div>
        </div>
        <router-view></router-view>
        <router-view name="login"></router-view>
        <v-modal ref="vmMsg"></v-modal>
    </div>
</template>

<script type="text/ecmascript-6">
    import VTable from '@/components/common/table/VTable';
    import VModal from '@/components/common/modal/VModal';
    import data from '@/assets/js/tdata';

    let vtdata = data;
    const func = [(dt, idx) => {
        if (dt && dt[3]['value'] === -1) {
            return '<b style="display: inline-block;width:50px;line-height:20px;text-align: center;cursor: pointer;">重发</b><span style="display: inline-block;width:50px;line-height:20px;text-align: center;cursor: pointer;color:#408aff">详情</span>';
        } else {
            return '<span style="display: inline-block;width:50px;line-height:20px;text-align: center;cursor: pointer;color:#408aff">详情</span>';
        }
    }, (dt, idx) => {
        if (dt && dt[3]['value'] === -1) {
            return '<b style="display: inline-block;width:50px;line-height:20px;text-align: center;cursor: pointer;">重发</b>';
        } else {
            return '';
        }
    }];

    // let query = window.location.search;

    let vTableParam = {
        'thead': ['序号', '顺丰单号', '发起时间', '是否发起成功', '处理状态', '操作'],
        // 'data': [],
        'dataURL': '/express/findByComplain',
        'params': {
            'page': 1,
            'rows': 20,
            'type': 1
        },
        'draw': 0,
        'displayStart': 0,
        'lengthMenu': [5, 10, 15, 20, 50],
        'language': '',
        'searching': false,
        'processing': true,
        'columns': [
            {
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render' (dt, idx) {
                    return idx + 1;
                }
            }, {
                'data': 'waybill',
                'orderable': false,
                'position': 'center',
                'render' (dt, idx) {
                    return '<a class="waybill" style="cursor: pointer;">' + dt[1]['value'] + '</a>';
                }
            }, {
                'data': 'createedDate',
                'orderable': false,
                'position': 'center'
            }, {
                'data': 'isSuccess',
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render' (dt, idx) {
                    if (dt[3] && dt[3]['value'] === 0) {
                        return '成功';
                    } else {
                        return '未成功';
                    }
                }
            }, {
                'data': 'status',
                'orderable': false,
                'position': 'center',
                'render' (dt, idx) {
                    if (dt[4] && dt[4]['value'] === 1) {
                        return '结束';
                    } else {
                        return '处理中';
                    }
                }
            }, {
                'data': '',
                'orderable': false,
                'searchable': false,
                'position': 'center',
                'render': func[0]
            }
        ],
        'pagination': {
            'pageSize': 20,
            'pointSize': 20
        },
        'dataReady' (res) {
            let dt = {
                total: res.data && res.data.data && res.data.data.totalPages,
                size: res.data && res.data.data && res.data.data.size,
                data: res.data && res.data.data && res.data.data.content
            };

            return dt;
        },
        'created': this.done,
        'dataKeys': ['complainId', 'receivetor', 'receiveCompany', 'receiveAddress', 'receivetorPhone', 'sender', 'senderPhone'],
        'keyMap': {
            'pageIndex': 'page',
            'pageSize': 'rows',
            'current': 'number',
            'total': 'totalPages'
        }
    };
    export default {
        template: '<div></div>',
        components: {
            'v-table': VTable,
            'v-modal': VModal
        },
        beforeCreate () {
            if (!vTableParam.dataURL) {
                vTableParam.data = vtdata[0];
            }
        },
        created () {
            vTableParam.itemClick = this.itemClick;

            // 更新导航菜单
            this.$store.commit('refreshMenu');
        },
        mounted () {
            this.vt = this.$refs.vtRequireChanges;
            this.vmodal = this.$refs.vmMsg;
            // this.vt.on('init', (e, settings) => {});
            // this.vt.on('length', (e, settings) => {});
            // this.vt.on('page', (e, settings) => {});
            // console.log(this.vt.size);
            this.tabs[0].active = true;
            /* for (let i = 0; i < this.tabs.length; i++) {
             if (query.search('type=' + this.tabs[i].code) !== -1) {
             this.tabs[i].active = true;
             if (vTableParam.useLocal) {
             vTableParam.data = vtdata[i];
             } else {
             vTableParam.params.type = i + 1;
             }
             this.vt.update(vTableParam);
             break;
             } else {
             this.tabs[i].active = false;
             }
             } */

            // 访问埋点
            this.$store.commit('recordVisits', {
                sysCode: 1,
                url: window.location.pathname + window.location.hash,
                referrerUrl: document.referrer
            });
        },
        methods: {
            itemClick (e, dt) {
                let that = this;
                let evt = e || window.event;
                let target = evt.target;
                evt.stopPropagation();

                if (target.nodeName.toLowerCase() === 'a') {
                    this.$router.push({
                        name: 'express_route',
                        query: {
                            'name': 'waybillNo',
                            'waybillNo': dt['data'][1]['value']
                        }
                    });
                }

                if (target.nodeName.toLowerCase() === 'span') {
                    const data = dt.data[0];
                    this.$store.commit('shareData', {
                        dataName: 'expressDetails',
                        value: {
                            sender: {
                                name: data.sender || '--',
                                phone: data.senderPhone || '--'
                            },
                            data: [{
                                receiverInfo: (data.receivetor || '--') + '/' + (data.receiveCompany || '--'),
                                receiveAddress: data.receiveAddress || '--',
                                receivetorPhone: data.receivetorPhone || '--'
                            }]
                        }
                    });
                    this.$router.push({
                        name: 'express_details'
                    });
                }

                if (target.nodeName.toLowerCase() === 'b') {
                    that.ajaxSettings = {
                        url: '/express/againLaunchComplain',
                        params: {
                            complainId: dt['data'][0]['complainId'],
                            type: vTableParam.params.type
                        },
                        success (res) {
                            let data = res.data;
                            if (data && data.code === 0) {
                                that.vmodal.loaded('重发成功！');
                                that.vt.update();
                            } else {
                                that.vmodal.failed(data.message);
                            }
                        },
                        error (err) {
                            console.log(err);
                        }
                    };

                    this.$store.commit('setAjax', this.ajaxSettings);
                    this.$store.dispatch('ajax');
                }
            },
            tabTurn (idx, code, bl) {
                for (let i = 0, len = this.tabs.length; i < len; i++) {
                    if (this.tabs[i].active && i === idx && !bl) {
                        return;
                    }
                    this.tabs[i].active = false;
                }
                if (!vTableParam.dataURL) {
                    vTableParam.data = vtdata[idx];
                } else {
                    vTableParam.params.type = idx + 1;
                }
                if (idx === 0) {
                    vTableParam.columns[5].render = func[0];
                } else {
                    vTableParam.columns[5].render = func[1];
                }
                this.tabs[idx].active = true;
                this.vt.update(vTableParam);
                // window.location.search = '?type=' + code;
            },
            done (dt) {
            },
            ready (dt) {
            }
        },
        data: () => {
            return {
                tableDt: vTableParam,
                title: '需求变更',
                tabs: [{
                    name: '要求退回件',
                    code: 'returned',
                    active: true
                }, {
                    name: '要求再派件',
                    code: 'resend',
                    active: false
                }, {
                    name: '要求转寄件',
                    code: 'forward',
                    active: false
                }, {
                    name: '要求更改收方信息件',
                    code: 'changing',
                    active: false
                }],
                mShow: true
            };
        }
    };
</script>

<style lang="less" type="text/less">

    .content-title {
        border-bottom: 1px solid #3B8EDE;
        padding: 0;
        height: 50px;
        box-sizing: border-box;
        background-color: #EDF1F5;

        h4 {
            margin: 0;
            display: inline-block;
            line-height: 1em;
            font-size: 18px;
            color: #09f;
            padding: 16px 0 16px 0;
        }

        & ~ div {
            margin: 0 28px 0;
            padding: 20px 0 0;
            overflow: hidden;

            ~ div {
                > div {
                    float: none !important;
                }
            }

            > div {
                &:nth-child(1) {
                    float: left;
                }
            }

            > div {
                &:nth-child(2) {
                    float: right;
                }
            }

            .m-btn {
                padding-right: 20px;
                padding-left: 20px;
            }

            .m-btn-blue {
                margin-right: 15px;
            }
            .m-btn-default {
                margin-left: 15px;
            }
        }
    }

    .content-title.fixed {
        position: fixed;
        top: 60px;
        right: 20px;
        left: 200px;
        z-index: 50;

        ~ div {
            margin-top: 110px;
            ~ div {
                margin-top: 0;
            }
        }
    }

    .nav-tabs {
        padding-left: 0;
        margin-bottom: -1px;
        list-style: none;
        overflow: hidden;

        &:before {
            display: table;
            content: " ";
        }

        &:after {
            clear: both;
        }

        > li {
            position: relative;
            float: left;
            font-size: 15px;

            > a {
                position: relative;
                display: block;
                padding: 10px 25px;
                margin-right: 2px;
                line-height: 1.42857143;
                border: 1px solid transparent;
                border-radius: 4px 4px 0 0;
                color: #666;

                &:hover {
                    background-color: #f7f7f7;
                    border: 1px solid #ddd;
                    border-bottom-color: transparent;
                    color: #3BA1DE;
                    opacity: .9;
                }
            }

            &.active > a, &.active > a :focus, &.active > a:hover {
                cursor: default;
                background-color: #fff;
                border: 1px solid #ddd;
                border-bottom-color: transparent;
                color: #3BA1DE;
                opacity: 1;
            }
        }
    }

    .order-table {
        margin-bottom: 30px;
        padding: 10px 10px 5px;
        border: 1px solid #ddd;
    }

    .waybill {
        &:hover{
            text-decoration: underline;
        }
    }

</style>
