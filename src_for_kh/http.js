import axios from 'axios';
import { Message } from 'element-ui';
import router from './router';
import store from './store';
import util from './lib/util';

axios.defaults.timeout = 60000;
// axios.defaults.maxRedirects = 3;

// http request 拦截器
axios.defaults.baseURL = '/kh_proxy_lzw';
// axios.defaults.baseURL = 'http://10.118.40.55:8090';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// axios.defaults.headers.common['Content-Type'] = 'charset=utf-8';

// 敏感字符转码
const html2Escape = (sHtml) => sHtml.replace(/[<>"]/g, (c) => ({
 '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[c]));

// 请求拦截
axios.interceptors.request.use((res) => {
    const r = res;
    if (r.data && (typeof r.data !== 'string')) {
        Object.keys(r.data).forEach(key => {
        if (typeof r.data[key] === 'string') {
          r.data[key] = html2Escape(r.data[key]);
        }
      });
    }
    // console.error(`请求拦截： ${err}`);
    return r;
});
let visited = false;
axios.interceptors.response.use(
    (res) => {
        let resp = res;
        // 取消lid对应的loading
        // if (res.data.code === 401) {
        //   store.commit('clearUserName');
        //   router.replace({
        //     path: '/401',
        //   });
        //   return res;
        // }
        // cas 跳转登录
        if (res.data.status === 'jump') {
            util.deleCookies();
            window.location.href = res.data.result.redirect;
        }
        // 需要登录
        if (res.data.code === 302) {
            // 清除上次登录保存的用户信息
            if (localStorage) {
                localStorage.clear('user_info');
            }
            // 弹出登录框
            if (store.state.global.loginForm) {
                store.state.global.loginForm.show();
            } else if (!visited) {
                visited = true;
                Message.error('需要登录！');
                setTimeout(() => {
                    router.push({
                        name: 'home',
                    });
                }, 500);
            }
        } else if (res.data && (res.data.msg === 'ok' || res.data.code === 200)) {
            // 正常响应
            // if (res.data.msg && res.data.msg.toLowerCase() !== 'ok') Message.success(res.data.msg);
            resp = res.data;
        } else if (res.data.code === 400 || res.data.code === 500) {
            Message.error(res.data.msg);
        } else if (res.data.msg !== 'ok') {
            // 全局统一出错处理
            if (res.data.message) {
                Message.error(res.data.message);
                return res;
            }
        }
        if (resp.config && resp.config.responseType === 'blob') {
            return resp;
        }
        resp = JSON.stringify(resp);
        // 对转义过的敏感字符进行全角替换
        return JSON.parse(resp.replace(/&amp;/gi, '&').replace(/&quot;/gi, '＂').replace(/&lt;/gi, '＜').replace(/&gt;/gi, '＞'));
    },
    (error) => {
        // console.log(error);
        if (error.message) {
            Message.error(error.message);
        } else if (error.response) {
            switch (error.response.status) {
                case 401:
                    store.commit('clearUser');
                    router.replace({
                        path: 'signIn',
                        query: {
                            redirect: router.currentRoute.fullPath,
                        },
                    });
                    break;
                case 403:
                    Message.error('没有权限');
                    break;
                case 500:
                    Message.error('系统错误');
                    break;
                default:
                    Message.error('系统错误');
                    break;
            }
        }
        return Promise.reject(error);
    });

export default axios;
