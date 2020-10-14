<template>
  <div
    :style="greetingStyle"
    class="columns medium-20 medium-centered"
  >
    Test
    <!-- <address-input v-if="shouldShowAddressInput" />
    <address-candidate-list v-if="addressAutocompleteEnabled && shouldShowAddressInput" /> -->

    <!-- <div
      v-if="!components && !hasError"
      class="greeting"
      v-html="message"
    >
    </div> -->

    <!-- <div
      v-if="!components && hasError"
      class="greeting greeting-error"
      v-html="errorMessage"
    /> -->

    <!-- <topic-component-group
      :topic-components="options.components"
      :item="item"
    /> -->

    <!-- <component
      :is="topicComp.type"
      v-for="(topicComp) in components"
      v-if="components"
      :key="topicComp.type"
      :slots="topicComp.slots"
      class="topic-comp"
    /> -->
  </div>
</template>

<script>

import TopicComponent from '@phila/vue-comps/src/components/TopicComponent.vue';

export default {
  components: {
    // Image_: () => import(/* webpackChunkName: "inGreeting_pvc_Image" */'./Image.vue'),
    // AddressInput: () => import(/* webpackChunkName: "inGreeting_pvc_AddressInput" */'./AddressInput.vue'),
    // AddressCandidateList: () => import(/* webpackChunkName: "inGreeting_pvc_AddressCandidateList" */'./AddressCandidateList.vue'),
    // TopicComponentGroup: () => import(/* webpackChunkName: "inGreeting_pvc_TopicComponentGroup" */'./TopicComponentGroup.vue'),
  },
  mixins: [ TopicComponent ],
  props: {
    'message': {
      type: String,
      default: function() {
        return 'defaultMessage';
      },
    },
  },
  // data() {
  //   let data = {
  //     greetingStyle: this.$props.options.style || {},
  //   };
  //   return data;
  // },
  computed: {
    // shouldShowAddressInput() {
    //   if (this.$config.addressInputLocation == 'topics') {
    //     return true;
    //   }
    //   return false;
    // },
    // addressAutocompleteEnabled() {
    //   // TODO tidy up the code
    //   if (this.$config.addressInput) {
    //     if (this.$config.addressInput.autocompleteEnabled === true) {
    //       return true;
    //     }
    //     return false;
    //   }
    //   return false;
    // },
    // components() {
    //   const greetingConfig = this.$config.greeting || {};
    //   return greetingConfig.components;
    // },
    // hasError() {
    //   return this.$store.state.geocode.status === 'error';
    // },
    // errorMessage() {
    //   const input = this.$store.state.geocode.input;
    //   return `
    //       <p>
    //         We couldn't find
    //         ${input ? '<strong>' + input + '</strong>' : 'that address'}.
    //         Are you sure everything was spelled correctly?
    //       </p>
    //       <p>
    //         Here are some examples of things you can search for:
    //       </p>
    //       <ul>
    //         <li>1234 Market St</li>
    //         <li>1001 Pine Street #201</li>
    //         <li>12th & Market</li>
    //         <li>883309050 (an OPA number with no hyphens or other characters)</li>
    //       </ul>
    //     `;
    // },
  },
};
</script>

<style scoped>
  .mb-panel-topics-greeting {
    padding-top: 20px;
  }

  .greeting {
    font-size: 20px;
    color: #444;
    padding: 14px;
  }

  .greeting-error {
    border-left-color: #ff0000;
  }

  /*medium*/
  @media screen and (min-width: 750px) {
    .mb-panel-topics-greeting {
      /*make this scroll on medium screens*/
      /*REVIEW this is a little hacky. the 120px shouldn't be hard-coded.*/
      height: calc(100vh - 120px);
      overflow: auto;
    }
  }
</style>
