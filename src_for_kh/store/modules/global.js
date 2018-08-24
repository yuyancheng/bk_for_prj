/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
import { MessageBox } from 'element-ui';
import axios from 'axios';
import util from '../../lib/util';

const state = {
    // userName: localStorage.getItem('userName'),
    userName: '',
    auth: ['admin', 'user'],
};

const mutations = {
    setUserName(state, { userName }) {
        localStorage.setItem('userName', userName);
        state.userName = userName;
    },
    clearUserName() {
        localStorage.removeItem('userName');
        state.userName = '';
    },
    // 添加共享数据
    shareData(state, dt) {
        state[dt.dataName] = dt.value;
    },
};

const actions = {
    userLogin(state) {
        axios.get('/back/users/?action=login').then((res) => {
            console.log(res, 5556);
            if (res.succ === 'ok') {
                const userName = res.result.userName;
                state.commit('setUserName', { userName });
            }
        });
    },
    userLogOut(state) {
        MessageBox.confirm('你确定退出登录么？', '', {
            type: 'warning',
        }).then(() => {
            util.deleCookies();
            state.commit('clearUserName');
            window.location.href = '/api/admin/logout';
        }).catch(() => {
        });
    },
    getRoles() {
        axios.get('/api/admin/queryRoles').then((res) => {
            console.log(res);
        });
    },
};

const getters = {
    userName(state) {
        return state.userName;
    },
};
export default {
    // namespaced: true 激活命名空间
    state,
    mutations,
    actions,
    getters,
};
