var Ht=Object.defineProperty;var Nt=(o,t,e)=>t in o?Ht(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e;var F=(o,t,e)=>Nt(o,typeof t!="symbol"?t+"":t,e);var j=globalThis,z=j.ShadowRoot&&(j.ShadyCSS===void 0||j.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ct=new WeakMap,k=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(z&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ct.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ct.set(e,t))}return t}toString(){return this.cssText}},dt=o=>new k(typeof o=="string"?o:o+"",void 0,G),K=(o,...t)=>{let e=o.length===1?o[0]:t.reduce((s,i,r)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+o[r+1],o[0]);return new k(e,o,G)},pt=(o,t)=>{if(z)o.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=j.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,o.appendChild(s)}},J=z?o=>o:o=>o instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return dt(e)})(o):o;var{is:Rt,defineProperty:Ut,getOwnPropertyDescriptor:Dt,getOwnPropertyNames:It,getOwnPropertySymbols:Lt,getPrototypeOf:jt}=Object,W=globalThis,ut=W.trustedTypes,zt=ut?ut.emptyScript:"",Wt=W.reactiveElementPolyfillSupport,M=(o,t)=>o,Y={toAttribute(o,t){switch(t){case Boolean:o=o?zt:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,t){let e=o;switch(t){case Boolean:e=o!==null;break;case Number:e=o===null?null:Number(o);break;case Object:case Array:try{e=JSON.parse(o)}catch{e=null}}return e}},ft=(o,t)=>!Rt(o,t),gt={attribute:!0,type:String,converter:Y,reflect:!1,useDefault:!1,hasChanged:ft};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=gt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Ut(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:r}=Dt(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let h=i?.call(this);r?.call(this,n),this.requestUpdate(t,h,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??gt}static _$Ei(){if(this.hasOwnProperty(M("elementProperties")))return;let t=jt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(M("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(M("properties"))){let e=this.properties,s=[...It(e),...Lt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(J(i))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return pt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let r=(s.converter?.toAttribute!==void 0?s.converter:Y).toAttribute(e,s.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let r=s.getPropertyOptions(i),n=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Y;this._$Em=i;let h=n.fromAttribute(e,r.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(t!==void 0){let n=this.constructor;if(i===!1&&(r=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??ft)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),r!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,r]of s){let{wrapped:n}=r,h=this[i];n!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,r,h)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[M("elementProperties")]=new Map,v[M("finalized")]=new Map,Wt?.({ReactiveElement:v}),(W.reactiveElementVersions??=[]).push("2.1.2");var it=globalThis,mt=o=>o,B=it.trustedTypes,_t=B?B.createPolicy("lit-html",{createHTML:o=>o}):void 0,xt="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,St="?"+y,Bt=`<${St}>`,E=document,P=()=>E.createComment(""),H=o=>o===null||typeof o!="object"&&typeof o!="function",ot=Array.isArray,Vt=o=>ot(o)||typeof o?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,vt=/-->/g,$t=/>/g,x=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),yt=/'/g,bt=/"/g,Et=/^(?:script|style|textarea|title)$/i,rt=o=>(t,...e)=>({_$litType$:o,strings:t,values:e}),U=rt(1),te=rt(2),ee=rt(3),$=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),At=new WeakMap,S=E.createTreeWalker(E,129);function wt(o,t){if(!ot(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return _t!==void 0?_t.createHTML(t):t}var qt=(o,t)=>{let e=o.length-1,s=[],i,r=t===2?"<svg>":t===3?"<math>":"",n=O;for(let h=0;h<e;h++){let a=o[h],d,p,l=-1,g=0;for(;g<a.length&&(n.lastIndex=g,p=n.exec(a),p!==null);)g=n.lastIndex,n===O?p[1]==="!--"?n=vt:p[1]!==void 0?n=$t:p[2]!==void 0?(Et.test(p[2])&&(i=RegExp("</"+p[2],"g")),n=x):p[3]!==void 0&&(n=x):n===x?p[0]===">"?(n=i??O,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,d=p[1],n=p[3]===void 0?x:p[3]==='"'?bt:yt):n===bt||n===yt?n=x:n===vt||n===$t?n=O:(n=x,i=void 0);let f=n===x&&o[h+1].startsWith("/>")?" ":"";r+=n===O?a+Bt:l>=0?(s.push(d),a.slice(0,l)+xt+a.slice(l)+y+f):a+y+(l===-2?h:f)}return[wt(o,r+(o[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},N=class o{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,n=0,h=t.length-1,a=this.parts,[d,p]=qt(t,e);if(this.el=o.createElement(d,s),S.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=S.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(xt)){let g=p[n++],f=i.getAttribute(l).split(y),A=/([.?@])?(.*)/.exec(g);a.push({type:1,index:r,name:A[2],strings:f,ctor:A[1]==="."?X:A[1]==="?"?tt:A[1]==="@"?et:T}),i.removeAttribute(l)}else l.startsWith(y)&&(a.push({type:6,index:r}),i.removeAttribute(l));if(Et.test(i.tagName)){let l=i.textContent.split(y),g=l.length-1;if(g>0){i.textContent=B?B.emptyScript:"";for(let f=0;f<g;f++)i.append(l[f],P()),S.nextNode(),a.push({type:2,index:++r});i.append(l[g],P())}}}else if(i.nodeType===8)if(i.data===St)a.push({type:2,index:r});else{let l=-1;for(;(l=i.data.indexOf(y,l+1))!==-1;)a.push({type:7,index:r}),l+=y.length-1}r++}}static createElement(t,e){let s=E.createElement("template");return s.innerHTML=t,s}};function w(o,t,e=o,s){if(t===$)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,r=H(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(o),i._$AT(o,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=w(o,i._$AS(o,t.values),i,s)),t}var Q=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??E).importNode(e,!0);S.currentNode=i;let r=S.nextNode(),n=0,h=0,a=s[0];for(;a!==void 0;){if(n===a.index){let d;a.type===2?d=new R(r,r.nextSibling,this,t):a.type===1?d=new a.ctor(r,a.name,a.strings,this,t):a.type===6&&(d=new st(r,this,t)),this._$AV.push(d),a=s[++h]}n!==a?.index&&(r=S.nextNode(),n++)}return S.currentNode=E,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},R=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=w(this,t,e),H(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==$&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(E.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=N.createElement(wt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let r=new Q(i,this),n=r.u(this.options);r.p(e),this.T(n),this._$AH=r}}_$AC(t){let e=At.get(t.strings);return e===void 0&&At.set(t.strings,e=new N(t)),e}k(t){ot(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let r of t)i===e.length?e.push(s=new o(this.O(P()),this.O(P()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=mt(t).nextSibling;mt(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,i){let r=this.strings,n=!1;if(r===void 0)t=w(this,t,e,0),n=!H(t)||t!==this._$AH&&t!==$,n&&(this._$AH=t);else{let h=t,a,d;for(t=r[0],a=0;a<r.length-1;a++)d=w(this,h[s+a],e,a),d===$&&(d=this._$AH[a]),n||=!H(d)||d!==this._$AH[a],d===u?t=u:t!==u&&(t+=(d??"")+r[a+1]),this._$AH[a]=d}n&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},X=class extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},tt=class extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},et=class extends T{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=w(this,t,e,0)??u)===$)return;let s=this._$AH,i=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==u&&(s===u||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},st=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){w(this,t)}};var Ft=it.litHtmlPolyfillSupport;Ft?.(N,R),(it.litHtmlVersions??=[]).push("3.3.3");var Tt=(o,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let r=e?.renderBefore??null;s._$litPart$=i=new R(t.insertBefore(P(),r),r,void 0,e??{})}return i._$AI(o),i};var nt=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Tt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};b._$litElement$=!0,b.finalized=!0,nt.litElementHydrateSupport?.({LitElement:b});var Gt=nt.litElementPolyfillSupport;Gt?.({LitElement:b});(nt.litElementVersions??=[]).push("4.2.2");var Ct={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},kt=o=>(...t)=>({_$litDirective$:o,values:t}),V=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var at=kt(class extends V{constructor(o){if(super(o),o.type!==Ct.ATTRIBUTE||o.name!=="class"||o.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(o){return" "+Object.keys(o).filter(t=>o[t]).join(" ")+" "}update(o,[t]){if(this.st===void 0){this.st=new Set,o.strings!==void 0&&(this.nt=new Set(o.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let e=o.element.classList;for(let s of this.st)s in t||(e.remove(s),this.st.delete(s));for(let s in t){let i=!!t[s];i===this.st.has(s)||this.nt?.has(s)||(i?(e.add(s),this.st.add(s)):(e.remove(s),this.st.delete(s)))}return $}});var Kt={"6h":"6h","24h":"24h","7d":"7d"},Mt={"6h":6*3600*1e3,"24h":24*3600*1e3,"7d":7*24*3600*1e3},D=class extends b{constructor(){super(),this._range="24h",this._logCollapsed=!1,this._events=[],this._tempHistory={living:[],bedroom:[]},this._sensorIds={tempDay:null,tempNight:null,status:null,mode:null,algorithm:null,dayTarget:null,nightTarget:null},this._disconnected=!1}disconnectedCallback(){super.disconnectedCallback(),this._disconnected=!0}connectedCallback(){super.connectedCallback(),this._discoverEntities(),this._fetchData()}updated(t){t.has("hass")&&this.hass&&(this._discoverEntities(),this._fetchData()),(t.has("_tempHistory")||t.has("_range"))&&this._renderGraph()}_discoverEntities(){if(!this.hass||!this.hass.states)return;let t=this.hass.states;for(let e of Object.keys(t))e.startsWith("sensor.thermoloop_status")&&(this._sensorIds.status=e),e.startsWith("select.thermoloop_mode")&&(this._sensorIds.mode=e),e.startsWith("select.thermoloop_algorithm")&&(this._sensorIds.algorithm=e),e.startsWith("number.thermoloop_target_day")&&(this._sensorIds.dayTarget=e),e.startsWith("number.thermoloop_target_night")&&(this._sensorIds.nightTarget=e)}async _fetchData(){this.hass&&(this._fetchHistory(),this._fetchEvents())}async _fetchHistory(){if(!this.hass||!this.hass.callWS)return;let t=new Date,e=new Date(t.getTime()-Mt[this._range]),s=[];if(this._sensorIds.status){let i=this.hass.states[this._sensorIds.status];if(i&&i.attributes){let r=i.attributes.active_sensor;r&&s.push(r)}}if(s.length===0)for(let[i,r]of Object.entries(this.hass.states))r.attributes&&r.attributes.device_class==="temperature"&&s.push(i);if(s.length!==0)try{let i=await this.hass.callWS({type:"history/history_during_period",start_time:e.toISOString(),end_time:t.toISOString(),entity_ids:s,minimal_response:!0,no_attributes:!0}),r={living:[],bedroom:[]};for(let[n,h]of Object.entries(i)){let a=r.living.length<=r.bedroom.length?"living":"bedroom";r[a]=h.map(d=>({t:new Date(d.last_changed).getTime(),v:parseFloat(d.state)})).filter(d=>!isNaN(d.v))}this._tempHistory=r}catch(i){console.warn("ThermoLoop: history fetch failed",i)}}async _fetchEvents(){if(!this.hass||!this.hass.callWS)return;let t=new Date,e=new Date(t.getTime()-Mt[this._range]);try{let s=await this.hass.callWS({type:"logbook/get_events",start_time:e.toISOString(),end_time:t.toISOString(),event_types:["thermoloop_command"],entity_ids:[]}),i=[];for(let r of s)r.event_type==="thermoloop_command"&&i.push({time:new Date(r.time).toLocaleTimeString(),detail:r.message||r.title||JSON.stringify(r),type:"command"});for(let r of Object.keys(this.hass.states))if(r.startsWith("device_tracker.")){let n=this.hass.states[r];n&&n.state}i.sort((r,n)=>new Date(r.time)-new Date(n.time)),this._events=i.slice(-100)}catch(s){console.warn("ThermoLoop: logbook fetch failed",s)}}_findEntity(t){if(!this.hass||!this.hass.states)return null;for(let e of Object.keys(this.hass.states))if(e.startsWith(t))return e;return null}_entityState(t,e=null){return!t||!this.hass||!this.hass.states[t]?e:this.hass.states[t].state}_entityAttr(t,e,s=null){if(!t||!this.hass||!this.hass.states[t])return s;let i=this.hass.states[t].attributes;return i?i[e]:s}_statusValue(t,e="\u2014"){if(!this._sensorIds.status)return e;let s=this.hass&&this.hass.states[this._sensorIds.status];return s?t==="state"?s.state:s.attributes?s.attributes[t]:e:e}_callService(t,e,s){this.hass&&this.hass.callService(t,e,s)}_setDayTarget(t){this._sensorIds.dayTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.dayTarget,value:Math.max(16,Math.min(30,t))})}_setNightTarget(t){this._sensorIds.nightTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.nightTarget,value:Math.max(16,Math.min(30,t))})}_setMode(t){this._sensorIds.mode&&this._callService("select","select_option",{entity_id:this._sensorIds.mode,option:t})}_setAlgorithm(t){this._sensorIds.algorithm&&this._callService("select","select_option",{entity_id:this._sensorIds.algorithm,option:t})}_renderGraph(){let t=this.shadowRoot&&this.shadowRoot.getElementById("tempChart");if(!t)return;let e=t.getContext("2d"),s=window.devicePixelRatio||1,i=t.getBoundingClientRect(),r=i.width,n=i.height;t.width=r*s,t.height=n*s,e.scale(s,s),e.clearRect(0,0,r,n);let h=[];if(this._tempHistory.living.length>0&&h.push({data:this._tempHistory.living,color:"#03a9f4",label:"Living",lineDash:[]}),this._tempHistory.bedroom.length>0&&h.push({data:this._tempHistory.bedroom,color:"#ff9800",label:"Bedroom",lineDash:[6,4]}),h.length===0||h.every(c=>c.data.length<2)){e.fillStyle="#999",e.font="14px sans-serif",e.textAlign="center",e.fillText("Waiting for temperature data\u2026",r/2,n/2);return}let a={top:16,right:16,bottom:28,left:48},d=r-a.left-a.right,p=n-a.top-a.bottom,l=[],g=[];for(let c of h)for(let m of c.data)l.push(m.v),g.push(m.t);if(l.length===0)return;let f=Math.floor(Math.min(...l)-1),A=Math.ceil(Math.max(...l)+1),q=Math.min(...g),Ot=Math.max(...g),lt=Math.max(Ot-q,1),Pt=c=>a.left+(c-q)/lt*d,ht=c=>a.top+p-(c-f)/(A-f)*p;e.strokeStyle="rgba(0,0,0,0.06)",e.lineWidth=1;for(let c=0;c<=4;c++){let m=a.top+p/4*c;e.beginPath(),e.moveTo(a.left,m),e.lineTo(r-a.right,m),e.stroke()}e.fillStyle="rgba(0,0,0,0.4)",e.font="11px sans-serif",e.textAlign="right";for(let c=0;c<=4;c++){let m=f+(A-f)/4*c,_=a.top+p-p/4*c;e.fillText(m.toFixed(1),a.left-6,_+4)}e.textAlign="center";for(let c=0;c<=4;c++){let m=q+lt/4*c,_=a.left+d/4*c,L=new Date(m).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});e.fillText(L,_,n-6)}for(let c of h){if(c.data.length<2)continue;e.strokeStyle=c.color,e.lineWidth=2,e.setLineDash(c.lineDash),e.beginPath();let m=[...c.data].sort((_,C)=>_.t-C.t);for(let _=0;_<m.length;_++){let C=Pt(m[_].t),L=ht(m[_].v);_===0?e.moveTo(C,L):e.lineTo(C,L)}e.stroke(),e.setLineDash([])}let I=this._statusValue("target");if(I&&I!=="\u2014"){let c=ht(parseFloat(I));e.strokeStyle="rgba(0,0,0,0.25)",e.lineWidth=1,e.setLineDash([4,4]),e.beginPath(),e.moveTo(a.left,c),e.lineTo(r-a.right,c),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.35)",e.font="10px sans-serif",e.textAlign="left",e.fillText(`Target ${I}\xB0C`,r-a.right-70,c-4)}}_rangeHistory(t){this._range=t,this._fetchHistory(),this._fetchEvents()}render(){let t=this._entityState(this._sensorIds.mode,"auto"),e=this._entityState(this._sensorIds.algorithm,"v0"),s=parseFloat(this._entityState(this._sensorIds.dayTarget,"22"))||22,i=parseFloat(this._entityState(this._sensorIds.nightTarget,"24"))||24,r=this._statusValue("state"),n=this._statusValue("reason"),h=this._statusValue("active_sensor"),a=this._statusValue("current_temp"),d=this._statusValue("target"),p=this._entityState(this._findEntity("select.thermoloop_mode"),"auto");return U`
      <div class="grid">
        <!-- Status strip -->
        <div class="status">
          <div class="status-item">
            <span class="status-label">Status</span>
            <span class="status-value ${r}">${r||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Mode</span>
            <span class="status-value">${t}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Active Sensor</span>
            <span class="status-value">${h||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Temperature</span>
            <span class="status-value">${a!=null?`${a}\xB0C`:"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${d!=null?`${d}\xB0C`:"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Algorithm</span>
            <span class="status-value">${e}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Reason</span>
            <span class="status-value" style="font-size:0.85em;font-weight:400">${n||"\u2014"}</span>
          </div>
        </div>

        <!-- Graph -->
        <div class="graph-card">
          <canvas id="tempChart"></canvas>
          <div class="range-chips">
            ${Object.entries(Kt).map(([l,g])=>U`
              <div class="range-chip ${at({active:this._range===l})}"
                   @click=${()=>this._rangeHistory(l)} role="button">${g}</div>
            `)}
          </div>
        </div>

        <!-- Controls -->
        <div class="controls-card">
          <h3>Controls</h3>

          <div class="control-row">
            <span class="control-label">Mode</span>
            <select @change=${l=>this._setMode(l.target.value)} .value=${t}>
              <option value="auto">Auto</option>
              <option value="off">Off</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Algorithm</span>
            <select @change=${l=>this._setAlgorithm(l.target.value)} .value=${e}>
              <option value="v0">v0 — Aggressive</option>
              <option value="v1">v1 — Proportional</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Day Target</span>
            <div class="stepper">
              <button @click=${()=>this._setDayTarget(s-1)}>−</button>
              <span>${s}°C</span>
              <button @click=${()=>this._setDayTarget(s+1)}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${()=>this._setNightTarget(i-1)}>−</button>
              <span>${i}°C</span>
              <button @click=${()=>this._setNightTarget(i+1)}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="log-card ${at({collapsed:this._logCollapsed})}">
          <h3 @click=${()=>this._logCollapsed=!this._logCollapsed}>
            ${this._logCollapsed?"\u25B6":"\u25BC"} Event Log (${this._events.length})
          </h3>
          <div class="log-entries">
            ${this._events.length===0?U`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`:this._events.map(l=>U`
                <div class="log-entry ${l.type}">
                  <span class="log-time">${l.time}</span>
                  <span class="log-detail">${l.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}};F(D,"styles",K`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--primary-font-family, sans-serif);
      color: var(--primary-text-color, #333);
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .grid { grid-template-columns: 1fr; }
    }

    .status {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 16px 24px;
      padding: 16px;
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
    }
    .status-item { display: flex; flex-direction: column; min-width: 70px; }
    .status-label { font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.6; }
    .status-value { font-size: 1.1em; font-weight: 600; margin-top: 2px; }
    .status-value.idle { color: var(--warning-color, #ff9800); }
    .status-value.active { color: var(--success-color, #4caf50); }
    .status-value.off { color: var(--disabled-text-color, #999); }
    .status-value.error,
    .status-value.stale { color: var(--error-color, #f44336); }

    .graph-card {
      grid-column: 1 / -1;
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
      padding: 16px;
    }
    .graph-card canvas {
      width: 100%;
      height: 260px;
      display: block;
      border-radius: 8px;
    }
    .graph-empty {
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.4;
      font-size: 0.9em;
    }
    .range-chips {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      justify-content: center;
    }
    .range-chip {
      padding: 6px 16px;
      border-radius: 16px;
      border: 1px solid var(--divider-color, #ccc);
      cursor: pointer;
      font-size: 0.8em;
      user-select: none;
    }
    .range-chip.active {
      background: var(--primary-color, #03a9f4);
      color: var(--text-primary-color, white);
      border-color: var(--primary-color);
    }

    .controls-card {
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
      padding: 16px;
    }
    .controls-card h3 {
      margin: 0 0 4px 0;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
    }
    .control-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color, #ddd);
    }
    .control-row:last-child { border-bottom: none; }
    .control-label { font-size: 0.85em; }
    .stepper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stepper button {
      width: 30px; height: 30px;
      border-radius: 50%;
      border: 1px solid var(--divider-color, #ccc);
      background: var(--card-background-color);
      cursor: pointer;
      font-size: 1.1em;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .stepper button:hover { background: var(--primary-color, #03a9f4); color: white; }
    .stepper span { min-width: 40px; text-align: center; font-weight: 600; font-size: 1.05em; }
    select {
      background: var(--input-background-color, white);
      border: 1px solid var(--divider-color, #ccc);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 0.85em;
      color: var(--primary-text-color);
    }

    .log-card {
      background: var(--card-background-color, #f0f0f0);
      border-radius: 12px;
      padding: 16px;
      max-height: 360px;
      overflow-y: auto;
    }
    .log-card h3 {
      margin: 0 0 8px 0;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      cursor: pointer;
      user-select: none;
    }
    .log-card.collapsed .log-entries { display: none; }
    .log-entries { display: flex; flex-direction: column; gap: 4px; }
    .log-entry {
      padding: 6px 8px;
      font-size: 0.78em;
      border-radius: 6px;
      display: flex;
      gap: 8px;
      align-items: baseline;
      background: var(--input-background-color, rgba(0,0,0,0.02));
    }
    .log-time { opacity: 0.5; white-space: nowrap; font-family: monospace; font-size: 0.9em; }
    .log-detail { flex: 1; word-break: break-word; }
    .log-entry.command { border-left: 3px solid var(--primary-color, #03a9f4); }
    .log-entry.arrive { border-left: 3px solid var(--success-color, #4caf50); }
    .log-entry.leave { border-left: 3px solid var(--warning-color, #ff9800); }

  `),F(D,"properties",{hass:{type:Object},config:{type:Object},_range:{state:!0},_logCollapsed:{state:!0},_events:{state:!0},_tempHistory:{state:!0}});customElements.define("thermoloop-panel",D);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
