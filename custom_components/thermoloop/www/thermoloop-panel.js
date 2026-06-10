var Nt=Object.defineProperty;var Ot=(r,t,s)=>t in r?Nt(r,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):r[t]=s;var Y=(r,t,s)=>Ot(r,typeof t!="symbol"?t+"":t,s);var F=globalThis,q=F.ShadowRoot&&(F.ShadyCSS===void 0||F.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Z=Symbol(),dt=new WeakMap,P=class{constructor(t,s,e){if(this._$cssResult$=!0,e!==Z)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(q&&t===void 0){let e=s!==void 0&&s.length===1;e&&(t=dt.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&dt.set(s,t))}return t}toString(){return this.cssText}},ut=r=>new P(typeof r=="string"?r:r+"",void 0,Z),Q=(r,...t)=>{let s=r.length===1?r[0]:t.reduce((e,i,o)=>e+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[o+1],r[0]);return new P(s,r,Z)},ft=(r,t)=>{if(q)r.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let e=document.createElement("style"),i=F.litNonce;i!==void 0&&e.setAttribute("nonce",i),e.textContent=s.cssText,r.appendChild(e)}},X=q?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let s="";for(let e of t.cssRules)s+=e.cssText;return ut(s)})(r):r;var{is:Dt,defineProperty:Pt,getOwnPropertyDescriptor:Rt,getOwnPropertyNames:Ut,getOwnPropertySymbols:Lt,getPrototypeOf:jt}=Object,G=globalThis,gt=G.trustedTypes,Wt=gt?gt.emptyScript:"",zt=G.reactiveElementPolyfillSupport,R=(r,t)=>r,tt={toAttribute(r,t){switch(t){case Boolean:r=r?Wt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let s=r;switch(t){case Boolean:s=r!==null;break;case Number:s=r===null?null:Number(r);break;case Object:case Array:try{s=JSON.parse(r)}catch{s=null}}return s}},mt=(r,t)=>!Dt(r,t),_t={attribute:!0,type:String,converter:tt,reflect:!1,useDefault:!1,hasChanged:mt};Symbol.metadata??=Symbol("metadata"),G.litPropertyMetadata??=new WeakMap;var E=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=_t){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){let e=Symbol(),i=this.getPropertyDescriptor(t,e,s);i!==void 0&&Pt(this.prototype,t,i)}}static getPropertyDescriptor(t,s,e){let{get:i,set:o}=Rt(this.prototype,t)??{get(){return this[s]},set(n){this[s]=n}};return{get:i,set(n){let l=i?.call(this);o?.call(this,n),this.requestUpdate(t,l,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??_t}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;let t=jt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){let s=this.properties,e=[...Ut(s),...Lt(s)];for(let i of e)this.createProperty(i,s[i])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[e,i]of s)this.elementProperties.set(e,i)}this._$Eh=new Map;for(let[s,e]of this.elementProperties){let i=this._$Eu(s,e);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let i of e)s.unshift(X(i))}else t!==void 0&&s.push(X(t));return s}static _$Eu(t,s){let e=s.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let e of s.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ft(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,e){this._$AK(t,e)}_$ET(t,s){let e=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,e);if(i!==void 0&&e.reflect===!0){let o=(e.converter?.toAttribute!==void 0?e.converter:tt).toAttribute(s,e.type);this._$Em=t,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,s){let e=this.constructor,i=e._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let o=e.getPropertyOptions(i),n=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:tt;this._$Em=i;let l=n.fromAttribute(s,o.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,s,e,i=!1,o){if(t!==void 0){let n=this.constructor;if(i===!1&&(o=this[t]),e??=n.getPropertyOptions(t),!((e.hasChanged??mt)(o,s)||e.useDefault&&e.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,e))))return;this.C(t,s,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:e,reflect:i,wrapped:o},n){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??s??this[t]),o!==!0||n!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(s=void 0),this._$AL.set(t,s)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[i,o]of e){let{wrapped:n}=o,l=this[i];n!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,o,l)}}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(s)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[R("elementProperties")]=new Map,E[R("finalized")]=new Map,zt?.({ReactiveElement:E}),(G.reactiveElementVersions??=[]).push("2.1.2");var at=globalThis,vt=r=>r,K=at.trustedTypes,yt=K?K.createPolicy("lit-html",{createHTML:r=>r}):void 0,wt="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+H,Bt=`<${Tt}>`,N=document,L=()=>N.createComment(""),j=r=>r===null||typeof r!="object"&&typeof r!="function",lt=Array.isArray,Vt=r=>lt(r)||typeof r?.[Symbol.iterator]=="function",et=`[ 	
\f\r]`,U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,bt=/>/g,M=RegExp(`>|${et}(?:([^\\s"'>=/]+)(${et}*=${et}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xt=/'/g,At=/"/g,Et=/^(?:script|style|textarea|title)$/i,ht=r=>(t,...s)=>({_$litType$:r,strings:t,values:s}),B=ht(1),te=ht(2),ee=ht(3),C=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),St=new WeakMap,I=N.createTreeWalker(N,129);function Ct(r,t){if(!lt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return yt!==void 0?yt.createHTML(t):t}var Ft=(r,t)=>{let s=r.length-1,e=[],i,o=t===2?"<svg>":t===3?"<math>":"",n=U;for(let l=0;l<s;l++){let a=r[l],p,d,h=-1,v=0;for(;v<a.length&&(n.lastIndex=v,d=n.exec(a),d!==null);)v=n.lastIndex,n===U?d[1]==="!--"?n=$t:d[1]!==void 0?n=bt:d[2]!==void 0?(Et.test(d[2])&&(i=RegExp("</"+d[2],"g")),n=M):d[3]!==void 0&&(n=M):n===M?d[0]===">"?(n=i??U,h=-1):d[1]===void 0?h=-2:(h=n.lastIndex-d[2].length,p=d[1],n=d[3]===void 0?M:d[3]==='"'?At:xt):n===At||n===xt?n=M:n===$t||n===bt?n=U:(n=M,i=void 0);let m=n===M&&r[l+1].startsWith("/>")?" ":"";o+=n===U?a+Bt:h>=0?(e.push(p),a.slice(0,h)+wt+a.slice(h)+H+m):a+H+(h===-2?l:m)}return[Ct(r,o+(r[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},W=class r{constructor({strings:t,_$litType$:s},e){let i;this.parts=[];let o=0,n=0,l=t.length-1,a=this.parts,[p,d]=Ft(t,s);if(this.el=r.createElement(p,e),I.currentNode=this.el.content,s===2||s===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=I.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let h of i.getAttributeNames())if(h.endsWith(wt)){let v=d[n++],m=i.getAttribute(h).split(H),b=/([.?@])?(.*)/.exec(v);a.push({type:1,index:o,name:b[2],strings:m,ctor:b[1]==="."?it:b[1]==="?"?ot:b[1]==="@"?nt:D}),i.removeAttribute(h)}else h.startsWith(H)&&(a.push({type:6,index:o}),i.removeAttribute(h));if(Et.test(i.tagName)){let h=i.textContent.split(H),v=h.length-1;if(v>0){i.textContent=K?K.emptyScript:"";for(let m=0;m<v;m++)i.append(h[m],L()),I.nextNode(),a.push({type:2,index:++o});i.append(h[v],L())}}}else if(i.nodeType===8)if(i.data===Tt)a.push({type:2,index:o});else{let h=-1;for(;(h=i.data.indexOf(H,h+1))!==-1;)a.push({type:7,index:o}),h+=H.length-1}o++}}static createElement(t,s){let e=N.createElement("template");return e.innerHTML=t,e}};function O(r,t,s=r,e){if(t===C)return t;let i=e!==void 0?s._$Co?.[e]:s._$Cl,o=j(t)?void 0:t._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,s,e)),e!==void 0?(s._$Co??=[])[e]=i:s._$Cl=i),i!==void 0&&(t=O(r,i._$AS(r,t.values),i,e)),t}var st=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:e}=this._$AD,i=(t?.creationScope??N).importNode(s,!0);I.currentNode=i;let o=I.nextNode(),n=0,l=0,a=e[0];for(;a!==void 0;){if(n===a.index){let p;a.type===2?p=new z(o,o.nextSibling,this,t):a.type===1?p=new a.ctor(o,a.name,a.strings,this,t):a.type===6&&(p=new rt(o,this,t)),this._$AV.push(p),a=e[++l]}n!==a?.index&&(o=I.nextNode(),n++)}return I.currentNode=N,i}p(t){let s=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,s),s+=e.strings.length-2):e._$AI(t[s])),s++}},z=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,e,i){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=e,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=O(this,t,s),j(t)?t===A||t==null||t===""?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==C&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==A&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){let{values:s,_$litType$:e}=t,i=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=W.createElement(Ct(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===i)this._$AH.p(s);else{let o=new st(i,this),n=o.u(this.options);o.p(s),this.T(n),this._$AH=o}}_$AC(t){let s=St.get(t.strings);return s===void 0&&St.set(t.strings,s=new W(t)),s}k(t){lt(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,e,i=0;for(let o of t)i===s.length?s.push(e=new r(this.O(L()),this.O(L()),this,this.options)):e=s[i],e._$AI(o),i++;i<s.length&&(this._$AR(e&&e._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){let e=vt(t).nextSibling;vt(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},D=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,e,i,o){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=o,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=A}_$AI(t,s=this,e,i){let o=this.strings,n=!1;if(o===void 0)t=O(this,t,s,0),n=!j(t)||t!==this._$AH&&t!==C,n&&(this._$AH=t);else{let l=t,a,p;for(t=o[0],a=0;a<o.length-1;a++)p=O(this,l[e+a],s,a),p===C&&(p=this._$AH[a]),n||=!j(p)||p!==this._$AH[a],p===A?t=A:t!==A&&(t+=(p??"")+o[a+1]),this._$AH[a]=p}n&&!i&&this.j(t)}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},it=class extends D{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===A?void 0:t}},ot=class extends D{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A)}},nt=class extends D{constructor(t,s,e,i,o){super(t,s,e,i,o),this.type=5}_$AI(t,s=this){if((t=O(this,t,s,0)??A)===C)return;let e=this._$AH,i=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,o=t!==A&&(e===A||i);i&&this.element.removeEventListener(this.name,this,e),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},rt=class{constructor(t,s,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){O(this,t)}};var qt=at.litHtmlPolyfillSupport;qt?.(W,z),(at.litHtmlVersions??=[]).push("3.3.3");var Ht=(r,t,s)=>{let e=s?.renderBefore??t,i=e._$litPart$;if(i===void 0){let o=s?.renderBefore??null;e._$litPart$=i=new z(t.insertBefore(L(),o),o,void 0,s??{})}return i._$AI(r),i};var ct=globalThis,k=class extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ht(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};k._$litElement$=!0,k.finalized=!0,ct.litElementHydrateSupport?.({LitElement:k});var Gt=ct.litElementPolyfillSupport;Gt?.({LitElement:k});(ct.litElementVersions??=[]).push("4.2.2");var kt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Mt=r=>(...t)=>({_$litDirective$:r,values:t}),J=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,e){this._$Ct=t,this._$AM=s,this._$Ci=e}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}};var T=Mt(class extends J{constructor(r){if(super(r),r.type!==kt.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(e=>e!=="")));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let s=r.element.classList;for(let e of this.st)e in t||(s.remove(e),this.st.delete(e));for(let e in t){let i=!!t[e];i===this.st.has(e)||this.nt?.has(e)||(i?(s.add(e),this.st.add(e)):(s.remove(e),this.st.delete(e)))}return C}});var Kt={"6h":"6h","24h":"24h","7d":"7d"},It={"6h":6*3600*1e3,"24h":24*3600*1e3,"7d":7*24*3600*1e3},V=class extends k{constructor(){super(),this._range="24h",this._logCollapsed=!1,this._events=[],this._tempHistory={living:[],bedroom:[],external:[]},this._smoothMin=5,this._targetHistory={day:[],night:[]},this._statusHistory=[],this._sensorIds={tempDay:null,tempNight:null,status:null,mode:null,algorithm:null,dayTarget:null,nightTarget:null,weather:null,nightStart:null,nightEnd:null},this._disconnected=!1}disconnectedCallback(){super.disconnectedCallback(),this._disconnected=!0,this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=null)}connectedCallback(){super.connectedCallback(),this._discoverEntities(),this._fetchData(),this._pollTimer||(this._pollTimer=setInterval(()=>this._fetchData(),2e4))}updated(t){t.has("hass")&&this.hass&&(this._discoverEntities(),this._fetchData()),(t.has("_tempHistory")||t.has("_range")||t.has("_smoothMin"))&&this._renderGraph()}_toDisplay(t){return t}_fromDisplay(t){return t}_fmtTemp(t,s=1){let e=typeof t=="string"?parseFloat(t):t;return e==null||isNaN(e)?"\u2014":`${e.toFixed(s)}\xB0C`}_smooth(t,s=(this._smoothMin||0)*60*1e3){if(!t||t.length===0)return[];if(s<=0)return t;let e=s/2,i=new Array(t.length),o=0,n=0,l=0;for(let a=0;a<t.length;a++){let p=t[a].t;for(;o<t.length&&t[o].t<p-e;)l-=t[o].v,o++;for(;n<t.length&&t[n].t<=p+e;)l+=t[n].v,n++;let d=n-o;i[a]={t:p,v:d>0?l/d:t[a].v}}return i}_discoverEntities(){if(!this.hass||!this.hass.states)return;let t=this.hass.states;for(let s of Object.keys(t))s.startsWith("sensor.thermoloop_status")&&(this._sensorIds.status=s),s.startsWith("select.thermoloop_mode")&&(this._sensorIds.mode=s),s.startsWith("select.thermoloop_algorithm")&&(this._sensorIds.algorithm=s),s.startsWith("number.thermoloop_target_day")&&(this._sensorIds.dayTarget=s),s.startsWith("number.thermoloop_target_night")&&(this._sensorIds.nightTarget=s),s.startsWith("time.thermoloop_night_window_start")&&(this._sensorIds.nightStart=s),s.startsWith("time.thermoloop_night_window_end")&&(this._sensorIds.nightEnd=s);if(!this._sensorIds.weather)for(let s of Object.keys(t)){if(!s.startsWith("weather."))continue;let e=t[s].attributes;if(e&&!isNaN(parseFloat(e.temperature))){this._sensorIds.weather=s;break}}}async _fetchData(){this.hass&&(this._fetchHistory(),this._fetchEvents())}_toC(t,s){let e=typeof t=="string"?parseFloat(t):t;return e==null||isNaN(e)?null:typeof s=="string"&&s.toUpperCase().includes("F")?(e-32)*5/9:e}_unitOf(t,s="unit_of_measurement"){let e=t&&this.hass&&this.hass.states[t];return e&&e.attributes?e.attributes[s]:null}async _fetchHistory(){if(!this.hass||!this.hass.callWS)return;let t=new Date,s=new Date(t.getTime()-It[this._range]),e=this._sensorIds.status&&this.hass.states[this._sensorIds.status]&&this.hass.states[this._sensorIds.status].attributes||{},i=e.day_sensor||e.active_sensor||null,o=e.night_sensor||null,n=[];if(i&&n.push(i),o&&o!==i&&n.push(o),n.length===0)for(let[m,b]of Object.entries(this.hass.states))b.attributes&&b.attributes.device_class==="temperature"&&n.push(m);let l=this._sensorIds.weather,a=this._sensorIds.dayTarget,p=this._sensorIds.nightTarget,d=this._sensorIds.status,h=[l,a,p,d].filter(Boolean),v=[...n,...h];if(v.length!==0)try{let m=await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:v,minimal_response:!1,no_attributes:!1}),b=x=>x.map(y=>({t:(y.lu??y.lc)*1e3,v:parseFloat(y.s)})).filter(y=>!isNaN(y.v)&&y.t>0),f={living:[],bedroom:[],external:[]},w={day:[],night:[]},S=[];for(let[x,y]of Object.entries(m)){if(x===l){let _=this._unitOf(l,"temperature_unit")||this._unitOf(l),c=null;f.external=y.map($=>{if($.a&&$.a.temperature!=null){let pt=this._toC($.a.temperature,_);pt!=null&&(c=pt)}return{t:($.lu??$.lc)*1e3,v:c}}).filter($=>$.v!=null&&!isNaN($.v)&&$.t>0);continue}if(x===a){w.day=b(y);continue}if(x===p){w.night=b(y);continue}if(x===d){let _=null;S=y.map(c=>{if(c.a&&c.a.setpoint!=null){let $=parseFloat(c.a.setpoint);isNaN($)||(_=$)}return{t:(c.lu??c.lc)*1e3,state:c.s,setpoint:_}}).filter(c=>c.t>0);continue}let u;o&&x===o&&x!==i?u="bedroom":i&&x===i?u="living":u=f.living.length<=f.bedroom.length?"living":"bedroom";let g=this._unitOf(x);f[u]=b(y).map(_=>({t:_.t,v:this._toC(_.v,g)})).filter(_=>_.v!=null)}this._targetHistory=w,this._statusHistory=S,this._tempHistory=f}catch(m){console.warn("ThermoLoop: history fetch failed",m)}}async _fetchEvents(){if(!this.hass||!this.hass.callWS||!this._sensorIds.status){this._events=[];return}let t=new Date,s=new Date(t.getTime()-It[this._range]);try{let i=(await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:[this._sensorIds.status],minimal_response:!1,no_attributes:!1}))[this._sensorIds.status]||[],o=[],n=null,l={};for(let a of i){a.a&&(l=a.a);let p=a.s,d=(a.lc??a.lu)*1e3;if(p===n)continue;n=p;let h="";if((p==="active"||p==="off")&&l.setpoint!=null){let m=l.mode||"cool",b=l.fan?` ${l.fan}`:"";h=` ${m} ${Number(l.setpoint).toFixed(0)}\xB0C${b}`}let v=l.reason?` \u2014 ${l.reason}`:"";o.push({time:new Date(d).toLocaleTimeString(),detail:`${p}${h}${v}`,type:p==="error"?"leave":"command"})}this._events=o.slice(-100).reverse()}catch(e){console.warn("ThermoLoop: status history fetch failed",e),this._events=[]}}_findEntity(t){if(!this.hass||!this.hass.states)return null;for(let s of Object.keys(this.hass.states))if(s.startsWith(t))return s;return null}_entityState(t,s=null){return!t||!this.hass||!this.hass.states[t]?s:this.hass.states[t].state}_entityAttr(t,s,e=null){if(!t||!this.hass||!this.hass.states[t])return e;let i=this.hass.states[t].attributes;return i?i[s]:e}_statusValue(t,s="\u2014"){if(!this._sensorIds.status)return s;let e=this.hass&&this.hass.states[this._sensorIds.status];return e?t==="state"?e.state:e.attributes?e.attributes[t]:s:s}_callService(t,s,e){this.hass&&this.hass.callService(t,s,e)}_setDayTarget(t){this._sensorIds.dayTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.dayTarget,value:Math.max(16,Math.min(30,t))})}_setNightTarget(t){this._sensorIds.nightTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.nightTarget,value:Math.max(16,Math.min(30,t))})}_setMode(t){this._sensorIds.mode&&this._callService("select","select_option",{entity_id:this._sensorIds.mode,option:t})}_setAlgorithm(t){this._sensorIds.algorithm&&this._callService("select","select_option",{entity_id:this._sensorIds.algorithm,option:t})}_renderGraph(){let t=this.shadowRoot&&this.shadowRoot.getElementById("tempChart");if(!t)return;this._bindCrosshair(t);let s=t.getContext("2d"),e=window.devicePixelRatio||1,i=t.getBoundingClientRect(),o=i.width,n=i.height;t.width=o*e,t.height=n*e,s.setTransform(e,0,0,e,0,0);let l=[];if(this._tempHistory.living.length>0&&l.push({key:"living",color:"#03a9f4",label:"Living",lineDash:[],data:this._smooth([...this._tempHistory.living].sort((c,$)=>c.t-$.t))}),this._tempHistory.bedroom.length>0&&l.push({key:"bedroom",color:"#ff9800",label:"Bedroom",lineDash:[6,4],data:this._smooth([...this._tempHistory.bedroom].sort((c,$)=>c.t-$.t))}),this._tempHistory.external.length>0&&l.push({key:"external",color:"#4caf50",label:"Outdoor",lineDash:[2,3],data:this._smooth([...this._tempHistory.external].sort((c,$)=>c.t-$.t))}),l.length===0||l.every(c=>c.data.length<2)){this._plot=null,s.clearRect(0,0,o,n),s.fillStyle="#999",s.font="14px sans-serif",s.textAlign="center",s.fillText("Waiting for temperature data\u2026",o/2,n/2);return}let a={top:16,right:16,bottom:28,left:48},p=o-a.left-a.right,d=n-a.top-a.bottom,h=[];for(let c of l)for(let $ of c.data)h.push($.t);let v=Math.min(...h),m=Math.max(...h),b=Math.max(m-v,1),f=this._buildTargetSteps(v,m),w=this._activeRegions(v,m),S=(this._statusHistory||[]).filter(c=>c.setpoint!=null&&c.t>=v&&c.t<=m).map(c=>({t:c.t,v:c.setpoint})),x=[];for(let c of l)for(let $ of c.data)x.push($.v);for(let c of f)x.push(c.v);for(let c of S)x.push(c.v);let y=Math.floor(Math.min(...x)-1),u=Math.ceil(Math.max(...x)+1),g=c=>a.left+(c-v)/b*p,_=c=>a.top+d-(c-y)/(u-y)*d;this._plot={ctx:s,w:o,h:n,pad:a,plotW:p,plotH:d,series:l,xScale:g,yScale:_,minTemp:y,maxTemp:u,minTime:v,maxTime:m,timeRange:b,targetSteps:f,activeRegions:w,acSetpoints:S},this._paint(this._hoverX!=null?this._hoverX:null)}_bindCrosshair(t){t._thermoBound||(t._thermoBound=!0,t.addEventListener("mousemove",s=>{if(!this._plot)return;let e=t.getBoundingClientRect(),{pad:i,w:o}=this._plot,n=Math.max(i.left,Math.min(o-i.right,s.clientX-e.left));this._hoverX=n,this._paint(n)}),t.addEventListener("mouseleave",()=>{this._hoverX=null,this._paint(null)}))}_valueAtTime(t,s){if(t.length===0||s<t[0].t||s>t[t.length-1].t)return null;for(let e=1;e<t.length;e++)if(t[e].t>=s){let i=t[e-1],o=t[e],n=(s-i.t)/(o.t-i.t||1);return i.v+(o.v-i.v)*n}return t[t.length-1].v}_parseTimeEntity(t){if(!t||!this.hass||!this.hass.states[t])return null;let s=this.hass.states[t].state;if(!s||typeof s!="string")return null;let e=s.split(":");if(e.length<2)return null;let i=parseInt(e[0],10),o=parseInt(e[1],10);return isNaN(i)||isNaN(o)?null:i*60+o}_isNightAt(t,s,e){if(s==null||e==null)return!1;let i=new Date(t),o=i.getHours()*60+i.getMinutes();return s<=e?o>=s&&o<e:o>=s||o<e}_stepValueAt(t,s){if(!t||t.length===0)return null;if(s<=t[0].t)return t[0].v;let e=t[0].v;for(let i of t)if(i.t<=s)e=i.v;else break;return e}_buildTargetSteps(t,s){let e=this._targetHistory.day,i=this._targetHistory.night;if(e.length===0&&i.length===0)return[];let o=this._parseTimeEntity(this._sensorIds.nightStart),n=this._parseTimeEntity(this._sensorIds.nightEnd),l=400,a=(s-t)/l,p=[];for(let d=0;d<=l;d++){let h=t+d*a,v=this._isNightAt(h,o,n),m=this._stepValueAt(v?i:e,h);m==null&&(m=this._stepValueAt(v?e:i,h)),m!=null&&p.push({t:h,v:m,night:v})}return p}_activeRegions(t,s){let e=this._statusHistory;if(!e||e.length===0)return[];let i=[...e].sort((n,l)=>n.t-l.t),o=[];for(let n=0;n<i.length;n++){if(i[n].state!=="active")continue;let l=Math.max(i[n].t,t),a=Math.min(n+1<i.length?i[n+1].t:s,s);a>l&&o.push({t0:l,t1:a})}return o}_paint(t){let s=this._plot;if(!s)return;let{ctx:e,w:i,h:o,pad:n,plotW:l,plotH:a,series:p,xScale:d,yScale:h,minTemp:v,maxTemp:m,minTime:b,maxTime:f,timeRange:w,targetSteps:S,activeRegions:x,acSetpoints:y}=s;if(e.clearRect(0,0,i,o),x&&x.length){e.fillStyle="rgba(76,175,80,0.13)";for(let u of x){let g=d(u.t0),_=d(u.t1);_>g&&e.fillRect(g,n.top,_-g,a)}}e.strokeStyle="rgba(0,0,0,0.06)",e.lineWidth=1;for(let u=0;u<=4;u++){let g=n.top+a/4*u;e.beginPath(),e.moveTo(n.left,g),e.lineTo(i-n.right,g),e.stroke()}e.fillStyle="rgba(0,0,0,0.4)",e.font="11px sans-serif",e.textAlign="right";for(let u=0;u<=4;u++){let g=v+(m-v)/4*u,_=n.top+a-a/4*u;e.fillText(this._toDisplay(g).toFixed(1),n.left-6,_+4)}e.textAlign="center";for(let u=0;u<=4;u++){let g=b+w/4*u,_=n.left+l/4*u,c=new Date(g);e.fillText(c.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),_,o-6)}for(let u of p)if(!(u.data.length<2)){e.strokeStyle=u.color,e.lineWidth=2,e.setLineDash(u.lineDash),e.beginPath();for(let g=0;g<u.data.length;g++){let _=d(u.data[g].t),c=h(u.data[g].v);g===0?e.moveTo(_,c):e.lineTo(_,c)}e.stroke(),e.setLineDash([])}if(S&&S.length>1){e.lineWidth=1.5;for(let u=1;u<S.length;u++){let g=S[u-1],_=S[u];e.strokeStyle=g.night?"#9c27b0":"#fbc02d",e.beginPath(),e.moveTo(d(g.t),h(g.v)),e.lineTo(d(_.t),h(g.v)),e.lineTo(d(_.t),h(_.v)),e.stroke()}}if(y&&y.length>0){e.strokeStyle="#e53935",e.lineWidth=1.5,e.setLineDash([]),e.beginPath(),e.moveTo(d(y[0].t),h(y[0].v));for(let g=1;g<y.length;g++){let _=d(y[g].t);e.lineTo(_,h(y[g-1].v)),e.lineTo(_,h(y[g].v))}let u=y[y.length-1];e.lineTo(d(f),h(u.v)),e.stroke()}if(t!=null){let u=b+(t-n.left)/l*w;e.strokeStyle="rgba(0,0,0,0.35)",e.lineWidth=1,e.setLineDash([2,3]),e.beginPath(),e.moveTo(t,n.top),e.lineTo(t,n.top+a),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.6)",e.font="10px sans-serif",e.textAlign="center",e.fillText(new Date(u).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),t,n.top+10);let g=t>i-n.right-50;for(let _ of p){let c=this._valueAtTime(_.data,u);if(c==null)continue;let $=h(c);e.beginPath(),e.arc(t,$,4,0,Math.PI*2),e.fillStyle=_.color,e.fill(),e.lineWidth=1.5,e.strokeStyle="#fff",e.stroke(),e.fillStyle=_.color,e.font="bold 11px sans-serif",e.textAlign=g?"right":"left",e.fillText(`${this._toDisplay(c).toFixed(1)}\xB0`,t+(g?-8:8),$-6)}}}_rangeHistory(t){this._range=t,this._fetchHistory(),this._fetchEvents()}render(){let t=this._entityState(this._sensorIds.mode,"auto"),s=this._entityState(this._sensorIds.algorithm,"v0"),e=parseFloat(this._entityState(this._sensorIds.dayTarget,"22"))||22,i=parseFloat(this._entityState(this._sensorIds.nightTarget,"24"))||24,o=this._statusValue("state"),n=this._statusValue("reason"),l=this._statusValue("active_sensor"),a=this._statusValue("current_temp"),p=this._statusValue("target"),d=this._entityState(this._findEntity("select.thermoloop_mode"),"auto"),h=this._toC(this._entityAttr(this._sensorIds.weather,"temperature"),this._entityAttr(this._sensorIds.weather,"temperature_unit")),v=this._toDisplay(e),m=this._toDisplay(i),b=(f,w,S)=>{let x=this._fromDisplay(this._toDisplay(f)+w);S(x)};return B`
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
            <span class="status-value">${l||"\u2014"}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Temperature</span>
            <span class="status-value">${this._fmtTemp(a)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Target</span>
            <span class="status-value">${this._fmtTemp(p)}</span>
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
            <span class="status-value" style="font-size:0.85em;font-weight:400">${n||"\u2014"}</span>
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
            <span class="item ${T({off:(this._statusHistory||[]).every(f=>f.setpoint==null)})}"
                  style="color:#e53935">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">AC setpoint</span>
            </span>
            <span class="item ${T({off:this._statusHistory.length===0})}">
              <span class="swatch block" style="background:rgba(76,175,80,0.4)"></span><span>Active</span>
            </span>
          </div>
          <div class="range-chips">
            ${Object.entries(Kt).map(([f,w])=>B`
              <div class="range-chip ${T({active:this._range===f})}"
                   @click=${()=>this._rangeHistory(f)} role="button">${w}</div>
            `)}
          </div>
          <div class="smooth-row">
            <span>Smoothing: ${this._smoothMin} min</span>
            <input type="range" min="0" max="30" step="1" .value=${String(this._smoothMin)}
                   @input=${f=>{this._smoothMin=parseInt(f.target.value,10)}} />
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
              <button @click=${()=>b(e,-1,f=>this._setDayTarget(f))}>−</button>
              <span>${this._fmtTemp(e)}</span>
              <button @click=${()=>b(e,1,f=>this._setDayTarget(f))}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${()=>b(i,-1,f=>this._setNightTarget(f))}>−</button>
              <span>${this._fmtTemp(i)}</span>
              <button @click=${()=>b(i,1,f=>this._setNightTarget(f))}>+</button>
            </div>
          </div>
        </div>

        <!-- Event log -->
        <div class="log-card ${T({collapsed:this._logCollapsed})}">
          <h3>
            <span @click=${()=>this._logCollapsed=!this._logCollapsed} style="cursor:pointer">
              ${this._logCollapsed?"\u25B6":"\u25BC"} Event Log (${this._events.length})
            </span>
            <span class="log-refresh" title="Refresh"
                  @click=${()=>this._fetchData()}>⟳</span>
          </h3>
          <div class="log-entries">
            ${this._events.length===0?B`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`:this._events.map(f=>B`
                <div class="log-entry ${f.type}">
                  <span class="log-time">${f.time}</span>
                  <span class="log-detail">${f.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}};Y(V,"styles",Q`
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
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .log-refresh { cursor: pointer; font-size: 1.2em; opacity: 0.7; }
    .log-refresh:hover { opacity: 1; }
    .smooth-row {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin-top: 10px;
      font-size: 0.78em;
      opacity: 0.8;
    }
    .smooth-row input[type="range"] { flex: 0 1 180px; }
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

  `),Y(V,"properties",{hass:{type:Object},config:{type:Object},_range:{state:!0},_logCollapsed:{state:!0},_events:{state:!0},_tempHistory:{state:!0},_smoothMin:{state:!0}});customElements.define("thermoloop-panel",V);
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
