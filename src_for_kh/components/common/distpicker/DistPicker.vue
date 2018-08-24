<template lang="pug">
    .sf-dist-picker
        el-select(v-model="distData.lv_1", size="mini", placeholder="省/直辖市/自治区/特区", @change="addressChanged(0)", :style="styles.select_1")
            el-option(v-for="(opt, idx) in provinces", :key="opt.id", :label="opt.name", :value="opt.name")
        el-select(v-model="distData.lv_2", size="mini", placeholder="市/区", @change="addressChanged(1)", :style="styles.select_2")
            el-option(v-for="(opt, idx) in cities", :key="opt.id", :label="opt.name", :value="opt.name")
        el-select(v-model="distData.lv_3", size="mini", placeholder="区/镇/县", @change="addressChanged(2)", :style="styles.select_3", :disabled="isSpecial")
            el-option(v-for="(opt, idx) in districts", :key="opt.id", :label="opt.name", :value="opt.name")
        el-input(v-model="distData.lv_4", size="mini", @blur="iptBlur", :style="styles.ipt", placeholder="街道-小区-门号", @keyup.native.13="key13Down($event)")
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';
    import area from '@/assets/js/area';    // 使用本地静态地域数据

    const provinces = area.province;
    const cities = area.city;
    const districts = area.district;

    const picker = Vue.component('dist-picker', {
        props: ['change'],
        data() {
            return {
                isSpecial: false,
                provinces: [],
                cities: [],
                districts: [],
                fullDist: '',
                distData: {
                    lv_1: '',
                    lv_2: '',
                    lv_3: '',
                    lv_4: '',
                },
                styles: {
                    select_1: {
                        width: '32.5%',
                        marginRight: '1.2%',
                    },
                    select_2: {
                        width: '32.5%',
                        marginRight: '1.2%',
                    },
                    select_3: {
                        width: '32.5%',
                    },
                    ipt: {
                        width: '100%',
                        top: '0px',
                    },
                },
            };
        },
        created() {
            this.provinces = area.province;
            this.cities = [];
            this.districts = [];

            this.init();
        },
        mounted() {
            // console.log(this);
        },
        methods: {
            init() {
                const attrs = this.$vnode.data.attrs;
                if (attrs.singleLine) {
                    this.styles.select_1 = {
                        width: '16.5%',
                        marginRight: '1.5%',
                    };
                    this.styles.select_2 = {
                        width: '18%',
                        marginRight: '1.5%',
                    };
                    this.styles.select_3 = {
                        width: '18%',
                        marginRight: '1.5%',
                    };
                    this.styles.ipt = {
                        width: '43%',
                    };
                }
                this.distData.lv_1 = attrs.province || '';
                this.distData.lv_2 = attrs.city || '';
                this.distData.lv_3 = attrs.district || '';
                this.distData.lv_4 = attrs.location || '';

                if (this.distData.lv_1) {
                    this.setDefaultItem();
                } else if (attrs.address && typeof attrs.address === 'string') {
                    const distData = this.address2area(attrs.address);

                    this.distData.lv_1 = distData.lv_1 || '';
                    this.distData.lv_2 = distData.lv_2 || '';
                    this.distData.lv_3 = distData.lv_3 || '';
                    this.distData.lv_4 = distData.lv_4 || '';

                    if (this.distData.lv_1) {
                        this.setDefaultItem();
                    }
                }
            },
            setDefaultItem() {
                this.addressChanged(0, true);
                if (this.distData.lv_2) {
                    this.addressChanged(1, true);
                }
            },
            clearData() {
                this.distData.lv_1 = '';
                this.distData.lv_2 = '';
                this.distData.lv_3 = '';
                this.distData.lv_4 = '';
            },
            iptBlur() {
                const pr = this.provinces;
                const len = pr.length;
                let isSpec = false;
                for (let i = 0; i < len; i += 1) {
                    const flg = pr[i].remark === '直辖市' || pr[i].remark === '特别行政区';
                    if (this.distData.lv_1 === pr[i].name && flg) {
                        isSpec = true;
                        break;
                    }
                }
                const stA = /\S/.test(this.distData.lv_4) && /\S/.test(this.distData.lv_2) && isSpec;
                const stB = /\S/.test(this.distData.lv_4) && /\S/.test(this.distData.lv_3);

                if (this.$vnode.data.model) {
                    if (stA || stB) {
                        this.$vnode.data.model.value = this.distData.lv_4;
                        this.$vnode.data.model.callback(this.distData.lv_4);
                    } else {
                        this.$vnode.data.model.value = '';
                        this.$vnode.data.model.callback('');
                    }
                }
                if (this.change) {
                    this.change({
                        lv_1: this.distData.lv_1,
                        lv_2: this.distData.lv_2,
                        lv_3: this.distData.lv_3,
                        lv_4: this.distData.lv_4,
                    }, this.isSpecial);
                }
            },
            key13Down() {
            },
            addressChanged(idx, keep) {
                let pId = '';
                let cId = '';
                const city = [];
                const district = [];

                switch (idx) {
                    case 0:

                        if (!keep) {
                            this.distData.lv_2 = '';
                            this.distData.lv_3 = '';
                        }

                        for (let i = 0, len = provinces.length; i < len; i += 1) {
                            if (this.distData.lv_1 === provinces[i].name) {
                                pId = provinces[i].id;
                                if (provinces[i].remark === '直辖市' || provinces[i].remark === '特别行政区') {
                                    this.isSpecial = true;
                                } else {
                                    this.isSpecial = false;
                                }
                            }
                        }

                        for (let i = 0, len = cities.length; i < len; i += 1) {
                            if (cities[i].pid === pId) {
                                city.push({
                                    id: cities[i].id,
                                    name: cities[i].name,
                                });
                            }
                        }

                        for (let i = 0, len = districts.length; i < len; i += 1) {
                            if (districts[i].cid === cId) {
                                district.push({
                                    id: districts[i].id,
                                    name: districts[i].name,
                                });
                            }
                        }

                        this.districts = district;

                        this.cities = city;
                        break;
                    case 1:
                        if (!keep) {
                            this.distData.lv_3 = '';
                        }

                        for (let i = 0, len = cities.length; i < len; i += 1) {
                            if (this.distData.lv_2 === cities[i].name) {
                                cId = cities[i].id;
                            }
                        }
                        for (let i = 0, len = districts.length; i < len; i += 1) {
                            if (districts[i].cid === cId) {
                                district.push({
                                    id: districts[i].id,
                                    name: districts[i].name,
                                });
                            }
                        }

                        this.districts = district;
                        break;
                    case 2:
                        break;
                    default:
                        break;
                }

                // this.iptBlur();
                this.fullDist = `${this.distData.lv_1}${this.distData.lv_2}${this.distData.lv_3}${this.distData.lv_4}`;
                // console.log(this.fullDist);
                if (this.change) {
                    this.change({
                        lv_1: this.distData.lv_1,
                        lv_2: this.distData.lv_2,
                        lv_3: this.distData.lv_3,
                        lv_4: this.distData.lv_4,
                    }, this.isSpecial);
                }
            },
            address2area(address) {
                const addStr = address;

                const idxA = addStr.indexOf('省');
                const idxB = addStr.indexOf('自治区');
                const idxC = addStr.indexOf('特别行政区');

                const idxD = addStr.indexOf('市');
                const idxE = addStr.indexOf('自治州');
                const idxF = addStr.indexOf('地区');
                const idxG = addStr.indexOf('盟');

                let idxH = addStr.indexOf('区');
                const idxI = addStr.indexOf('县');
                const idxJ = addStr.indexOf('旗');
                const idxK = addStr.indexOf('市');

                let pIndex;
                let pLen;
                let cIndex;
                let cLen;
                let dIndex;
                let dLen;
                if (idxA !== -1) {
                    pIndex = idxA;
                    pLen = 1;
                } else if (idxB !== -1) {
                    pIndex = idxB;
                    pLen = 3;
                } else if (idxC !== -1) {
                    pIndex = idxC;
                    pLen = 5;
                    if (idxH !== -1) {
                        idxH = addStr.indexOf('区', idxH + 1);
                    }
                } else {
                    pIndex = -1;
                }

                if (idxD !== -1) {
                    cIndex = idxD;
                    cLen = 1;
                } else if (idxE !== -1) {
                    cIndex = idxE;
                    cLen = 3;
                } else if (idxF !== -1) {
                    cIndex = idxF;
                    cLen = 2;
                } else if (idxG !== -1) {
                    cIndex = idxG;
                    cLen = 1;
                } else {
                    cIndex = -1;
                }

                if (idxH !== -1) {
                    dIndex = idxH;
                    dLen = 1;
                } else if (idxI !== -1) {
                    dIndex = idxI;
                    dLen = 1;
                } else if (idxJ !== -1) {
                    dIndex = idxJ;
                    dLen = 1;
                } else if (idxK !== -1) {
                    dIndex = idxK;
                    dLen = 1;
                } else {
                    dIndex = -1;
                }

                if (dIndex !== -1) {
                    if (idxF !== -1) {
                        dIndex = addStr.substring(idxF + pLen).indexOf('区');
                    } else if (idxB !== -1) {
                        dIndex = addStr.substring(idxB + pLen).indexOf('区');
                    } else if (idxC !== -1) {
                        dIndex = addStr.substring(idxC + pLen).indexOf('区');
                    }
                }

                const province = addStr.substring(0, pIndex + pLen);
                const city = addStr.substring(pIndex + pLen, cIndex + cLen);
                const district = addStr.substring(cIndex + cLen, dIndex + dLen);
                const addressStr = (dIndex !== -1 ? addStr.substring(dIndex + dLen) : '');

                if (province) {
                    return {
                        lv_1: province, lv_2: city, lv_3: district, lv_4: addressStr,
                    };
                }
                return {
                    lv_1: city, lv_2: district, lv_3: '', lv_4: addressStr,
                };
            },
            resetDistData() {
                this.init();
            },
            getDistData() {
                return { fullDist: this.fullDist, distData: this.distData };
            },
        },
    });

    export default picker;

</script>

<style lang="scss" type="text/scss">

    .sf-dist-picker {

    }

</style>
