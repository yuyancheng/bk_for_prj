<template lang="pug">
.sfStances(v-loading="mask",element-loading-text="稍等加载中",element-loading-spinner="el-icon-loading",element-loading-background="rgba(0, 0, 0, 0.8)")
  .allFast
    .isFull(:class="{'FullBig commes':isFullScreen,'FullCancel commes':!isFullScreen}" @click="changeFullScreen")
    el-row.view-left
      el-col.fastLeft(:span="6")
        .fastOver
          .fastScreen
            .fastLook
              | {{dvInfo.activityName}}
          .fastTime
            | {{dvInfo.start_tm}} - {{dvInfo.end_tm}}
        .fastFrame
          .fastSign
            el-row.fastcommen
              el-col.sfPie(:span="6")
                sfMap(:echartsData="echartsData")
                .bottomStyle
              el-col.fastSignCon(:span="6")
                .fastTitle
                  | 已签收
                .fastNum
                  span.fastBig {{dvInfo.signInNum}}
                  |  票
            el-row.fastcommen
              el-col.sfPie(:span="6")
                sfMap(:echartsData="echartsDatas")
                .bottomStyle
              el-col.fastSignCon(:span="6")
                .fastTitle
                  | 异常件量
                .fastNum
                  span.fastBig {{dvInfo.exceptionNum}}
                  |  票
      el-col.allNums(:span="18")
        .allNum
          .allDue
            .allDueNum
                | 数据更新时间:
                span.allDueNumFont
                  | {{dvInfo.calTime}}
          .allFare
            .allTitle
              span.allTitleNum {{dvInfo.totalNum}}
              span.allTicket 票
        .banks
          .bank-first.bankcommen(v-for="(item,i) in option")
            .bank-bg
              .bank-province
                | No.
                span
                  | {{i+1}} {{item.city}}
              .bank-num
                span {{item.qty}}
                |  票
        .content
          .map
            bdp-map(:carData="tData",:mapStyle="{areaColor:'rgba(28,68,132,.2)'}",name="件量")
</template>

<script>
    import moment from 'moment';
    import sfTable from '@/components/sfTable';
    import BdpMap from '@/components/bdpmap.vue';
    import sfMap from '@/components/sfMap';

    export default {
         components: {
              sfTable,
              sfMap,
              'bdp-map': BdpMap,
            },
        data() {
            return {
               mask: true,
               isFullScreen: false,
               tColumns: [
                { props: 'index', label: '排名' },
                { props: 'name', label: '目的地' },
                { props: 'count', label: '物资数量' },
              ],
              tData: [],
              echartsData: {
                   text: '签收率',
                   value: 0,
              },
              echartsDatas: {
                   text: '签收率',
                   value: 0,
              },
              dvInfo: {
                  start_tm: '',
                  end_tm: '',
                  activityName: 'DEMO大屏',
                  signInNum: '',
                  exceptionNum: '',
                  signInRate: '',
                  exceptionRate: '',
                  totalNum: '',
                  calTime: '',
              },
              option: [],
            };
        },
        created() {
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
                     this.dvInfo.calTime = res.data.updateTime;
                  }
              });
                  this.$axios.get('/screen/statistics/overview').then(res => {
                      if (res.code === 200) {
                        this.mask = false;
                        if (!res.data) return;
                        const  { status } =  res.data;
                        this.tData = [];
                        this.dvInfo.activityName = res.data.screen_name;
                        this.dvInfo.start_tm = moment(res.data.start_tm).format('YYYY-MM-DD');
                        this.dvInfo.end_tm = res.data.end_tm === '' ? '至今' : moment(res.data.end_tm).format('YYYY-MM-DD');
                        this.dvInfo.totalNum = status.all_qty;
                        this.dvInfo.signInNum = status.signed_qty === '' ? 0 : Number.parseFloat(status.signed_qty).toLocaleString();
                        this.dvInfo.exceptionNum = status.except_qty;
                        if (isNaN(status.signed_qty / status.all_qty) || (status.signed_qty / status.all_qty) === undefined) {
                                this.echartsData = {
                                text: '签收率',
                                value: 0,
                              };
                        } else {
                           this.echartsData = {
                                text: '签收率',
                                value: Math.round((status.signed_qty / status.all_qty).toFixed(2) * 100),
                              };
                        }
                        if (isNaN(status.except_qty /  status.all_qty) || (status.except_qty /  status.all_qty) === undefined) {
                                 this.echartsDatas = {
                                  text: '异常占比',
                                  value: 0,
                                };
                        } else {
                           this.echartsDatas = {
                            text: '异常占比',
                            value: Math.round((status.except_qty / status.all_qty).toFixed(2) * 100),
                          };
                        }
                         let cityRanks =  res.data.city_rank.map(v => {
                            const obj = {};
                            obj.city = v.city.split('/')[0].replace(/(省|市)/, '');
                            obj.qty = v.qty;
                            return obj;
                         });
                        if (cityRanks.length > 3) cityRanks = cityRanks.splice(0, 3);
                        this.option = cityRanks;
                        const data = res.data.city_rank.map(v => {
                            const obj = {};
                            obj.name = (v.city.split('/')[0]).replace(/(省|市)/, '');
                            obj.count = v.qty;
                            return obj;
                         });
                        this.tData = data;
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
  .sfStances{
        width: 100vw;
        min-height: 100vh;
        min-width: 1280px;
        z-index: 2;
         .bdp-map {
             min-height: 700px;
      }
    }
   .allFast{
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
      // position: relative;
     .bdp-map {
        // left: 20%;
        // // top: 30px;
        // height: 100%;
        // z-index: 2;
    }
    .content{
            position: fixed;
            top: 9%;
            width: 65%;
    }
    .banks{
      color: #00d2ff;
      height: 7rem;
      width: 16%;
      position: relative;
      left: 40%;
      top: 7rem;
      z-index: 5;
      .bankcommen{
        width: 12.2rem;
        height: 6.4rem;
        position: absolute;
        .bank-bg{
          width: 100%;
          height: 100%;
          background: url("../../assets/image/province-bg.png") no-repeat center;
          background-size: 100% 100%;
          .bank-province{
            margin-left: 30px;
           padding-top: 13px;
           font-size: 1.7rem;
          }
          .bank-num{
             margin-left: 30px;
            font-size: 1.4rem;
            span{
                 font-family: 'dc-number-small';
            }
          }
        }
      }
      .bank-first:nth-child(1){
          left: 199%;
          top: 78%;
      }
     .bank-first:nth-child(2){
            left: 50%;
            top: 100%;
      }
     .bank-first:nth-child(3){
          top: 220%;
          left: -5%;
      }
    }
    .view-left{
          // width: 88%;
          // position: absolute;
          // z-index: 6;
          // left: 3%;
          // top: 5%;
          .fastLeft{
                padding: 3% 0 0 5%;
          }
    }
   .fastLeft{
            .fastOver{
              background: url("../../assets/image/activity-box-bg2.png") no-repeat;
              width: 28.4rem;
              height: 9.8rem;
              background-size: 100% 100%;
              display: inline-block;
              .fastScreen{
              background: url("../../assets/image/activity-name-bg.png") no-repeat;
              width: 23.2rem;
              height: 3.2rem;
              margin-left: 2.3rem;
              margin-top: 3.2rem;
              margin-bottom: .5rem;
              background-size: 23.2rem 3.2rem;
              color: #d0a04b;
              font-size: 2.1rem;
              text-indent: 1rem;
              // .fastLook{
              //   color: #d0a04b;
              //   font-size: 30px;
              //   text-indent: 19px;
              // }

              }
               .fastTime{
                color: #d0a04b;
                font-size: 26px;
                margin-left: 2.4rem;
              }
       }
       .fastFrame{
              color: #00d2ff;
              background: url("../../assets/image/deliver-goods-box-bg.png") no-repeat;
              background-size: 100% 100%;
              width: 28.4rem;
              height: 24.7rem;
              box-sizing: border-box;
              margin-top: 37%;
              margin-left: 0;
              background-size: 28.4rem 24.7rem;
              padding: 10px;
        .fastSign{
            .fastcommen{
                margin-top: 15px;
            }
          .sfPie{
                width: 7.1rem;
                height: 100%;
                margin-left: 1.2rem;
                float: left;
                position: relative;
                color: #00d2ff;
                .bottomStyle{
                        width: 77%;
                        height: 14%;
                        background: url("../../assets/image/y-bottom.png") no-repeat;
                        display: inline-block;
                        background-size: 100% 100%;
                        position: absolute;
                        bottom: 0%;
                        left: 66%;
                        transform: translateX(-50%);
                    }
          }
          .fastSignCon{
              width: 16rem;
              height: 100%;
              margin-left: 1.8rem;
              color: #00d2ff;
              .fastNum{
                    font-size: 1.3rem;
                    .fastBig{
                          font-size: 2.3rem;
                    }
              }
          }
        }
        .fastTitle{
          font-size: 28px;
          margin: 1.8rem 0 .5rem 0;
        }
        .fastNum{
            .fastBig{
              font-size: 25px;
            }
        }
       }
          }
          .allNums{
            padding: 0 0 0 10%;
            min-height: 600px;
            display: inline-block;
            vertical-align: top;
          }
          .allNum{
               color: #00d2ff;
               margin-top: 45px;
               width: 41.2rem;
               position: relative;
               z-index: 9;
               .allDue{
                 height: 2.7rem;
                  width: 100%;
                  position: relative;
                  margin-left: 1.2rem;
                  .allDueNum{
                    color: #00d2ff;
                    font-size: 1.3rem;
                    vertical-align: text-bottom;
                    position: absolute;
                    right: 5.5rem;
                    bottom: 0;
                    .allDueNumFont{
                      font-family: 'dc-number-small';
                      margin-left: 8px;
                    }
                  }
               }
               .allTitle{
                  width: 100%;
                  height: 9rem;
                  line-height: 9rem;
                  background-image: -webkit-gradient(linear, 0 0, 0 bottom, from(#c6a94b), to(#aa6c1b));
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  .allTitleNum{
                    font-family: 'dc-number-big';
                     font-weight: bold;
                  }
                  .allTicket{
                    font-size: 2.5rem;
                    font-family: '微软雅黑';
                    margin-left: .8rem;
                  }
               }
        .allFare{
            width: 100%;
            background: url("../../assets/image/sv-bottom-box-bg.png") no-repeat;
            background-size: 100% 110%;
            text-align: center;
            font-size: 6.5rem;
            color: #d0a04b;
            margin-top: -0.5rem;
            .allTitleNum{

            }
            .allTicket{
              font-size: 2.5rem;
              margin-left: .8rem;
            }
        }
          }
}
</style>
