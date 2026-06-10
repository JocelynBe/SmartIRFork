var Ht=Object.defineProperty;var Rt=(r,t,e)=>t in r?Ht(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var F=(r,t,e)=>Rt(r,typeof t!="symbol"?t+"":t,e);var j=globalThis,z=j.ShadowRoot&&(j.ShadyCSS===void 0||j.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol(),ct=new WeakMap,M=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==G)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(z&&t===void 0){let s=e!==void 0&&e.length===1;s&&(t=ct.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&ct.set(e,t))}return t}toString(){return this.cssText}},dt=r=>new M(typeof r=="string"?r:r+"",void 0,G),K=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((s,i,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new M(e,r,G)},pt=(r,t)=>{if(z)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let s=document.createElement("style"),i=j.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,r.appendChild(s)}},J=z?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let s of t.cssRules)e+=s.cssText;return dt(e)})(r):r;var{is:Ut,defineProperty:Nt,getOwnPropertyDescriptor:It,getOwnPropertyNames:Dt,getOwnPropertySymbols:Lt,getPrototypeOf:jt}=Object,W=globalThis,ut=W.trustedTypes,zt=ut?ut.emptyScript:"",Wt=W.reactiveElementPolyfillSupport,P=(r,t)=>r,Y={toAttribute(r,t){switch(t){case Boolean:r=r?zt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},ft=(r,t)=>!Ut(r,t),gt={attribute:!0,type:String,converter:Y,reflect:!1,useDefault:!1,hasChanged:ft};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;var v=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=gt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Nt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){let{get:i,set:o}=It(this.prototype,t)??{get(){return this[e]},set(n){this[e]=n}};return{get:i,set(n){let c=i?.call(this);o?.call(this,n),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??gt}static _$Ei(){if(this.hasOwnProperty(P("elementProperties")))return;let t=jt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(P("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(P("properties"))){let e=this.properties,s=[...Dt(e),...Lt(e)];for(let i of s)this.createProperty(i,e[i])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[e,s]of this.elementProperties){let i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let s=new Set(t.flat(1/0).reverse());for(let i of s)e.unshift(J(i))}else t!==void 0&&e.push(J(t));return e}static _$Eu(t,e){let s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return pt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){let s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){let o=(s.converter?.toAttribute!==void 0?s.converter:Y).toAttribute(e,s.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){let s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=s.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:Y;this._$Em=i;let c=n.fromAttribute(e,o.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,e,s,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??ft)(o,e)||s.useDefault&&s.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:o},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,o]of s){let{wrapped:n}=o,c=this[i];n!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,o,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};v.elementStyles=[],v.shadowRootOptions={mode:"open"},v[P("elementProperties")]=new Map,v[P("finalized")]=new Map,Wt?.({ReactiveElement:v}),(W.reactiveElementVersions??=[]).push("2.1.2");var it=globalThis,_t=r=>r,B=it.trustedTypes,mt=B?B.createPolicy("lit-html",{createHTML:r=>r}):void 0,xt="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,St="?"+y,Bt=`<${St}>`,E=document,O=()=>E.createComment(""),H=r=>r===null||typeof r!="object"&&typeof r!="function",rt=Array.isArray,Vt=r=>rt(r)||typeof r?.[Symbol.iterator]=="function",Z=`[ 	
\f\r]`,k=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,vt=/-->/g,$t=/>/g,x=RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),yt=/'/g,bt=/"/g,Et=/^(?:script|style|textarea|title)$/i,ot=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),N=ot(1),te=ot(2),ee=ot(3),$=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),At=new WeakMap,S=E.createTreeWalker(E,129);function wt(r,t){if(!rt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return mt!==void 0?mt.createHTML(t):t}var qt=(r,t)=>{let e=r.length-1,s=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=k;for(let c=0;c<e;c++){let a=r[c],h,p,l=-1,g=0;for(;g<a.length&&(n.lastIndex=g,p=n.exec(a),p!==null);)g=n.lastIndex,n===k?p[1]==="!--"?n=vt:p[1]!==void 0?n=$t:p[2]!==void 0?(Et.test(p[2])&&(i=RegExp("</"+p[2],"g")),n=x):p[3]!==void 0&&(n=x):n===x?p[0]===">"?(n=i??k,l=-1):p[1]===void 0?l=-2:(l=n.lastIndex-p[2].length,h=p[1],n=p[3]===void 0?x:p[3]==='"'?bt:yt):n===bt||n===yt?n=x:n===vt||n===$t?n=k:(n=x,i=void 0);let f=n===x&&r[c+1].startsWith("/>")?" ":"";o+=n===k?a+Bt:l>=0?(s.push(h),a.slice(0,l)+xt+a.slice(l)+y+f):a+y+(l===-2?c:f)}return[wt(r,o+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]},R=class r{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0,c=t.length-1,a=this.parts,[h,p]=qt(t,e);if(this.el=r.createElement(h,s),S.currentNode=this.el.content,e===2||e===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=S.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(xt)){let g=p[n++],f=i.getAttribute(l).split(y),A=/([.?@])?(.*)/.exec(g);a.push({type:1,index:o,name:A[2],strings:f,ctor:A[1]==="."?X:A[1]==="?"?tt:A[1]==="@"?et:T}),i.removeAttribute(l)}else l.startsWith(y)&&(a.push({type:6,index:o}),i.removeAttribute(l));if(Et.test(i.tagName)){let l=i.textContent.split(y),g=l.length-1;if(g>0){i.textContent=B?B.emptyScript:"";for(let f=0;f<g;f++)i.append(l[f],O()),S.nextNode(),a.push({type:2,index:++o});i.append(l[g],O())}}}else if(i.nodeType===8)if(i.data===St)a.push({type:2,index:o});else{let l=-1;for(;(l=i.data.indexOf(y,l+1))!==-1;)a.push({type:7,index:o}),l+=y.length-1}o++}}static createElement(t,e){let s=E.createElement("template");return s.innerHTML=t,s}};function w(r,t,e=r,s){if(t===$)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl,o=H(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=w(r,i._$AS(r,t.values),i,s)),t}var Q=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??E).importNode(e,!0);S.currentNode=i;let o=S.nextNode(),n=0,c=0,a=s[0];for(;a!==void 0;){if(n===a.index){let h;a.type===2?h=new U(o,o.nextSibling,this,t):a.type===1?h=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(h=new st(o,this,t)),this._$AV.push(h),a=s[++c]}n!==a?.index&&(o=S.nextNode(),n++)}return S.currentNode=E,i}p(t){let e=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}},U=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=w(this,t,e),H(t)?t===u||t==null||t===""?(this._$AH!==u&&this._$AR(),this._$AH=u):t!==this._$AH&&t!==$&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==u&&H(this._$AH)?this._$AA.nextSibling.data=t:this.T(E.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=R.createElement(wt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{let o=new Q(i,this),n=o.u(this.options);o.p(e),this.T(n),this._$AH=o}}_$AC(t){let e=At.get(t.strings);return e===void 0&&At.set(t.strings,e=new R(t)),e}k(t){rt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,s,i=0;for(let o of t)i===e.length?e.push(s=new r(this.O(O()),this.O(O()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let s=_t(t).nextSibling;_t(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},T=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=u,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=u}_$AI(t,e=this,s,i){let o=this.strings,n=!1;if(o===void 0)t=w(this,t,e,0),n=!H(t)||t!==this._$AH&&t!==$,n&&(this._$AH=t);else{let c=t,a,h;for(t=o[0],a=0;a<o.length-1;a++)h=w(this,c[s+a],e,a),h===$&&(h=this._$AH[a]),n||=!H(h)||h!==this._$AH[a],h===u?t=u:t!==u&&(t+=(h??"")+o[a+1]),this._$AH[a]=h}n&&!i&&this.j(t)}j(t){t===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},X=class extends T{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===u?void 0:t}},tt=class extends T{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==u)}},et=class extends T{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=w(this,t,e,0)??u)===$)return;let s=this._$AH,i=t===u&&s!==u||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==u&&(s===u||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},st=class{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){w(this,t)}};var Ft=it.litHtmlPolyfillSupport;Ft?.(R,U),(it.litHtmlVersions??=[]).push("3.3.3");var Tt=(r,t,e)=>{let s=e?.renderBefore??t,i=s._$litPart$;if(i===void 0){let o=e?.renderBefore??null;s._$litPart$=i=new U(t.insertBefore(O(),o),o,void 0,e??{})}return i._$AI(r),i};var nt=globalThis,b=class extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Tt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return $}};b._$litElement$=!0,b.finalized=!0,nt.litElementHydrateSupport?.({LitElement:b});var Gt=nt.litElementPolyfillSupport;Gt?.({LitElement:b});(nt.litElementVersions??=[]).push("4.2.2");var Ct={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Mt=r=>(...t)=>({_$litDirective$:r,values:t}),V=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,s){this._$Ct=t,this._$AM=e,this._$Ci=s}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var at=Mt(class extends V{constructor(r){if(super(r),r.type!==Ct.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(let s in t)t[s]&&!this.nt?.has(s)&&this.st.add(s);return this.render(t)}let e=r.element.classList;for(let s of this.st)s in t||(e.remove(s),this.st.delete(s));for(let s in t){let i=!!t[s];i===this.st.has(s)||this.nt?.has(s)||(i?(e.add(s),this.st.add(s)):(e.remove(s),this.st.delete(s)))}return $}});var Kt={"6h":"6h","24h":"24h","7d":"7d"},Pt={"6h":6*3600*1e3,"24h":24*3600*1e3,"7d":7*24*3600*1e3},I=class extends b{constructor(){super(),this._range="24h",this._logCollapsed=!1,this._events=[],this._tempHistory={living:[],bedroom:[]},this._sensorIds={tempDay:null,tempNight:null,status:null,mode:null,algorithm:null,dayTarget:null,nightTarget:null},this._disconnected=!1}disconnectedCallback(){super.disconnectedCallback(),this._disconnected=!0}connectedCallback(){super.connectedCallback(),this._discoverEntities(),this._fetchData()}updated(t){t.has("hass")&&this.hass&&(this._discoverEntities(),this._fetchData()),(t.has("_tempHistory")||t.has("_range"))&&this._renderGraph()}_discoverEntities(){if(!this.hass||!this.hass.states)return;let t=this.hass.states;for(let e of Object.keys(t))e.startsWith("sensor.thermoloop_status")&&(this._sensorIds.status=e),e.startsWith("select.thermoloop_mode")&&(this._sensorIds.mode=e),e.startsWith("select.thermoloop_algorithm")&&(this._sensorIds.algorithm=e),e.startsWith("number.thermoloop_target_day")&&(this._sensorIds.dayTarget=e),e.startsWith("number.thermoloop_target_night")&&(this._sensorIds.nightTarget=e)}async _fetchData(){this.hass&&(this._fetchHistory(),this._fetchEvents())}async _fetchHistory(){if(!this.hass||!this.hass.callWS)return;let t=new Date,e=new Date(t.getTime()-Pt[this._range]),s=[];if(this._sensorIds.status){let i=this.hass.states[this._sensorIds.status];if(i&&i.attributes){let o=i.attributes.active_sensor;o&&s.push(o)}}if(s.length===0)for(let[i,o]of Object.entries(this.hass.states))o.attributes&&o.attributes.device_class==="temperature"&&s.push(i);if(s.length!==0)try{let i=await this.hass.callWS({type:"history/history_during_period",start_time:e.toISOString(),end_time:t.toISOString(),entity_ids:s,minimal_response:!0,no_attributes:!0}),o={living:[],bedroom:[]};for(let[n,c]of Object.entries(i)){let a=o.living.length<=o.bedroom.length?"living":"bedroom";o[a]=c.map(h=>({t:(h.lu??h.lc)*1e3,v:parseFloat(h.s)})).filter(h=>!isNaN(h.v)&&h.t>0)}this._tempHistory=o}catch(i){console.warn("ThermoLoop: history fetch failed",i)}}async _fetchEvents(){if(!this.hass||!this.hass.callWS||!this._sensorIds.status){this._events=[];return}let t=new Date,e=new Date(t.getTime()-Pt[this._range]);try{let i=(await this.hass.callWS({type:"history/history_during_period",start_time:e.toISOString(),end_time:t.toISOString(),entity_ids:[this._sensorIds.status],minimal_response:!1,no_attributes:!1}))[this._sensorIds.status]||[],o=[],n=null,c={};for(let a of i){a.a&&(c=a.a);let h=a.s,p=(a.lc??a.lu)*1e3;if(h===n)continue;n=h;let l=c.reason?` \u2014 ${c.reason}`:"";o.push({time:new Date(p).toLocaleTimeString(),detail:`${h}${l}`,type:h==="error"?"leave":"command"})}this._events=o.slice(-100)}catch(s){console.warn("ThermoLoop: status history fetch failed",s),this._events=[]}}_findEntity(t){if(!this.hass||!this.hass.states)return null;for(let e of Object.keys(this.hass.states))if(e.startsWith(t))return e;return null}_entityState(t,e=null){return!t||!this.hass||!this.hass.states[t]?e:this.hass.states[t].state}_entityAttr(t,e,s=null){if(!t||!this.hass||!this.hass.states[t])return s;let i=this.hass.states[t].attributes;return i?i[e]:s}_statusValue(t,e="\u2014"){if(!this._sensorIds.status)return e;let s=this.hass&&this.hass.states[this._sensorIds.status];return s?t==="state"?s.state:s.attributes?s.attributes[t]:e:e}_callService(t,e,s){this.hass&&this.hass.callService(t,e,s)}_setDayTarget(t){this._sensorIds.dayTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.dayTarget,value:Math.max(16,Math.min(30,t))})}_setNightTarget(t){this._sensorIds.nightTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.nightTarget,value:Math.max(16,Math.min(30,t))})}_setMode(t){this._sensorIds.mode&&this._callService("select","select_option",{entity_id:this._sensorIds.mode,option:t})}_setAlgorithm(t){this._sensorIds.algorithm&&this._callService("select","select_option",{entity_id:this._sensorIds.algorithm,option:t})}_renderGraph(){let t=this.shadowRoot&&this.shadowRoot.getElementById("tempChart");if(!t)return;let e=t.getContext("2d"),s=window.devicePixelRatio||1,i=t.getBoundingClientRect(),o=i.width,n=i.height;t.width=o*s,t.height=n*s,e.scale(s,s),e.clearRect(0,0,o,n);let c=[];if(this._tempHistory.living.length>0&&c.push({data:this._tempHistory.living,color:"#03a9f4",label:"Living",lineDash:[]}),this._tempHistory.bedroom.length>0&&c.push({data:this._tempHistory.bedroom,color:"#ff9800",label:"Bedroom",lineDash:[6,4]}),c.length===0||c.every(d=>d.data.length<2)){e.fillStyle="#999",e.font="14px sans-serif",e.textAlign="center",e.fillText("Waiting for temperature data\u2026",o/2,n/2);return}let a={top:16,right:16,bottom:28,left:48},h=o-a.left-a.right,p=n-a.top-a.bottom,l=[],g=[];for(let d of c)for(let _ of d.data)l.push(_.v),g.push(_.t);if(l.length===0)return;let f=Math.floor(Math.min(...l)-1),A=Math.ceil(Math.max(...l)+1),q=Math.min(...g),kt=Math.max(...g),lt=Math.max(kt-q,1),Ot=d=>a.left+(d-q)/lt*h,ht=d=>a.top+p-(d-f)/(A-f)*p;e.strokeStyle="rgba(0,0,0,0.06)",e.lineWidth=1;for(let d=0;d<=4;d++){let _=a.top+p/4*d;e.beginPath(),e.moveTo(a.left,_),e.lineTo(o-a.right,_),e.stroke()}e.fillStyle="rgba(0,0,0,0.4)",e.font="11px sans-serif",e.textAlign="right";for(let d=0;d<=4;d++){let _=f+(A-f)/4*d,m=a.top+p-p/4*d;e.fillText(_.toFixed(1),a.left-6,m+4)}e.textAlign="center";for(let d=0;d<=4;d++){let _=q+lt/4*d,m=a.left+h/4*d,L=new Date(_).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});e.fillText(L,m,n-6)}for(let d of c){if(d.data.length<2)continue;e.strokeStyle=d.color,e.lineWidth=2,e.setLineDash(d.lineDash),e.beginPath();let _=[...d.data].sort((m,C)=>m.t-C.t);for(let m=0;m<_.length;m++){let C=Ot(_[m].t),L=ht(_[m].v);m===0?e.moveTo(C,L):e.lineTo(C,L)}e.stroke(),e.setLineDash([])}let D=this._statusValue("target");if(D&&D!=="\u2014"){let d=ht(parseFloat(D));e.strokeStyle="rgba(0,0,0,0.25)",e.lineWidth=1,e.setLineDash([4,4]),e.beginPath(),e.moveTo(a.left,d),e.lineTo(o-a.right,d),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.35)",e.font="10px sans-serif",e.textAlign="left",e.fillText(`Target ${D}\xB0C`,o-a.right-70,d-4)}}_rangeHistory(t){this._range=t,this._fetchHistory(),this._fetchEvents()}render(){let t=this._entityState(this._sensorIds.mode,"auto"),e=this._entityState(this._sensorIds.algorithm,"v0"),s=parseFloat(this._entityState(this._sensorIds.dayTarget,"22"))||22,i=parseFloat(this._entityState(this._sensorIds.nightTarget,"24"))||24,o=this._statusValue("state"),n=this._statusValue("reason"),c=this._statusValue("active_sensor"),a=this._statusValue("current_temp"),h=this._statusValue("target"),p=this._entityState(this._findEntity("select.thermoloop_mode"),"auto");return N`
      <div class="grid">
        <!-- Status strip -->
        <div class="status">
          <div class="status-item">
            <span class="status-label">Status</span>
            <span class="status-value ${o}">${o||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Mode</span>
            <span class="status-value">${t}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Active Sensor</span>
            <span class="status-value">${c||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Temperature</span>
            <span class="status-value">${a!=null?`${a}\xB0C`:"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${h!=null?`${h}\xB0C`:"\u2014"}</span>
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
            ${Object.entries(Kt).map(([l,g])=>N`
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
            ${this._events.length===0?N`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`:this._events.map(l=>N`
                <div class="log-entry ${l.type}">
                  <span class="log-time">${l.time}</span>
                  <span class="log-detail">${l.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}};F(I,"styles",K`
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

  `),F(I,"properties",{hass:{type:Object},config:{type:Object},_range:{state:!0},_logCollapsed:{state:!0},_events:{state:!0},_tempHistory:{state:!0}});customElements.define("thermoloop-panel",I);
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
