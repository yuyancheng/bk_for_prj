<template lang="pug">
    div
        .cnt-header
            h3 发件
        el-main
            router-view
</template>

<script type="text/ecmascript-6">
    export default {
        data: () => ({
            defaultActive: '1',
        }),
        created() {
        },
        methods: {
            open() {},
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
    }

</style>
