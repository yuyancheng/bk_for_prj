<template>
    <nav class="navbar navbar-default navbar-fixed-top">
        <div class="navbar-header">
            <a class="navbar-brand" href="javascript:void(0);">
                <img src="/newAssets/img/logo.png">
                <span class="pro-version">物流版</span></a>
        </div>
        <div id="navbar" class="navbar-collapse collapse in" aria-expanded="false">
            <ul class="nav navbar-nav" id="ddt-top-left-menu">
                <li><a href="/home">首页</a></li>
                <li><a href="/page/express/realTimeOverview.html">快递分析</a></li>
                <li><a href="/page/express/inventoryWarningAnalysis.html">仓储分析</a></li>
                <li class="active"><a href="/realtime/page/dataConfig">自助取数</a></li>
                <li><a href="/battleRoom/activeConfiguration">定制工具</a></li>
            </ul>
            <ul class="nav navbar-nav navbar-right grzx-nav" style="margin-right: 0px;">
            </ul>
        </div>
    </nav>
</template>

<script type="text/ecmascript-6">

    import Vue from 'vue';

    let Nav = Vue.component('navigator', {

    });

    let Menu = new Vue({
        components: {
            menu: Nav
        }
    });

    export default Menu;

</script>

<style rel="stylesheet/sass" type="text/scss">
    @import "navi.scss";

    .nav-item {
        color: #00f;
        border: {
            top: {
                width: 1px;
                color: #444;
                style: solid;
            }
        }
    }
</style>
