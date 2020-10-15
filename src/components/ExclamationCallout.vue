<template>
  <div class="wrapper grid-y">
    <div :class="'callout topic-header-content ' + calloutClass">
      <font-awesome-icon
        icon="exclamation-triangle"
        class="fa-3x inline-block-class"
      />
      <div
        v-if="message && !i18nEnabled"
        class="topic-header-label-holder"
        v-html="message"
      />
      <div
        v-if="message && i18nEnabled"
        class="topic-header-label-holder"
        v-html="$t(message)"
      />
    </div>
  </div>
</template>

<script>
import TopicComponent from '@phila/vue-comps/src/components/TopicComponent.vue';

export default {
  mixins: [ TopicComponent ],
  computed: {
    i18nEnabled() {
      let value = this.$config.i18n && this.$config.i18n.enabled;
      console.log('exclamationCallout i18nEnabled computing, value:', value);
      return value;
    },
    calloutClass() {
      let value;
      if (this.$props.options) {
        if (this.$props.options.class) {
          value = this.$props.options.class;
        }
        value = 'columns small-24';
      }
      return value;
    },
    message() {
      if (this.$props.slots) {
        return this.evaluateSlot(this.$props.slots.text) || '';
      }
      return '';

    },
    components() {
      if (this.$props.options) {
        return this.$props.options.components || null;
      }
      return null;
    },
  },
  mounted() {
    console.log('exclamationCallout mounted, this.$config:', this.$config);
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
