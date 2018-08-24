<template lang="pug">
.bdp-panel(:class='[!showz ? "hidden":"",card ? "card":""]')
  .panel-heading
    slot(name="header")
    div(v-if="collapse",:class="[showz ? 'panel-down':'panel-up']",@click="showUpdate")
  .panel-body
    slot
</template>
<script>
export default {
  name: 'bdp-panel',
  props: ['type', 'show', 'collapse', 'card'],
  data() {
    return {
      showz: true,
    };
  },
  methods: {
    showUpdate() {
      this.showz = !this.showz;
    },
  },
  mounted() {
    if (this.collapse && !this.show) {
      this.showz = false;
    }
  },
};
</script>

