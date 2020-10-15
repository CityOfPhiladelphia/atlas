<template>
  <div
    :style="greetingStyle"
    class="columns medium-20 medium-centered greeting"
  >
    <h2>Find your polling place on Atlas</h2>
    <exclamation-callout
      :slots="exclamationCalloutSlots"
    >
    </exclamation-callout>

    <p>Check here to confirm the location and more before
      you head to the polls on election day.
    </p>

    <p>Enter your home address to find:</p>
    <div class="custom-section">
      <ul class="custom-ul">
        <li>Your polling place address and map location.</li>
        <li>Accessibility and parking information for the building.</li>
        <li>A preview of the November 2020 general election ballot.</li>
        <li>Your elected officials and their contact information.</li>
      </ul>
    </div>

    <p><b>Hours:</b> All polling places will be open on election day from 7 a.m. to 8 p.m.</p>

    <p class="border">
      Changes to the official voter registry may not be reflected here
      immediately. For up-to-date, official polling place locations in
      Philadelphia County, contact the Philadelphia Voter Registration
      Office at (215) 686-1590.
    </p>

    <div
      class="section-header"
      :style="{ 'background-color': '#F0F0F0', 'color': 'black' }"
    >
      <b>Related content</b>
    </div>
    <div class="custom-section">
      <ul class="custom-ul">
        <li><a target="_blank" href="https://www.phila.gov/2020-09-08-general-election-mail-in-ballot-guide-for-philadelphia-voters/">See our mail-in ballot guide for Philadelphia Voters</a></li>
        <li><a target="_blank" href="https://www.phila.gov/voting">Find where to get and return mail-in ballots in person</a></li>
        <li><a target="_blank" href="https://www.pavoterservices.pa.gov/pages/ballottracking.aspx">Check the status of your mail-in ballot</a></li>
        <li><a target="_blank" href="https://www.pavoterservices.pa.gov/Pages/voterregistrationstatus.aspx">Confirm that you're registered to vote</a></li>
      </ul>
    </div>

  </div>
</template>

<script>

import TopicComponent from '@phila/vue-comps/src/components/TopicComponent.vue';
import ExclamationCallout from './ExclamationCallout.vue';

export default {
  components: {
    ExclamationCallout,
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
  data() {
    let data = {
      greetingStyle: this.$props.options.style || {},
    };
    return data;
  },
  computed: {
    exclamationCalloutSlots() {
      return {
        text: 'COVID-19 info: Due to the pandemic, many polling places for the November 2020 general election have changed or have not been finalized.',
      };
    },
  },
};
</script>

<style scoped>
  .mb-panel-topics-greeting {
    padding-top: 20px;
  }

  .greeting {
    font-size: 16px;
    color: #444;
    /* padding: 14px; */
  }

  .greeting-error {
    border-left-color: #ff0000;
  }

  .border {
    border-style: solid;
    border-width: 2px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 2px;
    padding-bottom: 2px;
  }

  .custom-section {
    margin-left: 8px;
    margin-top: 4px;
  }

  .custom-ul {
    margin-left: 2rem;
    /* font-size: 14px; */
  }

  .section-header {
    padding-left: 4px;
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
