var kt=Object.defineProperty;var Mt=(r,t,s)=>t in r?kt(r,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):r[t]=s;var G=(r,t,s)=>Mt(r,typeof t!="symbol"?t+"":t,s);var W=globalThis,B=W.ShadowRoot&&(W.ShadyCSS===void 0||W.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,K=Symbol(),lt=new WeakMap,D=class{constructor(t,s,e){if(this._$cssResult$=!0,e!==K)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(B&&t===void 0){let e=s!==void 0&&s.length===1;e&&(t=lt.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&lt.set(s,t))}return t}toString(){return this.cssText}},ht=r=>new D(typeof r=="string"?r:r+"",void 0,K),J=(r,...t)=>{let s=r.length===1?r[0]:t.reduce((e,i,n)=>e+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new D(s,r,K)},ct=(r,t)=>{if(B)r.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let e=document.createElement("style"),i=W.litNonce;i!==void 0&&e.setAttribute("nonce",i),e.textContent=s.cssText,r.appendChild(e)}},Y=B?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let s="";for(let e of t.cssRules)s+=e.cssText;return ht(s)})(r):r;var{is:Pt,defineProperty:Ot,getOwnPropertyDescriptor:Dt,getOwnPropertyNames:Ht,getOwnPropertySymbols:Nt,getPrototypeOf:It}=Object,V=globalThis,pt=V.trustedTypes,Rt=pt?pt.emptyScript:"",Ut=V.reactiveElementPolyfillSupport,H=(r,t)=>r,Z={toAttribute(r,t){switch(t){case Boolean:r=r?Rt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let s=r;switch(t){case Boolean:s=r!==null;break;case Number:s=r===null?null:Number(r);break;case Object:case Array:try{s=JSON.parse(r)}catch{s=null}}return s}},ut=(r,t)=>!Pt(r,t),dt={attribute:!0,type:String,converter:Z,reflect:!1,useDefault:!1,hasChanged:ut};Symbol.metadata??=Symbol("metadata"),V.litPropertyMetadata??=new WeakMap;var A=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=dt){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){let e=Symbol(),i=this.getPropertyDescriptor(t,e,s);i!==void 0&&Ot(this.prototype,t,i)}}static getPropertyDescriptor(t,s,e){let{get:i,set:n}=Dt(this.prototype,t)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){let l=i?.call(this);n?.call(this,o),this.requestUpdate(t,l,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??dt}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;let t=It(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){let s=this.properties,e=[...Ht(s),...Nt(s)];for(let i of e)this.createProperty(i,s[i])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[e,i]of s)this.elementProperties.set(e,i)}this._$Eh=new Map;for(let[s,e]of this.elementProperties){let i=this._$Eu(s,e);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let i of e)s.unshift(Y(i))}else t!==void 0&&s.push(Y(t));return s}static _$Eu(t,s){let e=s.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let e of s.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ct(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,e){this._$AK(t,e)}_$ET(t,s){let e=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,e);if(i!==void 0&&e.reflect===!0){let n=(e.converter?.toAttribute!==void 0?e.converter:Z).toAttribute(s,e.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,s){let e=this.constructor,i=e._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let n=e.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Z;this._$Em=i;let l=o.fromAttribute(s,n.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,s,e,i=!1,n){if(t!==void 0){let o=this.constructor;if(i===!1&&(n=this[t]),e??=o.getPropertyOptions(t),!((e.hasChanged??ut)(n,s)||e.useDefault&&e.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,e))))return;this.C(t,s,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:e,reflect:i,wrapped:n},o){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??s??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(s=void 0),this._$AL.set(t,s)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[i,n]of e){let{wrapped:o}=n,l=this[i];o!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(s)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};A.elementStyles=[],A.shadowRootOptions={mode:"open"},A[H("elementProperties")]=new Map,A[H("finalized")]=new Map,Ut?.({ReactiveElement:A}),(V.reactiveElementVersions??=[]).push("2.1.2");var rt=globalThis,ft=r=>r,F=rt.trustedTypes,gt=F?F.createPolicy("lit-html",{createHTML:r=>r}):void 0,bt="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,xt="?"+w,Lt=`<${xt}>`,k=document,I=()=>k.createComment(""),R=r=>r===null||typeof r!="object"&&typeof r!="function",ot=Array.isArray,jt=r=>ot(r)||typeof r?.[Symbol.iterator]=="function",Q=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,mt=/-->/g,_t=/>/g,T=RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),vt=/'/g,yt=/"/g,At=/^(?:script|style|textarea|title)$/i,nt=r=>(t,...s)=>({_$litType$:r,strings:t,values:s}),j=nt(1),Yt=nt(2),Zt=nt(3),S=Symbol.for("lit-noChange"),v=Symbol.for("lit-nothing"),$t=new WeakMap,C=k.createTreeWalker(k,129);function St(r,t){if(!ot(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return gt!==void 0?gt.createHTML(t):t}var zt=(r,t)=>{let s=r.length-1,e=[],i,n=t===2?"<svg>":t===3?"<math>":"",o=N;for(let l=0;l<s;l++){let a=r[l],c,d,h=-1,u=0;for(;u<a.length&&(o.lastIndex=u,d=o.exec(a),d!==null);)u=o.lastIndex,o===N?d[1]==="!--"?o=mt:d[1]!==void 0?o=_t:d[2]!==void 0?(At.test(d[2])&&(i=RegExp("</"+d[2],"g")),o=T):d[3]!==void 0&&(o=T):o===T?d[0]===">"?(o=i??N,h=-1):d[1]===void 0?h=-2:(h=o.lastIndex-d[2].length,c=d[1],o=d[3]===void 0?T:d[3]==='"'?yt:vt):o===yt||o===vt?o=T:o===mt||o===_t?o=N:(o=T,i=void 0);let _=o===T&&r[l+1].startsWith("/>")?" ":"";n+=o===N?a+Lt:h>=0?(e.push(c),a.slice(0,h)+bt+a.slice(h)+w+_):a+w+(h===-2?l:_)}return[St(r,n+(r[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},U=class r{constructor({strings:t,_$litType$:s},e){let i;this.parts=[];let n=0,o=0,l=t.length-1,a=this.parts,[c,d]=zt(t,s);if(this.el=r.createElement(c,e),C.currentNode=this.el.content,s===2||s===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=C.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(bt)){let u=d[o++],_=i.getAttribute(h).split(w),y=/([.?@])?(.*)/.exec(u);a.push({type:1,index:n,name:y[2],strings:_,ctor:y[1]==="."?tt:y[1]==="?"?et:y[1]==="@"?st:P}),i.removeAttribute(h)}else h.startsWith(w)&&(a.push({type:6,index:n}),i.removeAttribute(h));if(At.test(i.tagName)){let h=i.textContent.split(w),u=h.length-1;if(u>0){i.textContent=F?F.emptyScript:"";for(let _=0;_<u;_++)i.append(h[_],I()),C.nextNode(),a.push({type:2,index:++n});i.append(h[u],I())}}}else if(i.nodeType===8)if(i.data===xt)a.push({type:2,index:n});else{let h=-1;for(;(h=i.data.indexOf(w,h+1))!==-1;)a.push({type:7,index:n}),h+=w.length-1}n++}}static createElement(t,s){let e=k.createElement("template");return e.innerHTML=t,e}};function M(r,t,s=r,e){if(t===S)return t;let i=e!==void 0?s._$Co?.[e]:s._$Cl,n=R(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,s,e)),e!==void 0?(s._$Co??=[])[e]=i:s._$Cl=i),i!==void 0&&(t=M(r,i._$AS(r,t.values),i,e)),t}var X=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:e}=this._$AD,i=(t?.creationScope??k).importNode(s,!0);C.currentNode=i;let n=C.nextNode(),o=0,l=0,a=e[0];for(;a!==void 0;){if(o===a.index){let c;a.type===2?c=new L(n,n.nextSibling,this,t):a.type===1?c=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(c=new it(n,this,t)),this._$AV.push(c),a=e[++l]}o!==a?.index&&(n=C.nextNode(),o++)}return C.currentNode=k,i}p(t){let s=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,s),s+=e.strings.length-2):e._$AI(t[s])),s++}},L=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,e,i){this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=e,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=M(this,t,s),R(t)?t===v||t==null||t===""?(this._$AH!==v&&this._$AR(),this._$AH=v):t!==this._$AH&&t!==S&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):jt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==v&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(k.createTextNode(t)),this._$AH=t}$(t){let{values:s,_$litType$:e}=t,i=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=U.createElement(St(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===i)this._$AH.p(s);else{let n=new X(i,this),o=n.u(this.options);n.p(s),this.T(o),this._$AH=n}}_$AC(t){let s=$t.get(t.strings);return s===void 0&&$t.set(t.strings,s=new U(t)),s}k(t){ot(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,e,i=0;for(let n of t)i===s.length?s.push(e=new r(this.O(I()),this.O(I()),this,this.options)):e=s[i],e._$AI(n),i++;i<s.length&&(this._$AR(e&&e._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){let e=ft(t).nextSibling;ft(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,e,i,n){this.type=1,this._$AH=v,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=n,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=v}_$AI(t,s=this,e,i){let n=this.strings,o=!1;if(n===void 0)t=M(this,t,s,0),o=!R(t)||t!==this._$AH&&t!==S,o&&(this._$AH=t);else{let l=t,a,c;for(t=n[0],a=0;a<n.length-1;a++)c=M(this,l[e+a],s,a),c===S&&(c=this._$AH[a]),o||=!R(c)||c!==this._$AH[a],c===v?t=v:t!==v&&(t+=(c??"")+n[a+1]),this._$AH[a]=c}o&&!i&&this.j(t)}j(t){t===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},tt=class extends P{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===v?void 0:t}},et=class extends P{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==v)}},st=class extends P{constructor(t,s,e,i,n){super(t,s,e,i,n),this.type=5}_$AI(t,s=this){if((t=M(this,t,s,0)??v)===S)return;let e=this._$AH,i=t===v&&e!==v||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==v&&(e===v||i);i&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},it=class{constructor(t,s,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){M(this,t)}};var Wt=rt.litHtmlPolyfillSupport;Wt?.(U,L),(rt.litHtmlVersions??=[]).push("3.3.3");var wt=(r,t,s)=>{let e=s?.renderBefore??t,i=e._$litPart$;if(i===void 0){let n=s?.renderBefore??null;e._$litPart$=i=new L(t.insertBefore(I(),n),n,void 0,s??{})}return i._$AI(r),i};var at=globalThis,E=class extends A{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=wt(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return S}};E._$litElement$=!0,E.finalized=!0,at.litElementHydrateSupport?.({LitElement:E});var Bt=at.litElementPolyfillSupport;Bt?.({LitElement:E});(at.litElementVersions??=[]).push("4.2.2");var Et={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Tt=r=>(...t)=>({_$litDirective$:r,values:t}),q=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,e){this._$Ct=t,this._$AM=s,this._$Ci=e}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}};var O=Tt(class extends q{constructor(r){if(super(r),r.type!==Et.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(e=>e!=="")));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let s=r.element.classList;for(let e of this.st)e in t||(s.remove(e),this.st.delete(e));for(let e in t){let i=!!t[e];i===this.st.has(e)||this.nt?.has(e)||(i?(s.add(e),this.st.add(e)):(s.remove(e),this.st.delete(e)))}return S}});var Vt={"6h":"6h","24h":"24h","7d":"7d"},Ct={"6h":6*3600*1e3,"24h":24*3600*1e3,"7d":7*24*3600*1e3},z=class extends E{constructor(){super(),this._range="24h",this._logCollapsed=!1,this._events=[],this._tempHistory={living:[],bedroom:[],external:[]},this._sensorIds={tempDay:null,tempNight:null,status:null,mode:null,algorithm:null,dayTarget:null,nightTarget:null,weather:null},this._disconnected=!1}disconnectedCallback(){super.disconnectedCallback(),this._disconnected=!0}connectedCallback(){super.connectedCallback(),this._discoverEntities(),this._fetchData()}updated(t){t.has("hass")&&this.hass&&(this._discoverEntities(),this._fetchData()),(t.has("_tempHistory")||t.has("_range"))&&this._renderGraph()}_toDisplay(t){return t}_fromDisplay(t){return t}_fmtTemp(t,s=1){let e=typeof t=="string"?parseFloat(t):t;return e==null||isNaN(e)?"\u2014":`${e.toFixed(s)}\xB0C`}_smooth(t,s=15*60*1e3){if(!t||t.length===0)return[];let e=s/2,i=new Array(t.length),n=0,o=0,l=0;for(let a=0;a<t.length;a++){let c=t[a].t;for(;n<t.length&&t[n].t<c-e;)l-=t[n].v,n++;for(;o<t.length&&t[o].t<=c+e;)l+=t[o].v,o++;let d=o-n;i[a]={t:c,v:d>0?l/d:t[a].v}}return i}_discoverEntities(){if(!this.hass||!this.hass.states)return;let t=this.hass.states;for(let s of Object.keys(t))s.startsWith("sensor.thermoloop_status")&&(this._sensorIds.status=s),s.startsWith("select.thermoloop_mode")&&(this._sensorIds.mode=s),s.startsWith("select.thermoloop_algorithm")&&(this._sensorIds.algorithm=s),s.startsWith("number.thermoloop_target_day")&&(this._sensorIds.dayTarget=s),s.startsWith("number.thermoloop_target_night")&&(this._sensorIds.nightTarget=s);if(!this._sensorIds.weather)for(let s of Object.keys(t)){if(!s.startsWith("weather."))continue;let e=t[s].attributes;if(e&&!isNaN(parseFloat(e.temperature))){this._sensorIds.weather=s;break}}}async _fetchData(){this.hass&&(this._fetchHistory(),this._fetchEvents())}async _fetchHistory(){if(!this.hass||!this.hass.callWS)return;let t=new Date,s=new Date(t.getTime()-Ct[this._range]),e=[];if(this._sensorIds.status){let o=this.hass.states[this._sensorIds.status];if(o&&o.attributes){let l=o.attributes.active_sensor;l&&e.push(l)}}if(e.length===0)for(let[o,l]of Object.entries(this.hass.states))l.attributes&&l.attributes.device_class==="temperature"&&e.push(o);let i=this._sensorIds.weather,n=i?[...e,i]:[...e];if(n.length!==0)try{let o=await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:n,minimal_response:!1,no_attributes:!1}),l={living:[],bedroom:[],external:[]};for(let[a,c]of Object.entries(o)){if(a===i){let h=null;l.external=c.map(u=>{if(u.a&&u.a.temperature!=null){let _=parseFloat(u.a.temperature);isNaN(_)||(h=_)}return{t:(u.lu??u.lc)*1e3,v:h}}).filter(u=>u.v!=null&&!isNaN(u.v)&&u.t>0);continue}let d=l.living.length<=l.bedroom.length?"living":"bedroom";l[d]=c.map(h=>({t:(h.lu??h.lc)*1e3,v:parseFloat(h.s)})).filter(h=>!isNaN(h.v)&&h.t>0)}this._tempHistory=l}catch(o){console.warn("ThermoLoop: history fetch failed",o)}}async _fetchEvents(){if(!this.hass||!this.hass.callWS||!this._sensorIds.status){this._events=[];return}let t=new Date,s=new Date(t.getTime()-Ct[this._range]);try{let i=(await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:[this._sensorIds.status],minimal_response:!1,no_attributes:!1}))[this._sensorIds.status]||[],n=[],o=null,l={};for(let a of i){a.a&&(l=a.a);let c=a.s,d=(a.lc??a.lu)*1e3;if(c===o)continue;o=c;let h=l.reason?` \u2014 ${l.reason}`:"";n.push({time:new Date(d).toLocaleTimeString(),detail:`${c}${h}`,type:c==="error"?"leave":"command"})}this._events=n.slice(-100)}catch(e){console.warn("ThermoLoop: status history fetch failed",e),this._events=[]}}_findEntity(t){if(!this.hass||!this.hass.states)return null;for(let s of Object.keys(this.hass.states))if(s.startsWith(t))return s;return null}_entityState(t,s=null){return!t||!this.hass||!this.hass.states[t]?s:this.hass.states[t].state}_entityAttr(t,s,e=null){if(!t||!this.hass||!this.hass.states[t])return e;let i=this.hass.states[t].attributes;return i?i[s]:e}_statusValue(t,s="\u2014"){if(!this._sensorIds.status)return s;let e=this.hass&&this.hass.states[this._sensorIds.status];return e?t==="state"?e.state:e.attributes?e.attributes[t]:s:s}_callService(t,s,e){this.hass&&this.hass.callService(t,s,e)}_setDayTarget(t){this._sensorIds.dayTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.dayTarget,value:Math.max(16,Math.min(30,t))})}_setNightTarget(t){this._sensorIds.nightTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.nightTarget,value:Math.max(16,Math.min(30,t))})}_setMode(t){this._sensorIds.mode&&this._callService("select","select_option",{entity_id:this._sensorIds.mode,option:t})}_setAlgorithm(t){this._sensorIds.algorithm&&this._callService("select","select_option",{entity_id:this._sensorIds.algorithm,option:t})}_renderGraph(){let t=this.shadowRoot&&this.shadowRoot.getElementById("tempChart");if(!t)return;this._bindCrosshair(t);let s=t.getContext("2d"),e=window.devicePixelRatio||1,i=t.getBoundingClientRect(),n=i.width,o=i.height;t.width=n*e,t.height=o*e,s.setTransform(e,0,0,e,0,0);let l=[];if(this._tempHistory.living.length>0&&l.push({key:"living",color:"#03a9f4",label:"Living",lineDash:[],data:this._smooth([...this._tempHistory.living].sort((g,b)=>g.t-b.t))}),this._tempHistory.bedroom.length>0&&l.push({key:"bedroom",color:"#ff9800",label:"Bedroom",lineDash:[6,4],data:this._smooth([...this._tempHistory.bedroom].sort((g,b)=>g.t-b.t))}),this._tempHistory.external.length>0&&l.push({key:"external",color:"#4caf50",label:"Outdoor",lineDash:[2,3],data:this._smooth([...this._tempHistory.external].sort((g,b)=>g.t-b.t))}),l.length===0||l.every(g=>g.data.length<2)){this._plot=null,s.clearRect(0,0,n,o),s.fillStyle="#999",s.font="14px sans-serif",s.textAlign="center",s.fillText("Waiting for temperature data\u2026",n/2,o/2);return}let a={top:16,right:16,bottom:28,left:48},c=n-a.left-a.right,d=o-a.top-a.bottom,h=[],u=[];for(let g of l)for(let b of g.data)h.push(b.v),u.push(b.t);let _=Math.floor(Math.min(...h)-1),y=Math.ceil(Math.max(...h)+1),f=Math.min(...u),x=Math.max(...u),p=Math.max(x-f,1),m=g=>a.left+(g-f)/p*c,$=g=>a.top+d-(g-_)/(y-_)*d;this._plot={ctx:s,w:n,h:o,pad:a,plotW:c,plotH:d,series:l,xScale:m,yScale:$,minTemp:_,maxTemp:y,minTime:f,timeRange:p},this._paint(this._hoverX!=null?this._hoverX:null)}_bindCrosshair(t){t._thermoBound||(t._thermoBound=!0,t.addEventListener("mousemove",s=>{if(!this._plot)return;let e=t.getBoundingClientRect(),{pad:i,w:n}=this._plot,o=Math.max(i.left,Math.min(n-i.right,s.clientX-e.left));this._hoverX=o,this._paint(o)}),t.addEventListener("mouseleave",()=>{this._hoverX=null,this._paint(null)}))}_valueAtTime(t,s){if(t.length===0||s<t[0].t||s>t[t.length-1].t)return null;for(let e=1;e<t.length;e++)if(t[e].t>=s){let i=t[e-1],n=t[e],o=(s-i.t)/(n.t-i.t||1);return i.v+(n.v-i.v)*o}return t[t.length-1].v}_paint(t){let s=this._plot;if(!s)return;let{ctx:e,w:i,h:n,pad:o,plotW:l,plotH:a,series:c,xScale:d,yScale:h,minTemp:u,maxTemp:_,minTime:y,timeRange:f}=s;e.clearRect(0,0,i,n),e.strokeStyle="rgba(0,0,0,0.06)",e.lineWidth=1;for(let p=0;p<=4;p++){let m=o.top+a/4*p;e.beginPath(),e.moveTo(o.left,m),e.lineTo(i-o.right,m),e.stroke()}e.fillStyle="rgba(0,0,0,0.4)",e.font="11px sans-serif",e.textAlign="right";for(let p=0;p<=4;p++){let m=u+(_-u)/4*p,$=o.top+a-a/4*p;e.fillText(this._toDisplay(m).toFixed(1),o.left-6,$+4)}e.textAlign="center";for(let p=0;p<=4;p++){let m=y+f/4*p,$=o.left+l/4*p,g=new Date(m);e.fillText(g.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),$,n-6)}for(let p of c)if(!(p.data.length<2)){e.strokeStyle=p.color,e.lineWidth=2,e.setLineDash(p.lineDash),e.beginPath();for(let m=0;m<p.data.length;m++){let $=d(p.data[m].t),g=h(p.data[m].v);m===0?e.moveTo($,g):e.lineTo($,g)}e.stroke(),e.setLineDash([])}let x=this._statusValue("target");if(x&&x!=="\u2014"){let p=h(parseFloat(x));e.strokeStyle="rgba(0,0,0,0.25)",e.lineWidth=1,e.setLineDash([4,4]),e.beginPath(),e.moveTo(o.left,p),e.lineTo(i-o.right,p),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.35)",e.font="10px sans-serif",e.textAlign="left",e.fillText(`Target ${this._fmtTemp(x)}`,i-o.right-70,p-4)}if(t!=null){let p=y+(t-o.left)/l*f;e.strokeStyle="rgba(0,0,0,0.35)",e.lineWidth=1,e.setLineDash([2,3]),e.beginPath(),e.moveTo(t,o.top),e.lineTo(t,o.top+a),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.6)",e.font="10px sans-serif",e.textAlign="center",e.fillText(new Date(p).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),t,o.top+10);let m=t>i-o.right-50;for(let $ of c){let g=this._valueAtTime($.data,p);if(g==null)continue;let b=h(g);e.beginPath(),e.arc(t,b,4,0,Math.PI*2),e.fillStyle=$.color,e.fill(),e.lineWidth=1.5,e.strokeStyle="#fff",e.stroke(),e.fillStyle=$.color,e.font="bold 11px sans-serif",e.textAlign=m?"right":"left",e.fillText(`${this._toDisplay(g).toFixed(1)}\xB0`,t+(m?-8:8),b-6)}}}_rangeHistory(t){this._range=t,this._fetchHistory(),this._fetchEvents()}render(){let t=this._entityState(this._sensorIds.mode,"auto"),s=this._entityState(this._sensorIds.algorithm,"v0"),e=parseFloat(this._entityState(this._sensorIds.dayTarget,"22"))||22,i=parseFloat(this._entityState(this._sensorIds.nightTarget,"24"))||24,n=this._statusValue("state"),o=this._statusValue("reason"),l=this._statusValue("active_sensor"),a=this._statusValue("current_temp"),c=this._statusValue("target"),d=this._entityState(this._findEntity("select.thermoloop_mode"),"auto"),h=this._entityAttr(this._sensorIds.weather,"temperature"),u=this._toDisplay(e),_=this._toDisplay(i),y=(f,x,p)=>{let m=this._fromDisplay(this._toDisplay(f)+x);p(m)};return j`
      <div class="grid">
        <!-- Status strip -->
        <div class="status">
          <div class="status-item">
            <span class="status-label">Status</span>
            <span class="status-value ${n}">${n||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Mode</span>
            <span class="status-value">${t}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Active Sensor</span>
            <span class="status-value">${l||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Temperature</span>
            <span class="status-value">${this._fmtTemp(a)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${this._fmtTemp(c)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Outdoor</span>
            <span class="status-value">${this._fmtTemp(h)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Algorithm</span>
            <span class="status-value">${s}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Reason</span>
            <span class="status-value" style="font-size:0.85em;font-weight:400">${o||"\u2014"}</span>
          </div>
        </div>

        <!-- Graph -->
        <div class="graph-card">
          <canvas id="tempChart"></canvas>
          <div class="graph-legend">
            <span class="item ${O({off:this._tempHistory.living.length===0})}"
                  style="color:#03a9f4">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Living (day)</span>
            </span>
            <span class="item ${O({off:this._tempHistory.bedroom.length===0})}"
                  style="color:#ff9800">
              <span class="swatch dashed"></span><span style="color:var(--primary-text-color)">Bedroom (night)</span>
            </span>
            <span class="item ${O({off:this._tempHistory.external.length===0})}"
                  style="color:#4caf50">
              <span class="swatch dashed"></span><span style="color:var(--primary-text-color)">Outdoor</span>
            </span>
          </div>
          <div class="range-chips">
            ${Object.entries(Vt).map(([f,x])=>j`
              <div class="range-chip ${O({active:this._range===f})}"
                   @click=${()=>this._rangeHistory(f)} role="button">${x}</div>
            `)}
          </div>
        </div>

        <!-- Controls -->
        <div class="controls-card">
          <h3>Controls</h3>

          <div class="control-row">
            <span class="control-label">Mode</span>
            <select @change=${f=>this._setMode(f.target.value)} .value=${t}>
              <option value="auto">Auto</option>
              <option value="off">Off</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Algorithm</span>
            <select @change=${f=>this._setAlgorithm(f.target.value)} .value=${s}>
              <option value="v0">v0 — Aggressive</option>
              <option value="v1">v1 — Proportional</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Day Target</span>
            <div class="stepper">
              <button @click=${()=>y(e,-1,f=>this._setDayTarget(f))}>−</button>
              <span>${this._fmtTemp(e)}</span>
              <button @click=${()=>y(e,1,f=>this._setDayTarget(f))}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${()=>y(i,-1,f=>this._setNightTarget(f))}>−</button>
              <span>${this._fmtTemp(i)}</span>
              <button @click=${()=>y(i,1,f=>this._setNightTarget(f))}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="log-card ${O({collapsed:this._logCollapsed})}">
          <h3 @click=${()=>this._logCollapsed=!this._logCollapsed}>
            ${this._logCollapsed?"\u25B6":"\u25BC"} Event Log (${this._events.length})
          </h3>
          <div class="log-entries">
            ${this._events.length===0?j`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`:this._events.map(f=>j`
                <div class="log-entry ${f.type}">
                  <span class="log-time">${f.time}</span>
                  <span class="log-detail">${f.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}};G(z,"styles",J`
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
      cursor: crosshair;
    }
    .graph-legend {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-top: 10px;
      font-size: 0.78em;
      opacity: 0.85;
    }
    .graph-legend .item { display: flex; align-items: center; gap: 7px; }
    .graph-legend .item.off { opacity: 0.35; }
    .graph-legend .swatch {
      width: 18px;
      border-top: 3px solid currentColor;
      display: inline-block;
    }
    .graph-legend .swatch.dashed { border-top-style: dashed; }
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

  `),G(z,"properties",{hass:{type:Object},config:{type:Object},_range:{state:!0},_logCollapsed:{state:!0},_events:{state:!0},_tempHistory:{state:!0}});customElements.define("thermoloop-panel",z);
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
