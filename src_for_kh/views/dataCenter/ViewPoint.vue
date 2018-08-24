<template lang="pug">
  div.da-main.vw(v-loading="mask",element-loading-text="稍等加载中",element-loading-spinner="el-icon-loading",element-loading-background="rgba(0, 0, 0, 0.8)")
    .vw-map
      .isFull(:class="{'FullBig commes':isFullScreen,'FullCancel commes':!isFullScreen}", @click="changeFullScreen")
      .da-header
        .title-box
          .title 流向分析{{!multipleStart ? `-${info.screenName}` : ''}}
        .updateTime {{info.startTime}}  数据更新时间: {{info.updateTime}}
      .da-left
        .title 流向城市TOP10
        table
          thead
            tr
              th(v-for="label in tColumns") {{label.label}}
          tbody
            tr(v-for="(col,i) in tData")
              td(v-for="label in tColumns") {{label.props == 'index' ? i+1 : col[label.props]}}
      bdp-map(:flyData="flyData",:mapStyle="{areaColor:'rgba(28,68,132,.2)'}",)
</template>
<script>
import qs from 'qs';
import moment from 'moment';
import BdpMap from '@/components/bdpmap.vue';

// import { objectExpression } from 'babel-types';

export default {
  components: {
    'bdp-map': BdpMap,
  },
  data() {
    return {
      mask: true,
      isFullScreen: false,
      info: {
        screenName: '',
        startTime: '',
        updateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      },
      tData: [],
      tColumns: [
        { props: 'index', label: '排名' },
        { props: 'fromName', label: '始发城市' },
        { props: 'name', label: '流向城市' },
        { props: 'count', label: '物资数量' },
        // { props: 'zb', label: '占比' },
      ],
      flyData: [
        // { fromName: '深圳', toName: '北京' },
      ],
      multipleStart: false,
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
                      this.info.updateTime = res.data.updateTime;
                  }
         });
        const objs = {
             screenCode: 'waybill-flow-analysis',
           };
      this.$axios.post('/despatchAnalysis/findResult', qs.stringify(objs)).then(res => {
        if (res.code === 200) {
          this.mask = false;
          const { flowDirectionAnalysisList } = res.data;
          // const { flowDirectionAnalysisList } = data.data;
          if (!flowDirectionAnalysisList || !flowDirectionAnalysisList.length) {
            this.multipleStart = true;
            return;
          }
          this.flyData = [];
          this.tData = [];
          let taDatas = flowDirectionAnalysisList.map(v => {
                const obj = {};
                obj.fromName = v.senderAddrCity.split('/')[0].replace(/(省|市)/, '');
                obj.name = v.receiverAddrCity.split('/')[0].replace(/(省|市)/, '');
                obj.count = v.goodsNum;
                obj.zb  = `${v.zb}%`;
                return obj;
            });
          if (taDatas.length > 10) taDatas = taDatas.splice(0, 10);
            if (taDatas.length === 1 && !/\S/.test(taDatas[0].name)) {
                this.tData = [];
            } else {
                this.tData = taDatas;
            }
          let cName = '全部';
          const flyData = flowDirectionAnalysisList.map(v => {
              this.info.screenName = v.senderAddrCity;
              const obj = {};
              const sc = v.senderAddrCity.split('/')[0].replace(/(省|市)/, '');
              if (sc === '全部') {
                  this.multipleStart = true;
              } else if (cName !== '全部' && cName !== sc) {
                  this.multipleStart = true;
                  cName = sc;
              } else if (cName === '全部') {
                  cName = sc;
              }
              obj.toName =  v.receiverAddrCity.split('/')[0].replace(/(省|市)/, '');
              obj.fromName = sc;
              return obj;
            });
            if (flyData.length === 1 && !/\S/.test(flyData[0].fromName)) {
                this.flyData = [];
            } else {
                this.flyData = flyData;
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
          const el = document.documentElement;
          if (this.isFullScreen) {
              el.webkitRequestFullScreen();
          } else {
            document.webkitCancelFullScreen();
          }
    },
  },
};
</script>
<style lang="scss">
.da-main.vw {
  // height: 100%;
  // height: 100vh;
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
  .da-header {
    position: absolute;
    left:0;
    right: 0;
    z-index: 12;
    .updateTime {
      float: none;
      font-size:1.2rem;
      text-align: center;
    }
  }
  .bdp-map {
    min-height: 600px;
    // height: 100%;

  }
  .da-left {
    position: absolute;
    top:20%;
    left:5%;
    z-index: 12;
    width: 30%;
    .title {
      margin-bottom: 10px;
      color:#f2c831;
      font-size: 1.4rem;
    }
    table {
      border: 1px solid rgba(14, 89, 194, 0.298039);
      font-size: 1.1rem;
      line-height: 1.46;
      color:#06c7ff;
      width: 100%;
      tr {
        border-bottom: 1px solid rgba(14, 89, 194, 0.298039);
        &:nth-child(1),&:nth-child(2),&:nth-child(3) {
          color:#f2c831;
        }
      }
      th {
        color:#00b4ff;
        background: rgba(14, 89, 194, 0.298039);
        padding: 2.5% 2%;
        text-align: center;
      }
      td {
        background: rgba(14,89,194,0.14);
        padding: 2% 5%;
        text-align: center;
      }
    }
  }
  .vw-map {
    position: relative;
    height: 100vh;
    .bdp-map {
      height: 100%;
    }
  }
  .updateTime {

  }
}
</style>

