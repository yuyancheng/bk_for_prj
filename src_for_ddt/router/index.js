import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/components/Home';

import logisticsRoute from '@/router/logistics';
import industryRoute from '@/router/industry';
import toolsRoute from '@/router/tools';

Vue.use(Router);

let prefix = '';
// let prefix = '/vsrc';

let routes = [
    {
        path: prefix + '/home',
        name: 'home',
        components: {
            default: Home
        }
    }
];

export default new Router({
    // mode: 'history',
    routes: routes.concat(logisticsRoute, industryRoute, toolsRoute)
});
