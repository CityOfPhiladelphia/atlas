(window.webpackJsonp=window.webpackJsonp||[]).push([[16,38],{260:function(e,t,n){"use strict";var s={props:{slots:{type:Object,default:function(){return{}}},options:{type:Object,default:function(){return{}}},item:{type:Object,default:function(){return{}}}},beforeCreate(){},created(){},computed:{nullValue(){return(this.options||{}).nullValue}},methods:{evaluateSlot(e,t=[],n=""){if(!e)return e;let s;if("function"===typeof e){const t=this.$store.state,n=this.$controller,o=e,r=this.item;s=r?o(t,r,n):o(t)}else s=e;if(!1===s);else if(!s)return n;for(let e of t){const t=this.$config.transforms[e];let n;const o=t.globals;o&&(n=Object.keys(window).filter(e=>o.includes(e)).reduce((e,t)=>(e[t]=window[t],e),{})),s=(0,t.transform)(s,n)}return s}}},o=n(37),r=Object(o.a)(s,void 0,void 0,!1,null,null,null);t.a=r.exports},320:function(e,t,n){var s=n(451);"string"==typeof s&&(s=[[e.i,s,""]]);var o={hmr:!0,transform:void 0,insertInto:void 0};n(17)(s,o);s.locals&&(e.exports=s.locals)},450:function(e,t,n){"use strict";var s=n(320);n.n(s).a},451:function(e,t,n){(e.exports=n(16)(!1)).push([e.i,"\n.mb-panel-topics-greeting[data-v-6fb6249c] {\n  padding-top: 20px;\n}\n.greeting[data-v-6fb6249c] {\n  font-size: 20px;\n  color: #444;\n  padding: 14px;\n}\n.greeting-error[data-v-6fb6249c] {\n  border-left-color: #ff0000;\n}\n\n/*medium*/\n@media screen and (min-width: 750px) {\n.mb-panel-topics-greeting[data-v-6fb6249c] {\n    /*make this scroll on medium screens*/\n    /*REVIEW this is a little hacky. the 120px shouldn't be hard-coded.*/\n    height: calc(100vh - 120px);\n    overflow: auto;\n}\n}\n",""])},483:function(e,t,n){"use strict";n.r(t);var s={components:{Image_:()=>n.e(7).then(n.bind(null,459)),AddressInput:()=>n.e(1).then(n.bind(null,482)),AddressCandidateList:()=>n.e(0).then(n.bind(null,489)),TopicComponentGroup:()=>n.e(2).then(n.bind(null,264))},mixins:[n(260).a],data(){return{greetingStyle:this.$props.options.style||{}}},props:{message:{type:String,default:function(){return"defaultMessage"}}},computed:{shouldShowAddressInput(){return"topics"==this.$config.addressInputLocation},addressAutocompleteEnabled(){return!!this.$config.addressInput&&!0===this.$config.addressInput.autocompleteEnabled},components(){return(this.$config.greeting||{}).components},hasError(){return"error"===this.$store.state.geocode.status},errorMessage(){const e=this.$store.state.geocode.input;return`\n        <p>\n          We couldn't find\n          ${e?"<strong>"+e+"</strong>":"that address"}.\n          Are you sure everything was spelled correctly?\n        </p>\n        <p>\n          Here are some examples of things you can search for:\n        </p>\n        <ul>\n          <li>1234 Market St</li>\n          <li>1001 Pine Street #201</li>\n          <li>12th & Market</li>\n        </ul>\n      `}}},o=(n(450),n(37)),r=Object(o.a)(s,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"columns medium-20 medium-centered",style:e.greetingStyle},[this.shouldShowAddressInput?n("address-input"):e._e(),e._v(" "),this.addressAutocompleteEnabled&&this.shouldShowAddressInput?n("address-candidate-list"):e._e(),e._v(" "),e.components||e.hasError?e._e():n("div",{staticClass:"greeting",domProps:{innerHTML:e._s(e.message)}}),e._v(" "),!e.components&&e.hasError?n("div",{staticClass:"greeting greeting-error",domProps:{innerHTML:e._s(e.errorMessage)}}):e._e(),e._v(" "),n("topic-component-group",{attrs:{"topic-components":e.options.components,item:e.item}}),e._v(" "),e._l(e.components,function(t,s){return e.components?n(t.type,{key:"greeting",tag:"component",staticClass:"topic-comp",attrs:{slots:t.slots}}):e._e()})],2)},[],!1,null,"6fb6249c",null);t.default=r.exports}}]);