<template lang="pug">
  div
    .bdp-main(style="position:relative;")
      .z-tabs
        router-link(to="/kh/data-centre/views") 综合态势
        router-link(to="/kh/data-centre/default", v-show="roleCode !== 'MANAGER'") 本级统计
        router-link(to="/kh/data-centre/specialty", v-show="roleCode === 'MANAGER' || (deptPurview === 2 && orgMaterialMark === 1)") 专业统计
      router-view.bdp-content
</template>
<script type="text/ecmascript-6">
export default {
  data: () => ({
      defaultActive: '1',
      deptPurview: '',
      orgMaterialMark: '',
      roleCode: '',
  }),
  created() {
      const userInfo = this.getUserInfo();
      if (userInfo) {
          this.roleCode = userInfo.roleCode;
          this.deptPurview = userInfo.deptPurview;
          this.orgMaterialMark = userInfo.orgMaterialMark;
      }
  },
  methods: {
      getUserInfo() {
          if (localStorage) {
              const userInfo = localStorage.getItem('user_info');
              if (userInfo) {
                  return JSON.parse(userInfo);
              }
          }
          return null;
      },
      open() {},
  },
};

</script>
<style lang="scss" type="text/scss">
.bdp-main {
  height: calc(100vh - 60px);
  overflow: auto;
  // .bdp-content {
  //   padding: 18px;
  // }
}
.z-tabs {
  a {
    display: inline-block;
    padding: 12px 10px;
    font-size: 16px;
    color: #333333;
    text-decoration: none !important;
    margin:0 18px;
      &.router-link-active{
        border-bottom: 3px solid #2FACED;
        color: #2FACED;
        font-size:18px;
      }
    }
  // padding: 10px;
  border-bottom: 1.5px solid #2FACED;
  background-color: #f5f5f5;
}

</style>
