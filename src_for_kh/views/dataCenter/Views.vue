<template lang="pug">
  div.static-main
    el-row
      el-col(:span="12")
        bdp-panel
          div.text-head(slot="header")
            .title 全国运单概览
            .fr
              a(@click="doConfig('waybill-qty-overview')") 配置
              router-link(to="/views/dv",target="_blank") 查看大屏
          img(src="../../assets/da/pn0.jpg")
      el-col(:span="12")
        bdp-panel
          div.text-head(slot="header")
            .title 在运状态监控
            .fr
              a(@click="doConfig('waybill-status-monitor')") 配置
              router-link(to="/views/ts",target="_blank") 查看大屏
          img(src="../../assets/da/pn1.jpg")
      el-col(:span="12")
        bdp-panel
          div.text-head(slot="header")
            .title 配送分析
            .fr
              a(@click="doConfig('waybill-despatch-analysis')") 配置
              router-link(to="/views/da",target="_blank") 查看大屏
          img(src="../../assets/da/pn2.jpg")
      el-col(:span="12")
        bdp-panel
          div.text-head(slot="header")
            .title 流向分析
            .fr
              a(@click="doConfig('waybill-flow-analysis')") 配置
              router-link(to="/views/vw",target="_blank") 查看大屏
          img(src="../../assets/da/pn3.png")
    el-dialog(title="配置",:visible.sync="groupsVisable",@close="resetFields('searchForm')")
      el-form(ref="searchForm",:model="searchForm",label-width="120px",:rules="searchFormRules")
        el-form-item.sfCommens(label="开始时间",prop="startTm",size="medium")
          el-date-picker(v-model="searchForm.startTm")
        el-form-item.sfCommens(label="截止时间",size="medium")
          el-date-picker(v-model="searchForm.endTm", placeholder="为空表示至今")
        // span(style="position: absolute;top: 39px;font-size: 12px;right: 260px;color: #999;") 为空表示至今
        el-form-item(label="发运单位类型",v-show="orgMaterialMark == 1 || roleCode == 'MANAGER'")
          el-radio-group(v-model="searchForm.senderOrgTypeId")
            el-radio(:label="-1") 全部
            el-radio(v-for="item in orgTypesList",:label="item.id",:key="item.id") {{item.orgTypeName}}
        el-form-item(label="发运单位",v-show="searchForm.senderOrgTypeId != -1")
          dept-select(
            :initData="initData",
            :orgTypeId="searchForm.senderOrgTypeId",
            :showDeptOptions="orgMaterialMark == 2 && deptPurview == 1 ? 'disable': true",
            :config="{width:'80%'}",
            @getResult="itemChanged",
          )
        el-form-item(label="接收单位类型")
          el-radio-group(v-model="searchForm.receiverOrgTypeId")
            el-radio(:label="-1") 全部
            el-radio(v-for="item in orgTypesList",:label="item.id",:key="item.id") {{item.orgTypeName}}
        el-form-item(label="接收单位",v-show="searchForm.receiverOrgTypeId != -1")
          dept-select(
            :orgs="orgsRe",
            :initData="initDataRe",
            :orgTypeId="searchForm.receiverOrgTypeId",
            :showDeptOptions="true",
            :config="{width:'30%'}",
            @getResult="itemChangedRe")
        .inline
          el-form-item(label="专业")
            el-select(v-model="searchForm.specialtyId",:disabled="!!specialtyId",placeholder="选择专业",size="medium",@change="changeList1('materialList','searchForm')")
              el-option(label="全部专业", :value="-1")
              el-option(v-for="(it, idx) in materialList.list1", :key="idx", :label="it.name", :value="it.id")
          el-form-item(label="类别")
            el-select(v-model="searchForm.categoryId",:disabled="!!categoryId", placeholder="选择类别",size="medium", style="margin-left:10px;",@change="changeList2('materialList','searchForm')")
              el-option(label="全部类别", :value="-1")
              el-option(v-for="(it, idx) in materialList.list2", v-if="materialList.list4.length === 0",:key="idx", :label="it.name", :value="it.id")
              el-option(v-for="(it, idx) in materialList.list4", v-if="materialList.list4.length > 0", :key="idx", :label="it.name", :value="it.id")
          el-form-item(label="品名")
            el-select(v-model="searchForm.goodsId", placeholder="选择类别",size="medium", style="margin-left:10px;")
              el-option(label="全部品名", :value="-1")
              el-option(v-for="(it, idx) in materialList.list3", :key="idx", :label="it.goodsName", :value="it.id")
        el-form-item(label="发件城市",v-if="type=='waybill-flow-analysis'",prop="startCity",size="medium")
          el-select(v-model="searchForm.startCity",filterable)
            el-option(label="全部", value="全部")
            el-option(v-for="item in citys",:key="item",:label="item",:value="item")
      .dialog-footer(slot="footer", style="text-align:center;")
        el-button.btn-default(@click="groupsVisable = false", style="width:80px", size="small", round) 取消
        el-button.btn-primary(type="primary",@click="saveGroups", style="width:80px", size="small", round) 确定
</template>
<script>
import moment from 'moment';
import BdpPanel from '@/components/bdpPanel';
import deptSelect from '@/components/DepartmentSelector';
import { mapGetters, mapMutations } from 'vuex';
// import qs from 'qs';
import util from '../../lib/util';

export default {
  components: {
    'bdp-panel': BdpPanel,
    'dept-select': deptSelect,
  },
  computed: {
    ...mapGetters('custNo',
    {
      custNo: 'custNo',
    }),
  },
  data() {
    return {
      // orgMaterialMark: 2,
      // deptPurview: 2,
      // roleCode: 'default',
      // categoryHide: true, // 是否可选专业
      // CategoryInfo
      specialtyId: '',
      categoryId: '',
      custOrgId: '',
      orgMaterialMark: '',
      deptPurview: '',
      roleCode: '',
      type: '',
      citys: util.getCity(),
      groupsVisable: false,
      hostGroups: {},
        swotForm: {
        timeStart: '',
        timeEnd: '',
        re1: '',
        re2: '',
        specialtyId: -1,
        categoryId: -1,
        orgTypeId: -1,
        receiverOrgTypeId: -1,
        accept: -1,
      },
      orgsAll: [],
      orgsRe: [],
      initData: {
      },
      initDataRe: {
      },
      orgLists: [],
      ids: [],
      orgTypesList: [],
      orgTypeId: -1,
      materialList: {
        list1: [],
        list2: [],
        list3: [],
        list4: [], // 业务处选项
      },
      goodsList: {},
      searchForm: {
        startTm: '',
        endTm: '',
        senderOrgId: -1,
        receiverOrgId: -1,
        // senderOrgTypeId: -1,
        goodsId: -1,
        senderDeptId: -1,
        receiverDeptId: -1,
        specialtyId: -1,
        categoryId: -1,
        senderOrgTypeId: -1,
        receiverOrgTypeId: -1,
        startCity: '',
      },
      searchFormRules: {
        startTm: [
            { required: true, message: '请填写开始时间', trigger: 'blur' },
        ],
        startCity: [
            { required: false, message: '请选择城市', trigger: 'blur' },
        ],
      },
    };
  },
  async mounted() {
    const $vm = this;
    await this.getMyInfo();
    await this.$axios.post('/baseDict/getGoodsData').then(res => {
      const obj = {};
      const arr = [];
      if (Array.isArray(res.data)) {
        res.data.forEach(v => {
          arr.push({ name: v.name, id: v.id });
          const obj2 = {
            list: v.childrens,
          };
          v.childrens.forEach(vv => {
            obj2[vv.id] = vv.goods;
          });
          obj[v.id] = obj2;
        });
        $vm.goodsList = obj;
        $vm.materialList.list1 = arr;
        $vm.materialList.list2 = [];
        $vm.materialList.list3 = [];
      }
    });
    if (this.orgMaterialMark === 1 && this.roleCode !== 'MANAGER') {
      const re = await this.$axios.post('/baseDict/getCategoryInfo');
      if (re.data) {
        const categoryInfo = re.data;
        if (categoryInfo.specialtyId === '-1') {
          this.specialtyId = '';
        } else {
          this.specialtyId = parseInt(categoryInfo.specialtyId, 10);
          if (categoryInfo.categoryId === '-1') {
            this.categoryId = '';
          } else {
            const arr = categoryInfo.categoryId.split(',');
            if (arr.length === 1) {
              this.categoryId = parseInt(categoryInfo.categoryId, 10);
            } else {
                const array = [].concat(this.goodsList[this.specialtyId].list);
                const list4 = [];
                array.forEach(v => {
                  if (arr.includes(v.id.toString())) {
                    list4.push(v);
                  }
                });
                this.materialList.list4 = list4;
            }
          }
        }
      }
    }
    await this.getOrgTypes();
    const id = this.custOrgId;
    this.$axios.get('/department/getDeptWithHierarchicalOrgById', { params: { id } }).then(res => {
      if (res.data) {
        const orgTypeId = res.data.orgTypeId;
        const org = res.data.organization;
        if (!org) return;
        const orgs = util.getOrganization(org, []);
        orgs.reverse();
        this.orgsAll = orgs.concat([{ name: res.data.deptName, id }]);
        // console.log(orgTypeId);
        this.orgTypeId = orgTypeId;
      }
    });
  },
  methods: {
    ...mapMutations('custNo', ['setRoleCode']),
    async getMyInfo() {
      const res = await this.$axios.get('/user/ops/myinfo');
      this.custOrgId = res.data.deptId ? res.data.deptId : -1;
      this.roleCode = res.data.roleCode;
      this.orgMaterialMark = res.data.orgMaterialMark;
      this.deptPurview = res.data.deptPurview;
      this.setRoleCode({ roleCode: res.data.roleCode });
    },
    async getOrgs(id, tId) {
      const res = await this.$axios.get('/organization/getAscendingOrgById', { params: { id } });
      // if (!res.data.parentOrganization) return null;
      const orgTypeId = res.data.orgTypeId;
      let orgIds = [];
      if (res.data.parentOrganization) {
        orgIds = util.getOrganization(res.data.parentOrganization, []);
      }
      orgIds = orgIds.reverse().map(v => v.id);
      orgIds.push(id);
      const ids = [].concat(orgIds);
      let orgList = [];
      if (!tId) {
        orgList = await this.getOrgList(ids, orgTypeId);
      } else {
        ids.unshift(tId);
        orgList = await this.getOrgList(ids);
      }
      orgIds.push(-1);
      return {
        orgIds,
        orgTypeId,
        orgList,
      };
    },
    async getOrgList(orgs, orgTypeId) {
      /* eslint-disable */
      const orgList = [];
      if(orgTypeId){
        const dt = await this.$axios.get('/organization/getTopOrgsByOrgTypeId', { params: { orgTypeId: orgTypeId } });
        orgList.push(dt.data);
        // console.log(dt);
      }
      for (let i = 0; i < orgs.length; i += 1) {
        const res = await this.$axios.get('/organization/getSubOrgsByOrgId', { params: { orgId: orgs[i] } });
        orgList.push(res.data);
      }
      return orgList;
    },
    getOrgTypes() {
      this.$axios.get('/organizationType/getAllValidOrgTypes').then(res => {
        if (Array.isArray(res.data.rows)) {
          this.orgTypesList = res.data.rows;
        }
      });
    },
    resetFields(type) {
      this.$refs[type].resetFields();
    },
    async doConfig(str) {
      this.groupsVisable = true;
      this.type = str;
      const res = await this.$axios.get('/screen/config/get', { params: { screenCode: str } });
      if(res.data&&res.code == 200) {
        if(this.type=='waybill-flow-analysis') {
          this.searchForm.startCity = res.data.startCity;
        }
        this.searchForm.specialtyId = res.data.specialtyId ? res.data.specialtyId : -1;
        if(this.specialtyId){
          this.searchForm.specialtyId = this.specialtyId;
        }
        if(this.searchForm.specialtyId != -1) {
          this.changeList1('materialList', 'searchForm');
        }
        this.searchForm.categoryId = res.data.categoryId ? res.data.categoryId : -1;
        if(this.categoryId){
          this.searchForm.categoryId = this.categoryId;
        }
        if(this.searchForm.categoryId != -1){
          this.changeList2('materialList', 'searchForm');
        }
        this.searchForm.goodsId = res.data.goodsId ? res.data.goodsId : -1;
        this.searchForm.startTm = res.data.startTm;
        this.searchForm.endTm = res.data.endTm ? res.data.endTm : '';
        this.searchForm.receiverOrgTypeId = res.data.receiverOrgTypeId ? res.data.receiverOrgTypeId : -1;
        this.searchForm.senderOrgTypeId = res.data.senderOrgTypeId ? res.data.senderOrgTypeId: -1;
        res.data.receiverOrgId =  res.data.receiverOrgId ? res.data.receiverOrgId:-1;
        res.data.senderOrgId =  res.data.senderOrgId ? res.data.senderOrgId:-1;
        res.data.receiverDeptId =  res.data.receiverDeptId ? res.data.receiverDeptId:-1;
        res.data.senderDeptId =  res.data.senderDeptId ? res.data.senderDeptId:-1;
        if(res.data.receiverOrgId && res.data.receiverOrgId != -1) {
          let receive = await this.getOrgs(res.data.receiverOrgId);
          receive = receive ? receive : {
          };
          receive.deptId = res.data.receiverDeptId;
          this.initDataRe = receive;
        }
        //全部的状态
        if(res.data.senderOrgId && res.data.senderOrgId != -1){
          if(this.orgMaterialMark == 2 && this.roleCode != "MANAGER"){
            if(this.deptPurview == 2) {
              let sender = await this.getOrgs(res.data.senderOrgId);
              sender = sender ? sender : {
              };
              sender.deptId = res.data.senderDeptId;
              this.searchForm.senderOrgTypeId = this.orgTypeId;
              sender.zlength = this.orgsAll.length - 1;
              this.initData = sender;
            }
            if(this.deptPurview == 1){
              this.searchForm.senderOrgTypeId = this.orgTypeId;
              this.searchForm.senderOrgId = this.orgsAll[this.orgsAll.length -2].id;
              let sender = await this.getOrgs(this.searchForm.senderOrgId);
              sender = sender ? sender : {
              };
              sender.deptId = this.orgsAll[this.orgsAll.length - 1].id;
              sender.zlength = this.orgsAll.length;
              // this.searchForm.senderOrgTypeId = sender.orgTypeId ? sender.orgTypeId:-1;
              this.searchForm.senderDeptId = sender.deptId ? sender.deptId : -1;
              this.initData = sender;
            }
          }else{
            let sender = await this.getOrgs(res.data.senderOrgId);
            sender = sender ? sender : {
            };
            // console.log(sender);
            sender.deptId = res.data.senderDeptId;
            this.initData = sender;
          }
        }
      }else {
        this.searchForm.startTm = '';
        this.searchForm.endTm = '';
        this.searchForm.goodsId = -1;
        this.searchForm.receiverOrgTypeId = -1;
        if(this.specialtyId){
          this.searchForm.specialtyId = this.specialtyId;
          this.changeList1('materialList', 'searchForm');
        }else {
          this.searchForm.specialtyId =  -1;
        }
        if(this.categoryId){
          this.searchForm.categoryId = this.categoryId;
          this.changeList2('materialList', 'searchForm');
        }else {
          this.searchForm.categoryId =  -1;
        }
        if(this.custOrgId != -1) {
          this.searchForm.senderOrgTypeId = this.orgTypeId;
          const id = this.orgsAll[this.orgsAll.length - 2];
          const sender = await this.getOrgs(id.id);
          sender.deptId = this.custOrgId;
          if(this.orgMaterialMark == 2 && this.roleCode != "MANAGER"){
            sender.zlength = this.orgsAll.length;
            if(this.deptPurview == 2) {
              sender.zlength = sender.zlength - 1;
            }
          }
          this.initData = sender;
        }else {
          this.searchForm.senderOrgTypeId = -1;
        }
      }
    },
    changeList1(name, formName) {
      const $vm = this;
      const { goodsList } = $vm;
      const key = $vm[formName].specialtyId;
      if (goodsList[key]) {
        $vm[name].list2 = goodsList[key].list;
      } else {
        $vm[name].list2 = [];
      }
      $vm[formName].categoryId = -1;
      $vm[formName].goodsId = -1;
      $vm[name].list3 = [];
    },
    changeList2(name, formName) {
      const $vm = this;
      const { goodsList } = $vm;
      const key = $vm[formName].specialtyId;
      const good = $vm[formName].categoryId;
      if (goodsList[key] && goodsList[key][good]) {
        $vm[name].list3 = goodsList[key][good];
      } else {
        $vm[name].list3 = [];
      }
      $vm[formName].goodsId = -1;
    },
    itemChanged(dt) {
      if (!dt) return;
      const { deptId,result } = dt;
      let data = -1;
      if(result.indexOf(-1) != -1) {
        for(let i=0;i<result.length;i+=1){
          if(result[i] == -1){
            if(i > 1) data = result[i-1];
            break;
          }
        }
      }else {
        data = result[result.length -1];
      }
      this.searchForm.senderDeptId = deptId;
      this.searchForm.senderOrgId = data;
    },
    itemChangedRe(dt) {
      if (!dt) return;
      const { deptId,result } = dt;
      let data = -1;
      if(result.indexOf(-1) != -1) {
        for(let i=0;i<result.length;i+=1){
          if(result[i] == -1){
            if(i > 1) data = result[i-1];
            break;
          }
        }
      }else {
        data = result[result.length -1];
      }
      this.searchForm.receiverDeptId = deptId;
      this.searchForm.receiverOrgId = data;
    },
    saveGroups() {
        this.$refs.searchForm.validate((vaild) => {
          if (vaild) {
            const obj = Object.assign({}, this.searchForm);
            obj.startTm  = moment(this.searchForm.startTm).format('YYYY-MM-DD HH:mm:ss');
            if(obj.endTm){
              obj.endTm  = moment(this.searchForm.endTm).format('YYYY-MM-DD HH:mm:ss');
            }
            if(obj.endTm && obj.endTm < obj.startTm) {
              this.$message.warning("开始时间应小于等于结束时间");
              return;
            }
            obj.screenCode = this.type;
            if(obj.receiverOrgTypeId == -1){
              delete obj.receiverDeptId;
              delete obj.receiverOrgId;
            }
            if(obj.senderOrgTypeId == -1){
              delete obj.senderDeptId;
              delete obj.senderOrgId;
            }
            // 删除普通用户选项
            // if(this.deptPurview == 1){
            //   delete obj.senderOrgId
            //   delete obj.senderDeptId
            // }
            Object.keys(obj).forEach(k=>{
              if(obj[k] == -1){
                delete obj[k]
              }
            })
            this.$axios.post('/screen/config/save',obj).then(res => {
              if (res.code === 200) {
                this.$message.success('保存成功');
                this.groupsVisable = false;
              }
            });
          }
        });
    },
  },
};
</script>
<style lang="scss">

.static-main {
  .text-head {
    display: flex;
    width: 100%;
    justify-content: space-between;
    .title {
      margin:0;
    }
    .fr {
      a {
        text-decoration: none;
        cursor: pointer;
        display: inline-block;
        margin: 0 9px;
        color: $pr;
      }
    }
  }
  .panel-body {
    img {
      width: 100%;
    }
  }
  padding: 20px;
  .el-dialog {
      width: 800px;
      .el-radio-group {
        min-height: 40px;
      }
      .el-radio {
        line-height: 40px;
        margin: 0 18px 0 0 !important;
        font-weight: normal;
      }
    }
    .inline {
    display: flex;
  }
    .sfCommens{
      width: 40%;
      display: inline-block;
    }
    .el-dialog__footer{
      text-align: right;
    }
}
</style>

