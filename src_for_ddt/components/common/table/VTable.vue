<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div class="v-table-wrapper">
        <div>
            <table class="v-table">
                <thead v-if="hdt.length > 1">
                <tr>
                    <td v-for="(dt, idx) in hdt">{{dt}}
                        <div v-if="!hasNoData" class="mark-holder">
                            <span v-if="cols[idx] && cols[idx].orderable"
                                  :class="['mark-order', {'mark-order-asc': cols[idx].sortType === 'ASC'}, {'mark-order-desc': cols[idx].sortType === 'DESC'}]" v-on:click="sort($event, idx)"></span>
                        </div>
                    </td>
                </tr>
                </thead>
                <div class="division-line"></div>
                <tbody v-if="!hasNoData">
                <tr v-for="(item, index) in bdt" v-if="item">
                    <td v-for="dt in item.data" v-if="!dt.hidden" v-html="dt.html" v-on:click="itemClick($event, index)"
                        :id="dt.colIndex"
                        :style="{textAlign: dt.position}"></td>
                </tr>
                </tbody>

                <tbody v-else>
                <tr>
                    <td :colspan="hdt.length" style="text-align: center">没有相关数据！</td>
                </tr>
                </tbody>
                <div class="division-line"></div>
                <tfoot>
                <tr></tr>
                </tfoot>
            </table>
        </div>
        <div class="v-pagination">
            <div class="v-pagination-opr">
                共<span> {{pagination.total}} </span>条，每页<span> {{pagination.pageSize}} </span>条
                <span><a v-for="(pt, index) in pagination.points"
                         :class="[{'active': pt.active}, {'disabled': pt.disabled}, pt.className || '']"
                         v-html="pt.html"
                         v-on:click="doPaging(index)"></a></span>
            </div>
            <div class="v-notes" :title="noteText" v-html="noteText"></div>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';

    // 定义v-table可重用组件
    let table = Vue.component('v-table', {
        template: '#main',
        props: ['vtData'],                      // vtData 为注册方传递过来的数据
        beforeCreate: function (bus) {
        },
        created: function (bus) {
            let that = this;
            let thisVDT = this['vtData'];
            let page = thisVDT['pagination'];
            if (thisVDT['note']) {
                this.noteText = thisVDT['note'];
            }
            if (thisVDT['totalLimit']) {
                this.totalLimit = thisVDT['totalLimit'];
            }
            if (page) {
                this.pagination.pageSize = page.pageSize;
            }

            this.ajaxSettings = {
                url: thisVDT['dataURL'],
                params: {},
                success (res) {
                    if (res && typeof res === 'object') {
                        let _dt = thisVDT.dataReady && thisVDT.dataReady(res) || res;                // 数据加载完成
                        that.setPagination(_dt);            // 分页
                        that.visited = true;
                    } else {
                        that.setPagination([]);
                        that.visited = true;
                        that.hasNoData = true;                                  // 无可显示数据
                    }
                },
                error (err) {
                    that.hasNoData = true;
                    console.error(err);
                }
            };
            if (thisVDT['autoRender'] !== false) {
                this.init();
            }
        },
        mounted: function () {
            // console.log(this.tData);
            this['vtData'].created && this['vtData'].created();                           // 表格创建完成
        },
        methods: {
            init () {
                if (this['vtData'].keyMap) {                                                // 字段名称映射
                    let map = this['vtData'].keyMap;
                    for (let key in map) {
                        if (map.hasOwnProperty(key)) {
                            this.keyMap[key] = map[key];
                        }
                    }
                }
                if (this['vtData'].thead) {
                    this.hdt = this['vtData'].thead;                                       // 表头字段
                }
                if (this['vtData'].data && this['vtData'].data.length > 0) {
                    this.useLocal = true;
                    this.setPagination(this['vtData'].data);        // 分页
                    // this['vtData'].dataReady && this['vtData'].dataReady(this['vtData'].data);   // 数据加载完成
                } else if (this['vtData']['dataURL']) {
                    this.serverData();                                                     // 异步获取数据
                } else {
                    this.hasNoData = true;                                              // 无可显示数据
                }
            },
            // 排序
            sort (e, idx) {
                let evt = e || window.event;
                let sortField = [];
                let sortType = [];
                evt.stopPropagation();

                if (this.cols[idx].sortType === 'ASC') {
                    this.cols[idx].sortType = 'DESC';
                } else {
                    this.cols[idx].sortType = 'ASC';
                }

                this.sortType[this.cols[idx].name] = this.cols[idx].sortType;
                for (let k in this.sortType) {
                    sortField.push(k);
                    sortType.push(this.sortType[k]);
                }
                if (sortField.length === 0) {
                    sortField = null;
                    sortType = null;
                }
                this['vtData'].params.sortField = sortField;
                this['vtData'].params.sortType = sortType;

                this.update(this['vtData']);
            },
            // 手动更新（重新渲染）
            update (dt) {
                this.visited = false;
                this.hasNoData = false;
                this.gap = 0;
                this.pagination = {};
                this['vtData'] = dt || this['vtData'];
                this.init();
            },
            // 获取表格数据（针对异步请求）
            getData (params) {
                if (!this.useLocal) {
                    this.ajaxSettings.params = params;
                    this.$store.commit('setAjax', this.ajaxSettings);
                    this.$store.dispatch('ajax');
                }
            },
            // 当从服务端获取数据时，设置请求参数（只调用一次）
            serverData () {
                let thisVDT = this['vtData'];
                let params = {};
                if (thisVDT.params) {
                    let thisVDT = this['vtData'];
                    if (thisVDT.params) {
                        for (let k in thisVDT.params) {
                            params[k] = thisVDT.params[k];
                        }
                    }
                }

                this.getData(params);
            },
            // 重组数据，使数据字段与表头字段对应
            resetData (dt) {
                let thisVDT = this['vtData'];
                this.rawData = dt;

                if (!thisVDT.columns || thisVDT.columns.length === 0) {
                    this.bdt = dt;
                    return;
                }

                let columns = thisVDT.columns;
                let cols = [];
                let tbData = [];
                let key;

                let dataKeys = thisVDT['dataKeys'] || [];

                for (let i = 0, len = columns.length; i < len; i++) {
                    cols[i] = {};
                    key = columns[i]['data'];
                    cols[i]['name'] = key;
                    if (key === undefined || !/\S/g.test(key)) {
                        if (columns[i]['position']) {
                            cols[i]['position'] = columns[i]['position'];
                        }
                        if (columns[i]['render']) {
                            cols[i]['render'] = columns[i]['render'];
                        }
                        cols[i]['orderable'] = false;
                        cols[i]['searchable'] = false;
                    } else {
                        cols[i]['position'] = columns[i]['position'] || 'left';
                        if (columns[i]['render']) {
                            cols[i]['render'] = columns[i]['render'];
                        }
                        cols[i]['orderable'] = columns[i]['orderable'] === undefined ? true : columns[i]['orderable'];
                        if (!this.cols[i] || !this.cols[i]['sortType']) {
                            cols[i]['sortType'] = columns[i]['sortType'] === undefined ? 'DESC' : columns[i]['sortType'];
                        } else {
                            cols[i]['sortType'] = this.cols[i]['sortType'];
                        }
                        cols[i]['searchable'] = columns[i]['searchable'] === undefined ? true : columns[i]['searchable'];
                        cols[i]['hidden'] = columns[i]['hidden'] === undefined ? false : columns[i]['hidden'];
                    }
                }

                let colName;

                for (let m = 0, ln = dt.length; m < ln; m++) {
                    tbData[m] = {};
                    tbData[m]['data'] = [];
                    tbData[m]['index'] = m;
                    let dtArr = [];
                    // 设置每一列数据的相关属性
                    for (let n = 0, len = cols.length; n < len; n++) {
                        let _dt = {};
                        dtArr[n] = {};
                        colName = cols[n]['name'];

                        if (cols[n]['render']) {
                            _dt['render'] = cols[n]['render'];
                        }

                        _dt['colIndex'] = n;
                        _dt['orderable'] = cols[n]['orderable'];
                        _dt['sortType'] = cols[n]['sortType'];
                        _dt['searchable'] = cols[n]['searchable'];
                        _dt['hidden'] = cols[n]['hidden'];
                        dtArr[n]['position'] = _dt['position'] = cols[n]['position'];

                        for (let k = 0, l = dataKeys.length; k < l; k++) {
                            dtArr[n][dataKeys[k]] = _dt[dataKeys[k]] = dt[m][dataKeys[k]];
                        }

                        if (colName !== undefined) {
                            dtArr[n]['name'] = _dt['name'] = colName;
                            dtArr[n]['value'] = _dt['value'] = dt[m][colName];
                        }

                        /* if (!cols[n]['hidden']) {
                            tbData[m]['data'].push(_dt);
                        } */
                        tbData[m]['data'].push(_dt);
                    }

                    // 访问每个子都的render属性（如果有），
                    // 以给html（最终在文档中显示的内容）属性赋值
                    for (let w = 0, l = tbData[m]['data'].length; w < l; w++) {
                        if (tbData[m]['data'][w]['render']) {
                            let itemIndex = this.pagination.index * this.pagination.pageSize + m;
                            tbData[m]['data'][w]['html'] = tbData[m]['data'][w]['render'](dtArr, itemIndex);
                        } else {
                            // 没有render属性时，取value的值
                            tbData[m]['data'][w]['html'] = tbData[m]['data'][w]['value'];
                        }
                    }
                }

                this.cols = cols;
                this.bdt = tbData;  // 组合后的数据最终赋值给this.bdt，表格更新
            },
            // 配置翻页控件
            setPagination (res) {
                let dt = [];
                if (res && res.data && typeof res.data === 'object' && res.data.constructor === Array) {
                    dt = res.data;
                } else {
                    // this.resetData(dt);
                    dt = res;
                }

                let total = 0;
                let thisVDT = this['vtData'];
                let pg = {};

                let page = thisVDT['pagination'];

                if (this.useLocal) {
                    total = dt.length;
                    if (page) {
                        pg.pageSize = page.pageSize || this.pagination.pageSize;
                        pg.pointSize = page.pointSize || this.pagination.pointSize;
                    }
                } else {
                    if (res.total && res.total > 0) {
                        total = res.total;
                    } else {
                        total = 0;
                        this.hasNoData = true;
                    }

                    pg.pageSize = page.pageSize || res.size || this.pagination.pageSize;
                    pg.pointSize = page.pointSize || this.pagination.pointSize;
                }

                let pagination = {};

                // 配置一次后将不再重复配置
                if (this.visited) {
                    if (total === 0) {
                        pagination.total = total;
                        pagination.pageSize = pg.pageSize;
                        this.pagination = pagination;
                    }

                    if (this.useLocal) {
                        this.resetData(dt.slice(0, pg.pageSize));
                    } else {
                        this.resetData(dt);
                    }
                    return false;
                }

                let size;

                if (this.totalLimit && total > this.totalLimit) {
                    size = Math.ceil(this.totalLimit / pg.pageSize);
                } else {
                    size = Math.ceil(total / pg.pageSize);
                }

                let points = [];
                // 总页数小于或等于pointSize（操作按钮数量）时，不会有上下翻页按钮，否则...
                if (size <= pg.pointSize) {
                    for (let n = 0; n < size; n++) {
                        points[n] = {};
                        points[n]['html'] = n + 1;
                    }
                    pagination.index = 0;
                    points[0] && (points[0]['active'] = true);

                    pg.pointSize = size;
                } else {
                    for (let i = 0; i < pg.pointSize; i++) {
                        points[i] = {};
                        if (i === 0) {
                            points[i]['html'] = '&lt;';
                        } else if (i === pg.pointSize - 1) {
                            points[i]['html'] = '&gt;';
                        } else if (i === pg.pointSize - 2) {
                            points[i]['html'] = size;
                        } else if (i === pg.pointSize - 3) {
                            points[i]['html'] = '...';
                            points[i]['className'] = 'none';
                        } else {
                            points[i]['html'] = i;
                            if (i === 1) {
                                pagination.index = 0;
                                points[0]['disabled'] = true;
                                points[1]['active'] = true;
                            }
                        }
                    }
                }

                if (this.totalLimit && total > this.totalLimit) {
                    pagination.total = this.totalLimit;
                    pagination.pageTotal = Math.ceil(this.totalLimit / pg.pageSize);
                } else {
                    pagination.total = total;
                    pagination.pageTotal = size;
                }
                pagination.pageSize = pg.pageSize;
                pagination.pointSize = pg.pointSize;
                pagination.points = points;

                this.step = pagination.pointSize - 8;   // 跳页步数
                this.pagination = pagination;   // 赋值给数据集合，更新视图

                if (this.useLocal) {
                    this.resetData(dt.slice(0, pg.pageSize));
                } else {
                    this.resetData(dt);
                }
            },
            // 翻页操作
            doPaging (idx, num) {
                let pagination = {};
                let points = [];
                let pointSize = this.pagination.pointSize;
                let size = this.pagination.pageTotal;
                let sub = 0;
                // let isNum = true;
                for (let k in this.pagination) {
                    if (this.pagination.hasOwnProperty(k)) {
                        pagination[k] = this.pagination[k];
                    }
                }

                for (let i = 0; i < pointSize; i++) {
                    this.pagination.points[i]['active'] = false;
                }

                switch (idx) {
                    // 上一页或第一页
                    case 0:
                        if (size <= pagination.pointSize) {
                            if (idx === pagination.index) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        }

                        if (this.curPtIdx === 1) {
                            pagination.points[this.curPtIdx]['active'] = true;
                            return;
                        }

                        pagination.points[pagination.pointSize - 1].disabled = false;

                        if (this.gap <= 0 || this.curPtIdx > 4) {
                            if (pagination.index >= 1) pagination.index--;
                            if (this.curPtIdx > 1) {
                                --this.curPtIdx;
                            }
                            pagination.points[this.curPtIdx]['active'] = true;
                        } else {
                            if (this.gap > 0 && this.curPtIdx <= 4) {
                                this.doPaging(3);
                                return;
                            }
                        }

                        if (this.curPtIdx <= 1) {
                            pagination.points[0].disabled = true;
                        }
                        break;

                    // 第一页或第二页
                    case 1:
                        if (size <= pagination.pointSize) {
                            if (idx === pagination.index) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        } else {
                            if (idx - 1 === pagination.index) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        }

                        if (size <= pagination.pointSize) {
                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        }

                        this.sum = 0;
                        this.sub = 0;
                        this.gap = 0;

                        // 重新渲染翻页条
                        points = [];
                        for (let n = 0; n < pointSize; n++) {
                            points[n] = {};
                            switch (n) {
                                case 0:
                                    points[n]['html'] = '&lt;';
                                    break;
                                case 1:
                                    points[n]['html'] = n;
                                    this.curPtIdx = n;
                                    break;
                                case pointSize - 1:
                                    points[n]['html'] = '&gt;';
                                    break;
                                case pointSize - 2:
                                    points[n]['html'] = size;
                                    break;
                                case pointSize - 3:
                                    points[n]['html'] = '...';
                                    points[n]['className'] = 'none';
                                    break;
                                default:
                                    points[n]['html'] = n;
                                    break;
                            }
                        }

                        this.back = false;
                        this.forward = true;

                        points[idx]['active'] = true;
                        points[0].disabled = true;
                        pagination.index = idx - 1;
                        pagination.points = points;
                        break;

                    case 2:
                        if (size <= pagination.pointSize) {
                            if (idx === pagination.index) {
                                pagination.points[idx]['active'] = true;
                                return;
                            } else {
                                pagination.index = idx;
                                pagination.points[0].disabled = false;
                                pagination.points[pagination.pointSize - 1].disabled = false;
                                this.curPtIdx = idx;
                                pagination.points[this.curPtIdx]['active'] = true;
                            }
                        } else {
                            if (this.gap <= 0) {
                                if (idx - 1 === pagination.index) {
                                    pagination.points[idx]['active'] = true;
                                    return;
                                } else {
                                    pagination.index = idx - 1;
                                    pagination.points[0].disabled = false;
                                    pagination.points[pagination.pointSize - 1].disabled = false;
                                    this.curPtIdx = idx;
                                    pagination.points[this.curPtIdx]['active'] = true;
                                }
                            } else {
                                pagination.points[this.curPtIdx]['active'] = true;
                                return;
                            }
                        }
                        break;

                    // 第四页或第一个跳码
                    case 3:
                        if (size <= pagination.pointSize) {
                            if (idx === pagination.index) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        } else {
                            if (idx - 1 === pagination.index) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        }

                        if (size <= pagination.pointSize) {
                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            break;
                        }
                        if (this.gap <= 0) {
                            pagination.index = idx - 1;
                            pagination.points[idx]['active'] = true;
                            break;
                        }
                        if (this.back) {
                            this.gap -= this.step;
                            if (this.gap < 0) {
                                this.sub = -this.gap;
                                this.gap = 0;
                                this.back = false;
                            }
                            this.forward = true;
                        }

                        sub = this.sub;

                        // 重新渲染翻页条
                        points = [];
                        for (let n = 0; n < pointSize; n++) {
                            points[n] = {};
                            this.sum = pointSize - 2 + this.gap;
                            switch (n) {
                                case 0:
                                    points[n]['html'] = '&lt;';
                                    break;
                                case 1:
                                    points[n]['html'] = n;
                                    break;
                                case 2:
                                    if (this.gap > 0) {
                                        points[n]['html'] = '...';
                                        points[n]['className'] = 'none';
                                    } else {
                                        points[n]['html'] = n;
                                    }
                                    break;
                                case pointSize - 1:
                                    points[n]['html'] = '&gt;';
                                    break;
                                case pointSize - 2:
                                    points[n]['html'] = size;
                                    break;
                                case pointSize - 3:
                                    if (this.gap >= 0) {
                                        points[n]['html'] = '...';
                                        points[n]['className'] = 'none';
                                    } else {
                                        points[n]['html'] = (n + this.gap - 1);
                                    }
                                    break;
                                default:
                                    if (this.gap > 0) {
                                        points[n]['html'] = n + this.gap;
                                        if (n === (pointSize - 5)) {
                                            this.curPtIdx = n;
                                        }
                                    } else if (this.gap <= 0) {
                                        points[n]['html'] = n + this.gap;
                                        if (n === (pointSize - 5 - sub)) {
                                            this.curPtIdx = n;
                                            this.sub = 0;
                                        }

                                        this.back = false;
                                    }
                                    break;
                            }
                        }
                        points[this.curPtIdx]['active'] = true;

                        pagination.index = this.curPtIdx + this.gap - 1;

                        pagination.points = points;
                        break;

                    // 下一页或末页
                    case pagination.pointSize - 1:
                        if (size <= pagination.pointSize) {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }

                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        } else {
                            if (this.curPtIdx === idx - 1) {
                                pagination.points[idx - 1]['active'] = true;
                                return;
                            }
                        }

                        if (pagination.pageTotal === pagination.index) return;

                        if (this.curPtIdx < pagination.pointSize - 3) {
                            pagination.points[0].disabled = false;
                        } else {
                            pagination.points[pagination.pointSize - 1].disabled = true;
                        }

                        if (this.sum + this.sub >= size || this.curPtIdx < pagination.pointSize - 5) {
                            if (pagination.index < size - 1) pagination.index++;
                            if (this.curPtIdx < pagination.pointSize - 2) {
                                ++this.curPtIdx;
                            }
                            pagination.points[this.curPtIdx]['active'] = true;
                        } else {
                            if (this.sum < size && this.curPtIdx >= pagination.pointSize - 5) {
                                this.doPaging(pagination.pointSize - 4);
                                return;
                            }
                        }
                        break;

                    case pagination.pointSize - 2:
                        if (size <= pagination.pointSize) {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }

                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        } else {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        }
                        pagination.points[0].disabled = false;
                        if (pagination.pageTotal === pagination.index) return;

                        this.sum = size;
                        this.gap = this.sum - pointSize + 2 - this.sub;
                        this.sub = this.sum - pointSize + 2 - this.gap;

                        // 重新渲染翻页条
                        points = [];
                        for (let m = 0; m < pointSize; m++) {
                            points[m] = {};
                            switch (m) {
                                case 0:
                                    points[m]['html'] = '&lt;';
                                    break;
                                case 1:
                                    points[m]['html'] = m;
                                    break;
                                case 2:
                                    points[m]['html'] = '...';
                                    points[m]['className'] = 'none';
                                    break;
                                case pointSize - 1:
                                    points[m]['html'] = '&gt;';
                                    break;
                                case pointSize - 2:
                                    points[m]['html'] = size;
                                    this.curPtIdx = m;
                                    break;
                                default:
                                    points[m]['html'] = size - (pointSize - m - 2);
                                    break;
                            }
                        }

                        points[pagination.pointSize - 1].disabled = true;

                        this.back = true;
                        this.forward = false;

                        points[idx]['active'] = true;
                        this.curPtIdx = idx;
                        pagination.index = pagination.pageTotal - 1;
                        pagination.points = points;
                        break;

                    case pagination.pointSize - 3:
                        if (size <= pagination.pointSize) {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }

                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        } else {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        }

                        this.sum = pointSize - 2 + this.gap;
                        pagination.points[pagination.pointSize - 1].disabled = false;

                        if (this.sum < size) {
                            pagination.points[this.curPtIdx]['active'] = true;
                            return;
                        } else if (this.sum === size) {
                            pagination.index = idx + this.gap - 1;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        } else {
                            pagination.index = idx + this.gap - 1 - (this.sum - size);
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                        }
                        break;

                    // 第二个跳码或倒数第四页
                    case pagination.pointSize - 4:
                        // 页数小于或等于翻页按钮数量
                        if (size <= pagination.pointSize) {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }

                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        } else {
                            if (this.curPtIdx === idx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        }

                        this.sum = idx + this.gap;
                        pagination.points[pagination.pointSize - 1].disabled = false;

                        // 此处为页面时
                        if (this.sum + 2 >= size) {
                            pagination.index = this.sum - 1 - (this.sum + 2 - size);
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                            break;
                        }

                        if (this.forward) {
                            this.gap += this.step;
                            this.back = true;
                        }

                        // 重新渲染翻页条
                        sub = 0;
                        points = [];
                        for (let m = 0; m < pointSize; m++) {
                            points[m] = {};
                            // let tmp = pointSize - 3 + this.gap;
                            this.sum = pointSize - 2 + this.gap;
                            switch (m) {
                                case 0:
                                    points[m]['html'] = '&lt;';
                                    break;
                                case 1:
                                    points[m]['html'] = m;
                                    break;
                                case 2:
                                    points[m]['html'] = '...';
                                    points[m]['className'] = 'none';
                                    break;
                                case pointSize - 1:
                                    points[m]['html'] = '&gt;';
                                    break;
                                case pointSize - 2:
                                    points[m]['html'] = size;
                                    break;
                                case pointSize - 3:
                                    if (this.sum < size) {
                                        points[m]['html'] = '...';
                                        points[m]['className'] = 'none';
                                    } else if (this.sum === size) {
                                        points[m]['html'] = m + this.gap;
                                    } else {
                                        points[m]['html'] = (m + this.gap) - (this.sum - size);
                                    }
                                    break;
                                default:
                                    if (this.sum < size) {
                                        points[m]['html'] = m + this.gap;
                                        if (m === 4) {
                                            this.curPtIdx = m;
                                        }
                                    } else if (this.sum === size) {
                                        points[m]['html'] = m + this.gap;
                                        if (m === 4) {
                                            this.curPtIdx = m;
                                        }
                                    } else {
                                        points[m]['html'] = (m + this.gap) - (this.sum - size);
                                        if (m === (4 + (this.sum - size))) {
                                            this.curPtIdx = m;
                                        }

                                        sub = (this.sum - size);
                                        this.sub = sub;

                                        this.forward = false;
                                    }
                                    break;
                            }
                        }

                        points[this.curPtIdx]['active'] = true;

                        this.gap = this.gap - sub;

                        pagination.index = this.curPtIdx + this.gap - 1;

                        pagination.points = points;
                        break;
                    // 其他页码
                    default:
                        if (size <= pagination.pointSize) {
                            if (idx === this.curPtIdx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        } else {
                            if (idx === this.curPtIdx) {
                                pagination.points[idx]['active'] = true;
                                return;
                            }
                        }

                        if (size <= pagination.pointSize) {
                            pagination.index = idx;
                            pagination.points[idx]['active'] = true;
                            this.curPtIdx = idx;
                        } else {
                            pagination.points[idx].active = true;
                            this.curPtIdx = idx;
                            if (pointSize - 3 + this.gap <= size) {
                                pagination.index = idx + this.gap - 1;
                            } else {
                                pagination.index = idx + this.gap - 2 - (pointSize - 3 + this.gap - size);
                            }
                        }
                        pagination.points[0].disabled = false;
                        pagination.points[pagination.pointSize - 1].disabled = false;
                        break;
                }
                // console.log(pagination.index);

                this.pagination = pagination;

                if (this.useLocal) {
                    let end = (pagination.index + 1) * pagination.pageSize;
                    end = end <= pagination.total ? end : pagination.total;
                    this.resetData(this['vtData'].data.slice(pagination.index * pagination.pageSize, end));
                } else {
                    let params = {};
                    let thisVDT = this['vtData'];
                    if (thisVDT.params) {
                        for (let k in thisVDT.params) {
                            params[k] = thisVDT.params[k];
                        }
                    }

                    params[this.keyMap.pageSize] = pagination.pageSize;
                    params[this.keyMap.pageIndex] = pagination.index + 1;
                    this.getData(params);
                }
            },
            itemClick (e, idx) {
                let evt = e || window.event;
                evt.stopPropagation();
                this['vtData'].itemClick && this['vtData'].itemClick(e, this.bdt[idx]);
            },
            reRenderItem (data, idx, flag) {
                let thisVDT = this['vtData'];
                let dataKeys = thisVDT['dataKeys'] || [];
                let arr = data || this.bdt[idx]['data'];
                let dt = [];
                let renderDt = [];
                let n = 0;
                for (let i = 0, len = this.cols.length; i < len; i++) {
                    dt[i] = {};
                    let _dt = {};

                    let colName = this.cols[i]['name'];
                    if (colName !== undefined) {
                        if (this.cols[i]['hidden']) {
                            dt[i]['name'] = colName;
                            dt[i]['value'] = this.rawData[idx][colName];
                            n++;
                        } else {
                            dt[i]['name'] = arr[i - n]['name'];
                            dt[i]['value'] = arr[i - n]['value'];
                        }
                    }

                    if (arr[i]) {
                        _dt['name'] = arr[i]['name'];
                        _dt['value'] = arr[i]['value'];
                        _dt['position'] = arr[i]['position'];
                        _dt['render'] = arr[i]['render'];
                        _dt['hidden'] = arr[i]['hidden'];
                    }

                    dt[i]['position'] = this.cols[i]['position'];
                    dt[i]['render'] = this.cols[i]['render'];

                    for (let k = 0, l = dataKeys.length; k < l; k++) {
                        if (arr[i]) {
                            _dt[dataKeys[k]] = this.rawData[idx][dataKeys[k]];
                        }
                        dt[i][dataKeys[k]] = this.rawData[idx][dataKeys[k]];
                    }

                    if (arr[i]) {
                        renderDt.push(_dt);
                    }
                }

                for (let i = 0, len = renderDt.length; i < len; i++) {
                    if (renderDt[i]['render']) {
                        renderDt[i]['html'] = renderDt[i]['render'](dt, idx, flag);
                    }
                }

                this.bdt[idx]['data'] = renderDt;
            }
        },
        data () {
            return {
                hdt: [],
                bdt: [],
                hasNoData: false,
                useLocal: false,
                step: 0,
                gap: 0,
                sum: 0,
                sub: 0,
                totalLimit: 0,
                contactsTel: '',
                back: false,
                forward: true,
                pagination: {
                    total: 0,
                    pageSize: 10,
                    pageTotal: 1,
                    pointSize: 10,
                    index: 0,
                    points: []
                },
                curPtIdx: 1,
                keyMap: {},
                cols: [],
                rawData: [],
                visible: false,
                visited: false,
                sortType: {},
                noteText: ''
            };
        }
    });

    export default table;
</script>

<style lang="less" type="text/less">

    .v-table-wrapper {
        b, strong, i {
            font-style: normal;
            font-weight: normal;
            font-family: inherit;
        }
        .mark-holder {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            opacity: .6;
            background-color: inherit;
        }
        .mark-order {
            position: relative;
            display: inline-block;
            width: 12px;
            height: 100%;
            border: 1px solid transparent;
            border-radius: 2px;
            box-sizing: border-box;
            cursor: pointer;

            &:hover {
                border: 1px solid #d7d7d7;
            }

            &:before, &:after {
                content: '';
                display: block;
                position: absolute;
                top: 50%;
                left: 1px;
                width: 0;
                height: 0;
                font-size: 0;
            }
        }
        .mark-order-asc {
            &:before {
                margin-top: -5px;
                border-top: 4px solid #3B8EDE;
                border-right: 4px solid #3B8EDE;
                border-bottom: 4px solid transparent;
                border-left: 4px solid transparent;
                transform: rotate(-45deg);
            }
            &:after {
                margin-top: -4px;
                border-top: 4px solid transparent;
                border-right: 4px solid transparent;
                border-bottom: 4px solid #C3C3C3;
                border-left: 4px solid #C3C3C3;
                transform: rotate(-45deg);
            }
        }
        .mark-order-desc {
            &:before {
                margin-top: -5px;
                border-top: 4px solid #C3C3C3;
                border-right: 4px solid #C3C3C3;
                border-bottom: 4px solid transparent;
                border-left: 4px solid transparent;
                transform: rotate(-45deg);
            }
            &:after {
                margin-top: -4px;
                border-top: 4px solid transparent;
                border-right: 4px solid transparent;
                border-bottom: 4px solid #3B8EDE;
                border-left: 4px solid #3B8EDE;
                transform: rotate(-45deg);
            }
        }

        .v-table {
            width: 100%;
            border-collapse: collapse;

            td {
                position: relative;
                padding: 10px;
                font-size: 14px;
                border: none;
                background-color: #fff;
                cursor: default;
            }

            thead {
                td {
                    background-color: #EAEAEA;
                    text-align: center;
                    user-select: none;

                    &:hover {
                        background-color: #e4e4e4;

                        .mark-holder {
                            opacity: 1;
                        }
                    }
                }
            }

            tbody {
                :first-child {
                    td {
                        border-top: 10px solid #fff;
                    }
                }
                :last-child {
                    td {
                        border-bottom: 10px solid #fff;
                    }
                }

                tr:hover td {
                    background-color: #f0f6f9;
                }
            }

            .division-line {
                height: 0;
                background-color: #fff;
            }
        }

        .v-pagination {
            margin: 5px 0 0;
            padding: 5px;
            overflow: hidden;
        }

        .v-pagination-opr {
            float: right;
            font-size: 15px;
            color: #666;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;

            a {
                display: inline-block;
                height: 24px;
                min-width: 15px;
                margin: 0 2px;
                padding: 0 5px;
                line-height: 24px;
                border: 1px solid #999;
                border-radius: 2px;
                background-color: #fff;
                cursor: pointer;
                color: #666;
                font-size: 14px;
                text-align: center;

                &:hover {
                    background-color: #dfedff;
                }

                &:last-child {
                    margin-right: 0;
                }
            }

            a.active {
                background-color: #dfedff;
                cursor: default;
                box-shadow: inset 0 0 8px rgba(0, 0, 0, .5);
            }
            a.disabled {
                background-color: #e1e1e1;
                color: #aaa;
                cursor: default;
                &:hover {
                    background-color: #e1e1e1;
                }
            }
            a.none {
                cursor: default;
                &:hover {
                    background-color: #fff;
                }
            }
        }

        .v-notes {
            float: left;
        }
    }

</style>
