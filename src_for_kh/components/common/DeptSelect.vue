<template lang="pug">
    span
        el-select(
        @change="orgLevelChange(index + 1, unitSearchForm.curOrgId[index])",
        v-for="(item, index) in unitSearchForm.unitFilters", :key="index",
        v-model="unitSearchForm.curOrgId[index]", placeholder="请选择", :style="itemStyle")
            el-option(label="全部", value="")
            el-option(v-for="(it, idx) in item", :key="idx", :label="it.name", :value="it.id")

</template>

<script type="text/ecmascript-6">
  import APIList from '@/assets/datas/APIList.json';

  export default {
      data() {
          const that = this;
          return {
              hasNoData: true,
              wTypePx: false,
              currentDeptId: '',
              orgFirstLevelId: '',
              initList: [],
              unitSearchForm: {
                  unitFilters: [],
                  curOrgId: [],
                  curOrg: [],
                  keyword: '',
                  getData(id) {
                      const orgTypeList = [];
                      let num = 1;

                      that.orgLevelHead = [];
                      const makeLists = (dt) => {
                          that.orgLevelHead.push({
                              headName: dt.levelName,
                              propName: `prop_${num}`,
                          });
                          if (dt.subLevel && dt.subLevel.levelName) {
                              num += 1;
                              makeLists(dt.subLevel);
                          }
                          orgTypeList.push([]);
                          // that.unitSearchForm.unitFilters = orgTypeList;
                      };
                      const dt = that.$qs.stringify({
                          orgTypeId: that.orgTypeId,
                      });

                      that.$axios.get(`${APIList.GET_ORG_LEVEL}?${dt}`, {
                          data: {},
                      }).then((response) => {
                          const data = response.data;
                          if (data && data.levelName) {
                              that.orgFirstLevelId = data.id;
                              makeLists(data);
                              that.orgLevelType.getData(id, 0);
                          } else {
                              that.initStatus();
                          }
                      }).catch((response) => {
                          console.error(response);
                      });
                  },
              },
              orgLevelType: {
                  levelIds: [],
                  curOrgId: '',
                  keyword: '',
                  getData(id, idx) {
                      const setFilterList = (dt) => {
                          const arr = [];
                          // const len = that.unitSearchForm.unitFilters.length;
                          // that.unitSearchForm.unitFilters.splice(idx, len);
                          for (let i = 0; i < dt.length; i += 1) {
                              arr.push({
                                  id: dt[i].id,
                                  name: dt[i].orgName,
                                  order: dt[i].sequence,
                                  parentId: dt[i].parentOrgId,
                                  orgTypeId: dt[i].orgTypeId,
                              });
                          }

                          that.unitSearchForm.unitFilters.push(arr);
                      };
                      if (idx === 0) {
                          const data = that.$qs.stringify({
                              orgTypeId: that.orgTypeId,
                          });
                          that.$axios.get(`${APIList.GET_TOP_ORG_LEVEL}?${data}`, {
                              data: {},
                          }).then((response) => {
                              const dt = response.data;
                              if (dt.constructor === Array && dt.length > 0) {
                                  setFilterList(dt);
                                  that.hasNoData = false;
                              } else {
                                  that.hasNoData = true;
                              }
                              // that.initStatus();
                              that.setItemWidth();
                          }).catch((response) => {
                              console.error(response);
                          });
                      } else {
                          const data = that.$qs.stringify({
                              orgId: id,
                          });
                          that.$axios.get(`${APIList.GET_SUB_ORG_LEVEL}?${data}`, {
                              data: {},
                          }).then((response) => {
                              const dt = response.data;
                              if (dt.constructor === Array && dt.length > 0) {
                                  setFilterList(dt);
                              }
                              that.setItemWidth();
                          }).catch((response) => {
                              console.error(response);
                          });
                      }
                  },
              },
              width: 90,
              itemStyle: {
                  width: '100%',
                  marginRight: '1%',
              },
          };
      },
      components: {},
      created() {
          this.unitType = decodeURIComponent(this.$router.history.current.hash.substring(1));
          this.orgTypeId = decodeURIComponent(this.$router.history.current.query.type_id || '');

          if (this.orgTypeId) {
              this.init();
          }
      },
      mounted() {},
      methods: {
          init() {
              const attrs = this.$vnode.data.attrs;
              if (attrs) {
                  const config = attrs.config;
                  if (config) {
                      const w = config.width;
                      if (w && w.indexOf('%') !== -1) {
                          this.wTypePx = false;
                      } else if (w && w.indexOf('px') !== -1) {
                          this.wTypePx = true;
                      }
                      this.width = window.parseInt(w);
                  }
              }
              this.unitSearchForm.getData(this.orgTypeId);
          },
          orgLevelChange(idx, id) {
              this.unitSearchForm.unitFilters.splice(idx, 100);
              this.orgLevelType.levelIds.splice(idx - 1, 100);

              if (id) {
                  this.orgLevelType.getData(id, idx);
                  this.curOrgId = id;
                  this.orgLevelType.levelIds.push(id);
              } else {
                  this.setItemWidth();
                  this.curOrgId = id;
              }

              const dt = this.unitSearchForm.curOrgId;
              for (let i = idx; i < dt.length; i += 1) {
                  this.unitSearchForm.curOrgId[i] = '';
              }
              const attrs = this.$vnode.data.attrs;
              if (attrs) {
                  const callback = attrs.change;
                  if (callback) {
                      const len = this.orgLevelType.levelIds.length;
                      callback.call(this, this.orgLevelType.levelIds[len - 1] || '');
                  }
              }
          },
          clearData() {
              this.unitSearchForm.unitFilters = [];
              this.orgLevelType.levelIds = [];
          },
          getCurrentId() {
              const len = this.orgLevelType.levelIds.length;
              return this.orgLevelType.levelIds[len - 1];
          },
          getIds() {
              return this.orgLevelType.levelIds;
          },
          setItemWidth() {
              const len = this.unitSearchForm.unitFilters.length;
              if (this.wTypePx) {
                  let val = (100 - len) / (len);
                  if (val > 30) {
                      val = 30;
                  }
                  this.itemStyle.width = `${val}%`;
              } else {
                  let val = (this.width - len) / (len);
                  if (val > 30) {
                      val = 30;
                  }
                  this.itemStyle.width = `${val}%`;
              }
          },
          isEmpty() {
              return this.hasNoData;
          },
          initStatus() {
              this.initList.forEach((item, idx) => {
                  if (item.constructor === Function) {
                      item.call(this);
                      this.initList.splice(idx, 1);
                  }
              });
              const attrs = this.$vnode.data.attrs;
              if (attrs) {
                  const callback = attrs.loaded;
                  if (callback) {
                      callback.call(this, this);
                  }
              }
          },
          getStatus(func) {
              this.initList.push(func);
          },
      },
  };
</script>

<style lang="scss" type="text/scss">

</style>
