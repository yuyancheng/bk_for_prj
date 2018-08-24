import Vue from 'vue';
import Vuex from 'vuex';
import global from './modules/global';
import custNo from './modules/custNo';

Vue.use(Vuex);
export default new Vuex.Store({
    modules: { global, custNo },
});
