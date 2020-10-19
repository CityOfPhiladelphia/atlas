<template>
  <div
    :style="contentStyle"
    class="columns medium-20 medium-centered greeting"
  >
    <p>
      <b>{{ $t('voting.introPage.p1_b') }}</b>
      {{ $t('voting.introPage.p1') }}
    </p>

  </div>
</template>

<script>

import TopicComponent from '@phila/vue-comps/src/components/TopicComponent.vue';

export default {
  mixins: [ TopicComponent ],
  props: {
    'message': {
      type: String,
      default: function() {
        return 'defaultMessage';
      },
    },
  },
  data() {
    let data = {
      contentStyle: this.$props.options.style || {},
    };
    return data;
  },
};
</script>

<style scoped>

.wrapper {

}

.inline-block-class {
  display: inline-block;
}

.callout {
  margin-top: 1rem;
  position: inherit;
  height: auto;
}

.topic-header-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.topic-header-label-holder {
  margin-left: 15px;
}

</style>
