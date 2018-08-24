import nodeZip from 'node-zip';

let zip = new nodeZip();

instance.interceptors.request.use((res) => {
    return res;
}, (err) => {
    console.error('请求拦截：' + err);
});

instance.interceptors.response.use((res) => {
    if (res && res.code === 403 || res && res.data && res.data.code === 403) {
        window.location.href = '/page/platform/login.html';         // 未登录，前往登录页面
    } else {
        return res;
    }
}, (err) => {
    console.error('响应拦截：' + err);
    if (err.message === 'Network Error') {
        if (localStorage) {
            localStorage.setItem('returnUrl', window.location.href);
        }
        window.location.href = '/page/platform/login.html';         // 可能未登录，前往登录页面
    }
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

                return instance.request({
                    maxRedirects: 3,
                    method: 'post',
                    url: context.state.url,
                    params: context.state.params
                }).then((res) => {
                    if (success) {
                        success(res);
                    }
                });
            })();
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
        // 设置侧边菜单
        setSideMenu (state, menu) {
            state.sideMenu = menu;
        },
        // 设置菜单索引
        setMenuIndex (state, menu) {
            state.menuIndexString = menu;
        },
        // 侧边菜单数据的回调设置方法
        setSubMenu (state, callback) {
            state.setSubMenu = callback;
        }
    }
});

export default store;
