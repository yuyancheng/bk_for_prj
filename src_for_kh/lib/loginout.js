import APIList from '@/assets/datas/APIList.json';
import { mapMutations } from 'vuex';

export default {
    ...mapMutations('custNo', ['setCustNo']),
    login(that, dt, success, fail) {

        that.$axios.get(`${APIList.USER_LOGIN}?${dt}`, {
        // that.$axios.get(`http://10.118.40.55:8080/login?${dt}`, {
            data: {},
            // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).then((response) => {
            if (response && response.code === 200) {
                // 获取用户信息
                that.$axios.get(APIList.USER_ACCOUNT_GETINFO, {
                // that.$axios.get('http://10.118.40.55:8080/user/ops/myinfo', {
                    data: {},
                }).then((resp) => {
                    if (resp.code === 200) {
                        const data = resp.data;
                        if (data) {
                            that.$store.commit('shareData', {
                                dataName: 'userInfo',
                                value: data,
                            });
                            if (that.$store.state.setLoginStatus) that.$store.state.setLoginStatus(true);
                            // 保存用户信息到localStorage
                            if (localStorage) {
                                localStorage.setItem('user_info', JSON.stringify(data));
                            }

                            if (success) {
                                success(data);
                            }
                        }
                    } else if (resp.data) {
                        that.$message({
                            message: resp.data.msg,
                            type: 'error',
                        });
                    } else {
                        that.$message({
                            message: resp.msg,
                            type: 'error',
                        });
                    }
                }).catch((resp) => {
                    console.error(resp);
                });
            } else if (response.data && response.data.code === 404) {
                that.$message({
                    message: '用户或密码错误！',
                    type: 'error',
                });
                if (fail) {
                    fail();
                }
            } else if (response.msg) {
                that.$message({
                    message: response.msg,
                    type: 'error',
                });
                if (fail) {
                    fail();
                }
            } else if (response.data) {
                that.$message({
                    message: response.data.msg,
                    type: 'error',
                });
                if (fail) {
                    fail();
                }
            }
        }).catch((response) => {
            console.error(response);
            if (fail) {
                fail();
            }
        });
    },
    logout(that, success, fail) {
        that.$axios.get(APIList.USER_LOGOUT, {
        // that.$axios.get('http://10.118.40.55:8080/login', {
            data: {},
        }).then((response) => {
            if (response.code === 200) {
                if (that.$store.state.setLoginStatus) that.$store.state.setLoginStatus(false);
                that.$store.state.clearUserInfo();
                if (localStorage) {
                    // 清除user_info
                    localStorage.clear('user_info');
                }
                that.setCustNo({ custNo: '全部' });
                if (success) {
                    success();
                }
                // 成功登出默认定向到“首页”
                that.$router.push({
                    name: 'home',
                });
            } else {
                console.error(response.msg);
            }
            that.isLoading = false;
        }).catch((response) => {
            if (fail) {
                fail();
            }
            console.error(response);
        });
    },
};
