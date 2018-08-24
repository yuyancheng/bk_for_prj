<template lang="pug">
  div.da-main(v-loading="mask",element-loading-text="稍等加载中",element-loading-spinner="el-icon-loading",element-loading-background="rgba(0, 0, 0, 0.8)")
    .da-header
      .isFull(:class="{'FullBig commes':isFullScreen,'FullCancel commes':!isFullScreen}" @click="changeFullScreen")
      .title-box
        .title 配送分析
      .updateTime 数据更新时间：{{reInfo.updateTm}}
    .da-content
      el-row(:gutter="12")
        el-col(:span="12")
          .item
            .item-title 到货分析
            el-row
              el-col(:span="10").item-content
                .content-item
                  .title 发货总量
                  .content
                    span {{reInfo.total}}
                    span   票
                .content-item
                  .title 在途快件
                  .content
                    span {{reInfo.load}}
                    span   票
                .content-item
                  .title 正在派送
                  .content
                    span {{reInfo.send}}
                    span   票
              el-col(:span="14").item-content-right
                .top 已签收
                  span.num-box {{reInfo.recevice}}
                  | 票
                .center
                    bdp-pie(:echartsData="echartsDatapie")
                    .bottomStyle
        el-col(:span="12")
          .item
            .item-title 流向分析
            .content
              .map
                bdp-map(:carData="tData",:mapStyle="{areaColor:'#1c4484'}",name="件量")
              .detail
                .de-tilte 快件流向省份TOP5
                table
                  thead
                    tr
                      th(v-for="label in tColumns") {{label.label}}
                  tbody
                    tr(v-for="(col,i) in tData")
                      td(v-for="label in tColumns") {{label.props == 'index' ? i+1 : col[label.props]}}
        el-col(:span="12")
          .item-z
            .title 异常分析
            .list
              .left
                p 超时5天未签收
                p {{errInfo.notReceiveCnt}}
              .right(v-zscroll="'top20Receive'")
                p(v-for="item in top20Receive") 运单号：{{item.waybillNo}}，快件状态：{{item.waybillStatus}}，寄件时间：{{item.consignedTime}}，发货城市：{{item.senderCity}}，收货城市：{{item.destCity}}
            .list
              .left
                p 超时3天无物流
                p {{errInfo.noLogisticsCnt}}
              .right(v-zscroll="'top20NoLogistics'")
                p(v-for="item in top20NoLogistics") 运单号：{{item.waybillNo}}，快件状态：{{item.waybillStatus}}，寄件时间：{{item.consignedTime}}，发货城市：{{item.senderCity}}，收货城市：{{item.destCity}}
            .list
              .left
                p 派送异常
                p {{errInfo.excepCnt}}
              .right(v-zscroll="'exceptionTop20'")
                p(v-for="item in exceptionTop20") 运单号：{{item.waybillNo}}，快件状态：{{item.waybillStatus}}，寄件时间：{{item.consignedTime}}，发货城市：{{item.senderCity}}，收货城市：{{item.destCity}}
        el-col(:span="12")
          .item-z
            .title 时效分析
            bdp-charts(:echartsData="echartsData",type="pie",isShow="true",:config="{color:'#00b4ff',hide:true,position:{left:'right',top:'center',orient:'vertical'}}")
</template>
<script>
/* eslint-disable */
import moment from 'moment';
import BdpMap from '@/components/bdpmap.vue';
import SfMap from '@/components/sfMap.vue';
import qs from 'qs';
export default {
  components: {
    'bdp-map': BdpMap,
    'bdp-pie': SfMap,
  },
  data() {
    return {
      mask: true,
      isFullScreen: false,
      exceptionTop20: [],
      top20NoLogistics: [],
      top20Receive: [],
      reInfo: {
          total: '',
          load: '',
          send: '',
          recevice: 0,
          updateTm: '',
      },
      errInfo: {
          notReceiveCnt: '',
          noLogisticsCnt: '',
          excepCnt: '',
      },
      echartsData: {
        legend: ['<24H', '24~48H', '48~72H', '>72H'],
        xData: ['2017-09-27'],
        yData: [],
      },
       tColumns: [
        { props: 'index', label: '排名' },
        { props: 'name', label: '目的地' },
        { props: 'count', label: '物资数量' },
      ],
      tData: [],
      echartsDatapie: {
         text: '揽收率',
         value: 0,
      },
      };
  },
  mounted() {
           this.init();
            setInterval(() => {
                 this.init();
            }, 1000 * 60 * 5);
  },
  methods: {
    init(){
       this.$axios.post('/despatchAnalysis/findUpdateDate').then(res => {
                  if (res.code === 200) {
                     if (!res.data) return;
                     this.reInfo.updateTm = res.data.updateTime;
                  }
        });
       const objs = {
          screenCode:'waybill-despatch-analysis'
        }
      this.$axios.post('/despatchAnalysis/findResult',qs.stringify(objs)).then(res => {
        if(res.code === 200){
             this.mask = false;
             const {exceptionalAnalysisMap,arrivalAnalysisList,flowDirectionAnalysisList,effectivenessAnalysisList} = res.data;
             if(!exceptionalAnalysisMap) return;
             this.top20Receive =  exceptionalAnalysisMap.noSignList;
             this.top20NoLogistics = exceptionalAnalysisMap.noRouteList;
             this.exceptionTop20 = exceptionalAnalysisMap.excList;
             this.errInfo.notReceiveCnt = this.top20Receive.length;
             this.errInfo.noLogisticsCnt = this.top20NoLogistics.length;
             this.errInfo.excepCnt =this.exceptionTop20.length;
             if(Array.isArray(arrivalAnalysisList)){
                  arrivalAnalysisList.forEach((v)=>{
                      if(v.waybillStatus==='在途'){
                           this.reInfo.load  = v.goodsNum;
                      }else if(v.waybillStatus==='顺丰发货总量'){
                          this.reInfo.total = v.goodsNum;
                      }else if(v.waybillStatus==='占比'){
                          this.echartsDatapie =  {
                                text: '揽收率',
                                value: v.goodsNum ? v.goodsNum  : 0,
                            };
                      }else if(v.waybillStatus==='已签收'){
                          this.reInfo.recevice = parseFloat(v.goodsNum).toLocaleString();
                      }else if(v.waybillStatus==='正在派送'){
                          this.reInfo.send = v.goodsNum;
                      }
                  });
             }
            if(Array.isArray(flowDirectionAnalysisList)){
                  let data = flowDirectionAnalysisList.map(v => {
                    const obj = {};
                    obj.name = (v.receiverAddrCity.split('/')[0]).replace(/(省|市)/, '');
                    obj.count = v.goodsNum;
                    return obj;
                });
                if (data.length > 5) data = data.splice(0, 5);
                if (data.length === 1 && !/\S/.test(data[0].name)) {
                    this.tData = [];
                } else {
                    this.tData = data;
                }
              }
            if(Array.isArray(effectivenessAnalysisList)){
              let legend = [];
              let yData  =[];
              effectivenessAnalysisList.forEach((i)=>{
              legend.push(i.stat);
              yData.push([window.parseFloat(i.zb)]);
              })
              this.echartsData = Object.assign({},this.echartsData,{
                legend,
                yData
              });
            };
        }else if (res.data.code === 404) {
            this.mask = false;
            this.$message({
              message: res.data.msg,
              type: 'warning',
            });
          }
      });

    },
    changeFullScreen() {
          this.isFullScreen = !this.isFullScreen;
          const el = document.documentElement;
          if (this.isFullScreen) {
              el.webkitRequestFullScreen();
          } else {
            document.webkitCancelFullScreen();
          }
    },

  },
  directives: {
    zscroll: {
      bind(el, { value }, vnode) {
        window.zscroll = {};
      },
      update(el, { value }) {
        if(window.zscroll[value]) {
          clearInterval(window.zscroll[value]);
        }
        window.zscroll[value] = setInterval(() => {
          const firstChild = el.firstChild;
          if(firstChild){
            el.removeChild(firstChild);
            el.appendChild(firstChild);
          }
        }, 1500);
      },
    },
  },

};
</script>
<style lang="scss">
.da-main {
  // height: 100vh;
  width: 100vw;
  min-height: 100vh;
  min-width: 1280px;
  background-image: url("../../assets/da/bg.jpg");
  background-attachment:fixed;
  background-size: 100% 100%;
  z-index: 2;
  .isFull{
    position: fixed;
    right: 2px;
    top: 5px;
    z-index: 9999;
  }
  .commes{
    width: 24px;
    height: 24px;
  }
  .FullCancel{
    background-image: url("../../assets/image/full1.png");
    background-size: 100% 100%;
  }
  .FullBig{
    background-image: url("../../assets/image/small1.png");
    background-size: 100% 100%;
  }
}
.da-header {
  .title-box {
    width: 100%;
    background: url("../../assets/da/title-border1.png") no-repeat;
    background-size: 50% 100%;
    background-position: 50%;
    margin: 0 auto;
    text-align: center;
    .title {
      display: inline-block;
      color: #d0a04b;
      font-size: 2vw;
      line-height: 1.46;
      margin: .2vw 0 .8vw;
    }
  }
  .updateTime {
    float: right;
    color: #00b4ff;
    margin-right: .8vw;
    font-size: .9vw;
  }
  margin-bottom: 30px;
}
.da-content {
  color: rgb(0,210,255);
  padding: 0 1%;
  .commen-hyd {
      height: 20vw;
      max-height: 220px;
    //   width: 100%;
    //   margin: 0 auto;
  }
  .item{
    height: 24vw;
    max-height: 340px;
    position: relative;
    background: url("../../assets/da/frame-top.png") no-repeat left top;
    background-size: 100% 100%;
    margin-bottom: 18px;
    .item-title {
      position: absolute;
      left: 14%;
      top: 2%;
    }
    .item-content {
      padding-top: 10%;
      padding-left: 5%;
      .title {
        margin:0;
        margin-bottom: 3px;
        font-size: 14px;
        color: rgb(0,210,255);
      }
      .content {
        margin-bottom: 1.25rem;
        span:nth-child(1) {
          font-size: 1.75rem;
        }
      }
    }
    .item-content-right {
      padding-top: 3%;
      .top{
        margin-left: 13%;
      }
      .num-box {
        display: inline-block;
        margin: 0 2%;
        height: 3.2rem;
        line-height: 3.2rem;
        width: 13.7rem;
        background: url("../../assets/da/activity-name-bg.png") no-repeat left top;
        background-size: 23.15rem 3.2rem;
        font-size: 2.4rem;
        text-align: center;
      }
      .center{
          position: relative;
           .bottomStyle{
                    width: 20%;
                    height: 10%;
                    background: url("../../assets/image/y-bottom.png") no-repeat;
                    display: inline-block;
                    background-size: 100% 100%;
                    position: absolute;
                    bottom: 10%;
                    left: 50%;
                    transform: translateX(-50%);
             }
      }
    }
    .map {
      display: inline-block;
      width: 50%;
      margin-top: 12px;
    }
    .detail {
      float: right;
      padding-top: 8%;
      // display: inline-block;
      width: 50%;
      .de-tilte {
        margin-bottom: 10px;
      }
      table {
        border: 1px solid rgba(23,69,139,0.8);
        width: 90%;
        tr {
          border-bottom: 1px solid rgba(23,69,139,0.8);
        }
        th {
          color:#00b4ff;
          background: #183a73;
          padding: 1% 8%;
          text-align: center;
        }
        td {
          padding: 1% 5%;
          text-align: center;
        }
      }
    }
  }
  .item-z {
    padding: 4%;
    height: 24vw;
    max-height: 360px;
    position: relative;
    background: url("../../assets/da/frame-btm.png") no-repeat left top;
    background-size: 100% 100%;
    .title {
      color:#00b4ff;
    }
    .list {
      display: flex;
      margin-bottom: 5%;
      border: 2px solid #1c4484;
      .left {
        background: #1c4484;
        text-align: center;
        padding: 2% 0;
        // flexwidth: 28%;
        flex-basis: 20%;
        // box-sizing: content-box;
      }
      .right{
        padding: 1%;
        font-size: 12px;
        flex:1;
        overflow: hidden;
        // height: 6vh;
        max-height: 60px;
      }
    }
  }
}

</style>
