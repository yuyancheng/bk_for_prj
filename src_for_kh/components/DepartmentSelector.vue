<template lang="pug">
    div.dept-z
        el-select(
        v-if="showOrgTypes",
        @change="handlerSelect('orgTypes')",
        v-model="orgTypesId",
        placeholder="选择类型",size="medium",
        :disabled="initData && initData.zlength > 0",
        :style="itemStyle",)
            el-option(label="全部", :value="-1")
            el-option(v-for="(it, idx) in orgTypesList", :key="idx", :label="it.orgTypeName", :value="it.id")
        span(v-if="(!custNo || custNo =='全部') && orgTypesId && orgTypesId !=-1 && orgList.length == 0",style="font-size:13px;color:#ccc;line-height:40px;") 该类型中还没有组织，请在对应的“架构管理”中添加。
        // el-select(
        //   v-if="custNo !='全部' && orgs",
        //   v-for="(org, index) in orgs", :key="'orgs'+index",
        //   :value="org.id", placeholder="选择组织", :style="itemStyle",disabled)
        //   el-option(:label="org.name", :value="org.id")
        el-select(
        @change="handlerSelect('org',index)",
        v-for="(item, index) in orgList", :key="'org'+index",
        v-show="item && item.length",size="medium",
        :disabled="initData && initData.zlength > index + 1",
        v-model="orgId[index]", placeholder="选择组织", :style="itemStyle")
          el-option(label="请选择", :value="-1")
          el-option(v-for="(it, idx) in item", :key="idx", :label="it.orgName", :value="it.id")
        el-select(
        v-if="showDeptOptions",size="medium",
        v-model="deptId", placeholder="选择单位", :style="itemStyle",:disabled="showDeptOptions && showDeptOptions=='disable'")
          el-option(label="全部单位", :value="-1")
          el-option(v-for="(it, idx) in departmentList", :key="idx", :label="it.deptName", :value="it.id")
</template>

<script >
  export default {
      props: [
        'config',
        'showOrgTypes',
        'showDeptOptions',
        'change',
        'orgs',
        'custNo',
        'orgTypeId',
        'orgTypes',
        'initData',
        'orgTypesList',
      ],
      data() {
        return {
          deptId: -1,
          departmentList: [],
          orgId: [-1],
          orgList: [],
          orgTypesId: -1,
          test: null,
          itemStyle: {
            width: '30%',
            marginRight: '1%',
          },
        };
      },
      mounted() {
        this.init();
      },
      methods: {
        getOrgTypes() {
          this.$axios.get('/organizationType/getAllValidOrgTypes').then(res => {
            if (Array.isArray(res.data.rows)) {
              this.orgTypesList = res.data.rows;
            }
          });
        },
        getDepartment(orgId) {
          const data = {
            orgId,
            pageNum: 1,
            pageSize: 1000,
          };
          this.$axios.get('/department/getDeptsWithHierarchicalOrgByOrgId', { params: data }).then(res => {
            if (Array.isArray(res.data.rows)) {
              this.departmentList = res.data.rows;
              this.deptId = this.test ? this.test : -1;
              this.test = null;
            }
          });
        },
        getOrg(type, orgTypeId, index) {
          /* eslint-disable */
          orgTypeId = orgTypeId ? orgTypeId : this.orgId[index];
          if(!orgTypeId) return;
          if(index == null) {
            this.$axios.get('/organization/getTopOrgsByOrgTypeId', { params: { orgTypeId } }).then(res => {
              if (!res.data.length) {
                this.orgList = [];
              } else {
                this.orgList = [res.data];
                this.orgId = [-1];
              }
            });
          }else{
            this.$axios.get('/organization/getSubOrgsByOrgId',{params: {orgId:orgTypeId} }).then(res=>{
              const list = [].concat(this.orgList).splice(0, index + 1);
              if (res.data.length > 0) {
                const arr = res.data ?  res.data : [];
                list.push(arr);
                this.orgId.splice(index + 1, 1, -1);
              }
              this.orgList = list;
            })
          }
        },
        handlerSelect(type, index) {
          // console.log(type, index);
          if (type === 'orgTypes') {
            const { orgTypesId } = this;
            this.getOrg(type, orgTypesId);
          } else {
            this.getOrg(type, null, index);
          }
        },
        init(){
          if(this.initData && Array.isArray(this.initData.orgList)){
            this.orgTypesId = this.initData.orgTypeId;
            this.deptId = this.initData.deptId;
            this.orgId = this.initData.orgIds;
            this.orgList = this.initData.orgList;
            this.test = this.initData.deptId;
          }else if(this.initData&&this.initData.deptId){
            this.deptId = this.initData.deptId
          }
        }
      },
      watch: {
        orgId() {
          const { orgId, orgTypesId } = this;
          const obj = orgId[orgId.length - 1] !== -1 ? orgId[orgId.length - 1] : orgId[orgId.length - 2];
          if (orgTypesId !== -1 && (!obj || obj === -1)) {
            this.getDepartment(orgTypesId);
          } else if (orgTypesId === -1) {
          } else {
            this.getDepartment(obj);
          }
          this.$emit('getResult',{result:[this.orgTypesId].concat(this.orgId),deptId:this.deptId})
        },
        orgTypeId(){
          this.orgTypesId = this.orgTypeId;
          this.getOrg('orgTypes', this.orgTypesId);
        },
        orgTypesId(){
          this.$emit('getResult',{result:[this.orgTypesId].concat(this.orgId),deptId:this.deptId})
        },
        initData(){
          this.init();
        },
        deptId(){
          this.$emit('getResult',{result:[this.orgTypesId].concat(this.orgId),deptId:this.deptId})
        },
      },
  };
</script>

<style lang="scss" type="text/scss">
.dept-z {
  display: flex;
}
</style>
