<template lang="pug">
  div.da-main.ts(v-loading="mask",element-loading-text="稍等加载中",element-loading-spinner="el-icon-loading",element-loading-background="rgba(0, 0, 0, 0.8)")
    .da-header
      .isFull(:class="{'FullBig commes':isFullScreen,'FullCancel commes':!isFullScreen}" @click="changeFullScreen")
      .title-box
        .title 在运状态监控
      .updateTime 数据更新时间：{{updateTm}}
    .da-content
      el-row(:gutter="24")
        el-col(:span="12")
          .item
            .item-title 已签收
            .content
              .allNum
                .allNumBck
                  span.allVolume {{allNum.receive}}
              .map
                bdp-map(:carData="signedtData",:mapStyle="{areaColor:'#1c4484'}",name="件量")
              .detail
                .de-tilte 快件流向城市TOP5
                table
                  thead
                    tr
                      th(v-for="label in tColumns") {{label.label}}
                  tbody
                    tr(v-for="(col,i) in signedtData")
                      td(v-for="label in tColumns") {{label.props == 'index' ? i+1 : col[label.props]}}
        el-col(:span="12")
          .item
            .item-title 在派
            .content
              .allNum
                .allNumBck
                  span.allVolume {{allNum.point}}
              .map
                bdp-map(:carData="deliverltData",:mapStyle="{areaColor:'#1c4484'}",name="件量")
              .detail
                .de-tilte 快件流向城市TOP5
                table
                  thead
                    tr
                      th(v-for="label in tColumns") {{label.label}}
                  tbody
                    tr(v-for="(col,i) in deliverltData")
                      td(v-for="label in tColumns") {{label.props == 'index' ? i+1 : col[label.props]}}
        el-col(:span="12")
          .item
            .item-title 在途
            .content
              .allNum
                .allNumBck
                  span.allVolume {{allNum.route}}
              .map
                bdp-map(:carData="onlineltData",:mapStyle="{areaColor:'#1c4484'}",name="件量")
              .detail
                .de-tilte 快件流向城市TOP5
                table
                  thead
                    tr
                      th(v-for="label in tColumns") {{label.label}}
                  tbody
                    tr(v-for="(col,i) in onlineltData")
                      td(v-for="label in tColumns") {{label.props == 'index' ? i+1 : col[label.props]}}
        el-col(:span="12")
          .item
            .item-title 异常
            .content
              .allNum
                .allNumBck
                  span.allVolume {{allNum.Exception}}
              .map
                bdp-map(:carData="exceptltData",:mapStyle="{areaColor:'#1c4484'}",name="件量")
              .detail
                .de-tilte 快件流向城市TOP5
                table
                  thead
                    tr
                      th(v-for="label in tColumns") {{label.label}}
                  tbody
                    tr(v-for="(col,i) in exceptltData")
                      td(v-for="label in tColumns") {{label.props == 'index' ? i+1 : col[label.props]}}
</template>
<script>
import BdpMap from '@/components/bdpmap.vue';

export default {
  components: {
    'bdp-map': BdpMap,
  },
  data() {
    return {
      mask: true,
      isFullScreen: false,
      updateTm: '',
      allNum: {
        receive: '',
        point: '',
        route: '',
        Exception: '',
      },
      signedtData: [],
      deliverltData: [],
      exceptltData: [],
      onlineltData: [],
      tColumns: [
        { props: 'index', label: '排名' },
        { props: 'name', label: '目的地' },
        { props: 'count', label: '物资数量' },
      ],
    };
  },
   mounted() {
            this.init();
            setInterval(() => {
                 this.init();
            }, 1000 * 60 * 5);
   },
   methods: {
     init() {
         this.$axios.post('/despatchAnalysis/findUpdateDate').then(res => {
                  if (res.code === 200) {
                     if (!res.data) return;
                      this.updateTm = res.data.updateTime;
                  }
         });
         this.$axios.get('/screen/statistics/monitor').then(res => {
              if (res.code === 200) {
                  this.mask = false;
                  const {
                    signed,
                    deliver,
                    online,
                    except,
                  } = res.data;
                    const sum  = [];
                    const signedaSum = [];
                    const deliversSum = [];
                    const exceptsSum = [];
                    let onlines = online.map(v => {
                      sum.push(v.qty);
                      const obj = {};
                      obj.name = (v.city.split('/')[0]).replace(/(省|市)/, '');
                      obj.count = v.qty;
                      return obj;
                  });
                  if (onlines.length > 5) onlines = onlines.splice(0, 5);
                  this.onlineltData = onlines;
                  if (sum.length !== 0) {
                      this.allNum.route = sum.reduce((a, b) => a + b);
                  }
                 let signedas = signed.map(v => {
                      signedaSum.push(v.qty);
                      const obj = {};
                      obj.name = (v.city.split('/')[0]).replace(/(省|市)/, '');
                      obj.count = v.qty;
                      return obj;
                  });
                  if (signedas.length > 5) signedas = signedas.splice(0, 5);
                  this.signedtData = signedas;
                   if (signedaSum.length !== 0) {
                     this.allNum.receive = signedaSum.reduce((a, b) => a + b);
                   }
                  let delivers = deliver.map(v => {
                     deliversSum.push(v.qty);
                     const obj = {};
                     obj.name = (v.city.split('/')[0]).replace(/(省|市)/, '');
                     obj.count = v.qty;
                     return obj;
                  });
                  if (delivers.length > 5) delivers = delivers.splice(0, 5);
                  this.deliverltData = delivers;
                   if (deliversSum.length !== 0) {
                      this.allNum.point = deliversSum.reduce((a, b) => a + b);
                   }
                  let excepts = except.map(v => {
                      exceptsSum.push(v.qty);
                      const obj = {};
                      obj.name = (v.city.split('/')[0]).replace(/(省|市)/, '');
                      obj.count = v.qty;
                      return obj;
                  });
                   if (excepts.length > 5) excepts = excepts.splice(0, 5);
                   this.exceptltData = excepts;
                   if (exceptsSum.length !== 0) {
                        this.allNum.Exception  = exceptsSum.reduce((a, b) => a + b);
                    }
              } else if (res.data.code === 404) {
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
          const docElm = document.documentElement;
          if (this.isFullScreen) {
              docElm.webkitRequestFullScreen();
          } else {
            document.webkitCancelFullScreen();
          }
     },
   },
};
</script>
<style lang="scss" scoped>
.da-main.ts {
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
     .allNum{
        height: 3.1rem;
        width: 7.3rem;
        background: url("../../assets/image/count-jb-bg.png") no-repeat center;
        background-size: 100% 100%;
        text-align: center;
        font-size: 1.8rem;
        color: #d0a04b;
        margin-top: 0;
        position: absolute;
        z-index: 100;
        left: 19%;
        margin-left: -3.5rem;
        top: 1.5rem;
        .allNumBck{
          background-image: -webkit-gradient(linear, 0 0, 0 bottom, from(#c6a94b), to(#aa6c1b));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: bold;
           line-height: 3.1rem
        }
     }
  .item-title {
    left: 50%;
    top:2%;
    transform: translateX(-50%);
  }
  .bdp-map {
    max-width: 360px;
  }
  .item {
    background-image: url("../../assets/da/frame-item-bg.png")
  }
}

</style>

