<template lang="pug">
    div
        .cnt-header
            h3 物资类别管理
        router-view(v-if="isAdmin", :key="routerKey")
</template>

<script type="text/ecmascript-6">
    export default {
        data() {
            return {
                isAdmin: false,
            };
        },
        computed: {
            routerKey() {
                const hash = decodeURIComponent(this.$router.history.current.hash);
                const key = `${this.$route.path}${hash}`;
                return key;
            },
        },
        components: {},
        created() {
            if (!this.$store.state.global.isAdmin) {
                this.isAdmin = false;
                this.$alert('非管理员角色，不能访问此页！', {
                    confirmButtonText: '确定',
                    type: 'warning',
                }).then(() => {
                });
            } else {
                this.isAdmin = true;
            }
        },
        mounted() {},
        methods: {
        },
    };

</script>

<style lang="scss" type="text/scss" scoped>

    .cnt-wrapper {
        padding: 0 30px 20px;
        background-color: #FFF;
    }
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
    .el-menu-item {
        padding: 0 15px;
    }
    .opr-btns {
        display: inline-block;
        > .el-button {
            width: 90px;
        }
    }
</style>
