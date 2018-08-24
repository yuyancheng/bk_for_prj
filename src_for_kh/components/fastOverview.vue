<template lang="pug">
.allFast
</template>

<script>
export default {
  name: 'fastOverview',
   components: {
          },
  data() {
    return {
      echartsData: {
        isPie: true,
        color: '#2F7FD5',
        text: '签收率',
        yname: {
          name: '一小时',
        },
        yData: {
          value: 32,
        },
      },
      echartsDatas: {
        isPie: true,
        color: '#2F7FD5',
        text: '异常占比',
        yname: {
          name: 'hahha',
        },
        yData: {
          value: 32,
        },
      },
       flyData: [
                    {
                    fromName: '深圳',
                    toName: '北京',
                    },
                    {
                    fromName: '深圳',
                    toName: '上海',
                    },
                    {
                    fromName: '深圳',
                    toName: '成都',
                    },
                    {
                    fromName: '深圳',
                    toName: '武汉',
                    },
                    {
                    fromName: '深圳',
                    toName: '哈尔滨',
                    },
                    {
                    fromName: '深圳',
                    toName: '拉萨',
                    },
                    {
                    fromName: '深圳',
                    toName: '银川',
                    },
                 ],
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


</style>
