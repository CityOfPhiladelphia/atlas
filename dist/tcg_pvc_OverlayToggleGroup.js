(window.webpackJsonp=window.webpackJsonp||[]).push([[42,38],{260:function(t,e,o){"use strict";var n={props:{slots:{type:Object,default:function(){return{}}},options:{type:Object,default:function(){return{}}},item:{type:Object,default:function(){return{}}}},beforeCreate(){},created(){},computed:{nullValue(){return(this.options||{}).nullValue}},methods:{evaluateSlot(t,e=[],o=""){if(!t)return t;let n;if("function"===typeof t){const e=this.$store.state,o=this.$controller,r=t,s=this.item;n=s?r(e,s,o):r(e)}else n=t;if(!1===n);else if(!n)return o;for(let t of e){const e=this.$config.transforms[t];let o;const r=e.globals;r&&(o=Object.keys(window).filter(t=>r.includes(t)).reduce((t,e)=>(t[e]=window[e],t),{})),n=(0,e.transform)(n,o)}return n}}},r=o(37),s=Object(r.a)(n,void 0,void 0,!1,null,null,null);e.a=s.exports},307:function(t,e,o){var n=o(432);"string"==typeof n&&(n=[[t.i,n,""]]);var r={hmr:!0,transform:void 0,insertInto:void 0};o(17)(n,r);n.locals&&(t.exports=n.locals)},431:function(t,e,o){"use strict";var n=o(307);o.n(n).a},432:function(t,e,o){(t.exports=o(16)(!1)).push([t.i,"\n.container[data-v-372334fb] {\n  margin-bottom: 30px;\n}\n.button[data-v-372334fb] {\n  margin-right: 10px;\n  margin-top: 0px;\n  margin-bottom: 0px;\n}\n.overlay-toggle[data-v-372334fb] {\n  border: 1px solid #f99300 !important;\n  color: #f99300 !important;\n  background: #fff !important;\n}\n.overlay-toggle.mouseover[data-v-372334fb] {\n  background: #444 !important;\n  color: white !important;\n}\n.overlay-toggle.active[data-v-372334fb] {\n  background: #f99300 !important;\n  color: #fff !important;\n}\n",""])},488:function(t,e,o){"use strict";o.r(e);var n={mixins:[o(260).a],data:()=>({mouseover:null}),computed:{items(){return this.evaluateSlot(this.slots.items)}},methods:{isActive(t){return this.$store.state.map.imageOverlay===this.keyForItem(t)},keyForItem(t){return(0,this.options.getKey)(t)},handleClick(t){t.preventDefault();const e=this.$store.state.map.imageOverlay,o=t.target.getAttribute("data-key");e===o?this.$store.commit("setImageOverlay",null):this.$store.commit("setImageOverlay",o)},handleMouseover(t){this.mouseover=t},handleMouseout(){this.mouseover=null},isMousedover(t){return this.keyForItem(t)===this.mouseover}}},r=(o(431),o(37)),s=Object(r.a)(n,function(){var t=this,e=t.$createElement,o=t._self._c||e;return t.items.length?o("div",[o("div",{staticClass:"container"},[t.slots.title?o("h4",[t._v("\n      "+t._s(t.evaluateSlot(t.slots.title))+"\n    ")]):t._e(),t._v(" "),t._l(t.items,function(e){return o("a",{staticClass:"button overlay-toggle",class:{active:t.isActive(e),mouseover:t.isMousedover(e)},attrs:{href:"#","data-key":t.keyForItem(e)},on:{click:t.handleClick,mouseover:function(o){t.handleMouseover(t.keyForItem(e))},mouseout:t.handleMouseout}},[t._v("\n      "+t._s(t.keyForItem(e))+"\n    ")])})],2)]):t._e()},[],!1,null,"372334fb",null);e.default=s.exports}}]);