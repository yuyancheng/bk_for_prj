import Vue from 'vue';
import VueRouter from 'vue-router';

import Main from '@/views/Main';
import Home from '@/views/home/Home';
import PrintPage from '@/views/print/PrintPage';
import trends from '@/router/trends';
import backstage from '@/router/backstage';
import material from '@/router/material';
import monitoring from '@/router/monitoring';
import dataCenter from '@/router/dataCenter';

import App from '../App';
import store from '../store/index';
import E401 from '../components/401';
import E404 from '../components/404';
import NetErr from '../components/netErr';

Vue.use(VueRouter);

const prefix = 'kh';
const routeIndex = [{
    path: '/401',
    component: E401,
}, {
    path: '*',
    component: E404,
}, {
    path: '/network-error',
    name: 'network-error',
    component: NetErr,
},
];

const routeDefault = [
    {
        path: '/',
        name: '/',
        component: App,
        redirect: `/${prefix}`,
        children: [
            {
                path: `/${prefix}`,
                name: `${prefix}`,
                component: Main,
                redirect: `/${prefix}/home`,
                children: [
                    {
                        path: `/${prefix}/home`,
                        name: 'home',
                        component: Home,
                        meta: { title: '首页' },
                    },
                ],
            },
            {
                path: '/print-preview',
                name: 'print-preview',
                components: {
                    default: PrintPage,
                },
                meta: { title: '发运单' },
            },
        ],
    },

];

const routes = routeDefault.concat(
  routeIndex,
  trends,
  material,
  monitoring,
  dataCenter,
  backstage,
);

const router = new VueRouter({
    // mode: 'history',
    routes,
});

router.beforeEach((to, from, next) => {
    // 中止之前加入的请求
    // 权限控制
    if (to.matched.some(r => r.meta.requireAuth)) {
        if (store.state.global.auth) {
            const flag = to.meta.requireAuth.every(v => store.state.global.auth.includes(v));
            if (flag) {
                next();
            } else {
                next({
                    path: '401',
                    query: { redirect: to.fullPath },
                });
            }
            next();
        } else {
            next({
                path: '401',
                query: { redirect: to.fullPath },
            });
        }
    } else {
        next();
    }
});
router.afterEach((route) => {
    let documentTitle = '后勤物流融合网';
    route.matched.forEach((path) => {
        if (path.meta.title) {
            documentTitle += ` - ${path.meta.title}`;
        }
    });
    document.title = documentTitle;
});
export default router;
