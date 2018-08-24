<template lang="pug">
div(:class="col ? 'col-'+col : 'flex-item'")
  slot
</template>
<script>
export default {
  name: 'bdp-col',
  props: ['col'],
};
</script>

