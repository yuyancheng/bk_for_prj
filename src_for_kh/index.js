// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import ElementUI from 'element-ui';
import qs from 'qs';
// import echarts from 'echarts';

import 'element-ui/lib/theme-chalk/index.css';
import './assets/style.scss';
// import 'font-awesome/css/font-awesome.css';
// import 'animate.css';

// import '../static/css/font-awesome.css';
import 'echarts/map/js/china-contour';
import router from './router';
import store from './store';
import axios from './http';
import App from './App';
import Mock from './store/mockDt';
import sfTable from './components/sfTable';
import bdpCharts from './components/bdpCharts';

const echarts = require('echarts');
// require('vue2-scrollbar/dist/style/vue2-scrollbar.css');
// require('echarts/map/js/china.js');
const chinaJson = require('echarts/map/json/china.json');

echarts.registerMap('china', chinaJson);
require('echarts-gl');

Vue.config.productionTip = false;
Vue.prototype.$echarts = echarts;
window.echarts = echarts;
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
Vue.use(Vuex);
Vue.use(ElementUI);
Vue.component('sf-table', sfTable);
Vue.component('bdp-charts', bdpCharts);

// Vue.use(VueScrollbar);

// axios.defaults.baseURL = '/kh_proxy_rap';    // 用于本地反向代理，打包发布时需要注释此行代码
if (Mock) {
    // Vue.prototype.$axios = Mock;            // 是否使用本地mock数据，打包发布时需要注释此行代码
}

/* eslint-disable no-new */
// new PerfectScrollbar('#app');
new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App),
});

