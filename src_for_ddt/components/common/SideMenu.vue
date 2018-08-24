<template id="main" xmlns:v-on="http://www.w3.org/1999/xhtml">
    <aside class="side-menu side-menu-fixed">
        <ul>
            <li v-for="(menu, index, key) in menuList" v-if="menu && !menu['$ref'] && menu['flag'] !== 2"
                :class="[menu.childRes && menu.childRes.length > 0 ? 'menu-folder' : 'menu-item', {'active': menu.active}]">
                <div v-if="menu.childRes && menu.childRes.length > 0">
                    <a v-on:click="setFolderStatus(menu);">
                        <span :class="['menu-icon', menu.icons]"></span>
                        <b>{{menu.resName}}</b>
                        <i class="">&#8744;</i>
                    </a>
                    <ul :class="{'show': menu.active}">
                        <li v-for="(item, idx, key) in menu.childRes" v-if="item && !item['$ref'] && item['flag'] !== 0 && item['flag'] !== 2"
                            :class="['menu-item', {'active': item.active}]">
                            <a :href="item.resUrl">
                                <span :class="[item.flag === 21 ? 'icons-status-rechargeable' : 'menu-icon ' + item.icons]"></span>
                                <b>{{item.resName}}</b>
                            </a>
                        </li>
                    </ul>
                </div>
                <a v-else :href="menu.resUrl">{{menu.resName}}</a>
            </li>
        </ul>
    </aside>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';

    let Nav = Vue.component('side-menu', {
        template: '#main',
        beforeCreate: function (bus) {
            // console.log('init');
        },
        created: function (bus) {
            this.$store.commit('setSubMenu', this.setMenuData);
            this.$store.commit('setSubMenuObject', this);
        },
        mounted: function (bus) {
        },
        methods: {
            setIndex () {
                let idx = this.$store.state.menuIndexString.split('-');
                this.folderActiveIndex = idx[1] * 1 || 0;
                this.activeIndex = idx[2] * 1 || 0;
            },
            checkPath () {
                let pathHash = window.location.hash;
                let pathSectionP = pathHash.split('/')[3];
                let pathSectionC = pathHash.split('/')[4];
                pathSectionC = pathSectionC && pathSectionC.split('?')[0];

                // let search = window.location.search;
                for (let i = 0, len = this.menuList.length; i < len; i++) {
                    if (!this.menuList[i]) break;
                    if (this.menuList[i].resCode === pathSectionP && (this.menuList[i].childRes && this.menuList[i].childRes.length === 0)) {
                        // this.folderActiveIndex = i;
                        this.menuList[i].active = true;
                    } else {
                        this.menuList[i].active = false;
                        if (this.menuList[i].childRes && this.menuList[i].childRes.length > 0) {
                            let subMenu = this.menuList[i].childRes;
                            for (let n = 0, len = subMenu.length; n < len; n++) {
                                if (!subMenu[n]) break;
                                if (subMenu[n].resCode === pathSectionC) {
                                    // this.folderActiveIndex = i;
                                    // this.activeIndex = n;
                                    this.menuList[i].active = true;
                                    subMenu[n].active = true;
                                } else {
                                    subMenu[n].active = false;
                                }
                            }
                        }
                    }
                }
            },
            setFolderStatus (item) {
                item.active = !item.active;
                item.childRes.push(null);
                // this.visible = !this.visible;
                // this.indexLiteral = idx;
                /* if (this.folderActiveIndex !== idx) {
                    this.folderActiveIndex = idx;
                    if (this.literal['i_' + idx]) {
                        this.folderActiveIndex = idx + '';
                        this.literal['i_' + idx] = false;
                    } else {
                        this.literal['i_' + idx] = true;
                    }
                } else {
                    this.folderActiveIndex = typeof (this.folderActiveIndex) === 'number' ? idx + '' : idx * 1;
                    this.literal['i_' + idx] = false;
                } */
            },
            setMenuData () {
                this.menuList = this.$store.state.sideMenu;
                this.checkPath();
            },
            refresh () {
                this.checkPath();
                this.menuList.push(null);
            }
        },
        data () {
            return {
                menuList: this.$store.state.sideMenu,
                folderActiveIndex: null,
                activeIndex: null,
                indexLiteral: null,
                literal: {
                    // ['i_' + 4]: true
                },
                visible: false,
                ddt: {
                    value: 132
                }
            };
        }
    });

    export default Nav;
</script>

<style lang="scss" type="text/scss">
    @import "navi.scss";

</style>
