<template lang="pug">
.karnel-commen
  .header
    // button.btn-blue(@click="drawline('line')",) 切换折线图
    // button.btn-primary(@click="drawline('bar')") 切换柱状图
    // button.btn-red(@click="drawpie()") 切换饼状图
    .commen(ref="bdpCharts")
    slot(name="footer")
</template>

<script>
export default {
  name: 'bdp-charts',
  props: ['echartsData', 'type', 'service', 'config', 'isShow'],
  data() {
    return {
      myChart: '',
      option: '',
      echartsType: '',
    };
  },
  mounted() {
    // const id = document.getElementById(`${this.id}`);
    const { bdpCharts } = this.$refs;
    if (this.type) {
      this.echartsType = this.type[0];
    } else {
      this.echartsType = 'line';
    }
    if (!bdpCharts) return;
    this.myChart = this.$echarts.init(bdpCharts);
    window.onresize = () => (() => {
      this.myChart.resize();
    })();
    if (this.echartsData && this.echartsData.legend.length !== 0) {
      if (this.echartsType === 'bar') {
        this.drawline('bar');
      } else if (this.echartsType === 'line') {
        this.drawline('line');
      } else {
        this.drawpie();
      }
      // this.myChart.setOption(this.option);
    }
  },
  methods: {
    /* 绘制折线图以及柱状图 */
    drawline(type) {
      if (type) {
        this.echartsType = type;
      }
      const echartsType = this.echartsType;
      if (!this.loading) {
        this.myChart.hideLoading();
      }
      if (!this.myChart) return;
      const echartsData = this.echartsData;
      this.option = {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          top: 'bottom',
          data: echartsData.legend,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: [{
          type: 'category',
          boundrayGap: true,
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              opacity: 0,
            },
          },
          data: echartsData.xData,
        }],
        yAxis: [{
          type: 'value',
        //   scale: true,
          splitLine: {
            lineStyle: {
              type: 'dotted',
              color: '#ddd',
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              opacity: 0,
            },
          },
        }],
        series: [],
        dataZoom: echartsData.dataZoom,
      };

      echartsData.yData.forEach((v, i) => {
        const obj = {
          name: echartsData.legend[i],
          symbol: 'none',
          type: echartsType,
          smooth: true,
          barWidth: (function barWidth() {
            return `${50 / echartsData.legend.length}%`;
          }()),
          itemStyle: {
            normal: {
              barBorderRadius: [10, 10, 0, 0],
              color: (function color() {
                const index = i % 3;
                const colorList = ['#00CBD8', '#3D8BEB'];
                return colorList[index];
              }()),
            },
          },
          lineStyle: {
            normal: {
              width: 3,
              color: (function color() {
                const index = i % 3;
                const colorList = ['#00CBD8', '#3D8BEB'];
                return colorList[index];
              }()),
            },
          },
          label: {
            normal: {
              show: true,
              position: 'top',
            },
          },
          data: v,
        };
        this.option.series.push(obj);
        // this.option.showLoading();
      });
    },
    /* 绘制饼图 */
    drawpie() {
      if (!this.myChart) return;
      this.echartsType = 'pie';
      const pieechartsData = [];
      let config = {};
      if (this.config) {
         config = this.config;
      }
      const pie = [];
      const echartsData = this.echartsData;
      echartsData.legend.forEach((v) => {
        pie.push(v);
      });
      echartsData.yData.forEach((v, i) => {
        let value = 0;
        v.forEach((vv) => {
          value += vv;
        });
        pieechartsData.push({
          name: pie[i],
          value,
        });
      });
      const series = {
        type: 'pie',
        // radius: [0, '85%'],
        center: ['50%', '50%'],
        // roseType: 'radius',
        data: pieechartsData,
        label: {
          normal: {
            show: !config.hide,
            textStyle: {
              fontSize: 13,
              color: config.color ? config.color : '#333',
            },
            formatter(param) {
              return `${param.name} : ${param.percent.toFixed(2)}%`;
            },
          },
        },
        // labelLine: {
        //   normal: {
        //     smooth: true,
        //     lineStyle: {
        //       width: 2,
        //     },
        //   },
        // },
        // itemStyle: {
        //   normal: {
        //     shadowBlur: 10,
        //     shadowColor: 'rgba(0, 0, 0, 0.4)',
        //   },
        // },
      };
      const option = {
        // color: ['#7130aa', '#299471', '#2c69c8', '#cfa152'],
        color: ['#00CBD8', '#3D8BEB', '#3435EF', '#FF6347', '#DA70D6', '#32CD32', '#7130aa', '#2c69c8', '#cfa152', '#50d2e3', '#FFB6C1', '#FFD700'],
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            if (config) {
              return `${params.name}<br/> 签收量占比 : ${params.percent}%`;
            } else {
              return '{a} <br/>{b} : {c} ({d}%)';
            }
          },
        },
        legend: {
          orient: config.position ? config.position.orient : 'horizontal',
          top: config.position ? config.position.top : 'bottom',
          left: config.position ? config.position.left : 'center',
          textStyle: {
            color: config.color ? config.color : 'blue',
          },
          data: pie,
          show: !!this.isShow,
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: '12%',
          containLabel: true,
        },
        series,
      };
      this.option = option;
    },
    /* 下拉框change事件 */
    dateTimeChange() {
      this.$emit('change', {
        type: 'date',
        value: {
          startTime: this.rangeTime[0],
          endTime: this.rangeTime[1],
          index: this.index,
        },
      });
    },
  },
  watch: {
    /* 监听图表变化 */
    echartsData: {
      handler() {
        if (this.echartsType === 'pie') {
          this.drawpie();
        } else {
          this.drawline();
        }
      },
      deep: true,
    },
    option: {
      handler() {
        this.myChart.setOption(this.option, true);
      },
    },
    /* 加载lodding当为true显示lodding */
    service: {
      handler() {
        if (this.service.isLoading) {
          this.myChart.showLoading();
        } else {
          this.myChart.hideLoading();
        }
      },
      deep: true,
    },
  },
};
</script>
<style lang="scss" scoped>
.commen {
  min-height: 300px;
}
</style>

