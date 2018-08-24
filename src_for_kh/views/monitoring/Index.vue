<template lang="pug">
    div
        .cnt-header
            el-menu(
            style="height:50px;border-bottom:none;",
            :default-active="defaultActive", class="el-menu-demo", mode="horizontal")
                el-menu-item(@click="visitPage('monitoring-of-despatch')", index="1") 发运物资查询
                el-menu-item(@click="visitPage('monitoring-of-reception')", index="2") 接收物资查询
        el-main
            router-view
</template>

<script type="text/ecmascript-6">
    export default {
        data: () => ({
            defaultActive: '1',
        }),
        created() {
            const path = location.href;
            if (path.indexOf('default') !== -1) {
                this.defaultActive = '1';
            } else if (path.indexOf('reception') !== -1) {
                this.defaultActive = '2';
            } else {
                this.defaultActive = '3';
            }
        },
        methods: {
            open() {},
            visitPage(name) {
                this.$router.push({
                    name,
                });
            },
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-header {
        border-bottom: 1.5px solid #4791FF;
        background-color: #f5f5f5;
        h3 {
            padding-left: 30px;
            line-height: 48px;
            font: {
                weight: normal;
                size: 19px;
            };
            color: #565656;
        }
        .el-menu {
            background-color: transparent;
        }
    }
    .el-menu--horizontal>.el-menu-item {
        float: left;
        height: 50px;
        line-height: 50px;
        margin: 0;
        font-size: 16px;
    }
    .el-menu--horizontal>.el-menu-item.is-active {
        color: #409EFF;
        // font-size:18px;
        border-width: 4px;
    }
    .el-menu-item {
        padding: 0 30px;
    }
</style>
