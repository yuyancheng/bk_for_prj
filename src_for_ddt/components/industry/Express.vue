<template>
    <div>
        <div id="">{{title}}</div>
        <router-view name="logistics"></router-view>
    </div>
</template>

<script type="text/ecmascript-6">

    export default {
        data: () => {
            return {
                title: 'Express Module..'
            };
        }
    };

</script>

<style lang="scss" type="text/scss">

</style>
