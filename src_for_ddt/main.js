// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './js/store';

Vue.config.productionTip = false;

let $router = router;

$router.prev = () => {
    router.back();
    /* let strArr = window.location.hash.split('/');
    strArr.shift();
    strArr.pop();
    // window.location.href = window.location.host + window.location.pathname + strArr.join('/');
    $router.replace('/' + strArr.join('/')); */
};

$router.reload = () => {
    router.go(0);
};

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    template: '<App/>',
    components: {App}
});
