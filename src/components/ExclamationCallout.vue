<template>
  <div class="wrapper grid-y">
    <!-- <div class="callout columns small-24"> -->
    <div :class="'callout topic-header-content ' + calloutClass">
      <font-awesome-icon
        icon="exclamation-triangle"
        class="fa-3x inline-block-class"
      />
      <!-- <div class="inline-block-class"> -->
        <div class="topic-header-label-holder"
          v-if="message"
          v-html="message"
        />
        <!-- class="inline-block-class" -->
      <!-- </div> -->
      <!-- <topic-component-group
        v-if="components"
        :topic-components="components"
      /> -->

    </div>
  </div>
</template>

<script>
import TopicComponent from '@phila/vue-comps/src/components/TopicComponent.vue';

export default {
  // components: {
  //   TopicComponentGroup: () => import(/* webpackChunkName: "pvc_TopicComponentGroup" */'./TopicComponentGroup.vue'),
  // },
  mixins: [ TopicComponent ],
  computed: {
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
