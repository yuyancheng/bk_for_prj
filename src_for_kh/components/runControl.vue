<template lang="pug">
.allFast
  .systemTime
    bdpmap(id="mapFlys",:flyData='flyData')
    el-row
      el-col(:span="24")
        | 物流在运可视系统
      el-col(:span="24")
        | 2017
  .sfchart
    .sfSign
      el-row
        el-col(:span="5")
          | 图表
        el-col(:span="8")
          ul
            li
              |已签收
            li
              span
               | 348
      el-row
        el-col(:span="5")
          | 图表2
        el-col(:span="8")
          ul
            li
              |异常件量
            li
              span
               | 348
      el-row
        el-col(:span="6")
          span
            | 全流程
        el-col(:span="5")
          span
            | 配送
        el-col(:span="5")
          span
            | 流向
  .sfTicket
    .cutOff
      |截止日期
    .sfTotal
      .allNum
        | 367
  .ranking
    .rankFirst
      .rankCity
        |No1
      .rankNum
        | 57

</template>

<script>
 import bdpmap from '@/components/bdpmap';
export default {
  name: 'fastOverview',
  // props: ['id', 'flyData', 'bdpData', 'coord'],
   components: {
          bdpmap,
        },
  data() {
    return {
    };
  },
  computed: {

  },
  mounted() {

  },
  methods: {

  },
  watch: {

  },
};
</script>

<style lang="scss">
.allFast{
  position: relative;
  .sfchart{
    color: #177EAA;
    width: 200px;
    position: absolute;
    top: 169px;
    left: 32px;
  }
  .sfTicket{
    width: 300px;
    position: absolute;
    top: 30px;
    right: -91px;
    .cutOff{
      color: #157DA6;
    }
    .sfTotal{
      color: #B3902D;
    }
  }
  .ranking{
    color: #1F99C2;
    .rankFirst{
         position: absolute;
        bottom: -200px;
        right: 33%;
        z-index: 99999;
    }
  }
}

.systemTime{
    position: absolute;
    top: 30px;
    left: 30px;
    width: 120px;
    height: 40px;
    background: url(../../static/image/activity-box-bg2.png) no-repeat;
    display: inline-block;
    color: #887C66;
}

</style>
