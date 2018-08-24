<template lang="pug">
    span.selector-wrap
        span(v-if="showLabel && orgLevelType.orgs.length", style="margin-right:10px;font-size:12px;color:#999;") 筛选
        el-select(
        v-if="showOrgTypes",
        @change="handlerChange(1, orgTypeId)", :disabled="prevDisabled || allDisabled",
        v-model="orgTypeId", placeholder="选择组织类型", :style="itemStyle")
            el-option(label="全部", value="")
            el-option(v-for="(it, idx) in orgTypes.list", :key="idx", :label="it.orgTypeName", :value="it.id")

        span(
        v-if="orgTypeId && !orgLevelType.orgs.length",
        style="font-size:13px;color:#aaa;") 如果还未添加组织，请在“架构管理”中创建。

        el-select(
        @change="handlerChange(2, orgLevelType.levelIds[index], index + 1)",
        v-for="(item, index) in orgLevelType.orgs", :key="index", v-if="!item.hidden", :disabled="item.disabled || allDisabled",
        v-model="orgLevelType.levelIds[index]", placeholder="选择组织", :style="itemStyle")
            el-option(label="请选择", value="")
            el-option(v-for="(it, idx) in item", :key="idx", :label="it.name", :value="it.id")

        el-select(
        v-if="showDeptOptions && orgLevelType.orgs.length",
        @change="handlerChange(3, orgLevelType.curDeptId)", :disabled="allDisabled",
        v-model="orgLevelType.curDeptId", placeholder="选择单位", :style="itemStyle")
            el-option(v-for="(it, idx) in departments.list", :key="idx", :label="it.deptName", :value="it.id")

</template>

<script type="text/ecmascript-6">
    import Vue from 'vue';
    import APIList from '@/assets/datas/APIList.json';

    const deptPicker = Vue.component('dept-picker', {
        props: ['config', 'showOrgTypes', 'showDeptOptions', 'showLabel', 'rowSize', 'loaded', 'change'],
        data() {
            const that = this;
            return {
                hasNoData: true,
                initOrg: false,
                initState: false,
                prevDisabled: false,
                allDisabled: false,
                wTypePx: false,
                currentDeptId: '',
                orgFirstLevelId: '',
                curOrgs: [],
                curDept: {},
                initList: [],
                curDeptId: '',
                disabledIdx: 0,
                result: {
                    type: {
                        name: '',
                        id: '',
                    },
                    level: {
                        name: '',
                        id: '',
                    },
                    dept: {
                        name: '',
                        id: '',
                    },
                },
                orgTypes: {
                    list: [],
                    getData() {
                        that.$axios.get(APIList.GET_UNIT_TYPE, {
                            data: {},
                        }).then((response) => {
                            that.orgTypes.list = response.data.rows;
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                levelIds: [],
                orgLevelType: {
                    orgs: [],
                    levelIds: [],
                    curOrgId: [],
                    curDeptId: '',
                    keyword: '',
                    getData(id, idx) {
                        const setFilterList = (dt) => {
                            const arr = [];
                            for (let i = 0; i < dt.length; i += 1) {
                                arr.push({
                                    id: dt[i].id,
                                    name: dt[i].orgName,
                                    order: dt[i].sequence,
                                    parentId: dt[i].parentOrgId,
                                    orgTypeId: dt[i].orgTypeId,
                                });
                            }
                            // if (that.prevDisabled && idx > that.disabledIdx) {
                            //     that.orgLevelType.orgs.push(arr);
                            // } else {
                            //     that.orgLevelType.orgs.push([]);
                            // }
                            that.orgLevelType.orgs.push(arr);
                        };
                        if (idx === 0) {
                            const data = that.$qs.stringify({
                                orgTypeId: that.orgTypeId,
                            });
                            that.$axios.get(`${APIList.GET_TOP_ORG_LEVEL}?${data}`, {
                                data: {},
                            }).then((response) => {
                                const dt = response.data;
                                if (dt.constructor === Array && dt.length > 0) {
                                    setFilterList(dt);
                                    that.hasNoData = false;
                                } else {
                                    that.hasNoData = true;
                                }

                                if (that.initState) {
                                    if (that.initCallback) {
                                        that.initCallback();
                                    }
                                }
                                that.setItemWidth();
                            }).catch((response) => {
                                console.error(response);
                            });
                        } else {
                            const data = that.$qs.stringify({
                                orgId: id,
                            });
                            that.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${data}`, {
                                data: {},
                            }).then((response) => {
                                const dt = response.data;
                                if (dt.constructor === Array && dt.length > 0) {
                                    setFilterList(dt);
                                    that.setItemWidth();
                                    const curOrgId = that.levelIds[idx];
                                    if (that.initState) {
                                        if (that.prevDisabled) {
                                            if (that.orgLevelType.orgs.length > 0 && idx <= that.disabledIdx) {
                                                that.orgLevelType.orgs[idx - 1].disabled = true;
                                            }
                                            if (idx + 1 === that.disabledIdx) {
                                                that.handlerChange2(that.levelIds[idx], idx + 1);
                                            }
                                        } else if (that.allDisabled) {
                                            if (that.orgLevelType.orgs.length > 0 && idx <= that.disabledIdx) {
                                                that.orgLevelType.orgs[idx - 1].disabled = true;
                                            }
                                            if (idx < that.disabledIdx) {
                                                that.handlerChange2(that.levelIds[idx], idx + 1);
                                            }
                                        } else if (idx <= that.disabledIdx) {
                                            that.handlerChange2(that.levelIds[idx], idx + 1);
                                        }
                                    }
                                    // that.itemChanged();
                                    if (that.initOrg && curOrgId) {
                                        that.orgLevelType.getData(curOrgId, idx + 1);
                                    }
                                    if (that.initState && that.initOrg) {
                                        that.orgLevelType.curDeptId = that.curDeptId;
                                    }
                                    if (that.initState) {
                                        if (that.initCallback) {
                                            that.initCallback();
                                        }
                                    }
                                }
                            }).catch((response) => {
                                console.error(response);
                            });
                        }
                    },
                },
                departments: {
                    list: [],
                    getData(id) {
                        const param = that.$qs.stringify({
                            pageSize: 10000,
                            pageNum: 1,
                            orgId: id,
                        });
                        that.$axios.get(`${APIList.GET_UNITS_BY_ORG}?${param}`, {
                            data: {},
                        }).then((response) => {
                            if (response.data && response.data.rows) {
                                that.departments.list = response.data.rows;
                                that.setItemWidth();
                            }
                        }).catch((response) => {
                            console.error(response);
                        });
                    },
                },
                width: 90,
                itemStyle: {
                    width: '20%',
                    marginRight: '1%',
                    marginBottom: that.rowSize ? '10px' : '0',
                },
            };
        },
        components: {},
        created() {
            // this.unitType = decodeURIComponent(this.$router.history.current.hash.substring(1));
            if (!this.orgTypeId) {
                this.orgTypeId = decodeURIComponent(this.$router.history.current.query.type_id || '');
            }
            if (this.orgTypeId) {
                this.init();
            } else if (this.showOrgTypes) {
                this.orgTypes.getData();
            }
        },
        mounted() {
            const config = this.config;
            if (config) {
                const itemWidth = config.itemWidth;
                if (itemWidth) {
                    this.itemStyle.width = itemWidth;
                }
            }
            if (this.initOrg || this.initDept) {
                this.initState = true;
            }
            this.setLoadStatus();
        },
        methods: {
            init() {
                // const attrs = this.$vnode.data.attrs;
                const config = this.config;
                const w = config.width;
                if (w && w.indexOf('%') !== -1) {
                    this.wTypePx = false;
                } else if (w && w.indexOf('px') !== -1) {
                    this.wTypePx = true;
                }
                this.width = window.parseInt(w);

                if (this.orgTypeId) {
                    this.orgLevelType.getData(this.orgTypeId, 0);
                }
            },
            handlerChange(n, a, b) {
                this.initState = false;
                if (n === 1) {
                    this.handlerChange1(a);
                } else if (n === 2) {
                    this.handlerChange2(a, b);
                } else {
                    this.handlerChange3(a);
                }
            },
            handlerChange1(id) {
                if (this.orgTypeId) {
                    this.setOrgTypeId(this.orgTypeId);
                }
                this.orgLevelType.orgs = [];
                this.orgLevelType.orgs.splice(0, 100);
                this.orgLevelType.levelIds.splice(0, 100);
                this.levelIds.splice(0, 100);
                this.departments.list = [];         // 清空单位列表
                this.orgLevelType.curDeptId = '';
                this.orgLevelType.curOrgId = [];
                this.result.type.id = id;
                this.result.level.id = '';
                this.result.dept.id = '';
                this.itemChanged();
            },
            handlerChange2(id, idx) {
                this.orgLevelType.orgs.splice(idx, 100);
                // const len = this.orgLevelType.levelIds.length;
                this.orgLevelType.levelIds.splice(idx - 1, 100);
                this.departments.list = [];
                this.orgLevelType.curDeptId = '';
                if (id) {
                    this.orgLevelType.getData(id, idx);
                    if (this.showDeptOptions) {
                        this.departments.getData(id);
                    }
                    this.curOrgId = id;
                    this.orgLevelType.levelIds.push(id);
                } else {
                    this.setItemWidth();
                    if (idx > 1 && this.showDeptOptions) {
                        this.departments.getData(this.orgLevelType.levelIds[idx - 2]);
                    }
                }
                const dt = this.orgLevelType.curOrgId;
                for (let i = idx; i < dt.length; i += 1) {
                    dt[i] = '';
                }

                if (id) {
                    this.result.level.id = id;
                    this.result.dept.id = '';
                } else {
                    if (idx > 1) {
                        this.result.level.id = this.orgLevelType.levelIds[idx - 2];
                    } else {
                        this.result.level.id = this.orgLevelType.levelIds[0];
                    }
                    this.result.dept.id = '';
                }
                this.itemChanged();
            },
            handlerChange3(id) {
                this.result.dept.id = id;
                this.itemChanged();
            },
            itemChanged() {
                const callback = this.change;
                if (callback) {
                    callback.call(this, this.result);
                }
            },
            clearData() {
                this.orgLevelType.orgs = [];
                this.orgLevelType.levelIds = [];
                this.levelIds = [];
            },
            getCurrentId() {
                const len = this.orgLevelType.levelIds.length;
                return this.orgLevelType.levelIds[len - 1];
            },
            setOrgTypeId(id) {
                if (id) {
                    this.orgLevelType.orgs = [];
                    this.orgLevelType.orgs.splice(0, 100);
                    this.orgLevelType.levelIds.splice(0, 100);
                    this.levelIds.splice(0, 100);
                    this.departments.list = [];         // 清空单位列表
                    this.orgLevelType.curDeptId = '';
                    this.orgLevelType.curOrgId = [];
                    this.orgTypeId = id;
                    this.init();
                }
            },
            setInitDept(initDept) {
                if (initDept) {
                    this.initDept = true;
                    this.loadOrgData(initDept.id);
                    this.curDeptId = initDept.id;
                }
            },
            setInitParams(dt, callback) {
                if (dt) {
                    this.initOrg = dt.initOrg;
                    this.prevDisabled = dt.prevDisabled;
                    this.allDisabled = dt.allDisabled;
                    if (dt.dept) {
                        this.curDeptId = dt.dept.id;
                        this.loadOrgData(dt.dept.id);
                    }
                } else {
                    this.initOrg = false;
                }
                if (callback) {
                    this.initCallback = callback;
                }

                if (this.initOrg || this.initDept) {
                    this.initState = true;
                }
            },
            getIds() {
                return this.orgLevelType.levelIds;
            },
            setItemWidth() {
                const itemDefaultWidth = window.parseInt(this.config.itemWidth || 30);
                let len = this.orgLevelType.orgs.length + (this.showOrgTypes ? 1 : 0) + (this.showDeptOptions ? 1 : 0);
                if (this.rowSize) {
                    len = this.rowSize;
                }
                if (this.wTypePx) {
                    let val = (this.width * (100 - len)) / (100 * len);
                    if (val > itemDefaultWidth) {
                        val = itemDefaultWidth;
                    }
                    this.itemStyle.width = `${val}px`;
                } else {
                    let val = (this.width - len + 1) / (len);
                    if (val > itemDefaultWidth) {
                        val = itemDefaultWidth;
                    }
                    this.itemStyle.width = `${val}%`;
                }
            },
            isEmpty() {
                return this.hasNoData;
            },
            setLoadStatus() {
                const callback = this.loaded;
                if (callback) {
                    callback.call(this, this);
                }
            },
            initStatus() {
                this.initList.forEach((item, idx) => {
                    if (item.constructor === Function) {
                        item.call(this);
                        this.initList.splice(idx, 1);
                    }
                });
            },
            getStatus(func) {
                this.initList.push(func);
            },
            // 根据单位id获取所在组织链
            loadOrgData(deptId) {
                const that = this;
                const getOrgLevelData = (data) => {
                    let n = 0;
                    const sets = [];
                    const doRecursion = (dt) => {
                        const org = dt.organization || dt.parentOrganization;
                        if (org.parentOrganization) {
                            doRecursion(org);
                        }
                        if (org) {
                            sets[n] = [{
                                name: org.orgName,
                                id: org.id,
                            }];
                            that.orgLevelType.levelIds[n] = org.id;
                            that.levelIds[n] = org.id;
                            n += 1;
                        }
                    };
                    doRecursion(data);
                    that.disabledIdx = n;
                    return sets;
                };
                const param = this.$qs.stringify({
                    id: deptId || '-1',
                });
                this.$axios.get(`${APIList.GET_ORG_INFO_BY_DEPT_ID}?${param}`, {
                    data: {},
                }).then((response) => {
                    if (response.code === 200 && response.data) {
                        const orgs = getOrgLevelData(response.data);
                        if (that.initOrg) {
                            if (orgs.length > 1) {
                                that.orgLevelType.getData(that.orgLevelType.levelIds[0], 1);
                            } else {
                                that.handlerChange2(that.orgLevelType.levelIds[0], 1);
                            }
                            if (that.initState) {
                                if (that.initCallback) {
                                    that.initCallback();
                                }
                            }
                        }
                    }
                }).catch((response) => {
                    console.error(response);
                    console.error(response);
                });
            },
            // 一种触发数据检测的方式，不推荐！
            checkData(dt) {
                const len = dt.length;
                if (len > 0) {
                    if (dt[len - 1].hidden === undefined) {
                        dt.push({
                            hidden: true,
                        });
                    } else {
                        dt.pop();
                    }
                }
            },
        },
        watch: {
            orgTypeId(val) {
                if (val) {
                    this.init();
                }
            },
        },
    });

    export default deptPicker;
</script>

<style lang="scss" type="text/scss" scoped>
    .selector-wrap {
        select {
            &:first-child {
                margin-left: 0;
            }
        }
    }
</style>
