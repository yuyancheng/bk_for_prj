/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
import axios from '../../http';

const state = {
  // custNo: localStorage.getItem('custNo') || '全部',
  // custOrgId: localStorage.getItem('custOrgId') || '',
  // deptName: localStorage.getItem('deptName') || '',
  // deptPurview: localStorage.getItem('deptPurview') || '',
  // orgMaterialMark: localStorage.getItem('orgMaterialMark') || '',
  // roleCode: localStorage.getItem('roleCode') || '',
  custNo: '全部',
  custOrgId: '',
  deptName: '',
  deptPurview: '',
  orgMaterialMark: '',
  roleCode: '',
};

const mutations = {
  setCustNo(state, { custNo }) {
    // localStorage.setItem('custNo', custNo);
    state.custNo = custNo;
  },
  setDeptPurview(state, { deptPurview }) {
    // localStorage.setItem('deptPurview', deptPurview);
    state.deptPurview = deptPurview;
  },
  setOrgMaterialMark(state, { orgMaterialMark }) {
    // localStorage.setItem('orgMaterialMark', orgMaterialMark);
    state.orgMaterialMark = orgMaterialMark;
  },
  setRoleCode(state, { roleCode }) {
    // localStorage.setItem('roleCode', roleCode);
    state.roleCode = roleCode;
  },
  setDeptName(state, { deptName }) {
    // localStorage.setItem('deptName', deptName);
    state.deptName = deptName;
  },
  setCustOrgId(state, { custOrgId }) {
    // localStorage.setItem('custOrgId', custOrgId);
    state.custOrgId = custOrgId;
  },
};

const actions = {
  getMyInfo(context) {
    axios.get('/user/ops/myinfo').then(res => {
      context.commit('setCustOrgId', { custOrgId: res.data.deptId });
      context.commit('setRoleCode', { roleCode: res.data.roleCode });
      context.commit('setOrgMaterialMark', { orgMaterialMark: res.data.orgMaterialMark });
      context.commit('setDeptPurview', { deptPurview: res.data.deptPurview });
    });
  },
};

const getters = {
  custNo(state) {
    return state.custNo;
  },
  deptName(state) {
    return state.deptName;
  },
  custOrgId(state) {
    return state.custOrgId;
  },
  orgMaterialMark(state) {
    return state.orgMaterialMark;
  },
  deptPurview(state) {
    return state.deptPurview;
  },
  roleCode(state) {
    return state.roleCode;
  },
};
export default {
    namespaced: true, // 激活命名空间
    state,
    mutations,
    actions,
    getters,
};
