var It=Object.defineProperty;var Mt=(n,t,s)=>t in n?It(n,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):n[t]=s;var J=(n,t,s)=>Mt(n,typeof t!="symbol"?t+"":t,s);var V=globalThis,F=V.ShadowRoot&&(V.ShadyCSS===void 0||V.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),ct=new WeakMap,O=class{constructor(t,s,e){if(this._$cssResult$=!0,e!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(F&&t===void 0){let e=s!==void 0&&s.length===1;e&&(t=ct.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&ct.set(s,t))}return t}toString(){return this.cssText}},pt=n=>new O(typeof n=="string"?n:n+"",void 0,Y),Z=(n,...t)=>{let s=n.length===1?n[0]:t.reduce((e,i,r)=>e+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+n[r+1],n[0]);return new O(s,n,Y)},dt=(n,t)=>{if(F)n.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let e=document.createElement("style"),i=V.litNonce;i!==void 0&&e.setAttribute("nonce",i),e.textContent=s.cssText,n.appendChild(e)}},Q=F?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let s="";for(let e of t.cssRules)s+=e.cssText;return pt(s)})(n):n;var{is:Nt,defineProperty:Pt,getOwnPropertyDescriptor:Ot,getOwnPropertyNames:Rt,getOwnPropertySymbols:Dt,getPrototypeOf:Ut}=Object,q=globalThis,ut=q.trustedTypes,Lt=ut?ut.emptyScript:"",jt=q.reactiveElementPolyfillSupport,R=(n,t)=>n,X={toAttribute(n,t){switch(t){case Boolean:n=n?Lt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let s=n;switch(t){case Boolean:s=n!==null;break;case Number:s=n===null?null:Number(n);break;case Object:case Array:try{s=JSON.parse(n)}catch{s=null}}return s}},gt=(n,t)=>!Nt(n,t),ft={attribute:!0,type:String,converter:X,reflect:!1,useDefault:!1,hasChanged:gt};Symbol.metadata??=Symbol("metadata"),q.litPropertyMetadata??=new WeakMap;var w=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=ft){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){let e=Symbol(),i=this.getPropertyDescriptor(t,e,s);i!==void 0&&Pt(this.prototype,t,i)}}static getPropertyDescriptor(t,s,e){let{get:i,set:r}=Ot(this.prototype,t)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){let h=i?.call(this);r?.call(this,o),this.requestUpdate(t,h,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ft}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;let t=Ut(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){let s=this.properties,e=[...Rt(s),...Dt(s)];for(let i of e)this.createProperty(i,s[i])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[e,i]of s)this.elementProperties.set(e,i)}this._$Eh=new Map;for(let[s,e]of this.elementProperties){let i=this._$Eu(s,e);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let i of e)s.unshift(Q(i))}else t!==void 0&&s.push(Q(t));return s}static _$Eu(t,s){let e=s.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let e of s.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return dt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,e){this._$AK(t,e)}_$ET(t,s){let e=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,e);if(i!==void 0&&e.reflect===!0){let r=(e.converter?.toAttribute!==void 0?e.converter:X).toAttribute(s,e.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,s){let e=this.constructor,i=e._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let r=e.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:X;this._$Em=i;let h=o.fromAttribute(s,r.type);this[i]=h??this._$Ej?.get(i)??h,this._$Em=null}}requestUpdate(t,s,e,i=!1,r){if(t!==void 0){let o=this.constructor;if(i===!1&&(r=this[t]),e??=o.getPropertyOptions(t),!((e.hasChanged??gt)(r,s)||e.useDefault&&e.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,e))))return;this.C(t,s,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:e,reflect:i,wrapped:r},o){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??s??this[t]),r!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(s=void 0),this._$AL.set(t,s)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[i,r]of e){let{wrapped:o}=r,h=this[i];o!==!0||this._$AL.has(i)||h===void 0||this.C(i,void 0,r,h)}}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(s)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[R("elementProperties")]=new Map,w[R("finalized")]=new Map,jt?.({ReactiveElement:w}),(q.reactiveElementVersions??=[]).push("2.1.2");var nt=globalThis,_t=n=>n,G=nt.trustedTypes,mt=G?G.createPolicy("lit-html",{createHTML:n=>n}):void 0,At="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,St="?"+C,Wt=`<${St}>`,M=document,U=()=>M.createComment(""),L=n=>n===null||typeof n!="object"&&typeof n!="function",at=Array.isArray,zt=n=>at(n)||typeof n?.[Symbol.iterator]=="function",tt=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,vt=/-->/g,yt=/>/g,k=RegExp(`>|${tt}(?:([^\\s"'>=/]+)(${tt}*=${tt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),$t=/'/g,bt=/"/g,wt=/^(?:script|style|textarea|title)$/i,lt=n=>(t,...s)=>({_$litType$:n,strings:t,values:s}),z=lt(1),Qt=lt(2),Xt=lt(3),E=Symbol.for("lit-noChange"),x=Symbol.for("lit-nothing"),xt=new WeakMap,I=M.createTreeWalker(M,129);function Et(n,t){if(!at(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return mt!==void 0?mt.createHTML(t):t}var Bt=(n,t)=>{let s=n.length-1,e=[],i,r=t===2?"<svg>":t===3?"<math>":"",o=D;for(let h=0;h<s;h++){let a=n[h],d,c,l=-1,f=0;for(;f<a.length&&(o.lastIndex=f,c=o.exec(a),c!==null);)f=o.lastIndex,o===D?c[1]==="!--"?o=vt:c[1]!==void 0?o=yt:c[2]!==void 0?(wt.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=k):c[3]!==void 0&&(o=k):o===k?c[0]===">"?(o=i??D,l=-1):c[1]===void 0?l=-2:(l=o.lastIndex-c[2].length,d=c[1],o=c[3]===void 0?k:c[3]==='"'?bt:$t):o===bt||o===$t?o=k:o===vt||o===yt?o=D:(o=k,i=void 0);let m=o===k&&n[h+1].startsWith("/>")?" ":"";r+=o===D?a+Wt:l>=0?(e.push(d),a.slice(0,l)+At+a.slice(l)+C+m):a+C+(l===-2?h:m)}return[Et(n,r+(n[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},j=class n{constructor({strings:t,_$litType$:s},e){let i;this.parts=[];let r=0,o=0,h=t.length-1,a=this.parts,[d,c]=Bt(t,s);if(this.el=n.createElement(d,e),I.currentNode=this.el.content,s===2||s===3){let l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=I.nextNode())!==null&&a.length<h;){if(i.nodeType===1){if(i.hasAttributes())for(let l of i.getAttributeNames())if(l.endsWith(At)){let f=c[o++],m=i.getAttribute(l).split(C),$=/([.?@])?(.*)/.exec(f);a.push({type:1,index:r,name:$[2],strings:m,ctor:$[1]==="."?st:$[1]==="?"?it:$[1]==="@"?rt:P}),i.removeAttribute(l)}else l.startsWith(C)&&(a.push({type:6,index:r}),i.removeAttribute(l));if(wt.test(i.tagName)){let l=i.textContent.split(C),f=l.length-1;if(f>0){i.textContent=G?G.emptyScript:"";for(let m=0;m<f;m++)i.append(l[m],U()),I.nextNode(),a.push({type:2,index:++r});i.append(l[f],U())}}}else if(i.nodeType===8)if(i.data===St)a.push({type:2,index:r});else{let l=-1;for(;(l=i.data.indexOf(C,l+1))!==-1;)a.push({type:7,index:r}),l+=C.length-1}r++}}static createElement(t,s){let e=M.createElement("template");return e.innerHTML=t,e}};function N(n,t,s=n,e){if(t===E)return t;let i=e!==void 0?s._$Co?.[e]:s._$Cl,r=L(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(n),i._$AT(n,s,e)),e!==void 0?(s._$Co??=[])[e]=i:s._$Cl=i),i!==void 0&&(t=N(n,i._$AS(n,t.values),i,e)),t}var et=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:e}=this._$AD,i=(t?.creationScope??M).importNode(s,!0);I.currentNode=i;let r=I.nextNode(),o=0,h=0,a=e[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new W(r,r.nextSibling,this,t):a.type===1?d=new a.ctor(r,a.name,a.strings,this,t):a.type===6&&(d=new ot(r,this,t)),this._$AV.push(d),a=e[++h]}o!==a?.index&&(r=I.nextNode(),o++)}return I.currentNode=M,i}p(t){let s=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,s),s+=e.strings.length-2):e._$AI(t[s])),s++}},W=class n{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,e,i){this.type=2,this._$AH=x,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=e,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=N(this,t,s),L(t)?t===x||t==null||t===""?(this._$AH!==x&&this._$AR(),this._$AH=x):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):zt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==x&&L(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){let{values:s,_$litType$:e}=t,i=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=j.createElement(Et(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===i)this._$AH.p(s);else{let r=new et(i,this),o=r.u(this.options);r.p(s),this.T(o),this._$AH=r}}_$AC(t){let s=xt.get(t.strings);return s===void 0&&xt.set(t.strings,s=new j(t)),s}k(t){at(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,e,i=0;for(let r of t)i===s.length?s.push(e=new n(this.O(U()),this.O(U()),this,this.options)):e=s[i],e._$AI(r),i++;i<s.length&&(this._$AR(e&&e._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){let e=_t(t).nextSibling;_t(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,e,i,r){this.type=1,this._$AH=x,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=r,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=x}_$AI(t,s=this,e,i){let r=this.strings,o=!1;if(r===void 0)t=N(this,t,s,0),o=!L(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else{let h=t,a,d;for(t=r[0],a=0;a<r.length-1;a++)d=N(this,h[e+a],s,a),d===E&&(d=this._$AH[a]),o||=!L(d)||d!==this._$AH[a],d===x?t=x:t!==x&&(t+=(d??"")+r[a+1]),this._$AH[a]=d}o&&!i&&this.j(t)}j(t){t===x?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},st=class extends P{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===x?void 0:t}},it=class extends P{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==x)}},rt=class extends P{constructor(t,s,e,i,r){super(t,s,e,i,r),this.type=5}_$AI(t,s=this){if((t=N(this,t,s,0)??x)===E)return;let e=this._$AH,i=t===x&&e!==x||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,r=t!==x&&(e===x||i);i&&this.element.removeEventListener(this.name,this,e),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ot=class{constructor(t,s,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){N(this,t)}};var Vt=nt.litHtmlPolyfillSupport;Vt?.(j,W),(nt.litHtmlVersions??=[]).push("3.3.3");var Tt=(n,t,s)=>{let e=s?.renderBefore??t,i=e._$litPart$;if(i===void 0){let r=s?.renderBefore??null;e._$litPart$=i=new W(t.insertBefore(U(),r),r,void 0,s??{})}return i._$AI(n),i};var ht=globalThis,H=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Tt(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};H._$litElement$=!0,H.finalized=!0,ht.litElementHydrateSupport?.({LitElement:H});var Ft=ht.litElementPolyfillSupport;Ft?.({LitElement:H});(ht.litElementVersions??=[]).push("4.2.2");var Ct={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Ht=n=>(...t)=>({_$litDirective$:n,values:t}),K=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,e){this._$Ct=t,this._$AM=s,this._$Ci=e}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}};var T=Ht(class extends K{constructor(n){if(super(n),n.type!==Ct.ATTRIBUTE||n.name!=="class"||n.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(t=>n[t]).join(" ")+" "}update(n,[t]){if(this.st===void 0){this.st=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(e=>e!=="")));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let s=n.element.classList;for(let e of this.st)e in t||(s.remove(e),this.st.delete(e));for(let e in t){let i=!!t[e];i===this.st.has(e)||this.nt?.has(e)||(i?(s.add(e),this.st.add(e)):(s.remove(e),this.st.delete(e)))}return E}});var qt={"6h":"6h","24h":"24h","7d":"7d"},kt={"6h":6*3600*1e3,"24h":24*3600*1e3,"7d":7*24*3600*1e3},B=class extends H{constructor(){super(),this._range="24h",this._logCollapsed=!1,this._events=[],this._tempHistory={living:[],bedroom:[],external:[]},this._targetHistory={day:[],night:[]},this._statusHistory=[],this._sensorIds={tempDay:null,tempNight:null,status:null,mode:null,algorithm:null,dayTarget:null,nightTarget:null,weather:null,nightStart:null,nightEnd:null},this._disconnected=!1}disconnectedCallback(){super.disconnectedCallback(),this._disconnected=!0}connectedCallback(){super.connectedCallback(),this._discoverEntities(),this._fetchData()}updated(t){t.has("hass")&&this.hass&&(this._discoverEntities(),this._fetchData()),(t.has("_tempHistory")||t.has("_range"))&&this._renderGraph()}_toDisplay(t){return t}_fromDisplay(t){return t}_fmtTemp(t,s=1){let e=typeof t=="string"?parseFloat(t):t;return e==null||isNaN(e)?"\u2014":`${e.toFixed(s)}\xB0C`}_smooth(t,s=15*60*1e3){if(!t||t.length===0)return[];let e=s/2,i=new Array(t.length),r=0,o=0,h=0;for(let a=0;a<t.length;a++){let d=t[a].t;for(;r<t.length&&t[r].t<d-e;)h-=t[r].v,r++;for(;o<t.length&&t[o].t<=d+e;)h+=t[o].v,o++;let c=o-r;i[a]={t:d,v:c>0?h/c:t[a].v}}return i}_discoverEntities(){if(!this.hass||!this.hass.states)return;let t=this.hass.states;for(let s of Object.keys(t))s.startsWith("sensor.thermoloop_status")&&(this._sensorIds.status=s),s.startsWith("select.thermoloop_mode")&&(this._sensorIds.mode=s),s.startsWith("select.thermoloop_algorithm")&&(this._sensorIds.algorithm=s),s.startsWith("number.thermoloop_target_day")&&(this._sensorIds.dayTarget=s),s.startsWith("number.thermoloop_target_night")&&(this._sensorIds.nightTarget=s),s.startsWith("time.thermoloop_night_window_start")&&(this._sensorIds.nightStart=s),s.startsWith("time.thermoloop_night_window_end")&&(this._sensorIds.nightEnd=s);if(!this._sensorIds.weather)for(let s of Object.keys(t)){if(!s.startsWith("weather."))continue;let e=t[s].attributes;if(e&&!isNaN(parseFloat(e.temperature))){this._sensorIds.weather=s;break}}}async _fetchData(){this.hass&&(this._fetchHistory(),this._fetchEvents())}async _fetchHistory(){if(!this.hass||!this.hass.callWS)return;let t=new Date,s=new Date(t.getTime()-kt[this._range]),e=[];if(this._sensorIds.status){let c=this.hass.states[this._sensorIds.status];if(c&&c.attributes){let l=c.attributes.active_sensor;l&&e.push(l)}}if(e.length===0)for(let[c,l]of Object.entries(this.hass.states))l.attributes&&l.attributes.device_class==="temperature"&&e.push(c);let i=this._sensorIds.weather,r=this._sensorIds.dayTarget,o=this._sensorIds.nightTarget,h=this._sensorIds.status,a=[i,r,o,h].filter(Boolean),d=[...e,...a];if(d.length!==0)try{let c=await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:d,minimal_response:!1,no_attributes:!1}),l=u=>u.map(v=>({t:(v.lu??v.lc)*1e3,v:parseFloat(v.s)})).filter(v=>!isNaN(v.v)&&v.t>0),f={living:[],bedroom:[],external:[]},m={day:[],night:[]},$=[];for(let[u,v]of Object.entries(c)){if(u===i){let b=null;f.external=v.map(p=>{if(p.a&&p.a.temperature!=null){let g=parseFloat(p.a.temperature);isNaN(g)||(b=g)}return{t:(p.lu??p.lc)*1e3,v:b}}).filter(p=>p.v!=null&&!isNaN(p.v)&&p.t>0);continue}if(u===r){m.day=l(v);continue}if(u===o){m.night=l(v);continue}if(u===h){$=v.map(b=>({t:(b.lu??b.lc)*1e3,state:b.s})).filter(b=>b.t>0);continue}let A=f.living.length<=f.bedroom.length?"living":"bedroom";f[A]=l(v)}this._targetHistory=m,this._statusHistory=$,this._tempHistory=f}catch(c){console.warn("ThermoLoop: history fetch failed",c)}}async _fetchEvents(){if(!this.hass||!this.hass.callWS||!this._sensorIds.status){this._events=[];return}let t=new Date,s=new Date(t.getTime()-kt[this._range]);try{let i=(await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:[this._sensorIds.status],minimal_response:!1,no_attributes:!1}))[this._sensorIds.status]||[],r=[],o=null,h={};for(let a of i){a.a&&(h=a.a);let d=a.s,c=(a.lc??a.lu)*1e3;if(d===o)continue;o=d;let l=h.reason?` \u2014 ${h.reason}`:"";r.push({time:new Date(c).toLocaleTimeString(),detail:`${d}${l}`,type:d==="error"?"leave":"command"})}this._events=r.slice(-100)}catch(e){console.warn("ThermoLoop: status history fetch failed",e),this._events=[]}}_findEntity(t){if(!this.hass||!this.hass.states)return null;for(let s of Object.keys(this.hass.states))if(s.startsWith(t))return s;return null}_entityState(t,s=null){return!t||!this.hass||!this.hass.states[t]?s:this.hass.states[t].state}_entityAttr(t,s,e=null){if(!t||!this.hass||!this.hass.states[t])return e;let i=this.hass.states[t].attributes;return i?i[s]:e}_statusValue(t,s="\u2014"){if(!this._sensorIds.status)return s;let e=this.hass&&this.hass.states[this._sensorIds.status];return e?t==="state"?e.state:e.attributes?e.attributes[t]:s:s}_callService(t,s,e){this.hass&&this.hass.callService(t,s,e)}_setDayTarget(t){this._sensorIds.dayTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.dayTarget,value:Math.max(16,Math.min(30,t))})}_setNightTarget(t){this._sensorIds.nightTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.nightTarget,value:Math.max(16,Math.min(30,t))})}_setMode(t){this._sensorIds.mode&&this._callService("select","select_option",{entity_id:this._sensorIds.mode,option:t})}_setAlgorithm(t){this._sensorIds.algorithm&&this._callService("select","select_option",{entity_id:this._sensorIds.algorithm,option:t})}_renderGraph(){let t=this.shadowRoot&&this.shadowRoot.getElementById("tempChart");if(!t)return;this._bindCrosshair(t);let s=t.getContext("2d"),e=window.devicePixelRatio||1,i=t.getBoundingClientRect(),r=i.width,o=i.height;t.width=r*e,t.height=o*e,s.setTransform(e,0,0,e,0,0);let h=[];if(this._tempHistory.living.length>0&&h.push({key:"living",color:"#03a9f4",label:"Living",lineDash:[],data:this._smooth([...this._tempHistory.living].sort((_,S)=>_.t-S.t))}),this._tempHistory.bedroom.length>0&&h.push({key:"bedroom",color:"#ff9800",label:"Bedroom",lineDash:[6,4],data:this._smooth([...this._tempHistory.bedroom].sort((_,S)=>_.t-S.t))}),this._tempHistory.external.length>0&&h.push({key:"external",color:"#4caf50",label:"Outdoor",lineDash:[2,3],data:this._smooth([...this._tempHistory.external].sort((_,S)=>_.t-S.t))}),h.length===0||h.every(_=>_.data.length<2)){this._plot=null,s.clearRect(0,0,r,o),s.fillStyle="#999",s.font="14px sans-serif",s.textAlign="center",s.fillText("Waiting for temperature data\u2026",r/2,o/2);return}let a={top:16,right:16,bottom:28,left:48},d=r-a.left-a.right,c=o-a.top-a.bottom,l=[];for(let _ of h)for(let S of _.data)l.push(S.t);let f=Math.min(...l),m=Math.max(...l),$=Math.max(m-f,1),u=this._buildTargetSteps(f,m),v=this._activeRegions(f,m),A=[];for(let _ of h)for(let S of _.data)A.push(S.v);for(let _ of u)A.push(_.v);let b=Math.floor(Math.min(...A)-1),p=Math.ceil(Math.max(...A)+1),g=_=>a.left+(_-f)/$*d,y=_=>a.top+c-(_-b)/(p-b)*c;this._plot={ctx:s,w:r,h:o,pad:a,plotW:d,plotH:c,series:h,xScale:g,yScale:y,minTemp:b,maxTemp:p,minTime:f,maxTime:m,timeRange:$,targetSteps:u,activeRegions:v},this._paint(this._hoverX!=null?this._hoverX:null)}_bindCrosshair(t){t._thermoBound||(t._thermoBound=!0,t.addEventListener("mousemove",s=>{if(!this._plot)return;let e=t.getBoundingClientRect(),{pad:i,w:r}=this._plot,o=Math.max(i.left,Math.min(r-i.right,s.clientX-e.left));this._hoverX=o,this._paint(o)}),t.addEventListener("mouseleave",()=>{this._hoverX=null,this._paint(null)}))}_valueAtTime(t,s){if(t.length===0||s<t[0].t||s>t[t.length-1].t)return null;for(let e=1;e<t.length;e++)if(t[e].t>=s){let i=t[e-1],r=t[e],o=(s-i.t)/(r.t-i.t||1);return i.v+(r.v-i.v)*o}return t[t.length-1].v}_parseTimeEntity(t){if(!t||!this.hass||!this.hass.states[t])return null;let s=this.hass.states[t].state;if(!s||typeof s!="string")return null;let e=s.split(":");if(e.length<2)return null;let i=parseInt(e[0],10),r=parseInt(e[1],10);return isNaN(i)||isNaN(r)?null:i*60+r}_isNightAt(t,s,e){if(s==null||e==null)return!1;let i=new Date(t),r=i.getHours()*60+i.getMinutes();return s<=e?r>=s&&r<e:r>=s||r<e}_stepValueAt(t,s){if(!t||t.length===0)return null;if(s<=t[0].t)return t[0].v;let e=t[0].v;for(let i of t)if(i.t<=s)e=i.v;else break;return e}_buildTargetSteps(t,s){let e=this._targetHistory.day,i=this._targetHistory.night;if(e.length===0&&i.length===0)return[];let r=this._parseTimeEntity(this._sensorIds.nightStart),o=this._parseTimeEntity(this._sensorIds.nightEnd),h=400,a=(s-t)/h,d=[];for(let c=0;c<=h;c++){let l=t+c*a,f=this._isNightAt(l,r,o),m=this._stepValueAt(f?i:e,l);m==null&&(m=this._stepValueAt(f?e:i,l)),m!=null&&d.push({t:l,v:m,night:f})}return d}_activeRegions(t,s){let e=this._statusHistory;if(!e||e.length===0)return[];let i=[...e].sort((o,h)=>o.t-h.t),r=[];for(let o=0;o<i.length;o++){if(i[o].state!=="active")continue;let h=Math.max(i[o].t,t),a=Math.min(o+1<i.length?i[o+1].t:s,s);a>h&&r.push({t0:h,t1:a})}return r}_paint(t){let s=this._plot;if(!s)return;let{ctx:e,w:i,h:r,pad:o,plotW:h,plotH:a,series:d,xScale:c,yScale:l,minTemp:f,maxTemp:m,minTime:$,maxTime:u,timeRange:v,targetSteps:A,activeRegions:b}=s;if(e.clearRect(0,0,i,r),b&&b.length){e.fillStyle="rgba(76,175,80,0.13)";for(let p of b){let g=c(p.t0),y=c(p.t1);y>g&&e.fillRect(g,o.top,y-g,a)}}e.strokeStyle="rgba(0,0,0,0.06)",e.lineWidth=1;for(let p=0;p<=4;p++){let g=o.top+a/4*p;e.beginPath(),e.moveTo(o.left,g),e.lineTo(i-o.right,g),e.stroke()}e.fillStyle="rgba(0,0,0,0.4)",e.font="11px sans-serif",e.textAlign="right";for(let p=0;p<=4;p++){let g=f+(m-f)/4*p,y=o.top+a-a/4*p;e.fillText(this._toDisplay(g).toFixed(1),o.left-6,y+4)}e.textAlign="center";for(let p=0;p<=4;p++){let g=$+v/4*p,y=o.left+h/4*p,_=new Date(g);e.fillText(_.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),y,r-6)}for(let p of d)if(!(p.data.length<2)){e.strokeStyle=p.color,e.lineWidth=2,e.setLineDash(p.lineDash),e.beginPath();for(let g=0;g<p.data.length;g++){let y=c(p.data[g].t),_=l(p.data[g].v);g===0?e.moveTo(y,_):e.lineTo(y,_)}e.stroke(),e.setLineDash([])}if(A&&A.length>1){e.lineWidth=1.5;for(let p=1;p<A.length;p++){let g=A[p-1],y=A[p];e.strokeStyle=g.night?"#9c27b0":"#fbc02d",e.beginPath(),e.moveTo(c(g.t),l(g.v)),e.lineTo(c(y.t),l(g.v)),e.lineTo(c(y.t),l(y.v)),e.stroke()}}if(t!=null){let p=$+(t-o.left)/h*v;e.strokeStyle="rgba(0,0,0,0.35)",e.lineWidth=1,e.setLineDash([2,3]),e.beginPath(),e.moveTo(t,o.top),e.lineTo(t,o.top+a),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.6)",e.font="10px sans-serif",e.textAlign="center",e.fillText(new Date(p).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),t,o.top+10);let g=t>i-o.right-50;for(let y of d){let _=this._valueAtTime(y.data,p);if(_==null)continue;let S=l(_);e.beginPath(),e.arc(t,S,4,0,Math.PI*2),e.fillStyle=y.color,e.fill(),e.lineWidth=1.5,e.strokeStyle="#fff",e.stroke(),e.fillStyle=y.color,e.font="bold 11px sans-serif",e.textAlign=g?"right":"left",e.fillText(`${this._toDisplay(_).toFixed(1)}\xB0`,t+(g?-8:8),S-6)}}}_rangeHistory(t){this._range=t,this._fetchHistory(),this._fetchEvents()}render(){let t=this._entityState(this._sensorIds.mode,"auto"),s=this._entityState(this._sensorIds.algorithm,"v0"),e=parseFloat(this._entityState(this._sensorIds.dayTarget,"22"))||22,i=parseFloat(this._entityState(this._sensorIds.nightTarget,"24"))||24,r=this._statusValue("state"),o=this._statusValue("reason"),h=this._statusValue("active_sensor"),a=this._statusValue("current_temp"),d=this._statusValue("target"),c=this._entityState(this._findEntity("select.thermoloop_mode"),"auto"),l=this._entityAttr(this._sensorIds.weather,"temperature"),f=this._toDisplay(e),m=this._toDisplay(i),$=(u,v,A)=>{let b=this._fromDisplay(this._toDisplay(u)+v);A(b)};return z`
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
            <span class="status-value">${this._fmtTemp(a)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${this._fmtTemp(d)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Outdoor</span>
            <span class="status-value">${this._fmtTemp(l)}</span>
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
            <span class="item ${T({off:this._tempHistory.living.length===0})}"
                  style="color:#03a9f4">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Living (day)</span>
            </span>
            <span class="item ${T({off:this._tempHistory.bedroom.length===0})}"
                  style="color:#ff9800">
              <span class="swatch dashed"></span><span style="color:var(--primary-text-color)">Bedroom (night)</span>
            </span>
            <span class="item ${T({off:this._tempHistory.external.length===0})}"
                  style="color:#4caf50">
              <span class="swatch dashed"></span><span style="color:var(--primary-text-color)">Outdoor</span>
            </span>
            <span class="item ${T({off:this._targetHistory.day.length===0})}"
                  style="color:#fbc02d">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Target (day)</span>
            </span>
            <span class="item ${T({off:this._targetHistory.night.length===0})}"
                  style="color:#9c27b0">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">Target (night)</span>
            </span>
            <span class="item ${T({off:this._statusHistory.length===0})}">
              <span class="swatch block" style="background:rgba(76,175,80,0.4)"></span><span>Active</span>
            </span>
          </div>
          <div class="range-chips">
            ${Object.entries(qt).map(([u,v])=>z`
              <div class="range-chip ${T({active:this._range===u})}"
                   @click=${()=>this._rangeHistory(u)} role="button">${v}</div>
            `)}
          </div>
        </div>

        <!-- Controls -->
        <div class="controls-card">
          <h3>Controls</h3>

          <div class="control-row">
            <span class="control-label">Mode</span>
            <select @change=${u=>this._setMode(u.target.value)} .value=${t}>
              <option value="auto">Auto</option>
              <option value="off">Off</option>
              <option value="away">Away</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Algorithm</span>
            <select @change=${u=>this._setAlgorithm(u.target.value)} .value=${s}>
              <option value="v0">v0 — Aggressive</option>
              <option value="v1">v1 — Proportional</option>
            </select>
          </div>

          <div class="control-row">
            <span class="control-label">Day Target</span>
            <div class="stepper">
              <button @click=${()=>$(e,-1,u=>this._setDayTarget(u))}>−</button>
              <span>${this._fmtTemp(e)}</span>
              <button @click=${()=>$(e,1,u=>this._setDayTarget(u))}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${()=>$(i,-1,u=>this._setNightTarget(u))}>−</button>
              <span>${this._fmtTemp(i)}</span>
              <button @click=${()=>$(i,1,u=>this._setNightTarget(u))}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="log-card ${T({collapsed:this._logCollapsed})}">
          <h3 @click=${()=>this._logCollapsed=!this._logCollapsed}>
            ${this._logCollapsed?"\u25B6":"\u25BC"} Event Log (${this._events.length})
          </h3>
          <div class="log-entries">
            ${this._events.length===0?z`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`:this._events.map(u=>z`
                <div class="log-entry ${u.type}">
                  <span class="log-time">${u.time}</span>
                  <span class="log-detail">${u.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}};J(B,"styles",Z`
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
    .graph-legend .swatch.block { width: 14px; height: 11px; border-top: none; border-radius: 2px; }
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

  `),J(B,"properties",{hass:{type:Object},config:{type:Object},_range:{state:!0},_logCollapsed:{state:!0},_events:{state:!0},_tempHistory:{state:!0}});customElements.define("thermoloop-panel",B);
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
