<template lang="pug">
.karnel-commen
  .header
    .commen-hyd(ref="sfMap")
    slot(name="footer")
</template>

<script>

export default {
  name: 'bdp-charts',
  props: ['echartsData'],
  data() {
    return {
      myChart: '',
      option: '',
      echartsType: '',
    };
  },
  computed: {
  },
  mounted() {
    const { sfMap } = this.$refs;
    if (!sfMap) return;
    this.myChart = this.$echarts.init(sfMap);
    window.onresize = () => (() => {
      this.myChart.resize();
    })();
    this.drawline();
  },
  methods: {
    drawline() {
     if (!this.myChart) return;
      this.echartsType = 'gauge';
      const echartsData = this.echartsData;
      if (!echartsData) return;
      const series = [{
        name: 'noha111',
        type: 'pie',
        radius: ['69%', '85%'],
        avoidLabelOverlap: false,
        startAngle: 315,
        hoverAnimation: false,
        legendHoverLink: false,
        label: {
            normal: {
                 show: false,
                    formatter: '{d} %',
                    textStyle: {
                         fontSize: echartsData.fonstSize ? echartsData.fonstSize : 15,
                        fontWeight: 'bold',
                   },
                position: 'center',
            },
            emphasis: {
                show: false,
            },
        },
        labelLine: {
            normal: {
                show: false,
            },
        },
        data: [{
            value: 25,
            itemStyle: {
                normal: {
                    color: 'transparent',
                },
            },
        }, {
            value: echartsData.value * 0.74,
            label: {
                    normal: {
                        show: true,
                        formatter: () => (`${echartsData.value}%`),
                        textStyle: {
                            fontSize: echartsData.fonstSize ? echartsData.fonstSize : 15,
                            // fontWeight: 'bold',
                        },
                        position: 'center',
                    },
                },
            itemStyle: {
                normal: {
                    color: echartsData.color ? echartsData.color : '#2f7fd5',
                },
            },
        }, {
            value: 1,
            itemStyle: {
                normal: {
                    color: '#00b2dd',
                },
            },
        }, {
            value: 74 - (0.74 * echartsData.value),
            name: '4',
            itemStyle: {
                normal: {
                    color: '#0b3c7c',
                },
            },
        }],
    },
     {
        name: 'noha',
        type: 'pie',
        radius: ['40%', '45%'],
        avoidLabelOverlap: false,
        color: '#9f8fc1',
        hoverAnimation: false,
        legendHoverLink: false,
        label: {
            normal: {
                show: false,
                position: 'center',
            },
            emphasis: {
                show: false,
            },
        },
        labelLine: {
            normal: {
                show: false,
            },
        },
        data: [{
            value: 1,
            itemStyle: {
                normal: {
                    color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(30,92,178,1)',
                        }, {
                            offset: 1,
                            color: 'rgba(14,16,100,0.01)',
                        }]),
                },
            },
        }],
    }];
      const option = {
        title: {
          // 一小时概览
          text: echartsData.text,
          x: '50%',
          y: '75%',
          textAlign: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 18,
            color: '#00d2ff',
          },
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
        // this.myChart.clear();
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

<style lang="scss">
.karnel-commen{
  position: relative;
}
.commen-hyd {
  min-width: 142px;
  min-height: 142px;
}

</style>
