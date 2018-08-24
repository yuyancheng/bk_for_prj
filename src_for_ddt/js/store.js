import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import qs from 'qs';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(Vuex);
Vue.use(ElementUI);

axios.defaults.baseURL = '/ddt2';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
let visited = false;
Vue.prototype.$axios = axios;
Vue.prototype.$qs = qs;
let instance = axios.create({
    maxRedirects: 3,
    baseURL: '/ddt2',
    timeout: 5000
});
let html2Escape = (sHtml) => {
    return sHtml.replace(/[<>&"]/g, (c) => {
        return {'<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;'}[c];
    });
};

instance.interceptors.request.use((res) => {
    for (let key in res.params) {
        if (res.params.hasOwnProperty(key) && typeof res.params[key] === 'string') {
            res.params[key] = html2Escape(res.params[key]);
        }
    }
    return res;
}, (err) => {
    console.error('请求拦截：' + err);
});

const login = () => {
    const param = qs.stringify({
        userName: 'ddtshow',
        captcha: '2222',
        channelType: 1,
        userPwd: 'j0MyDLwtPA0Ycojnmy-8wUxIlAVP3sg1tOphqgdi4sJYIwNkgyc8ZGj6_YKt2leJcBIuLJOJ91vuyofQoG1uW53EWJxB2JR6NZZCQTUz537myzWOTB3yENcFB0yEllGBZD0Vcm4vNgPxM_xhPl_A4KGLxwaVMM5JCN4MH-JvJzA'
    });
    axios.get(`/auth/login?${param}`, {
        data: {}
    }).then((response) => {
    }).catch((response) => {
    });
};

instance.interceptors.response.use((res) => {
    let status403 = res && res.code === 403 || res && res.data && res.data.code === 403;     // 未登录
    let status302 = res && res.code === 302 || res && res.data && res.data.code === 302;     // 重定向
    // console.log(res);
    if (status403 || status302) {
        login();
        // window.location.href = '/pages/platform/login.html';         // 未登录，前往登录页面
    } else if (typeof res.data !== 'object' && res.data.length > 50) {
        if (res.data.search('请求参数非法') !== -1) {
            return {
                data: {
                    message: res.data
                }
            };
        } else {
            // login();
            // window.location.href = '/pages/platform/login.html';         // 可能未登录，前往登录页面
        }
    } else {
        return res;
    }
}, (err) => {
    console.error('响应拦截：' + err);
    if (err.message === 'Network Error') {
        if (localStorage) {
            localStorage.setItem('returnUrl', window.location.href);
        }
        // login();
        // window.location.href = '/pages/platform/login.html';         // 可能未登录，前往登录页面
    } else {
        return err;
    }
});
Vue.prototype.$axios.interceptors.response.use(
    (res) => {
        let resp = res;
        if (res.data.status === 'jump') {
            // util.deleCookies();
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
                ElementUI.Message.error('需要登录！');
                setTimeout(() => {
                    this.$router.push({
                        name: 'home'
                    });
                }, 500);
            }
        } else if (res.data && (res.data.msg === 'ok' || res.data.code === 200)) {
            // 正常响应
            // if (res.data.msg && res.data.msg.toLowerCase() !== 'ok') Message.success(res.data.msg);
            resp = res.data;
        } else if (res.data.code === 400 || res.data.code === 500) {
            ElementUI.Message.error(res.data.msg);
        } else if (res.data.msg !== 'ok') {
            // 全局统一出错处理
            if (res.data.message) {
                ElementUI.Message.error(res.data.message);
                return res;
            }
        }
        if (resp.config && resp.config.responseType === 'blob') {
            return resp;
        }
        // resp = JSON.stringify(resp);
        resp = JSON.stringify(resp.data);
        // 对转义过的敏感字符进行全角替换
        return JSON.parse(resp.replace(/&amp;/gi, '&').replace(/&quot;/gi, '＂').replace(/&lt;/gi, '＜').replace(/&gt;/gi, '＞'));
    },
    (error) => {
        // console.log(error);
        if (error.message) {
            ElementUI.Message.error(error.message);
        } else if (error.response) {
            switch (error.response.status) {
                case 401:
                    store.commit('clearUser');
                    this.$router.replace({
                        path: 'signIn',
                        query: {
                            redirect: this.$router.currentRoute.fullPath
                        }
                    });
                    break;
                case 403:
                    ElementUI.Message.error('没有权限');
                    break;
                case 500:
                    ElementUI.Message.error('系统错误');
                    break;
                default:
                    ElementUI.Message.error('系统错误');
                    break;
            }
        }
        return Promise.reject(error);
    });

const store = new Vuex.Store({
    state: {
        ajax: {
            url: '/',
            params: {}
        },
        sideMenu: []
    },
    actions: {
        ajax (context) {
            return (() => {
                let success = context.state.success;
                let error = context.state.error;

                return instance.request({
                    maxRedirects: 3,
                    method: 'post',
                    url: context.state.url,
                    params: context.state.params,
                    data: context.state.data,
                    // traditional: true,
                    onUploadProgress: context.state.onUploadProgress || null,
                    onDownloadProgress: context.state.onDownloadProgress || null,
                    maxContentLength: context.state.maxContentLength || 10000
                }).then((res) => {
                    if (success) {
                        success(res);
                    }
                }, (res) => {
                    if (error) {
                        error(res);
                    }
                });
            })();
        },
        card_no_change (context, val) {
            if (context.state.onChange) {
                context.state.onChange(val);
            }
        }
    },
    mutations: {
        // 添加共享数据
        shareData (state, dt) {
            state[dt.dataName] = dt.value;
        },
        // 设置请求参数
        setAjax (state, param) {
            for (let k in param) {
                state[k] = param[k];
            }
        },
        // 设置月结卡号变更回调
        setCardNoChangeCallback (state, callback) {
            state['onChange'] = callback;
        },
        // 设置顶部菜单
        setTopMenu (state, menu) {
            state.topMenu = menu;
        },
        // 设置侧边菜单
        setSideMenu (state, menu) {
            state.sideMenu = menu;
        },
        // 设置菜单索引
        setMenuIndex (state, menu) {
            state.menuIndexString = menu;
        },
        // 刷新导航菜单
        refreshMenu (state) {
            if (state.topMenu) {
                state.topMenuObject.refresh();
            }
            if (state.sideMenu) {
                state.subMenuObject.refresh();
            }
        },
        setTopMenuObject (state, obj) {
            state.topMenuObject = obj;
        },
        setSubMenuObject (state, obj) {
            state.subMenuObject = obj;
        },
        // 侧边菜单数据的回调设置方法
        setSubMenu (state, callback) {
            state.setSubMenu = callback;
        },
        // 页面埋点
        recordVisits (state, params) {
            let ajaxSettings = {};
            let accessID;
            let href = window.location.href;
            let idxA = href.indexOf('?');
            let idxB = href.indexOf('areaCodeEmpNumber');
            if (idxA !== -1 && idxA < idxB) {
                if (href.charAt(idxB + 17) === '=') {
                    accessID = href.substring(idxB + 18).split('&')[0];
                }
            }
            if (params && accessID !== undefined && /\S+/.test(accessID)) {
                params.areaCodeEmpNumber = accessID;
            } else {
                accessID = undefined;
            }
            // 去掉url后面的查询信息
            if (params && params.url) {
                let idx = params.url.indexOf('?');
                if (idx !== -1) {
                    params.url = params.url.substring(0, idx);
                }
            }
            ajaxSettings.url = '/clickMonitor/getPageId';
            ajaxSettings.params = params;
            ajaxSettings.success = (res) => {};
            store.commit('setAjax', ajaxSettings);
            store.dispatch('ajax');
        },
        // 缓存数据
        makeDataCache (state, dt) {
            state.cachedData = dt;
        },
        // 获取缓存数据
        getCachedData (state, params) {
            return state.cachedData;
        }
    }
});

export default store;
