var Nt=Object.defineProperty;var Ot=(r,t,s)=>t in r?Nt(r,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):r[t]=s;var Z=(r,t,s)=>Ot(r,typeof t!="symbol"?t+"":t,s);var q=globalThis,G=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Q=Symbol(),dt=new WeakMap,R=class{constructor(t,s,e){if(this._$cssResult$=!0,e!==Q)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=s}get styleSheet(){let t=this.o,s=this.t;if(G&&t===void 0){let e=s!==void 0&&s.length===1;e&&(t=dt.get(s)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&dt.set(s,t))}return t}toString(){return this.cssText}},ut=r=>new R(typeof r=="string"?r:r+"",void 0,Q),X=(r,...t)=>{let s=r.length===1?r[0]:t.reduce((e,i,n)=>e+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new R(s,r,Q)},ft=(r,t)=>{if(G)r.adoptedStyleSheets=t.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of t){let e=document.createElement("style"),i=q.litNonce;i!==void 0&&e.setAttribute("nonce",i),e.textContent=s.cssText,r.appendChild(e)}},tt=G?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let s="";for(let e of t.cssRules)s+=e.cssText;return ut(s)})(r):r;var{is:Pt,defineProperty:Dt,getOwnPropertyDescriptor:Rt,getOwnPropertyNames:Ut,getOwnPropertySymbols:Lt,getPrototypeOf:jt}=Object,K=globalThis,gt=K.trustedTypes,Wt=gt?gt.emptyScript:"",zt=K.reactiveElementPolyfillSupport,U=(r,t)=>r,et={toAttribute(r,t){switch(t){case Boolean:r=r?Wt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let s=r;switch(t){case Boolean:s=r!==null;break;case Number:s=r===null?null:Number(r);break;case Object:case Array:try{s=JSON.parse(r)}catch{s=null}}return s}},_t=(r,t)=>!Pt(r,t),mt={attribute:!0,type:String,converter:et,reflect:!1,useDefault:!1,hasChanged:_t};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;var E=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=mt){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(t,s),!s.noAccessor){let e=Symbol(),i=this.getPropertyDescriptor(t,e,s);i!==void 0&&Dt(this.prototype,t,i)}}static getPropertyDescriptor(t,s,e){let{get:i,set:n}=Rt(this.prototype,t)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){let l=i?.call(this);n?.call(this,o),this.requestUpdate(t,l,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??mt}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;let t=jt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){let s=this.properties,e=[...Ut(s),...Lt(s)];for(let i of e)this.createProperty(i,s[i])}let t=this[Symbol.metadata];if(t!==null){let s=litPropertyMetadata.get(t);if(s!==void 0)for(let[e,i]of s)this.elementProperties.set(e,i)}this._$Eh=new Map;for(let[s,e]of this.elementProperties){let i=this._$Eu(s,e);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let s=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let i of e)s.unshift(tt(i))}else t!==void 0&&s.push(tt(t));return s}static _$Eu(t,s){let e=s.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,s=this.constructor.elementProperties;for(let e of s.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ft(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,s,e){this._$AK(t,e)}_$ET(t,s){let e=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,e);if(i!==void 0&&e.reflect===!0){let n=(e.converter?.toAttribute!==void 0?e.converter:et).toAttribute(s,e.type);this._$Em=t,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,s){let e=this.constructor,i=e._$Eh.get(t);if(i!==void 0&&this._$Em!==i){let n=e.getPropertyOptions(i),o=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:et;this._$Em=i;let l=o.fromAttribute(s,n.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(t,s,e,i=!1,n){if(t!==void 0){let o=this.constructor;if(i===!1&&(n=this[t]),e??=o.getPropertyOptions(t),!((e.hasChanged??_t)(n,s)||e.useDefault&&e.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,e))))return;this.C(t,s,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,s,{useDefault:e,reflect:i,wrapped:n},o){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??s??this[t]),n!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(s=void 0),this._$AL.set(t,s)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[i,n]of e){let{wrapped:o}=n,l=this[i];o!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let t=!1,s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(s)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(s)}willUpdate(t){}_$AE(t){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(t){}firstUpdated(t){}};E.elementStyles=[],E.shadowRootOptions={mode:"open"},E[U("elementProperties")]=new Map,E[U("finalized")]=new Map,zt?.({ReactiveElement:E}),(K.reactiveElementVersions??=[]).push("2.1.2");var lt=globalThis,yt=r=>r,J=lt.trustedTypes,vt=J?J.createPolicy("lit-html",{createHTML:r=>r}):void 0,wt="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+H,Bt=`<${Tt}>`,N=document,j=()=>N.createComment(""),W=r=>r===null||typeof r!="object"&&typeof r!="function",ht=Array.isArray,Vt=r=>ht(r)||typeof r?.[Symbol.iterator]=="function",st=`[ 	
\f\r]`,L=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,$t=/-->/g,bt=/>/g,M=RegExp(`>|${st}(?:([^\\s"'>=/]+)(${st}*=${st}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),xt=/'/g,At=/"/g,Et=/^(?:script|style|textarea|title)$/i,ct=r=>(t,...s)=>({_$litType$:r,strings:t,values:s}),V=ct(1),te=ct(2),ee=ct(3),C=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),St=new WeakMap,I=N.createTreeWalker(N,129);function Ct(r,t){if(!ht(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return vt!==void 0?vt.createHTML(t):t}var Ft=(r,t)=>{let s=r.length-1,e=[],i,n=t===2?"<svg>":t===3?"<math>":"",o=L;for(let l=0;l<s;l++){let a=r[l],d,u,c=-1,_=0;for(;_<a.length&&(o.lastIndex=_,u=o.exec(a),u!==null);)_=o.lastIndex,o===L?u[1]==="!--"?o=$t:u[1]!==void 0?o=bt:u[2]!==void 0?(Et.test(u[2])&&(i=RegExp("</"+u[2],"g")),o=M):u[3]!==void 0&&(o=M):o===M?u[0]===">"?(o=i??L,c=-1):u[1]===void 0?c=-2:(c=o.lastIndex-u[2].length,d=u[1],o=u[3]===void 0?M:u[3]==='"'?At:xt):o===At||o===xt?o=M:o===$t||o===bt?o=L:(o=M,i=void 0);let y=o===M&&r[l+1].startsWith("/>")?" ":"";n+=o===L?a+Bt:c>=0?(e.push(d),a.slice(0,c)+wt+a.slice(c)+H+y):a+H+(c===-2?l:y)}return[Ct(r,n+(r[s]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},z=class r{constructor({strings:t,_$litType$:s},e){let i;this.parts=[];let n=0,o=0,l=t.length-1,a=this.parts,[d,u]=Ft(t,s);if(this.el=r.createElement(d,e),I.currentNode=this.el.content,s===2||s===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(i=I.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let c of i.getAttributeNames())if(c.endsWith(wt)){let _=u[o++],y=i.getAttribute(c).split(H),$=/([.?@])?(.*)/.exec(_);a.push({type:1,index:n,name:$[2],strings:y,ctor:$[1]==="."?nt:$[1]==="?"?ot:$[1]==="@"?rt:P}),i.removeAttribute(c)}else c.startsWith(H)&&(a.push({type:6,index:n}),i.removeAttribute(c));if(Et.test(i.tagName)){let c=i.textContent.split(H),_=c.length-1;if(_>0){i.textContent=J?J.emptyScript:"";for(let y=0;y<_;y++)i.append(c[y],j()),I.nextNode(),a.push({type:2,index:++n});i.append(c[_],j())}}}else if(i.nodeType===8)if(i.data===Tt)a.push({type:2,index:n});else{let c=-1;for(;(c=i.data.indexOf(H,c+1))!==-1;)a.push({type:7,index:n}),c+=H.length-1}n++}}static createElement(t,s){let e=N.createElement("template");return e.innerHTML=t,e}};function O(r,t,s=r,e){if(t===C)return t;let i=e!==void 0?s._$Co?.[e]:s._$Cl,n=W(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,s,e)),e!==void 0?(s._$Co??=[])[e]=i:s._$Cl=i),i!==void 0&&(t=O(r,i._$AS(r,t.values),i,e)),t}var it=class{constructor(t,s){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:s},parts:e}=this._$AD,i=(t?.creationScope??N).importNode(s,!0);I.currentNode=i;let n=I.nextNode(),o=0,l=0,a=e[0];for(;a!==void 0;){if(o===a.index){let d;a.type===2?d=new B(n,n.nextSibling,this,t):a.type===1?d=new a.ctor(n,a.name,a.strings,this,t):a.type===6&&(d=new at(n,this,t)),this._$AV.push(d),a=e[++l]}o!==a?.index&&(n=I.nextNode(),o++)}return I.currentNode=N,i}p(t){let s=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,s),s+=e.strings.length-2):e._$AI(t[s])),s++}},B=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,s,e,i){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=t,this._$AB=s,this._$AM=e,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,s=this._$AM;return s!==void 0&&t?.nodeType===11&&(t=s.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,s=this){t=O(this,t,s),W(t)?t===A||t==null||t===""?(this._$AH!==A&&this._$AR(),this._$AH=A):t!==this._$AH&&t!==C&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==A&&W(this._$AH)?this._$AA.nextSibling.data=t:this.T(N.createTextNode(t)),this._$AH=t}$(t){let{values:s,_$litType$:e}=t,i=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=z.createElement(Ct(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===i)this._$AH.p(s);else{let n=new it(i,this),o=n.u(this.options);n.p(s),this.T(o),this._$AH=n}}_$AC(t){let s=St.get(t.strings);return s===void 0&&St.set(t.strings,s=new z(t)),s}k(t){ht(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,e,i=0;for(let n of t)i===s.length?s.push(e=new r(this.O(j()),this.O(j()),this,this.options)):e=s[i],e._$AI(n),i++;i<s.length&&(this._$AR(e&&e._$AB.nextSibling,i),s.length=i)}_$AR(t=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);t!==this._$AB;){let e=yt(t).nextSibling;yt(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},P=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,s,e,i,n){this.type=1,this._$AH=A,this._$AN=void 0,this.element=t,this.name=s,this._$AM=i,this.options=n,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=A}_$AI(t,s=this,e,i){let n=this.strings,o=!1;if(n===void 0)t=O(this,t,s,0),o=!W(t)||t!==this._$AH&&t!==C,o&&(this._$AH=t);else{let l=t,a,d;for(t=n[0],a=0;a<n.length-1;a++)d=O(this,l[e+a],s,a),d===C&&(d=this._$AH[a]),o||=!W(d)||d!==this._$AH[a],d===A?t=A:t!==A&&(t+=(d??"")+n[a+1]),this._$AH[a]=d}o&&!i&&this.j(t)}j(t){t===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},nt=class extends P{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===A?void 0:t}},ot=class extends P{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==A)}},rt=class extends P{constructor(t,s,e,i,n){super(t,s,e,i,n),this.type=5}_$AI(t,s=this){if((t=O(this,t,s,0)??A)===C)return;let e=this._$AH,i=t===A&&e!==A||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==A&&(e===A||i);i&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},at=class{constructor(t,s,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=s,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){O(this,t)}};var qt=lt.litHtmlPolyfillSupport;qt?.(z,B),(lt.litHtmlVersions??=[]).push("3.3.3");var Ht=(r,t,s)=>{let e=s?.renderBefore??t,i=e._$litPart$;if(i===void 0){let n=s?.renderBefore??null;e._$litPart$=i=new B(t.insertBefore(j(),n),n,void 0,s??{})}return i._$AI(r),i};var pt=globalThis,k=class extends E{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ht(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return C}};k._$litElement$=!0,k.finalized=!0,pt.litElementHydrateSupport?.({LitElement:k});var Gt=pt.litElementPolyfillSupport;Gt?.({LitElement:k});(pt.litElementVersions??=[]).push("4.2.2");var kt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},Mt=r=>(...t)=>({_$litDirective$:r,values:t}),Y=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,s,e){this._$Ct=t,this._$AM=s,this._$Ci=e}_$AS(t,s){return this.update(t,s)}update(t,s){return this.render(...s)}};var T=Mt(class extends Y{constructor(r){if(super(r),r.type!==kt.ATTRIBUTE||r.name!=="class"||r.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(e=>e!=="")));for(let e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}let s=r.element.classList;for(let e of this.st)e in t||(s.remove(e),this.st.delete(e));for(let e in t){let i=!!t[e];i===this.st.has(e)||this.nt?.has(e)||(i?(s.add(e),this.st.add(e)):(s.remove(e),this.st.delete(e)))}return C}});var Kt={"1h":"1h","6h":"6h","24h":"24h","7d":"7d"},It={"1h":3600*1e3,"6h":6*3600*1e3,"24h":24*3600*1e3,"7d":7*24*3600*1e3},F=class extends k{constructor(){super(),this._range="24h",this._logCollapsed=!1,this._events=[],this._tempHistory={living:[],bedroom:[],external:[]},this._smoothMin=5,this._targetHistory={day:[],night:[]},this._statusHistory=[],this._sensorIds={tempDay:null,tempNight:null,status:null,mode:null,algorithm:null,dayTarget:null,nightTarget:null,weather:null,nightStart:null,nightEnd:null},this._disconnected=!1}disconnectedCallback(){super.disconnectedCallback(),this._disconnected=!0,this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=null),this._cmdUnsub&&(this._cmdUnsub(),this._cmdUnsub=null)}connectedCallback(){super.connectedCallback(),this._discoverEntities(),this._fetchData(),this._subscribeCommands(),this._pollTimer||(this._pollTimer=setInterval(()=>this._fetchHistory(),2e4))}updated(t){t.has("hass")&&this.hass&&(this._discoverEntities(),this._fetchHistory(),this._subscribeCommands()),(t.has("_tempHistory")||t.has("_range")||t.has("_smoothMin"))&&this._renderGraph()}async _subscribeCommands(){if(!(this._cmdUnsub||this._cmdSubscribing||!this.hass||!this.hass.connection)){this._cmdSubscribing=!0;try{this._cmdUnsub=await this.hass.connection.subscribeEvents(t=>this._onCommandEvent(t),"thermoloop_command")}catch(t){console.warn("ThermoLoop: command event subscribe failed",t)}finally{this._cmdSubscribing=!1}}}_onCommandEvent(t){let s=t&&t.data||{},e=s.power===!1?"off":"active",i="";if(s.power!==!1&&s.setpoint!=null){let l=s.fan?` ${s.fan}`:"";i=` ${s.ac_mode||"cool"} ${Number(s.setpoint).toFixed(0)}\xB0C${l}`}let n=s.reason?` \u2014 ${s.reason}`:"",o={time:new Date().toLocaleTimeString(),detail:`${e}${i}${n}`,type:"command"};this._events=[o,...this._events].slice(0,100)}_toDisplay(t){return t}_fromDisplay(t){return t}_fmtTemp(t,s=1){let e=typeof t=="string"?parseFloat(t):t;return e==null||isNaN(e)?"\u2014":`${e.toFixed(s)}\xB0C`}_smooth(t,s=(this._smoothMin||0)*60*1e3){if(!t||t.length===0)return[];if(s<=0)return t;let e=s/2,i=new Array(t.length),n=0,o=0,l=0;for(let a=0;a<t.length;a++){let d=t[a].t;for(;n<t.length&&t[n].t<d-e;)l-=t[n].v,n++;for(;o<t.length&&t[o].t<=d+e;)l+=t[o].v,o++;let u=o-n;i[a]={t:d,v:u>0?l/u:t[a].v}}return i}_discoverEntities(){if(!this.hass||!this.hass.states)return;let t=this.hass.states;for(let s of Object.keys(t))s.startsWith("sensor.thermoloop_status")&&(this._sensorIds.status=s),s.startsWith("select.thermoloop_mode")&&(this._sensorIds.mode=s),s.startsWith("select.thermoloop_algorithm")&&(this._sensorIds.algorithm=s),s.startsWith("number.thermoloop_target_day")&&(this._sensorIds.dayTarget=s),s.startsWith("number.thermoloop_target_night")&&(this._sensorIds.nightTarget=s),s.startsWith("time.thermoloop_night_window_start")&&(this._sensorIds.nightStart=s),s.startsWith("time.thermoloop_night_window_end")&&(this._sensorIds.nightEnd=s);if(!this._sensorIds.weather)for(let s of Object.keys(t)){if(!s.startsWith("weather."))continue;let e=t[s].attributes;if(e&&!isNaN(parseFloat(e.temperature))){this._sensorIds.weather=s;break}}}async _fetchData(){this.hass&&(this._fetchHistory(),this._fetchEvents())}_toC(t,s){let e=typeof t=="string"?parseFloat(t):t;return e==null||isNaN(e)?null:typeof s=="string"&&s.toUpperCase().includes("F")?(e-32)*5/9:e}_unitOf(t,s="unit_of_measurement"){let e=t&&this.hass&&this.hass.states[t];return e&&e.attributes?e.attributes[s]:null}async _fetchHistory(){if(!this.hass||!this.hass.callWS)return;let t=new Date,s=new Date(t.getTime()-It[this._range]),e=this._sensorIds.status&&this.hass.states[this._sensorIds.status]&&this.hass.states[this._sensorIds.status].attributes||{},i=e.day_sensor||e.active_sensor||null,n=e.night_sensor||null,o=[];if(i&&o.push(i),n&&n!==i&&o.push(n),o.length===0)for(let[y,$]of Object.entries(this.hass.states))$.attributes&&$.attributes.device_class==="temperature"&&o.push(y);let l=this._sensorIds.weather,a=this._sensorIds.dayTarget,d=this._sensorIds.nightTarget,u=this._sensorIds.status,c=[l,a,d,u].filter(Boolean),_=[...o,...c];if(_.length!==0)try{let y=await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:_,minimal_response:!1,no_attributes:!1}),$=b=>b.map(x=>({t:(x.lu??x.lc)*1e3,v:parseFloat(x.s)})).filter(x=>!isNaN(x.v)&&x.t>0),f={living:[],bedroom:[],external:[]},w={day:[],night:[]},S=[];for(let[b,x]of Object.entries(y)){if(b===l){let g=this._unitOf(l,"temperature_unit")||this._unitOf(l),h=null;f.external=x.map(v=>{if(v.a&&v.a.temperature!=null){let D=this._toC(v.a.temperature,g);D!=null&&(h=D)}return{t:(v.lu??v.lc)*1e3,v:h}}).filter(v=>v.v!=null&&!isNaN(v.v)&&v.t>0);continue}if(b===a){w.day=$(x);continue}if(b===d){w.night=$(x);continue}if(b===u){let g=null;S=x.map(h=>{if(h.a&&h.a.setpoint!=null){let D=parseFloat(h.a.setpoint);isNaN(D)||(g=D)}let v=h.s;return{t:(h.lu??h.lc)*1e3,state:v,setpoint:v==="active"?g:null}}).filter(h=>h.t>0);continue}let p;n&&b===n&&b!==i?p="bedroom":i&&b===i?p="living":p=f.living.length<=f.bedroom.length?"living":"bedroom";let m=this._unitOf(b);f[p]=$(x).map(g=>({t:g.t,v:this._toC(g.v,m)})).filter(g=>g.v!=null)}this._targetHistory=w,this._statusHistory=S,this._tempHistory=f}catch(y){console.warn("ThermoLoop: history fetch failed",y)}}async _fetchEvents(){if(!this.hass||!this.hass.callWS||!this._sensorIds.status){this._events=[];return}let t=new Date,s=new Date(t.getTime()-It[this._range]);try{let i=(await this.hass.callWS({type:"history/history_during_period",start_time:s.toISOString(),end_time:t.toISOString(),entity_ids:[this._sensorIds.status],minimal_response:!1,no_attributes:!1}))[this._sensorIds.status]||[],n=[],o=null,l={};for(let a of i){a.a&&(l=a.a);let d=a.s,u=(a.lu??a.lc)*1e3,c=`${d}|${l.setpoint??""}|${l.fan??""}|${l.mode??""}`;if(c===o)continue;o=c;let _="";if((d==="active"||d==="off")&&l.setpoint!=null){let $=l.ac_mode||"cool",f=l.fan?` ${l.fan}`:"";_=` ${$} ${Number(l.setpoint).toFixed(0)}\xB0C${f}`}let y=l.reason?` \u2014 ${l.reason}`:"";n.push({time:new Date(u).toLocaleTimeString(),detail:`${d}${_}${y}`,type:d==="error"?"leave":"command"})}this._events=n.slice(-100).reverse()}catch(e){console.warn("ThermoLoop: status history fetch failed",e),this._events=[]}}_findEntity(t){if(!this.hass||!this.hass.states)return null;for(let s of Object.keys(this.hass.states))if(s.startsWith(t))return s;return null}_entityState(t,s=null){return!t||!this.hass||!this.hass.states[t]?s:this.hass.states[t].state}_entityAttr(t,s,e=null){if(!t||!this.hass||!this.hass.states[t])return e;let i=this.hass.states[t].attributes;return i?i[s]:e}_statusValue(t,s="\u2014"){if(!this._sensorIds.status)return s;let e=this.hass&&this.hass.states[this._sensorIds.status];return e?t==="state"?e.state:e.attributes?e.attributes[t]:s:s}_callService(t,s,e){this.hass&&this.hass.callService(t,s,e)}_setDayTarget(t){this._sensorIds.dayTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.dayTarget,value:Math.max(16,Math.min(30,t))})}_setNightTarget(t){this._sensorIds.nightTarget&&this._callService("number","set_value",{entity_id:this._sensorIds.nightTarget,value:Math.max(16,Math.min(30,t))})}_setMode(t){this._sensorIds.mode&&this._callService("select","select_option",{entity_id:this._sensorIds.mode,option:t})}_setAlgorithm(t){this._sensorIds.algorithm&&this._callService("select","select_option",{entity_id:this._sensorIds.algorithm,option:t})}_renderGraph(){let t=this.shadowRoot&&this.shadowRoot.getElementById("tempChart");if(!t)return;this._bindCrosshair(t);let s=t.getContext("2d"),e=window.devicePixelRatio||1,i=t.getBoundingClientRect(),n=i.width,o=i.height;t.width=n*e,t.height=o*e,s.setTransform(e,0,0,e,0,0);let l=[];if(this._tempHistory.living.length>0&&l.push({key:"living",color:"#03a9f4",label:"Living",lineDash:[],data:this._smooth([...this._tempHistory.living].sort((h,v)=>h.t-v.t))}),this._tempHistory.bedroom.length>0&&l.push({key:"bedroom",color:"#ff9800",label:"Bedroom",lineDash:[6,4],data:this._smooth([...this._tempHistory.bedroom].sort((h,v)=>h.t-v.t))}),this._tempHistory.external.length>0&&l.push({key:"external",color:"#4caf50",label:"Outdoor",lineDash:[2,3],data:this._smooth([...this._tempHistory.external].sort((h,v)=>h.t-v.t))}),l.length===0||l.every(h=>h.data.length<2)){this._plot=null,s.clearRect(0,0,n,o),s.fillStyle="#999",s.font="14px sans-serif",s.textAlign="center",s.fillText("Waiting for temperature data\u2026",n/2,o/2);return}let a={top:16,right:16,bottom:28,left:48},d=n-a.left-a.right,u=o-a.top-a.bottom,c=[];for(let h of l)for(let v of h.data)c.push(v.t);let _=Math.min(...c),y=Math.max(...c),$=Math.max(y-_,1),f=this._buildTargetSteps(_,y),w=this._activeRegions(_,y),S=(this._statusHistory||[]).filter(h=>h.t>=_&&h.t<=y).map(h=>({t:h.t,v:h.setpoint})),b=[];for(let h of l)for(let v of h.data)b.push(v.v);for(let h of f)b.push(h.v);for(let h of S)h.v!=null&&b.push(h.v);let x=Math.floor(Math.min(...b)-1),p=Math.ceil(Math.max(...b)+1),m=h=>a.left+(h-_)/$*d,g=h=>a.top+u-(h-x)/(p-x)*u;this._plot={ctx:s,w:n,h:o,pad:a,plotW:d,plotH:u,series:l,xScale:m,yScale:g,minTemp:x,maxTemp:p,minTime:_,maxTime:y,timeRange:$,targetSteps:f,activeRegions:w,acSetpoints:S},this._paint(this._hoverX!=null?this._hoverX:null)}_bindCrosshair(t){t._thermoBound||(t._thermoBound=!0,t.addEventListener("mousemove",s=>{if(!this._plot)return;let e=t.getBoundingClientRect(),{pad:i,w:n}=this._plot,o=Math.max(i.left,Math.min(n-i.right,s.clientX-e.left));this._hoverX=o,this._paint(o)}),t.addEventListener("mouseleave",()=>{this._hoverX=null,this._paint(null)}))}_valueAtTime(t,s){if(t.length===0||s<t[0].t||s>t[t.length-1].t)return null;for(let e=1;e<t.length;e++)if(t[e].t>=s){let i=t[e-1],n=t[e],o=(s-i.t)/(n.t-i.t||1);return i.v+(n.v-i.v)*o}return t[t.length-1].v}_parseTimeEntity(t){if(!t||!this.hass||!this.hass.states[t])return null;let s=this.hass.states[t].state;if(!s||typeof s!="string")return null;let e=s.split(":");if(e.length<2)return null;let i=parseInt(e[0],10),n=parseInt(e[1],10);return isNaN(i)||isNaN(n)?null:i*60+n}_isNightAt(t,s,e){if(s==null||e==null)return!1;let i=new Date(t),n=i.getHours()*60+i.getMinutes();return s<=e?n>=s&&n<e:n>=s||n<e}_stepValueAt(t,s){if(!t||t.length===0)return null;if(s<=t[0].t)return t[0].v;let e=t[0].v;for(let i of t)if(i.t<=s)e=i.v;else break;return e}_buildTargetSteps(t,s){let e=this._targetHistory.day,i=this._targetHistory.night;if(e.length===0&&i.length===0)return[];let n=this._parseTimeEntity(this._sensorIds.nightStart),o=this._parseTimeEntity(this._sensorIds.nightEnd),l=400,a=(s-t)/l,d=[];for(let u=0;u<=l;u++){let c=t+u*a,_=this._isNightAt(c,n,o),y=this._stepValueAt(_?i:e,c);y==null&&(y=this._stepValueAt(_?e:i,c)),y!=null&&d.push({t:c,v:y,night:_})}return d}_activeRegions(t,s){let e=this._statusHistory;if(!e||e.length===0)return[];let i=[...e].sort((o,l)=>o.t-l.t),n=[];for(let o=0;o<i.length;o++){if(i[o].state!=="active")continue;let l=Math.max(i[o].t,t),a=Math.min(o+1<i.length?i[o+1].t:s,s);a>l&&n.push({t0:l,t1:a})}return n}_paint(t){let s=this._plot;if(!s)return;let{ctx:e,w:i,h:n,pad:o,plotW:l,plotH:a,series:d,xScale:u,yScale:c,minTemp:_,maxTemp:y,minTime:$,maxTime:f,timeRange:w,targetSteps:S,activeRegions:b,acSetpoints:x}=s;if(e.clearRect(0,0,i,n),b&&b.length){e.fillStyle="rgba(76,175,80,0.13)";for(let p of b){let m=u(p.t0),g=u(p.t1);g>m&&e.fillRect(m,o.top,g-m,a)}}e.strokeStyle="rgba(0,0,0,0.06)",e.lineWidth=1;for(let p=0;p<=4;p++){let m=o.top+a/4*p;e.beginPath(),e.moveTo(o.left,m),e.lineTo(i-o.right,m),e.stroke()}e.fillStyle="rgba(0,0,0,0.4)",e.font="11px sans-serif",e.textAlign="right";for(let p=0;p<=4;p++){let m=_+(y-_)/4*p,g=o.top+a-a/4*p;e.fillText(this._toDisplay(m).toFixed(1),o.left-6,g+4)}e.textAlign="center";for(let p=0;p<=4;p++){let m=$+w/4*p,g=o.left+l/4*p,h=new Date(m);e.fillText(h.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),g,n-6)}for(let p of d)if(!(p.data.length<2)){e.strokeStyle=p.color,e.lineWidth=2,e.setLineDash(p.lineDash),e.beginPath();for(let m=0;m<p.data.length;m++){let g=u(p.data[m].t),h=c(p.data[m].v);m===0?e.moveTo(g,h):e.lineTo(g,h)}e.stroke(),e.setLineDash([])}if(S&&S.length>1){e.lineWidth=1.5;for(let p=1;p<S.length;p++){let m=S[p-1],g=S[p];e.strokeStyle=m.night?"#9c27b0":"#fbc02d",e.beginPath(),e.moveTo(u(m.t),c(m.v)),e.lineTo(u(g.t),c(m.v)),e.lineTo(u(g.t),c(g.v)),e.stroke()}}if(x&&x.length>0){e.strokeStyle="#e53935",e.lineWidth=1.5,e.setLineDash([]),e.beginPath();let p=null;for(let g of x){if(g.v==null){p=null;continue}let h=u(g.t),v=c(g.v);p==null?e.moveTo(h,v):(e.lineTo(h,p.y),e.lineTo(h,v)),p={x:h,y:v}}let m=x[x.length-1];m&&m.v!=null&&e.lineTo(u(f),c(m.v)),e.stroke()}if(t!=null){let p=$+(t-o.left)/l*w;e.strokeStyle="rgba(0,0,0,0.35)",e.lineWidth=1,e.setLineDash([2,3]),e.beginPath(),e.moveTo(t,o.top),e.lineTo(t,o.top+a),e.stroke(),e.setLineDash([]),e.fillStyle="rgba(0,0,0,0.6)",e.font="10px sans-serif",e.textAlign="center",e.fillText(new Date(p).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),t,o.top+10);let m=t>i-o.right-50;for(let g of d){let h=this._valueAtTime(g.data,p);if(h==null)continue;let v=c(h);e.beginPath(),e.arc(t,v,4,0,Math.PI*2),e.fillStyle=g.color,e.fill(),e.lineWidth=1.5,e.strokeStyle="#fff",e.stroke(),e.fillStyle=g.color,e.font="bold 11px sans-serif",e.textAlign=m?"right":"left",e.fillText(`${this._toDisplay(h).toFixed(1)}\xB0`,t+(m?-8:8),v-6)}}}_rangeHistory(t){this._range=t,this._fetchHistory(),this._fetchEvents()}render(){let t=this._entityState(this._sensorIds.mode,"auto"),s=this._entityState(this._sensorIds.algorithm,"v0"),e=parseFloat(this._entityState(this._sensorIds.dayTarget,"22"))||22,i=parseFloat(this._entityState(this._sensorIds.nightTarget,"24"))||24,n=this._statusValue("state"),o=this._statusValue("reason"),l=this._statusValue("active_sensor"),a=this._statusValue("current_temp"),d=this._statusValue("target"),u=this._entityState(this._findEntity("select.thermoloop_mode"),"auto"),c=this._toC(this._entityAttr(this._sensorIds.weather,"temperature"),this._entityAttr(this._sensorIds.weather,"temperature_unit")),_=this._toDisplay(e),y=this._toDisplay(i),$=(f,w,S)=>{let b=this._fromDisplay(this._toDisplay(f)+w);S(b)};return V`
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
            <span class="status-value">${this._fmtTemp(d)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Outdoor</span>
            <span class="status-value">${this._fmtTemp(c)}</span>
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
            <span class="item ${T({off:(this._statusHistory||[]).every(f=>f.setpoint==null)})}"
                  style="color:#e53935">
              <span class="swatch"></span><span style="color:var(--primary-text-color)">AC setpoint</span>
            </span>
            <span class="item ${T({off:this._statusHistory.length===0})}">
              <span class="swatch block" style="background:rgba(76,175,80,0.4)"></span><span>Active</span>
            </span>
          </div>
          <div class="range-chips">
            ${Object.entries(Kt).map(([f,w])=>V`
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
              <button @click=${()=>$(e,-1,f=>this._setDayTarget(f))}>−</button>
              <span>${this._fmtTemp(e)}</span>
              <button @click=${()=>$(e,1,f=>this._setDayTarget(f))}>+</button>
            </div>
          </div>

          <div class="control-row">
            <span class="control-label">Night Target</span>
            <div class="stepper">
              <button @click=${()=>$(i,-1,f=>this._setNightTarget(f))}>−</button>
              <span>${this._fmtTemp(i)}</span>
              <button @click=${()=>$(i,1,f=>this._setNightTarget(f))}>+</button>
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
            ${this._events.length===0?V`<div class="log-entry"><span style="opacity:0.4">No events in this period</span></div>`:this._events.map(f=>V`
                <div class="log-entry ${f.type}">
                  <span class="log-time">${f.time}</span>
                  <span class="log-detail">${f.detail}</span>
                </div>
              `)}
          </div>
        </div>
      </div>
    `}};Z(F,"styles",X`
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

  `),Z(F,"properties",{hass:{type:Object},config:{type:Object},_range:{state:!0},_logCollapsed:{state:!0},_events:{state:!0},_tempHistory:{state:!0},_smoothMin:{state:!0}});customElements.define("thermoloop-panel",F);
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
