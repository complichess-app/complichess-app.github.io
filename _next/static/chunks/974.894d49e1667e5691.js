"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[974],{125:(e,t,r)=>{var n=r(2115),i="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},a=n.useState,o=n.useEffect,s=n.useLayoutEffect,l=n.useDebugValue;function u(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!i(e,r)}catch(e){return!0}}var c="undefined"==typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var r=t(),n=a({inst:{value:r,getSnapshot:t}}),i=n[0].inst,c=n[1];return s(function(){i.value=r,i.getSnapshot=t,u(i)&&c({inst:i})},[e,r,t]),o(function(){return u(i)&&c({inst:i}),e(function(){u(i)&&c({inst:i})})},[e]),l(r),r};t.useSyncExternalStore=void 0!==n.useSyncExternalStore?n.useSyncExternalStore:c},258:(e,t,r)=>{r.d(t,{Hl:()=>f});var n=r(6595),i=r(2115),a=r(7548);function o(e,t){let r;return(...n)=>{window.clearTimeout(r),r=window.setTimeout(()=>e(...n),t)}}let s=["x","y","top","bottom","left","right","width","height"];var l=r(4735),u=r(5155);function c({ref:e,children:t,fallback:r,resize:l,style:c,gl:f,events:d=n.f,eventSource:h,eventPrefix:p,shadows:m,linear:v,flat:g,legacy:y,orthographic:w,frameloop:b,dpr:x,performance:S,raycaster:E,camera:_,scene:M,onPointerMissed:A,onCreated:U,...C}){i.useMemo(()=>(0,n.e)(a),[]);let R=(0,n.u)(),[P,O]=function({debounce:e,scroll:t,polyfill:r,offsetSize:n}={debounce:0,scroll:!1,offsetSize:!1}){var a,l,u;let c=r||("undefined"==typeof window?class{}:window.ResizeObserver);if(!c)throw Error("This browser does not support ResizeObserver out of the box. See: https://github.com/react-spring/react-use-measure/#resize-observer-polyfills");let[f,d]=(0,i.useState)({left:0,top:0,width:0,height:0,bottom:0,right:0,x:0,y:0}),h=(0,i.useRef)({element:null,scrollContainers:null,resizeObserver:null,lastBounds:f,orientationHandler:null}),p=e?"number"==typeof e?e:e.scroll:null,m=e?"number"==typeof e?e:e.resize:null,v=(0,i.useRef)(!1);(0,i.useEffect)(()=>(v.current=!0,()=>void(v.current=!1)));let[g,y,w]=(0,i.useMemo)(()=>{let e=()=>{let e,t;if(!h.current.element)return;let{left:r,top:i,width:a,height:o,bottom:l,right:u,x:c,y:f}=h.current.element.getBoundingClientRect(),p={left:r,top:i,width:a,height:o,bottom:l,right:u,x:c,y:f};h.current.element instanceof HTMLElement&&n&&(p.height=h.current.element.offsetHeight,p.width=h.current.element.offsetWidth),Object.freeze(p),v.current&&(e=h.current.lastBounds,t=p,!s.every(r=>e[r]===t[r]))&&d(h.current.lastBounds=p)};return[e,m?o(e,m):e,p?o(e,p):e]},[d,n,p,m]);function b(){h.current.scrollContainers&&(h.current.scrollContainers.forEach(e=>e.removeEventListener("scroll",w,!0)),h.current.scrollContainers=null),h.current.resizeObserver&&(h.current.resizeObserver.disconnect(),h.current.resizeObserver=null),h.current.orientationHandler&&("orientation"in screen&&"removeEventListener"in screen.orientation?screen.orientation.removeEventListener("change",h.current.orientationHandler):"onorientationchange"in window&&window.removeEventListener("orientationchange",h.current.orientationHandler))}function x(){h.current.element&&(h.current.resizeObserver=new c(w),h.current.resizeObserver.observe(h.current.element),t&&h.current.scrollContainers&&h.current.scrollContainers.forEach(e=>e.addEventListener("scroll",w,{capture:!0,passive:!0})),h.current.orientationHandler=()=>{w()},"orientation"in screen&&"addEventListener"in screen.orientation?screen.orientation.addEventListener("change",h.current.orientationHandler):"onorientationchange"in window&&window.addEventListener("orientationchange",h.current.orientationHandler))}return a=w,l=!!t,(0,i.useEffect)(()=>{if(l)return window.addEventListener("scroll",a,{capture:!0,passive:!0}),()=>void window.removeEventListener("scroll",a,!0)},[a,l]),u=y,(0,i.useEffect)(()=>(window.addEventListener("resize",u),()=>void window.removeEventListener("resize",u)),[u]),(0,i.useEffect)(()=>{b(),x()},[t,w,y]),(0,i.useEffect)(()=>b,[]),[e=>{e&&e!==h.current.element&&(b(),h.current.element=e,h.current.scrollContainers=function e(t){let r=[];if(!t||t===document.body)return r;let{overflow:n,overflowX:i,overflowY:a}=window.getComputedStyle(t);return[n,i,a].some(e=>"auto"===e||"scroll"===e)&&r.push(t),[...r,...e(t.parentElement)]}(e),x())},f,g]}({scroll:!0,debounce:{scroll:50,resize:0},...l}),I=i.useRef(null),T=i.useRef(null);i.useImperativeHandle(e,()=>I.current);let L=(0,n.a)(A),z=i.useCallback(e=>null==L.current?void 0:L.current(e),[L]),[k,B]=i.useState(!1),[F,D]=i.useState(!1);if(k)throw k;if(F)throw F;let H=i.useRef(null),[j,N]=(0,n.b)(),q=i.useRef(null),W=()=>h?(0,n.i)(h)?h.current:h:T.current;i.useInsertionEffect(()=>()=>{let e=H.current;H.current=null,null==e||e.unmount()},[]),(0,n.c)(()=>{let e=I.current;O.width>0&&O.height>0&&e&&(H.current||(H.current=(0,n.d)(e)),H.current.configure({gl:f,scene:M,events:d,shadows:m,linear:v,flat:g,legacy:y,orthographic:w,frameloop:b,dpr:x,performance:S,raycaster:E,camera:_,size:O,onPointerMissed:z,onCreated:e=>{var t;q.current=e,null==e.events.connect||e.events.connect(null!=(t=W())?t:T.current),p&&e.setEvents({compute:(e,t)=>{let r=e[p+"X"],n=e[p+"Y"];t.pointer.set(r/t.size.width*2-1,-(2*(n/t.size.height))+1),t.raycaster.setFromCamera(t.pointer,t.camera)}}),null==U||U(e)}}).catch(D),"fulfilled"===H.current.ready.status?H.current.render((0,u.jsx)(R,{children:(0,u.jsx)(n.E,{set:D,children:(0,u.jsx)(i.Suspense,{fallback:(0,u.jsx)(n.B,{set:B}),children:null!=t?t:null})})})):"pending"===H.current.ready.status&&N(H.current.ready))}),i.useEffect(()=>{var e;let t=null==(e=q.current)?void 0:e.get(),r=W();t&&r&&t.events.connected!==r&&(null==t.events.connect||t.events.connect(r))}),i.useEffect(()=>{let e=I.current;return()=>{var t;e.isConnected||null==(t=H.current)||t.unmount()}},[]);let G=h?"none":"auto";return(0,u.jsxs)("div",{ref:T,style:{position:"relative",width:"100%",height:"100%",overflow:"hidden",pointerEvents:G,...c},...C,children:[(0,u.jsx)("div",{ref:P,style:{width:"100%",height:"100%"},children:(0,u.jsx)("canvas",{ref:I,style:{display:"block"},children:r})}),j]})}function f(e){return(0,u.jsx)(l.Af,{children:(0,u.jsx)(c,{...e})})}r(9914)},3654:(e,t,r)=>{var n=r(2115),i=r(4806),a="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},o=i.useSyncExternalStore,s=n.useRef,l=n.useEffect,u=n.useMemo,c=n.useDebugValue;t.useSyncExternalStoreWithSelector=function(e,t,r,n,i){var f=s(null);if(null===f.current){var d={hasValue:!1,value:null};f.current=d}else d=f.current;var h=o(e,(f=u(function(){function e(e){if(!l){if(l=!0,o=e,e=n(e),void 0!==i&&d.hasValue){var t=d.value;if(i(t,e))return s=t}return s=e}if(t=s,a(o,e))return t;var r=n(e);return void 0!==i&&i(t,r)?(o=e,t):(o=e,s=r)}var o,s,l=!1,u=void 0===r?null:r;return[function(){return e(t())},null===u?void 0:function(){return e(u())}]},[t,r,n,i]))[0],f[1]);return l(function(){d.hasValue=!0,d.value=h},[h]),c(h),h}},3689:(e,t,r)=>{r.d(t,{DY:()=>o,IU:()=>l,uv:()=>s});let n=[];function i(e,t,r=(e,t)=>e===t){if(e===t)return!0;if(!e||!t)return!1;let n=e.length;if(t.length!==n)return!1;for(let i=0;i<n;i++)if(!r(e[i],t[i]))return!1;return!0}function a(e,t=null,r=!1,o={}){for(let a of(null===t&&(t=[e]),n))if(i(t,a.keys,a.equal)){if(r)return;if(Object.prototype.hasOwnProperty.call(a,"error"))throw a.error;if(Object.prototype.hasOwnProperty.call(a,"response"))return o.lifespan&&o.lifespan>0&&(a.timeout&&clearTimeout(a.timeout),a.timeout=setTimeout(a.remove,o.lifespan)),a.response;if(!r)throw a.promise}let s={keys:t,equal:o.equal,remove:()=>{let e=n.indexOf(s);-1!==e&&n.splice(e,1)},promise:("object"==typeof e&&"function"==typeof e.then?e:e(...t)).then(e=>{s.response=e,o.lifespan&&o.lifespan>0&&(s.timeout=setTimeout(s.remove,o.lifespan))}).catch(e=>s.error=e)};if(n.push(s),!r)throw s.promise}let o=(e,t,r)=>a(e,t,!1,r),s=(e,t,r)=>void a(e,t,!0,r),l=e=>{if(void 0===e||0===e.length)n.splice(0,n.length);else{let t=n.find(t=>i(e,t.keys,t.equal));t&&t.remove()}}},3718:(e,t,r)=>{r.d(t,{h:()=>l});var n=r(2115),i=r(8828);let a=e=>{let t,r=new Set,n=(e,n)=>{let i="function"==typeof e?e(t):e;if(!Object.is(i,t)){let e=t;t=(null!=n?n:"object"!=typeof i||null===i)?i:Object.assign({},t,i),r.forEach(r=>r(t,e))}},i=()=>t,a={setState:n,getState:i,getInitialState:()=>o,subscribe:e=>(r.add(e),()=>r.delete(e))},o=t=e(n,i,a);return a},{useSyncExternalStoreWithSelector:o}=i,s=(e,t)=>{let r=(e=>e?a(e):a)(e),i=(e,i=t)=>(function(e,t=e=>e,r){let i=o(e.subscribe,e.getState,e.getInitialState,t,r);return n.useDebugValue(i),i})(r,e,i);return Object.assign(i,r),i},l=(e,t)=>e?s(e,t):s},4735:(e,t,r)=>{r.d(t,{Af:()=>s,Go:()=>d,Nz:()=>i,u5:()=>l,y3:()=>f});var n=r(2115);function i(e,t,r){if(!e)return;if(!0===r(e))return e;let n=t?e.return:e.child;for(;n;){let e=i(n,t,r);if(e)return e;n=t?null:n.sibling}}function a(e){try{return Object.defineProperties(e,{_currentRenderer:{get:()=>null,set(){}},_currentRenderer2:{get:()=>null,set(){}}})}catch(t){return e}}(()=>{var e,t;return"undefined"!=typeof window&&((null==(e=window.document)?void 0:e.createElement)||(null==(t=window.navigator)?void 0:t.product)==="ReactNative")})()?n.useLayoutEffect:n.useEffect;let o=a(n.createContext(null));class s extends n.Component{render(){return n.createElement(o.Provider,{value:this._reactInternals},this.props.children)}}function l(){let e=n.useContext(o);if(null===e)throw Error("its-fine: useFiber must be called within a <FiberProvider />!");let t=n.useId();return n.useMemo(()=>{for(let r of[e,null==e?void 0:e.alternate]){if(!r)continue;let e=i(r,!1,e=>{let r=e.memoizedState;for(;r;){if(r.memoizedState===t)return!0;r=r.next}});if(e)return e}},[e,t])}let u=Symbol.for("react.context"),c=e=>null!==e&&"object"==typeof e&&"$$typeof"in e&&e.$$typeof===u;function f(){let e=function(){let e=l(),[t]=n.useState(()=>new Map);t.clear();let r=e;for(;r;){let e=r.type;c(e)&&e!==o&&!t.has(e)&&t.set(e,n.use(a(e))),r=r.return}return t}();return n.useMemo(()=>Array.from(e.keys()).reduce((t,r)=>i=>n.createElement(t,null,n.createElement(r.Provider,{...i,value:e.get(r)})),e=>n.createElement(s,{...e})),[e])}function d(){if(!n.Activity)throw Error("its-fine: useActivityBridge requires React 19.2 or later!");let e=l(),[t]=n.useState(()=>{let t,r=[],a=!1;i(e,!0,e=>{var t,i;if(e.elementType===n.Activity){let n=(null==(t=e.child)?void 0:t.tag)===22?e.child.stateNode:null;if("number"!=typeof(null==n?void 0:n._visibility))throw Error("its-fine: unsupported React Activity internals!");r.push(n)}else 22===e.tag&&(null==(i=e.return)?void 0:i.elementType)!==n.Activity&&(a=!0)});let o="hidden",s=new Set,l={mounted:!1,connected:!1,subscribe:e=>(s.add(e),()=>{s.delete(e)}),sync(e){l.mounted&&!l.connected&&a&&r.length>0?t||(t=function(e){if("function"==typeof requestAnimationFrame){let t=requestAnimationFrame(e);return()=>cancelAnimationFrame(t)}let t=setTimeout(e,16);return()=>clearTimeout(t)}(()=>{t=void 0,l.sync(!0)})):(null==t||t(),t=void 0);let n=o;if(l.mounted?l.connected?n="visible":e&&(n=r.every(e=>(1&e._visibility)!=0)?"visible":"hidden"):n="hidden",o!==n)for(let e of(o=n,s))e()},Bridge:({children:e})=>n.createElement(n.Activity,{mode:n.useSyncExternalStore(l.subscribe,()=>o,()=>"hidden")},e)};return l});return n.useInsertionEffect(()=>(t.mounted=!0,queueMicrotask(()=>t.sync(!1)),()=>{t.mounted=!1,queueMicrotask(()=>t.sync(!1))}),[t]),n.useLayoutEffect(()=>(t.connected=!0,t.sync(!1),()=>{t.connected=!1,t.sync(!0)}),[t]),t.Bridge}},4806:(e,t,r)=>{e.exports=r(125)},4814:(e,t,r)=>{r.d(t,{r:()=>n});let n=parseInt(r(5339).sPf.replace(/\D+/g,""))},5322:(e,t,r)=>{let n,i;r.d(t,{l:()=>L});var a=r(8945),o=r(2115),s=r(5339),l=r(6595);let u=new s.NRn,c=new s.Pq0;class f extends s.CmU{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry",this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute("position",new s.qtW([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute("uv",new s.qtW([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,r=this.attributes.instanceEnd;return void 0!==t&&(t.applyMatrix4(e),r.applyMatrix4(e),t.needsUpdate=!0),null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let r=new s.LuO(t,6,1);return this.setAttribute("instanceStart",new s.eHs(r,3,0)),this.setAttribute("instanceEnd",new s.eHs(r,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let r;e instanceof Float32Array?r=e:Array.isArray(e)&&(r=new Float32Array(e));let n=new s.LuO(r,2*t,1);return this.setAttribute("instanceColorStart",new s.eHs(n,t,0)),this.setAttribute("instanceColorEnd",new s.eHs(n,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.XJ7(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){null===this.boundingBox&&(this.boundingBox=new s.NRn);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;void 0!==e&&void 0!==t&&(this.boundingBox.setFromBufferAttribute(e),u.setFromBufferAttribute(t),this.boundingBox.union(u))}computeBoundingSphere(){null===this.boundingSphere&&(this.boundingSphere=new s.iyt),null===this.boundingBox&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(void 0!==e&&void 0!==t){let r=this.boundingSphere.center;this.boundingBox.getCenter(r);let n=0;for(let i=0,a=e.count;i<a;i++)c.fromBufferAttribute(e,i),n=Math.max(n,r.distanceToSquared(c)),c.fromBufferAttribute(t,i),n=Math.max(n,r.distanceToSquared(c));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}var d=r(7548),h=r(4814);class p extends s.BKk{constructor(e){super({type:"LineMaterial",uniforms:s.LlO.clone(s.LlO.merge([d.UniformsLib.common,d.UniformsLib.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.I9Y(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${h.r>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(e){!0===e?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(e){!!e!="USE_DASH"in this.defines&&(this.needsUpdate=!0),!0===e?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(e){!!e!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),!0===e?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}let m=h.r>=125?"uv1":"uv2",v=new s.IUQ,g=new s.Pq0,y=new s.Pq0,w=new s.IUQ,b=new s.IUQ,x=new s.IUQ,S=new s.Pq0,E=new s.kn4,_=new s.cZY,M=new s.Pq0,A=new s.NRn,U=new s.iyt,C=new s.IUQ;function R(e,t,r){return C.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),C.multiplyScalar(1/C.w),C.x=i/r.width,C.y=i/r.height,C.applyMatrix4(e.projectionMatrixInverse),C.multiplyScalar(1/C.w),Math.abs(Math.max(C.x,C.y))}class P extends s.eaF{constructor(e=new f,t=new p({color:0xffffff*Math.random()})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,r=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)g.fromBufferAttribute(t,e),y.fromBufferAttribute(r,e),n[i]=0===i?0:n[i-1],n[i+1]=n[i]+g.distanceTo(y);let i=new s.LuO(n,2,1);return e.setAttribute("instanceDistanceStart",new s.eHs(i,1,0)),e.setAttribute("instanceDistanceEnd",new s.eHs(i,1,1)),this}raycast(e,t){let r,a,o=this.material.worldUnits,l=e.camera;null!==l||o||console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let u=void 0!==e.params.Line2&&e.params.Line2.threshold||0;n=e.ray;let c=this.matrixWorld,f=this.geometry,d=this.material;if(i=d.linewidth+u,null===f.boundingSphere&&f.computeBoundingSphere(),U.copy(f.boundingSphere).applyMatrix4(c),o)r=.5*i;else{let e=Math.max(l.near,U.distanceToPoint(n.origin));r=R(l,e,d.resolution)}if(U.radius+=r,!1!==n.intersectsSphere(U)){if(null===f.boundingBox&&f.computeBoundingBox(),A.copy(f.boundingBox).applyMatrix4(c),o)a=.5*i;else{let e=Math.max(l.near,A.distanceToPoint(n.origin));a=R(l,e,d.resolution)}A.expandByScalar(a),!1!==n.intersectsBox(A)&&(o?function(e,t){let r=e.matrixWorld,a=e.geometry,o=a.attributes.instanceStart,l=a.attributes.instanceEnd,u=Math.min(a.instanceCount,o.count);for(let a=0;a<u;a++){_.start.fromBufferAttribute(o,a),_.end.fromBufferAttribute(l,a),_.applyMatrix4(r);let u=new s.Pq0,c=new s.Pq0;n.distanceSqToSegment(_.start,_.end,c,u),c.distanceTo(u)<.5*i&&t.push({point:c,pointOnLine:u,distance:n.origin.distanceTo(c),object:e,face:null,faceIndex:a,uv:null,[m]:null})}}(this,t):function(e,t,r){let a=t.projectionMatrix,o=e.material.resolution,l=e.matrixWorld,u=e.geometry,c=u.attributes.instanceStart,f=u.attributes.instanceEnd,d=Math.min(u.instanceCount,c.count),h=-t.near;n.at(1,x),x.w=1,x.applyMatrix4(t.matrixWorldInverse),x.applyMatrix4(a),x.multiplyScalar(1/x.w),x.x*=o.x/2,x.y*=o.y/2,x.z=0,S.copy(x),E.multiplyMatrices(t.matrixWorldInverse,l);for(let t=0;t<d;t++){if(w.fromBufferAttribute(c,t),b.fromBufferAttribute(f,t),w.w=1,b.w=1,w.applyMatrix4(E),b.applyMatrix4(E),w.z>h&&b.z>h)continue;if(w.z>h){let e=w.z-b.z,t=(w.z-h)/e;w.lerp(b,t)}else if(b.z>h){let e=b.z-w.z,t=(b.z-h)/e;b.lerp(w,t)}w.applyMatrix4(a),b.applyMatrix4(a),w.multiplyScalar(1/w.w),b.multiplyScalar(1/b.w),w.x*=o.x/2,w.y*=o.y/2,b.x*=o.x/2,b.y*=o.y/2,_.start.copy(w),_.start.z=0,_.end.copy(b),_.end.z=0;let u=_.closestPointToPointParameter(S,!0);_.at(u,M);let d=s.cj9.lerp(w.z,b.z,u),p=d>=-1&&d<=1,v=S.distanceTo(M)<.5*i;if(p&&v){_.start.fromBufferAttribute(c,t),_.end.fromBufferAttribute(f,t),_.start.applyMatrix4(l),_.end.applyMatrix4(l);let i=new s.Pq0,a=new s.Pq0;n.distanceSqToSegment(_.start,_.end,a,i),r.push({point:a,pointOnLine:i,distance:n.origin.distanceTo(a),object:e,face:null,faceIndex:t,uv:null,[m]:null})}}}(this,l,t))}}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(v),this.material.uniforms.resolution.value.set(v.z,v.w))}}class O extends f{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,r=new Float32Array(2*t);for(let n=0;n<t;n+=3)r[2*n]=e[n],r[2*n+1]=e[n+1],r[2*n+2]=e[n+2],r[2*n+3]=e[n+3],r[2*n+4]=e[n+4],r[2*n+5]=e[n+5];return super.setPositions(r),this}setColors(e,t=3){let r=e.length-t,n=new Float32Array(2*r);if(3===t)for(let i=0;i<r;i+=t)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5];else for(let i=0;i<r;i+=t)n[2*i]=e[i],n[2*i+1]=e[i+1],n[2*i+2]=e[i+2],n[2*i+3]=e[i+3],n[2*i+4]=e[i+4],n[2*i+5]=e[i+5],n[2*i+6]=e[i+6],n[2*i+7]=e[i+7];return super.setColors(n,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class I extends P{constructor(e=new O,t=new p({color:0xffffff*Math.random()})){super(e,t),this.isLine2=!0,this.type="Line2"}}let T=o.forwardRef(function({points:e,color:t=0xffffff,vertexColors:r,linewidth:n,lineWidth:i,segments:u,dashed:c,...d},h){var m,v;let g=(0,l.D)(e=>e.size),y=o.useMemo(()=>u?new P:new I,[u]),[w]=o.useState(()=>new p),b=(null==r||null==(m=r[0])?void 0:m.length)===4?4:3,x=o.useMemo(()=>{let n=u?new f:new O,i=e.map(e=>{let t=Array.isArray(e);return e instanceof s.Pq0||e instanceof s.IUQ?[e.x,e.y,e.z]:e instanceof s.I9Y?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e});if(n.setPositions(i.flat()),r){t=0xffffff;let e=r.map(e=>e instanceof s.Q1f?e.toArray():e);n.setColors(e.flat(),b)}return n},[e,u,r,b]);return o.useLayoutEffect(()=>{y.computeLineDistances()},[e,y]),o.useLayoutEffect(()=>{c?w.defines.USE_DASH="":delete w.defines.USE_DASH,w.needsUpdate=!0},[c,w]),o.useEffect(()=>()=>{x.dispose(),w.dispose()},[x]),o.createElement("primitive",(0,a.A)({object:y,ref:h},d),o.createElement("primitive",{object:x,attach:"geometry"}),o.createElement("primitive",(0,a.A)({object:w,attach:"material",color:t,vertexColors:!!r,resolution:[g.width,g.height],linewidth:null!=(v=null!=n?n:i)?v:1,dashed:c,transparent:4===b},d)))}),L=o.forwardRef(({threshold:e=15,geometry:t,...r},n)=>{let i=o.useRef(null);o.useImperativeHandle(n,()=>i.current,[]);let l=o.useMemo(()=>[0,0,0,1,0,0],[]),u=o.useRef(null),c=o.useRef(null);return o.useLayoutEffect(()=>{let r=i.current.parent,n=null!=t?t:null==r?void 0:r.geometry;if(!n||u.current===n&&c.current===e)return;u.current=n,c.current=e;let a=new s.TDQ(n,e).attributes.position.array;i.current.geometry.setPositions(a),i.current.geometry.attributes.instanceStart.needsUpdate=!0,i.current.geometry.attributes.instanceEnd.needsUpdate=!0,i.current.computeLineDistances()}),o.createElement(T,(0,a.A)({segments:!0,points:l,ref:i,raycast:()=>null},r))})},5661:(e,t,r)=>{r.d(t,{O:()=>s});var n=r(8945),i=r(6595),a=r(2115),o=r(5339);let s=a.forwardRef(({light:e,args:t,map:r,toneMapped:s=!1,color:l="white",form:u="rect",intensity:c=1,scale:f=1,target:d=[0,0,0],children:h,...p},m)=>{let v=a.useRef(null);return a.useImperativeHandle(m,()=>v.current,[]),a.useLayoutEffect(()=>{h||p.material||((0,i.v)(v.current.material,{color:l}),v.current.material.color.multiplyScalar(c))},[l,c,h,p.material]),a.useLayoutEffect(()=>{p.rotation||v.current.quaternion.identity(),d&&!p.rotation&&("boolean"==typeof d?v.current.lookAt(0,0,0):v.current.lookAt(Array.isArray(d)?new o.Pq0(...d):d))},[d,p.rotation]),f=Array.isArray(f)&&2===f.length?[f[0],f[1],1]:f,a.createElement("mesh",(0,n.A)({ref:v,scale:f},p),"circle"===u?a.createElement("ringGeometry",{args:t||[0,.5,64]}):"ring"===u?a.createElement("ringGeometry",{args:t||[.25,.5,64]}):"rect"===u||"plane"===u?a.createElement("planeGeometry",{args:t||[1,1]}):"box"===u?a.createElement("boxGeometry",{args:t||[1,1,1]}):a.createElement(u,{args:t}),h||a.createElement("meshBasicMaterial",{toneMapped:s,map:r,side:o.$EB}),e&&a.createElement("pointLight",(0,n.A)({castShadow:!0},e)))})},6451:(e,t)=>{function r(e,t){var r=e.length;for(e.push(t);0<r;){var n=r-1>>>1,i=e[n];if(0<a(i,t))e[n]=t,e[r]=i,r=n;else break}}function n(e){return 0===e.length?null:e[0]}function i(e){if(0===e.length)return null;var t=e[0],r=e.pop();if(r!==t){e[0]=r;for(var n=0,i=e.length,o=i>>>1;n<o;){var s=2*(n+1)-1,l=e[s],u=s+1,c=e[u];if(0>a(l,r))u<i&&0>a(c,l)?(e[n]=c,e[u]=r,n=u):(e[n]=l,e[s]=r,n=s);else if(u<i&&0>a(c,r))e[n]=c,e[u]=r,n=u;else break}}return t}function a(e,t){var r=e.sortIndex-t.sortIndex;return 0!==r?r:e.id-t.id}if(t.unstable_now=void 0,"object"==typeof performance&&"function"==typeof performance.now){var o,s=performance;t.unstable_now=function(){return s.now()}}else{var l=Date,u=l.now();t.unstable_now=function(){return l.now()-u}}var c=[],f=[],d=1,h=null,p=3,m=!1,v=!1,g=!1,y=!1,w="function"==typeof setTimeout?setTimeout:null,b="function"==typeof clearTimeout?clearTimeout:null,x="undefined"!=typeof setImmediate?setImmediate:null;function S(e){for(var t=n(f);null!==t;){if(null===t.callback)i(f);else if(t.startTime<=e)i(f),t.sortIndex=t.expirationTime,r(c,t);else break;t=n(f)}}function E(e){if(g=!1,S(e),!v)if(null!==n(c))v=!0,_||(_=!0,o());else{var t=n(f);null!==t&&I(E,t.startTime-e)}}var _=!1,M=-1,A=5,U=-1;function C(){return!!y||!(t.unstable_now()-U<A)}function R(){if(y=!1,_){var e=t.unstable_now();U=e;var r=!0;try{e:{v=!1,g&&(g=!1,b(M),M=-1),m=!0;var a=p;try{t:{for(S(e),h=n(c);null!==h&&!(h.expirationTime>e&&C());){var s=h.callback;if("function"==typeof s){h.callback=null,p=h.priorityLevel;var l=s(h.expirationTime<=e);if(e=t.unstable_now(),"function"==typeof l){h.callback=l,S(e),r=!0;break t}h===n(c)&&i(c),S(e)}else i(c);h=n(c)}if(null!==h)r=!0;else{var u=n(f);null!==u&&I(E,u.startTime-e),r=!1}}break e}finally{h=null,p=a,m=!1}}}finally{r?o():_=!1}}}if("function"==typeof x)o=function(){x(R)};else if("undefined"!=typeof MessageChannel){var P=new MessageChannel,O=P.port2;P.port1.onmessage=R,o=function(){O.postMessage(null)}}else o=function(){w(R,0)};function I(e,r){M=w(function(){e(t.unstable_now())},r)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(e){e.callback=null},t.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):A=0<e?Math.floor(1e3/e):5},t.unstable_getCurrentPriorityLevel=function(){return p},t.unstable_next=function(e){switch(p){case 1:case 2:case 3:var t=3;break;default:t=p}var r=p;p=t;try{return e()}finally{p=r}},t.unstable_requestPaint=function(){y=!0},t.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var r=p;p=e;try{return t()}finally{p=r}},t.unstable_scheduleCallback=function(e,i,a){var s=t.unstable_now();switch(a="object"==typeof a&&null!==a&&"number"==typeof(a=a.delay)&&0<a?s+a:s,e){case 1:var l=-1;break;case 2:l=250;break;case 5:l=0x3fffffff;break;case 4:l=1e4;break;default:l=5e3}return l=a+l,e={id:d++,callback:i,priorityLevel:e,startTime:a,expirationTime:l,sortIndex:-1},a>s?(e.sortIndex=a,r(f,e),null===n(c)&&e===n(f)&&(g?(b(M),M=-1):g=!0,I(E,a-s))):(e.sortIndex=l,r(c,e),v||m||(v=!0,_||(_=!0,o()))),e},t.unstable_shouldYield=C,t.unstable_wrapCallback=function(e){var t=p;return function(){var r=p;p=t;try{return e.apply(this,arguments)}finally{p=r}}}},8014:(e,t,r)=>{let n;r.d(t,{OH:()=>ew});var i=r(8945),a=r(2115),o=r(6595),s=r(5339),l=r(7548),u=r(4814);class c extends s.eaF{constructor(e,t){var r,n;let i=(e=>e&&e.isCubeTexture)(e),a=Math.floor(Math.log2((null!=(n=i?null==(r=e.image[0])?void 0:r.width:e.image.width)?n:1024)/4)),o=Math.pow(2,a),l=3*Math.max(o,112),c=`
        varying vec3 vWorldPosition;
        void main() 
        {
            vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `,f=[i?"#define ENVMAP_TYPE_CUBE":"",`#define CUBEUV_TEXEL_WIDTH ${1/l}`,`#define CUBEUV_TEXEL_HEIGHT ${1/(4*o)}`,`#define CUBEUV_MAX_MIP ${a}.0`].join("\n")+`
        #define ENVMAP_TYPE_CUBE_UV
        varying vec3 vWorldPosition;
        uniform float radius;
        uniform float height;
        uniform float angle;
        #ifdef ENVMAP_TYPE_CUBE
            uniform samplerCube map;
        #else
            uniform sampler2D map;
        #endif
        // From: https://www.shadertoy.com/view/4tsBD7
        float diskIntersectWithBackFaceCulling( vec3 ro, vec3 rd, vec3 c, vec3 n, float r ) 
        {
            float d = dot ( rd, n );
            
            if( d > 0.0 ) { return 1e6; }
            
            vec3  o = ro - c;
            float t = - dot( n, o ) / d;
            vec3  q = o + rd * t;
            
            return ( dot( q, q ) < r * r ) ? t : 1e6;
        }
        // From: https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
        float sphereIntersect( vec3 ro, vec3 rd, vec3 ce, float ra ) 
        {
            vec3 oc = ro - ce;
            float b = dot( oc, rd );
            float c = dot( oc, oc ) - ra * ra;
            float h = b * b - c;
            
            if( h < 0.0 ) { return -1.0; }
            
            h = sqrt( h );
            
            return - b + h;
        }
        vec3 project() 
        {
            vec3 p = normalize( vWorldPosition );
            vec3 camPos = cameraPosition;
            camPos.y -= height;
            float intersection = sphereIntersect( camPos, p, vec3( 0.0 ), radius );
            if( intersection > 0.0 ) {
                
                vec3 h = vec3( 0.0, - height, 0.0 );
                float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );
                p = ( camPos + min( intersection, intersection2 ) * p ) / radius;
            } else {
                p = vec3( 0.0, 1.0, 0.0 );
            }
            return p;
        }
        #include <common>
        #include <cube_uv_reflection_fragment>
        void main() 
        {
            vec3 projectedWorldPosition = project();
            
            #ifdef ENVMAP_TYPE_CUBE
                vec3 outcolor = textureCube( map, projectedWorldPosition ).rgb;
            #else
                vec3 direction = normalize( projectedWorldPosition );
                vec2 uv = equirectUv( direction );
                vec3 outcolor = texture2D( map, uv ).rgb;
            #endif
            gl_FragColor = vec4( outcolor, 1.0 );
            #include <tonemapping_fragment>
            #include <${u.r>=154?"colorspace_fragment":"encodings_fragment"}>
        }
        `,d={map:{value:e},height:{value:(null==t?void 0:t.height)||15},radius:{value:(null==t?void 0:t.radius)||100}};super(new s.WBB(1,16),new s.BKk({uniforms:d,fragmentShader:f,vertexShader:c,side:s.$EB}))}set radius(e){this.material.uniforms.radius.value=e}get radius(){return this.material.uniforms.radius.value}set height(e){this.material.uniforms.height.value=e}get height(){return this.material.uniforms.height.value}}class f extends s.BRH{constructor(e){super(e),this.type=s.ix0}parse(e){let t,r,n,i=function(e,t){switch(e){case 1:throw Error("THREE.RGBELoader: Read Error: "+(t||""));case 2:throw Error("THREE.RGBELoader: Write Error: "+(t||""));case 3:throw Error("THREE.RGBELoader: Bad File Format: "+(t||""));default:throw Error("THREE.RGBELoader: Memory Error: "+(t||""))}},a=function(e,t,r){t=t||1024;let n=e.pos,i=-1,a=0,o="",s=String.fromCharCode.apply(null,new Uint16Array(e.subarray(n,n+128)));for(;0>(i=s.indexOf("\n"))&&a<t&&n<e.byteLength;)o+=s,a+=s.length,n+=128,s+=String.fromCharCode.apply(null,new Uint16Array(e.subarray(n,n+128)));return -1<i&&(!1!==r&&(e.pos+=a+i+1),o+s.slice(0,i))},o=new Uint8Array(e);o.pos=0;let l=function(e){let t,r,n=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,o=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,s=/^\s*FORMAT=(\S+)\s*$/,l=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,u={valid:0,string:"",comments:"",programtype:"RGBE",format:"",gamma:1,exposure:1,width:0,height:0};for(!(e.pos>=e.byteLength)&&(t=a(e))||i(1,"no header found"),(r=t.match(/^#\?(\S+)/))||i(3,"bad initial token"),u.valid|=1,u.programtype=r[1],u.string+=t+"\n";!1!==(t=a(e));){if(u.string+=t+"\n","#"===t.charAt(0)){u.comments+=t+"\n";continue}if((r=t.match(n))&&(u.gamma=parseFloat(r[1])),(r=t.match(o))&&(u.exposure=parseFloat(r[1])),(r=t.match(s))&&(u.valid|=2,u.format=r[1]),(r=t.match(l))&&(u.valid|=4,u.height=parseInt(r[1],10),u.width=parseInt(r[2],10)),2&u.valid&&4&u.valid)break}return 2&u.valid||i(3,"missing format specifier"),4&u.valid||i(3,"missing image size specifier"),u}(o),u=l.width,c=l.height,f=function(e,t,r){if(t<8||t>32767||2!==e[0]||2!==e[1]||128&e[2])return new Uint8Array(e);t!==(e[2]<<8|e[3])&&i(3,"wrong scanline width");let n=new Uint8Array(4*t*r);n.length||i(4,"unable to allocate buffer space");let a=0,o=0,s=4*t,l=new Uint8Array(4),u=new Uint8Array(s),c=r;for(;c>0&&o<e.byteLength;){o+4>e.byteLength&&i(1),l[0]=e[o++],l[1]=e[o++],l[2]=e[o++],l[3]=e[o++],(2!=l[0]||2!=l[1]||(l[2]<<8|l[3])!=t)&&i(3,"bad rgbe scanline format");let r=0,f;for(;r<s&&o<e.byteLength;){let t=(f=e[o++])>128;if(t&&(f-=128),(0===f||r+f>s)&&i(3,"bad scanline data"),t){let t=e[o++];for(let e=0;e<f;e++)u[r++]=t}else u.set(e.subarray(o,o+f),r),r+=f,o+=f}for(let e=0;e<t;e++){let r=0;n[a]=u[e+r],r+=t,n[a+1]=u[e+r],r+=t,n[a+2]=u[e+r],r+=t,n[a+3]=u[e+r],a+=4}c--}return n}(o.subarray(o.pos),u,c);switch(this.type){case s.RQf:let d=new Float32Array(4*(n=f.length/4));for(let e=0;e<n;e++)!function(e,t,r,n){let i=Math.pow(2,e[t+3]-128)/255;r[n+0]=e[t+0]*i,r[n+1]=e[t+1]*i,r[n+2]=e[t+2]*i,r[n+3]=1}(f,4*e,d,4*e);t=d,r=s.RQf;break;case s.ix0:let h=new Uint16Array(4*(n=f.length/4));for(let e=0;e<n;e++)!function(e,t,r,n){let i=Math.pow(2,e[t+3]-128)/255;r[n+0]=s.GxU.toHalfFloat(Math.min(e[t+0]*i,65504)),r[n+1]=s.GxU.toHalfFloat(Math.min(e[t+1]*i,65504)),r[n+2]=s.GxU.toHalfFloat(Math.min(e[t+2]*i,65504)),r[n+3]=s.GxU.toHalfFloat(1)}(f,4*e,h,4*e);t=h,r=s.ix0;break;default:throw Error("THREE.RGBELoader: Unsupported type: "+this.type)}return{width:u,height:c,data:t,header:l.string,gamma:l.gamma,exposure:l.exposure,type:r}}setDataType(e){return this.type=e,this}load(e,t,r,n){return super.load(e,function(e,r){switch(e.type){case s.RQf:case s.ix0:"colorSpace"in e?e.colorSpace="srgb-linear":e.encoding=3e3,e.minFilter=s.k6q,e.magFilter=s.k6q,e.generateMipmaps=!1,e.flipY=!0}t&&t(e,r)},r,n)}}var d=Uint8Array,h=Uint16Array,p=Uint32Array,m=new d([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),v=new d([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),g=new d([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),y=function(e,t){for(var r=new h(31),n=0;n<31;++n)r[n]=t+=1<<e[n-1];for(var i=new p(r[30]),n=1;n<30;++n)for(var a=r[n];a<r[n+1];++a)i[a]=a-r[n]<<5|n;return[r,i]},w=y(m,2),b=w[0],x=w[1];b[28]=258,x[258]=28;var S=y(v,0),E=S[0];S[1];for(var _=new h(32768),M=0;M<32768;++M){var A=(43690&M)>>>1|(21845&M)<<1;A=(61680&(A=(52428&A)>>>2|(13107&A)<<2))>>>4|(3855&A)<<4,_[M]=((65280&A)>>>8|(255&A)<<8)>>>1}for(var U=function(e,t,r){for(var n,i=e.length,a=0,o=new h(t);a<i;++a)++o[e[a]-1];var s=new h(t);for(a=0;a<t;++a)s[a]=s[a-1]+o[a-1]<<1;if(r){n=new h(1<<t);var l=15-t;for(a=0;a<i;++a)if(e[a])for(var u=a<<4|e[a],c=t-e[a],f=s[e[a]-1]++<<c,d=f|(1<<c)-1;f<=d;++f)n[_[f]>>>l]=u}else for(a=0,n=new h(i);a<i;++a)e[a]&&(n[a]=_[s[e[a]-1]++]>>>15-e[a]);return n},C=new d(288),M=0;M<144;++M)C[M]=8;for(var M=144;M<256;++M)C[M]=9;for(var M=256;M<280;++M)C[M]=7;for(var M=280;M<288;++M)C[M]=8;for(var R=new d(32),M=0;M<32;++M)R[M]=5;var P=U(C,9,1),O=U(R,5,1),I=function(e){for(var t=e[0],r=1;r<e.length;++r)e[r]>t&&(t=e[r]);return t},T=function(e,t,r){var n=t/8|0;return(e[n]|e[n+1]<<8)>>(7&t)&r},L=function(e,t){var r=t/8|0;return(e[r]|e[r+1]<<8|e[r+2]<<16)>>(7&t)},z=function(e,t,r){(null==t||t<0)&&(t=0),(null==r||r>e.length)&&(r=e.length);var n=new(e instanceof h?h:e instanceof p?p:d)(r-t);return n.set(e.subarray(t,r)),n},k=function(e,t,r){var n=e.length;if(!n||r&&!r.l&&n<5)return t||new d(0);var i=!t||r,a=!r||r.i;r||(r={}),t||(t=new d(3*n));var o=function(e){var r=t.length;if(e>r){var n=new d(Math.max(2*r,e));n.set(t),t=n}},s=r.f||0,l=r.p||0,u=r.b||0,c=r.l,f=r.d,h=r.m,p=r.n,y=8*n;do{if(!c){r.f=s=T(e,l,1);var w=T(e,l+1,3);if(l+=3,w)if(1==w)c=P,f=O,h=9,p=5;else if(2==w){var x=T(e,l,31)+257,S=T(e,l+10,15)+4,_=x+T(e,l+5,31)+1;l+=14;for(var M=new d(_),A=new d(19),C=0;C<S;++C)A[g[C]]=T(e,l+3*C,7);l+=3*S;for(var R=I(A),k=(1<<R)-1,B=U(A,R,1),C=0;C<_;){var F=B[T(e,l,k)];l+=15&F;var D=F>>>4;if(D<16)M[C++]=D;else{var H=0,j=0;for(16==D?(j=3+T(e,l,3),l+=2,H=M[C-1]):17==D?(j=3+T(e,l,7),l+=3):18==D&&(j=11+T(e,l,127),l+=7);j--;)M[C++]=H}}var N=M.subarray(0,x),q=M.subarray(x);h=I(N),p=I(q),c=U(N,h,1),f=U(q,p,1)}else throw"invalid block type";else{var W,D=((W=l)/8|0)+(7&W&&1)+4,G=e[D-4]|e[D-3]<<8,V=D+G;if(V>n){if(a)throw"unexpected EOF";break}i&&o(u+G),t.set(e.subarray(D,V),u),r.b=u+=G,r.p=l=8*V;continue}if(l>y){if(a)throw"unexpected EOF";break}}i&&o(u+131072);for(var Y=(1<<h)-1,$=(1<<p)-1,X=l;;X=l){var H=c[L(e,l)&Y],Q=H>>>4;if((l+=15&H)>y){if(a)throw"unexpected EOF";break}if(!H)throw"invalid length/literal";if(Q<256)t[u++]=Q;else if(256==Q){X=l,c=null;break}else{var Z=Q-254;if(Q>264){var C=Q-257,J=m[C];Z=T(e,l,(1<<J)-1)+b[C],l+=J}var K=f[L(e,l)&$],ee=K>>>4;if(!K)throw"invalid distance";l+=15&K;var q=E[ee];if(ee>3){var J=v[ee];q+=L(e,l)&(1<<J)-1,l+=J}if(l>y){if(a)throw"unexpected EOF";break}i&&o(u+131072);for(var et=u+Z;u<et;u+=4)t[u]=t[u-q],t[u+1]=t[u+1-q],t[u+2]=t[u+2-q],t[u+3]=t[u+3-q];u=et}}r.l=c,r.p=X,r.b=u,c&&(s=1,r.m=h,r.d=f,r.n=p)}while(!s);return u==t.length?t:z(t,0,u)},B=new d(0),F=function(e){if((15&e[0])!=8||e[0]>>>4>7||(e[0]<<8|e[1])%31)throw"invalid zlib data";if(32&e[1])throw"invalid zlib data: preset dictionaries not supported"};function D(e,t){return k((F(e),e.subarray(2,-4)),t)}var H="undefined"!=typeof TextDecoder&&new TextDecoder;try{H.decode(B,{stream:!0})}catch(e){}let j=u.r>=152;class N extends s.BRH{constructor(e){super(e),this.type=s.ix0}parse(e){let t={l:0,c:0,lc:0};function r(e,r,n,i,a){for(;n<e;)r=r<<8|A(i,a),n+=8;t.l=r>>(n-=e)&(1<<e)-1,t.c=r,t.lc=n}let n=Array(59),i={c:0,lc:0};function a(e,t,r,n){e=e<<8|A(r,n),t+=8,i.c=e,i.lc=t}let o={c:0,lc:0};function l(e,t,r,n,s,l,u,c,f,d){if(e==t){n<8&&(a(r,n,s,u),r=i.c,n=i.lc);var h=r>>(n-=8),h=new Uint8Array([h])[0];if(f.value+h>d)return!1;for(var p=c[f.value-1];h-- >0;)c[f.value++]=p}else{if(!(f.value<d))return!1;c[f.value++]=e}o.c=r,o.lc=n}function u(e){var t=65535&e;return t>32767?t-65536:t}let c={a:0,b:0};function f(e,t){var r=u(e),n=u(t),i=r+(1&n)+(n>>1),a=i-n;c.a=i,c.b=a}function d(e,t){var r=65535&t,n=(65535&e)-(r>>1)&65535;c.a=r+n-32768&65535,c.b=n}function h(e,s,u,c,f,d){var h=u.value,p=M(s,u),m=M(s,u);u.value+=4;var v=M(s,u);if(u.value+=4,p<0||p>=65537||m<0||m>=65537)throw"Something wrong with HUF_ENCSIZE";for(var g=Array(65537),y=Array(16384),w=0;w<16384;w++)y[w]={},y[w].len=0,y[w].lit=0,y[w].p=null;var b=c-(u.value-h);if(!function(e,i,a,o,s,l,u){for(var c=0,f=0;s<=l;s++){if(a.value-a.value>o)return!1;r(6,c,f,e,a);var d=t.l;if(c=t.c,f=t.lc,u[s]=d,63==d){if(a.value-a.value>o)throw"Something wrong with hufUnpackEncTable";r(8,c,f,e,a);var h=t.l+6;if(c=t.c,f=t.lc,s+h>l+1)throw"Something wrong with hufUnpackEncTable";for(;h--;)u[s++]=0;s--}else if(d>=59){var h=d-59+2;if(s+h>l+1)throw"Something wrong with hufUnpackEncTable";for(;h--;)u[s++]=0;s--}}!function(e){for(var t=0;t<=58;++t)n[t]=0;for(var t=0;t<65537;++t)n[e[t]]+=1;for(var r=0,t=58;t>0;--t){var i=r+n[t]>>1;n[t]=r,r=i}for(var t=0;t<65537;++t){var a=e[t];a>0&&(e[t]=a|n[a]++<<6)}}(u)}(e,0,u,b,p,m,g),v>8*(c-(u.value-h)))throw"Something wrong with hufUncompress";!function(e,t,r,n){for(;t<=r;t++){var i=e[t]>>6,a=63&e[t];if(i>>a)throw"Invalid table entry";if(a>14){var o=n[i>>a-14];if(o.len)throw"Invalid table entry";if(o.lit++,o.p){var s=o.p;o.p=Array(o.lit);for(var l=0;l<o.lit-1;++l)o.p[l]=s[l]}else o.p=[,];o.p[o.lit-1]=t}else if(a)for(var u=0,l=1<<14-a;l>0;l--){var o=n[(i<<14-a)+u];if(o.len||o.p)throw"Invalid table entry";o.len=a,o.lit=t,u++}}}(g,p,m,y),function(e,t,r,n,s,u,c,f,d,h){for(var p=0,m=0,v=Math.trunc(s.value+(u+7)/8);s.value<v;)for(a(p,m,r,s),p=i.c,m=i.lc;m>=14;){var g=t[p>>m-14&16383];if(g.len)m-=g.len,l(g.lit,c,p,m,r,n,s,d,h,f),p=o.c,m=o.lc;else{if(!g.p)throw"hufDecode issues";for(y=0;y<g.lit;y++){for(var y,w=63&e[g.p[y]];m<w&&s.value<v;)a(p,m,r,s),p=i.c,m=i.lc;if(m>=w&&e[g.p[y]]>>6==(p>>m-w&(1<<w)-1)){m-=w,l(g.p[y],c,p,m,r,n,s,d,h,f),p=o.c,m=o.lc;break}}if(y==g.lit)throw"hufDecode issues"}}var b=8-u&7;for(p>>=b,m-=b;m>0;){var g=t[p<<14-m&16383];if(g.len)m-=g.len,l(g.lit,c,p,m,r,n,s,d,h,f),p=o.c,m=o.lc;else throw"hufDecode issues"}}(g,y,e,s,u,v,m,d,f,{value:0})}function p(e){for(var t=1;t<e.length;t++){var r=e[t-1]+e[t]-128;e[t]=r}}function m(e,t){for(var r=0,n=Math.floor((e.length+1)/2),i=0,a=e.length-1;!(i>a)&&(t[i++]=e[r++],!(i>a));){;t[i++]=e[n++]}}function v(e){for(var t=e.byteLength,r=[],n=0,i=new DataView(e);t>0;){var a=i.getInt8(n++);if(a<0){var o=-a;t-=o+1;for(var s=0;s<o;s++)r.push(i.getUint8(n++))}else{var o=a;t-=2;for(var l=i.getUint8(n++),s=0;s<o+1;s++)r.push(l)}}return r}function g(e){return new DataView(e.array.buffer,e.offset.value,e.size)}function y(e){var t=new Uint8Array(v(e.viewer.buffer.slice(e.offset.value,e.offset.value+e.size))),r=new Uint8Array(t.length);return p(t),m(t,r),new DataView(r.buffer)}function w(e){var t=D(e.array.slice(e.offset.value,e.offset.value+e.size)),r=new Uint8Array(t.length);return p(t),m(t,r),new DataView(r.buffer)}function b(e){for(var t=e.viewer,r={value:e.offset.value},n=new Uint16Array(e.width*e.scanlineBlockSize*(e.channels*e.type)),i=new Uint8Array(8192),a=0,o=Array(e.channels),s=0;s<e.channels;s++)o[s]={},o[s].start=a,o[s].end=o[s].start,o[s].nx=e.width,o[s].ny=e.lines,o[s].size=e.type,a+=o[s].nx*o[s].ny*o[s].size;var l=I(t,r),u=I(t,r);if(u>=8192)throw"Something is wrong with PIZ_COMPRESSION BITMAP_SIZE";if(l<=u)for(var s=0;s<u-l+1;s++)i[s+l]=U(t,r);var p=new Uint16Array(65536),m=function(e,t){for(var r=0,n=0;n<65536;++n)(0==n||e[n>>3]&1<<(7&n))&&(t[r++]=n);for(var i=r-1;r<65536;)t[r++]=0;return i}(i,p),v=M(t,r);h(e.array,t,r,v,n,a);for(var s=0;s<e.channels;++s)for(var g=o[s],y=0;y<o[s].size;++y)!function(e,t,r,n,i,a,o){for(var s=o<16384,l=r>i?i:r,u=1;u<=l;)u<<=1;for(u>>=1,h=u,u>>=1;u>=1;){for(var h,p,m,v,g,y=0,w=0+a*(i-h),b=a*u,x=a*h,S=n*u,E=n*h;y<=w;y+=x){for(var _=y,M=y+n*(r-h);_<=M;_+=E){var A=_+S,U=_+b,C=U+S;s?(f(e[_+t],e[U+t]),p=c.a,v=c.b,f(e[A+t],e[C+t]),m=c.a,g=c.b,f(p,m),e[_+t]=c.a,e[A+t]=c.b,f(v,g)):(d(e[_+t],e[U+t]),p=c.a,v=c.b,d(e[A+t],e[C+t]),m=c.a,g=c.b,d(p,m),e[_+t]=c.a,e[A+t]=c.b,d(v,g)),e[U+t]=c.a,e[C+t]=c.b}if(r&u){var U=_+b;s?f(e[_+t],e[U+t]):d(e[_+t],e[U+t]),p=c.a,e[U+t]=c.b,e[_+t]=p}}if(i&u)for(var _=y,M=y+n*(r-h);_<=M;_+=E){var A=_+S;s?f(e[_+t],e[A+t]):d(e[_+t],e[A+t]),p=c.a,e[A+t]=c.b,e[_+t]=p}h=u,u>>=1}}(n,g.start+y,g.nx,g.size,g.ny,g.nx*g.size,m);for(var w=a,b=0;b<w;++b)n[b]=p[n[b]];for(var x=0,S=new Uint8Array(n.buffer.byteLength),E=0;E<e.lines;E++)for(var _=0;_<e.channels;_++){var g=o[_],A=g.nx*g.size,C=new Uint8Array(n.buffer,2*g.end,2*A);S.set(C,x),x+=2*A,g.end+=A}return new DataView(S.buffer)}function x(e){var t=D(e.array.slice(e.offset.value,e.offset.value+e.size));let r=e.lines*e.channels*e.width,n=1==e.type?new Uint16Array(r):new Uint32Array(r),i=0,a=0,o=[,,,,];for(let r=0;r<e.lines;r++)for(let r=0;r<e.channels;r++){let r=0;switch(e.type){case 1:o[0]=i,o[1]=o[0]+e.width,i=o[1]+e.width;for(let i=0;i<e.width;++i)r+=t[o[0]++]<<8|t[o[1]++],n[a]=r,a++;break;case 2:o[0]=i,o[1]=o[0]+e.width,o[2]=o[1]+e.width,i=o[2]+e.width;for(let i=0;i<e.width;++i)r+=t[o[0]++]<<24|t[o[1]++]<<16|t[o[2]++]<<8,n[a]=r,a++}}return new DataView(n.buffer)}function S(e){var t=e.viewer,r={value:e.offset.value},n=new Uint8Array(e.width*e.lines*(e.channels*e.type*2)),i={version:C(t,r),unknownUncompressedSize:C(t,r),unknownCompressedSize:C(t,r),acCompressedSize:C(t,r),dcCompressedSize:C(t,r),rleCompressedSize:C(t,r),rleUncompressedSize:C(t,r),rleRawSize:C(t,r),totalAcUncompressedCount:C(t,r),totalDcUncompressedCount:C(t,r),acCompression:C(t,r)};if(i.version<2)throw"EXRLoader.parse: "+B.compression+" version "+i.version+" is unsupported";for(var a=[],o=I(t,r)-2;o>0;){var l=E(t.buffer,r),u=U(t,r),c=u>>2&3,f=new Int8Array([(u>>4)-1])[0],d=U(t,r);a.push({name:l,index:f,type:d,compression:c}),o-=l.length+3}for(var p=B.channels,m=Array(e.channels),g=0;g<e.channels;++g){var y=m[g]={},b=p[g];y.name=b.name,y.compression=0,y.decoded=!1,y.type=b.pixelType,y.pLinear=b.pLinear,y.width=e.width,y.height=e.lines}for(var x={idx:[,,,]},S=0;S<e.channels;++S)for(var y=m[S],g=0;g<a.length;++g){var _=a[g];y.name==_.name&&(y.compression=_.compression,_.index>=0&&(x.idx[_.index]=S),y.offset=S)}if(i.acCompressedSize>0)switch(i.acCompression){case 0:var M=new Uint16Array(i.totalAcUncompressedCount);h(e.array,t,r,i.acCompressedSize,M,i.totalAcUncompressedCount);break;case 1:var A=e.array.slice(r.value,r.value+i.totalAcUncompressedCount),R=D(A),M=new Uint16Array(R.buffer);r.value+=i.totalAcUncompressedCount}if(i.dcCompressedSize>0){var P=new Uint16Array(w({array:e.array,offset:r,size:i.dcCompressedSize}).buffer);r.value+=i.dcCompressedSize}if(i.rleRawSize>0){var A=e.array.slice(r.value,r.value+i.rleCompressedSize),R=D(A),T=v(R.buffer);r.value+=i.rleCompressedSize}for(var L=0,z=Array(m.length),g=0;g<z.length;++g)z[g]=[];for(var k=0;k<e.lines;++k)for(var F=0;F<m.length;++F)z[F].push(L),L+=m[F].width*e.type*2;!function(e,t,r,n,i,a){var o=new DataView(a.buffer),l=r[e.idx[0]].width,u=r[e.idx[0]].height,c=Math.floor(l/8),f=Math.ceil(l/8),d=Math.ceil(u/8),h=l-(f-1)*8,p=u-(d-1)*8,m={value:0},v=[,,,],g=[,,,],y=[,,,],w=[,,,],b=[,,,];for(let r=0;r<3;++r)b[r]=t[e.idx[r]],v[r]=r<1?0:v[r-1]+f*d,g[r]=new Float32Array(64),y[r]=new Uint16Array(64),w[r]=new Uint16Array(64*f);for(let t=0;t<d;++t){var x,S,E=8;t==d-1&&(E=p);var _=8;for(let e=0;e<f;++e){e==f-1&&(_=h);for(let e=0;e<3;++e){y[e].fill(0),y[e][0]=i[v[e]++],function(e,t,r){for(var n,i=1;i<64;)65280==(n=t[e.value])?i=64:n>>8==255?i+=255&n:(r[i]=n,i++),e.value++}(m,n,y[e]),x=y[e],(S=g[e])[0]=O(x[0]),S[1]=O(x[1]),S[2]=O(x[5]),S[3]=O(x[6]),S[4]=O(x[14]),S[5]=O(x[15]),S[6]=O(x[27]),S[7]=O(x[28]),S[8]=O(x[2]),S[9]=O(x[4]),S[10]=O(x[7]),S[11]=O(x[13]),S[12]=O(x[16]),S[13]=O(x[26]),S[14]=O(x[29]),S[15]=O(x[42]),S[16]=O(x[3]),S[17]=O(x[8]),S[18]=O(x[12]),S[19]=O(x[17]),S[20]=O(x[25]),S[21]=O(x[30]),S[22]=O(x[41]),S[23]=O(x[43]),S[24]=O(x[9]),S[25]=O(x[11]),S[26]=O(x[18]),S[27]=O(x[24]),S[28]=O(x[31]),S[29]=O(x[40]),S[30]=O(x[44]),S[31]=O(x[53]),S[32]=O(x[10]),S[33]=O(x[19]),S[34]=O(x[23]),S[35]=O(x[32]),S[36]=O(x[39]),S[37]=O(x[45]),S[38]=O(x[52]),S[39]=O(x[54]),S[40]=O(x[20]),S[41]=O(x[22]),S[42]=O(x[33]),S[43]=O(x[38]),S[44]=O(x[46]),S[45]=O(x[51]),S[46]=O(x[55]),S[47]=O(x[60]),S[48]=O(x[21]),S[49]=O(x[34]),S[50]=O(x[37]),S[51]=O(x[47]),S[52]=O(x[50]),S[53]=O(x[56]),S[54]=O(x[59]),S[55]=O(x[61]),S[56]=O(x[35]),S[57]=O(x[36]),S[58]=O(x[48]),S[59]=O(x[49]),S[60]=O(x[57]),S[61]=O(x[58]),S[62]=O(x[62]),S[63]=O(x[63]),function(e){let t=.5*Math.cos(3.14159/16),r=.5*Math.cos(3.14159/8),n=.5*Math.cos(3*3.14159/16),i=.5*Math.cos(3*3.14159/8);for(var a=[,,,,],o=[,,,,],s=[,,,,],l=[,,,,],u=0;u<8;++u){var c=8*u;a[0]=r*e[c+2],a[1]=i*e[c+2],a[2]=r*e[c+6],a[3]=i*e[c+6],o[0]=t*e[c+1]+n*e[c+3]+.2777854612564676*e[c+5]+.09754573032714427*e[c+7],o[1]=n*e[c+1]-.09754573032714427*e[c+3]-t*e[c+5]-.2777854612564676*e[c+7],o[2]=.2777854612564676*e[c+1]-t*e[c+3]+.09754573032714427*e[c+5]+n*e[c+7],o[3]=.09754573032714427*e[c+1]-.2777854612564676*e[c+3]+n*e[c+5]-t*e[c+7],s[0]=.35355362513961314*(e[c+0]+e[c+4]),s[3]=.35355362513961314*(e[c+0]-e[c+4]),s[1]=a[0]+a[3],s[2]=a[1]-a[2],l[0]=s[0]+s[1],l[1]=s[3]+s[2],l[2]=s[3]-s[2],l[3]=s[0]-s[1],e[c+0]=l[0]+o[0],e[c+1]=l[1]+o[1],e[c+2]=l[2]+o[2],e[c+3]=l[3]+o[3],e[c+4]=l[3]-o[3],e[c+5]=l[2]-o[2],e[c+6]=l[1]-o[1],e[c+7]=l[0]-o[0]}for(var f=0;f<8;++f)a[0]=r*e[16+f],a[1]=i*e[16+f],a[2]=r*e[48+f],a[3]=i*e[48+f],o[0]=t*e[8+f]+n*e[24+f]+.2777854612564676*e[40+f]+.09754573032714427*e[56+f],o[1]=n*e[8+f]-.09754573032714427*e[24+f]-t*e[40+f]-.2777854612564676*e[56+f],o[2]=.2777854612564676*e[8+f]-t*e[24+f]+.09754573032714427*e[40+f]+n*e[56+f],o[3]=.09754573032714427*e[8+f]-.2777854612564676*e[24+f]+n*e[40+f]-t*e[56+f],s[0]=.35355362513961314*(e[f]+e[32+f]),s[3]=.35355362513961314*(e[f]-e[32+f]),s[1]=a[0]+a[3],s[2]=a[1]-a[2],l[0]=s[0]+s[1],l[1]=s[3]+s[2],l[2]=s[3]-s[2],l[3]=s[0]-s[1],e[0+f]=l[0]+o[0],e[8+f]=l[1]+o[1],e[16+f]=l[2]+o[2],e[24+f]=l[3]+o[3],e[32+f]=l[3]-o[3],e[40+f]=l[2]-o[2],e[48+f]=l[1]-o[1],e[56+f]=l[0]-o[0]}(g[e])}for(var M=g,A=0;A<64;++A){var U=M[0][A],C=M[1][A],R=M[2][A];M[0][A]=U+1.5747*R,M[1][A]=U-.1873*C-.4682*R,M[2][A]=U+1.8556*C}for(let t=0;t<3;++t)!function(e,t,r){for(var n,i=0;i<64;++i){t[r+i]=s.GxU.toHalfFloat((n=e[i])<=1?Math.sign(n)*Math.pow(Math.abs(n),2.2):Math.sign(n)*Math.pow(9.025013291561939,Math.abs(n)-1))}}(g[t],w[t],64*e)}let a=0;for(let n=0;n<3;++n){let i=r[e.idx[n]].type;for(let e=8*t;e<8*t+E;++e){a=b[n][e];for(let t=0;t<c;++t){let r=64*t+(7&e)*8;o.setUint16(a+0*i,w[n][r+0],!0),o.setUint16(a+2*i,w[n][r+1],!0),o.setUint16(a+4*i,w[n][r+2],!0),o.setUint16(a+6*i,w[n][r+3],!0),o.setUint16(a+8*i,w[n][r+4],!0),o.setUint16(a+10*i,w[n][r+5],!0),o.setUint16(a+12*i,w[n][r+6],!0),o.setUint16(a+14*i,w[n][r+7],!0),a+=16*i}}if(c!=f)for(let e=8*t;e<8*t+E;++e){let t=b[n][e]+8*c*2*i,r=64*c+(7&e)*8;for(let e=0;e<_;++e)o.setUint16(t+2*e*i,w[n][r+e],!0)}}}for(var P=new Uint16Array(l),o=new DataView(a.buffer),I=0;I<3;++I){r[e.idx[I]].decoded=!0;var T=r[e.idx[I]].type;if(2==r[I].type)for(var L=0;L<u;++L){let e=b[I][L];for(var z=0;z<l;++z)P[z]=o.getUint16(e+2*z*T,!0);for(var z=0;z<l;++z)o.setFloat32(e+2*z*T,O(P[z]),!0)}}}(x,z,m,M,P,n);for(var g=0;g<m.length;++g){var y=m[g];if(!y.decoded)if(2===y.compression)for(var H=0,j=0,k=0;k<e.lines;++k){for(var N=z[g][H],q=0;q<y.width;++q){for(var W=0;W<2*y.type;++W)n[N++]=T[j+W*y.width*y.height];j++}H++}else throw"EXRLoader.parse: unsupported channel compression"}return new DataView(n.buffer)}function E(e,t){for(var r=new Uint8Array(e),n=0;0!=r[t.value+n];)n+=1;var i=new TextDecoder().decode(r.slice(t.value,t.value+n));return t.value=t.value+n+1,i}function _(e,t){var r=e.getInt32(t.value,!0);return t.value=t.value+4,r}function M(e,t){var r=e.getUint32(t.value,!0);return t.value=t.value+4,r}function A(e,t){var r=e[t.value];return t.value=t.value+1,r}function U(e,t){var r=e.getUint8(t.value);return t.value=t.value+1,r}let C=function(e,t){let r;return r="getBigInt64"in DataView.prototype?Number(e.getBigInt64(t.value,!0)):e.getUint32(t.value+4,!0)+Number(e.getUint32(t.value,!0)<<32),t.value+=8,r};function R(e,t){var r=e.getFloat32(t.value,!0);return t.value+=4,r}function P(e,t){return s.GxU.toHalfFloat(R(e,t))}function O(e){var t=(31744&e)>>10,r=1023&e;return(e>>15?-1:1)*(t?31===t?r?NaN:1/0:Math.pow(2,t-15)*(1+r/1024):r/1024*6103515625e-14)}function I(e,t){var r=e.getUint16(t.value,!0);return t.value+=2,r}function T(e,t){return O(I(e,t))}let L=new DataView(e),z=new Uint8Array(e),k={value:0},B=function(e,t,r){let n={};if(0x1312f76!=e.getUint32(0,!0))throw"THREE.EXRLoader: provided file doesn't appear to be in OpenEXR format.";n.version=e.getUint8(4);let i=e.getUint8(5);n.spec={singleTile:!!(2&i),longName:!!(4&i),deepFormat:!!(8&i),multiPart:!!(16&i)},r.value=8;for(var a=!0;a;){var o=E(t,r);if(0==o)a=!1;else{var s=E(t,r),l=M(e,r),u=function(e,t,r,n,i){var a,o,s,l,u,c,f;if("string"===n||"stringvector"===n||"iccProfile"===n)return a=new TextDecoder().decode(new Uint8Array(t).slice(r.value,r.value+i)),r.value=r.value+i,a;if("chlist"===n)return function(e,t,r,n){for(var i=r.value,a=[];r.value<i+n-1;){var o=E(t,r),s=_(e,r),l=U(e,r);r.value+=3;var u=_(e,r),c=_(e,r);a.push({name:o,pixelType:s,pLinear:l,xSampling:u,ySampling:c})}return r.value+=1,a}(e,t,r,i);if("chromaticities"===n)return o=R(e,r),s=R(e,r),l=R(e,r),u=R(e,r),c=R(e,r),{redX:o,redY:s,greenX:l,greenY:u,blueX:c,blueY:R(e,r),whiteX:R(e,r),whiteY:R(e,r)};if("compression"===n)return["NO_COMPRESSION","RLE_COMPRESSION","ZIPS_COMPRESSION","ZIP_COMPRESSION","PIZ_COMPRESSION","PXR24_COMPRESSION","B44_COMPRESSION","B44A_COMPRESSION","DWAA_COMPRESSION","DWAB_COMPRESSION"][U(e,r)];if("box2i"===n)return f=M(e,r),{xMin:f,yMin:M(e,r),xMax:M(e,r),yMax:M(e,r)};else if("lineOrder"===n)return["INCREASING_Y"][U(e,r)];else if("float"===n)return R(e,r);else if("v2f"===n)return[R(e,r),R(e,r)];else if("v3f"===n)return[R(e,r),R(e,r),R(e,r)];else if("int"===n)return _(e,r);else if("rational"===n)return[_(e,r),M(e,r)];else if("timecode"===n)return[M(e,r),M(e,r)];else return"preview"===n?(r.value+=i,"skipped"):(r.value+=i,void 0)}(e,t,r,s,l);void 0===u?console.warn(`EXRLoader.parse: skipped unknown header attribute type '${s}'.`):n[o]=u}}if((-5&i)!=0)throw console.error("EXRHeader:",n),"THREE.EXRLoader: provided file is currently unsupported.";return n}(L,e,k),F=function(e,t,r,n,i){let a={size:0,viewer:t,array:r,offset:n,width:e.dataWindow.xMax-e.dataWindow.xMin+1,height:e.dataWindow.yMax-e.dataWindow.yMin+1,channels:e.channels.length,bytesPerLine:null,lines:null,inputSize:null,type:e.channels[0].pixelType,uncompress:null,getter:null,format:null,[j?"colorSpace":"encoding"]:null};switch(e.compression){case"NO_COMPRESSION":a.lines=1,a.uncompress=g;break;case"RLE_COMPRESSION":a.lines=1,a.uncompress=y;break;case"ZIPS_COMPRESSION":a.lines=1,a.uncompress=w;break;case"ZIP_COMPRESSION":a.lines=16,a.uncompress=w;break;case"PIZ_COMPRESSION":a.lines=32,a.uncompress=b;break;case"PXR24_COMPRESSION":a.lines=16,a.uncompress=x;break;case"DWAA_COMPRESSION":a.lines=32,a.uncompress=S;break;case"DWAB_COMPRESSION":a.lines=256,a.uncompress=S;break;default:throw"EXRLoader.parse: "+e.compression+" is unsupported"}if(a.scanlineBlockSize=a.lines,1==a.type)switch(i){case s.RQf:a.getter=T,a.inputSize=2;break;case s.ix0:a.getter=I,a.inputSize=2}else if(2==a.type)switch(i){case s.RQf:a.getter=R,a.inputSize=4;break;case s.ix0:a.getter=P,a.inputSize=4}else throw"EXRLoader.parse: unsupported pixelType "+a.type+" for "+e.compression+".";a.blockCount=(e.dataWindow.yMax+1)/a.scanlineBlockSize;for(var o=0;o<a.blockCount;o++)C(t,n);a.outputChannels=3==a.channels?4:a.channels;let l=a.width*a.height*a.outputChannels;switch(i){case s.RQf:a.byteArray=new Float32Array(l),a.channels<a.outputChannels&&a.byteArray.fill(1,0,l);break;case s.ix0:a.byteArray=new Uint16Array(l),a.channels<a.outputChannels&&a.byteArray.fill(15360,0,l);break;default:console.error("THREE.EXRLoader: unsupported type: ",i)}return a.bytesPerLine=a.width*a.inputSize*a.channels,4==a.outputChannels?a.format=s.GWd:a.format=s.VT0,j?a.colorSpace="srgb-linear":a.encoding=3e3,a}(B,L,z,k,this.type),H={value:0},N={R:0,G:1,B:2,A:3,Y:0};for(let e=0;e<F.height/F.scanlineBlockSize;e++){let t=M(L,k);F.size=M(L,k),F.lines=t+F.scanlineBlockSize>F.height?F.height-t:F.scanlineBlockSize;let r=F.size<F.lines*F.bytesPerLine?F.uncompress(F):g(F);k.value+=F.size;for(let t=0;t<F.scanlineBlockSize;t++){let n=t+e*F.scanlineBlockSize;if(n>=F.height)break;for(let e=0;e<F.channels;e++){let i=N[B.channels[e].name];for(let a=0;a<F.width;a++){H.value=(t*(F.channels*F.width)+e*F.width+a)*F.inputSize;let o=(F.height-1-n)*(F.width*F.outputChannels)+a*F.outputChannels+i;F.byteArray[o]=F.getter(r,H)}}}}return{header:B,width:F.width,height:F.height,data:F.byteArray,format:F.format,[j?"colorSpace":"encoding"]:F[j?"colorSpace":"encoding"],type:this.type}}setDataType(e){return this.type=e,this}load(e,t,r,n){return super.load(e,function(e,r){j?e.colorSpace=r.colorSpace:e.encoding=r.encoding,e.minFilter=s.k6q,e.magFilter=s.k6q,e.generateMipmaps=!1,e.flipY=!1,t&&t(e,r)},r,n)}}let q=(e,t,r)=>{let n;switch(e){case s.OUM:n=new Uint8ClampedArray(t*r*4);break;case s.ix0:n=new Uint16Array(t*r*4);break;case s.bkx:n=new Uint32Array(t*r*4);break;case s.tJf:n=new Int8Array(t*r*4);break;case s.fBL:n=new Int16Array(t*r*4);break;case s.Yuy:n=new Int32Array(t*r*4);break;case s.RQf:n=new Float32Array(t*r*4);break;default:throw Error("Unsupported data type")}return n};class W{_renderer;_rendererIsDisposable=!1;_material;_scene;_camera;_quad;_renderTarget;_width;_height;_type;_colorSpace;_supportsReadPixels=!0;constructor(e){this._width=e.width,this._height=e.height,this._type=e.type,this._colorSpace=e.colorSpace;let t={format:s.GWd,depthBuffer:!1,stencilBuffer:!1,type:this._type,colorSpace:this._colorSpace,anisotropy:e.renderTargetOptions?.anisotropy!==void 0?e.renderTargetOptions?.anisotropy:1,generateMipmaps:e.renderTargetOptions?.generateMipmaps!==void 0&&e.renderTargetOptions?.generateMipmaps,magFilter:e.renderTargetOptions?.magFilter!==void 0?e.renderTargetOptions?.magFilter:s.k6q,minFilter:e.renderTargetOptions?.minFilter!==void 0?e.renderTargetOptions?.minFilter:s.k6q,samples:e.renderTargetOptions?.samples!==void 0?e.renderTargetOptions?.samples:void 0,wrapS:e.renderTargetOptions?.wrapS!==void 0?e.renderTargetOptions?.wrapS:s.ghU,wrapT:e.renderTargetOptions?.wrapT!==void 0?e.renderTargetOptions?.wrapT:s.ghU};if(this._material=e.material,e.renderer?this._renderer=e.renderer:(this._renderer=W.instantiateRenderer(),this._rendererIsDisposable=!0),this._scene=new s.Z58,this._camera=new s.qUd,this._camera.position.set(0,0,10),this._camera.left=-.5,this._camera.right=.5,this._camera.top=.5,this._camera.bottom=-.5,this._camera.updateProjectionMatrix(),!((e,t,r,i)=>{if(void 0!==n)return n;let a=new s.nWS(1,1,i);t.setRenderTarget(a);let o=new s.eaF(new s.bdM,new s.V9B({color:0xffffff}));t.render(o,r),t.setRenderTarget(null);let l=q(e,a.width,a.height);return t.readRenderTargetPixels(a,0,0,a.width,a.height,l),a.dispose(),o.geometry.dispose(),o.material.dispose(),n=0!==l[0]})(this._type,this._renderer,this._camera,t)){let e;this._type===s.ix0&&(e=this._renderer.extensions.has("EXT_color_buffer_float")?s.RQf:void 0),void 0!==e?(console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${s.RQf}`),this._type=e):(this._supportsReadPixels=!1,console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"))}this._quad=new s.eaF(new s.bdM,this._material),this._quad.geometry.computeBoundingBox(),this._scene.add(this._quad),this._renderTarget=new s.nWS(this.width,this.height,t),this._renderTarget.texture.mapping=e.renderTargetOptions?.mapping!==void 0?e.renderTargetOptions?.mapping:s.UTZ}static instantiateRenderer(){let e=new l.WebGLRenderer;return e.setSize(128,128),e}render=()=>{this._renderer.setRenderTarget(this._renderTarget);try{this._renderer.render(this._scene,this._camera)}catch(e){throw this._renderer.setRenderTarget(null),e}this._renderer.setRenderTarget(null)};toArray(){if(!this._supportsReadPixels)throw Error("Can't read pixels in this browser");let e=q(this._type,this._width,this._height);return this._renderer.readRenderTargetPixels(this._renderTarget,0,0,this._width,this._height,e),e}toDataTexture(e){let t=new s.GYF(this.toArray(),this.width,this.height,s.GWd,this._type,e?.mapping||s.UTZ,e?.wrapS||s.ghU,e?.wrapT||s.ghU,e?.magFilter||s.k6q,e?.minFilter||s.k6q,e?.anisotropy||1,s.Zr2);return t.generateMipmaps=e?.generateMipmaps!==void 0&&e?.generateMipmaps,t}disposeOnDemandRenderer(){this._renderer.setRenderTarget(null),this._rendererIsDisposable&&(this._renderer.dispose(),this._renderer.forceContextLoss())}dispose(e){this.disposeOnDemandRenderer(),e&&this.renderTarget.dispose(),this.material instanceof s.BKk&&Object.values(this.material.uniforms).forEach(e=>{e.value instanceof s.gPd&&e.value.dispose()}),Object.values(this.material).forEach(e=>{e instanceof s.gPd&&e.dispose()}),this.material.dispose(),this._quad.geometry.dispose()}get width(){return this._width}set width(e){this._width=e,this._renderTarget.setSize(this._width,this._height)}get height(){return this._height}set height(e){this._height=e,this._renderTarget.setSize(this._width,this._height)}get renderer(){return this._renderer}get renderTarget(){return this._renderTarget}set renderTarget(e){this._renderTarget=e,this._width=e.width,this._height=e.height}get material(){return this._material}get type(){return this._type}get colorSpace(){return this._colorSpace}}class G extends Error{}class V extends Error{}let Y=(e,t,r)=>{let n=RegExp(`${t}="([^"]*)"`,"i").exec(e);if(n)return n[1];let i=RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`,"i").exec(e);if(i){let e=i[1].match(/<rdf:li>([^<]*)<\/rdf:li>/g);return e&&3===e.length?e.map(e=>e.replace(/<\/?rdf:li>/g,"")):i[1].trim()}if(void 0!==r)return r;throw Error(`Can't find ${t} in gainmap metadata`)};class ${options;constructor(e){this.options={debug:!!e&&void 0!==e.debug&&e.debug,extractFII:!e||void 0===e.extractFII||e.extractFII,extractNonFII:!e||void 0===e.extractNonFII||e.extractNonFII}}extract(e){return new Promise((t,r)=>{let n,i=this.options.debug,a=new DataView(e.buffer);if(65496!==a.getUint16(0))return void r(Error("Not a valid jpeg"));let o=a.byteLength,s=2,l=0;for(;s<o;){if(++l>250)return void r(Error(`Found no marker after ${l} loops 😵`));if(255!==a.getUint8(s))return void r(Error(`Not a valid marker at offset 0x${s.toString(16)}, found: 0x${a.getUint8(s).toString(16)}`));if(n=a.getUint8(s+1),i&&console.log(`Marker: ${n.toString(16)}`),226===n){i&&console.log("Found APP2 marker (0xffe2)");let e=s+4;if(0x4d504600===a.getUint32(e)){let n,i=e+4;if(18761===a.getUint16(i))n=!1;else{if(19789!==a.getUint16(i))return void r(Error("No valid endianness marker found in TIFF header"));n=!0}if(42!==a.getUint16(i+2,!n))return void r(Error("Not valid TIFF data! (no 0x002A marker)"));let o=a.getUint32(i+4,!n);if(o<8)return void r(Error("Not valid TIFF data! (First offset less than 8)"));let s=i+o,l=a.getUint16(s,!n),u=s+2,c=0;for(let e=u;e<u+12*l;e+=12)45057===a.getUint16(e,!n)&&(c=a.getUint32(e+8,!n));let f=s+2+12*l+4,d=[];for(let e=f;e<f+16*c;e+=16){let t={MPType:a.getUint32(e,!n),size:a.getUint32(e+4,!n),dataOffset:a.getUint32(e+8,!n),dependantImages:a.getUint32(e+12,!n),start:-1,end:-1,isFII:!1};t.dataOffset?(t.start=i+t.dataOffset,t.isFII=!1):(t.start=0,t.isFII=!0),t.end=t.start+t.size,d.push(t)}if(this.options.extractNonFII&&d.length){let e=new Blob([a]),r=[];for(let t of d){if(t.isFII&&!this.options.extractFII)continue;let n=e.slice(t.start,t.end+1,"image/jpeg");r.push(n)}t(r)}}}s+=2+a.getUint16(s+2)}})}}let X=async e=>{let t=(e=>{let t,r=(t="undefined"!=typeof TextDecoder?new TextDecoder().decode(e):e.toString()).indexOf("<x:xmpmeta");for(;-1!==r;){let e=t.indexOf("x:xmpmeta>",r),n=t.slice(r,e+10);try{let e=Y(n,"hdrgm:GainMapMin","0"),t=Y(n,"hdrgm:GainMapMax"),r=Y(n,"hdrgm:Gamma","1"),i=Y(n,"hdrgm:OffsetSDR","0.015625"),a=Y(n,"hdrgm:OffsetHDR","0.015625"),o=/hdrgm:HDRCapacityMin="([^"]*)"/.exec(n),s=o?o[1]:"0",l=/hdrgm:HDRCapacityMax="([^"]*)"/.exec(n);if(!l)throw Error("Incomplete gainmap metadata");let u=l[1];return{gainMapMin:Array.isArray(e)?e.map(e=>parseFloat(e)):[parseFloat(e),parseFloat(e),parseFloat(e)],gainMapMax:Array.isArray(t)?t.map(e=>parseFloat(e)):[parseFloat(t),parseFloat(t),parseFloat(t)],gamma:Array.isArray(r)?r.map(e=>parseFloat(e)):[parseFloat(r),parseFloat(r),parseFloat(r)],offsetSdr:Array.isArray(i)?i.map(e=>parseFloat(e)):[parseFloat(i),parseFloat(i),parseFloat(i)],offsetHdr:Array.isArray(a)?a.map(e=>parseFloat(e)):[parseFloat(a),parseFloat(a),parseFloat(a)],hdrCapacityMin:parseFloat(s),hdrCapacityMax:parseFloat(u)}}catch(e){}r=t.indexOf("<x:xmpmeta",e)}})(e);if(!t)throw new V("Gain map XMP metadata not found");let r=new $({extractFII:!0,extractNonFII:!0}),n=await r.extract(e);if(2!==n.length)throw new G("Gain map recovery image not found");return{sdr:new Uint8Array(await n[0].arrayBuffer()),gainMap:new Uint8Array(await n[1].arrayBuffer()),metadata:t}},Q=e=>new Promise((t,r)=>{let n=document.createElement("img");n.onload=()=>{t(n)},n.onerror=e=>{r(e)},n.src=URL.createObjectURL(e)});class Z extends s.aHM{_renderer;_renderTargetOptions;_internalLoadingManager;_config;constructor(e,t){super(t),this._config=e,e.renderer&&(this._renderer=e.renderer),this._internalLoadingManager=new s.KPJ}setRenderer(e){return this._renderer=e,this}setRenderTargetOptions(e){return this._renderTargetOptions=e,this}prepareQuadRenderer(){this._renderer||console.warn("WARNING: A Renderer was not passed to this Loader constructor or in setRenderer, the result of this Loader will need to be converted to a Data Texture with toDataTexture() before you can use it in your renderer.");let e=this._config.createMaterial({gainMapMax:[1,1,1],gainMapMin:[0,0,0],gamma:[1,1,1],offsetHdr:[1,1,1],offsetSdr:[1,1,1],hdrCapacityMax:1,hdrCapacityMin:0,maxDisplayBoost:1,gainMap:new s.gPd,sdr:new s.gPd});return this._config.createQuadRenderer({width:16,height:16,type:s.ix0,colorSpace:s.Zr2,material:e,renderer:this._renderer,renderTargetOptions:this._renderTargetOptions})}async processImages(e,t,r){let n,i,a=t?new Blob([t],{type:"image/jpeg"}):void 0,o=new Blob([e],{type:"image/jpeg"}),s=!1;if("undefined"==typeof createImageBitmap){let e=await Promise.all([a?Q(a):Promise.resolve(void 0),Q(o)]);i=e[0],n=e[1],s="flipY"===r}else{let e=await Promise.all([a?createImageBitmap(a,{imageOrientation:r||"flipY"}):Promise.resolve(void 0),createImageBitmap(o,{imageOrientation:r||"flipY"})]);i=e[0],n=e[1]}return{sdrImage:n,gainMapImage:i,needsFlip:s}}createTextures(e,t,r){let n=new s.gPd(t||new ImageData(2,2),s.UTZ,s.ghU,s.ghU,s.k6q,s.NZq,s.GWd,s.OUM,1,s.Zr2);n.flipY=r,n.needsUpdate=!0;let i=new s.gPd(e,s.UTZ,s.ghU,s.ghU,s.k6q,s.NZq,s.GWd,s.OUM,1,s.er$);return i.flipY=r,i.needsUpdate=!0,{gainMap:n,sdr:i}}updateQuadRenderer(e,t,r,n,i){e.width=t.width,e.height=t.height,e.material.gainMap=r,e.material.sdr=n,e.material.gainMapMin=i.gainMapMin,e.material.gainMapMax=i.gainMapMax,e.material.offsetHdr=i.offsetHdr,e.material.offsetSdr=i.offsetSdr,e.material.gamma=i.gamma,e.material.hdrCapacityMin=i.hdrCapacityMin,e.material.hdrCapacityMax=i.hdrCapacityMax,e.material.maxDisplayBoost=Math.pow(2,i.hdrCapacityMax),e.material.needsUpdate=!0}}let J=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,K=`
// min half float value
#define HALF_FLOAT_MIN vec3( -65504, -65504, -65504 )
// max half float value
#define HALF_FLOAT_MAX vec3( 65504, 65504, 65504 )

uniform sampler2D sdr;
uniform sampler2D gainMap;
uniform vec3 gamma;
uniform vec3 offsetHdr;
uniform vec3 offsetSdr;
uniform vec3 gainMapMin;
uniform vec3 gainMapMax;
uniform float weightFactor;

varying vec2 vUv;

void main() {
  vec3 rgb = texture2D( sdr, vUv ).rgb;
  vec3 recovery = texture2D( gainMap, vUv ).rgb;
  vec3 logRecovery = pow( recovery, gamma );
  vec3 logBoost = gainMapMin * ( 1.0 - logRecovery ) + gainMapMax * logRecovery;
  vec3 hdrColor = (rgb + offsetSdr) * exp2( logBoost * weightFactor ) - offsetHdr;
  vec3 clampedHdrColor = max( HALF_FLOAT_MIN, min( HALF_FLOAT_MAX, hdrColor ));
  gl_FragColor = vec4( clampedHdrColor , 1.0 );
}
`;class ee extends s.BKk{_maxDisplayBoost;_hdrCapacityMin;_hdrCapacityMax;constructor({gamma:e,offsetHdr:t,offsetSdr:r,gainMapMin:n,gainMapMax:i,maxDisplayBoost:a,hdrCapacityMin:o,hdrCapacityMax:l,sdr:u,gainMap:c}){super({name:"GainMapDecoderMaterial",vertexShader:J,fragmentShader:K,uniforms:{sdr:{value:u},gainMap:{value:c},gamma:{value:new s.Pq0(1/e[0],1/e[1],1/e[2])},offsetHdr:{value:new s.Pq0().fromArray(t)},offsetSdr:{value:new s.Pq0().fromArray(r)},gainMapMin:{value:new s.Pq0().fromArray(n)},gainMapMax:{value:new s.Pq0().fromArray(i)},weightFactor:{value:(Math.log2(a)-o)/(l-o)}},blending:s.XIg,depthTest:!1,depthWrite:!1}),this._maxDisplayBoost=a,this._hdrCapacityMin=o,this._hdrCapacityMax=l,this.needsUpdate=!0,this.uniformsNeedUpdate=!0}get sdr(){return this.uniforms.sdr.value}set sdr(e){this.uniforms.sdr.value=e}get gainMap(){return this.uniforms.gainMap.value}set gainMap(e){this.uniforms.gainMap.value=e}get offsetHdr(){return this.uniforms.offsetHdr.value.toArray()}set offsetHdr(e){this.uniforms.offsetHdr.value.fromArray(e)}get offsetSdr(){return this.uniforms.offsetSdr.value.toArray()}set offsetSdr(e){this.uniforms.offsetSdr.value.fromArray(e)}get gainMapMin(){return this.uniforms.gainMapMin.value.toArray()}set gainMapMin(e){this.uniforms.gainMapMin.value.fromArray(e)}get gainMapMax(){return this.uniforms.gainMapMax.value.toArray()}set gainMapMax(e){this.uniforms.gainMapMax.value.fromArray(e)}get gamma(){let e=this.uniforms.gamma.value;return[1/e.x,1/e.y,1/e.z]}set gamma(e){let t=this.uniforms.gamma.value;t.x=1/e[0],t.y=1/e[1],t.z=1/e[2]}get hdrCapacityMin(){return this._hdrCapacityMin}set hdrCapacityMin(e){this._hdrCapacityMin=e,this.calculateWeight()}get hdrCapacityMax(){return this._hdrCapacityMax}set hdrCapacityMax(e){this._hdrCapacityMax=e,this.calculateWeight()}get maxDisplayBoost(){return this._maxDisplayBoost}set maxDisplayBoost(e){this._maxDisplayBoost=Math.max(1,Math.min(65504,e)),this.calculateWeight()}calculateWeight(){let e=(Math.log2(this._maxDisplayBoost)-this._hdrCapacityMin)/(this._hdrCapacityMax-this._hdrCapacityMin);this.uniforms.weightFactor.value=Math.max(0,Math.min(1,e))}}!l.WebGLRenderer;class et extends Z{constructor(e,t){super({renderer:e,createMaterial:e=>new ee(e),createQuadRenderer:e=>new W(e)},t)}async render(e,t,r,n){let{sdrImage:i,gainMapImage:a,needsFlip:o}=await this.processImages(r,n,"flipY"),{gainMap:s,sdr:l}=this.createTextures(i,a,o);this.updateQuadRenderer(e,i,s,l,t),e.render()}}class er extends et{load([e,t,r],n,i,a){let o,l,u,c=this.prepareQuadRenderer(),f=async()=>{if(o&&l&&u){try{await this.render(c,u,o,l)}catch(n){this.manager.itemError(e),this.manager.itemError(t),this.manager.itemError(r),"function"==typeof a&&a(n),c.disposeOnDemandRenderer();return}"function"==typeof n&&n(c),this.manager.itemEnd(e),this.manager.itemEnd(t),this.manager.itemEnd(r),c.disposeOnDemandRenderer()}},d=!0,h=0,p=0,m=!0,v=0,g=0,y=!0,w=0,b=0,x=()=>{"function"==typeof i&&i(new ProgressEvent("progress",{lengthComputable:d&&m&&y,loaded:p+g+b,total:h+v+w}))};this.manager.itemStart(e),this.manager.itemStart(t),this.manager.itemStart(r);let S=new s.Y9S(this._internalLoadingManager);S.setResponseType("arraybuffer"),S.setRequestHeader(this.requestHeader),S.setPath(this.path),S.setWithCredentials(this.withCredentials),S.load(e,async e=>{if("string"==typeof e)throw Error("Invalid sdr buffer");o=e,await f()},e=>{d=e.lengthComputable,p=e.loaded,h=e.total,x()},t=>{this.manager.itemError(e),"function"==typeof a&&a(t)});let E=new s.Y9S(this._internalLoadingManager);E.setResponseType("arraybuffer"),E.setRequestHeader(this.requestHeader),E.setPath(this.path),E.setWithCredentials(this.withCredentials),E.load(t,async e=>{if("string"==typeof e)throw Error("Invalid gainmap buffer");l=e,await f()},e=>{m=e.lengthComputable,g=e.loaded,v=e.total,x()},e=>{this.manager.itemError(t),"function"==typeof a&&a(e)});let _=new s.Y9S(this._internalLoadingManager);return _.setRequestHeader(this.requestHeader),_.setPath(this.path),_.setWithCredentials(this.withCredentials),_.load(r,async e=>{if("string"!=typeof e)throw Error("Invalid metadata string");u=JSON.parse(e),await f()},e=>{y=e.lengthComputable,b=e.loaded,w=e.total,x()},e=>{this.manager.itemError(r),"function"==typeof a&&a(e)}),c}}class en extends et{load(e,t,r,n){let i=this.prepareQuadRenderer(),a=new s.Y9S(this._internalLoadingManager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(this.withCredentials),this.manager.itemStart(e),a.load(e,async r=>{let a,o,s;if("string"==typeof r)throw Error("Invalid buffer, received [string], was expecting [ArrayBuffer]");let l=new Uint8Array(r);try{let e=await X(l);a=e.sdr,o=e.gainMap,s=e.metadata}catch(t){if(t instanceof V||t instanceof G)console.warn(`Failure to reconstruct an HDR image from ${e}: Gain map metadata not found in the file, HDRJPGLoader will render the SDR jpeg`),s={gainMapMin:[0,0,0],gainMapMax:[1,1,1],gamma:[1,1,1],hdrCapacityMin:0,hdrCapacityMax:1,offsetHdr:[0,0,0],offsetSdr:[0,0,0]},a=l;else throw t}try{await this.render(i,s,a.buffer,o?.buffer)}catch(t){this.manager.itemError(e),"function"==typeof n&&n(t),i.disposeOnDemandRenderer();return}"function"==typeof t&&t(i),this.manager.itemEnd(e),i.disposeOnDemandRenderer()},r,t=>{this.manager.itemError(e),"function"==typeof n&&n(t)}),i}}let ei={apartment:"lebombo_1k.hdr",city:"potsdamer_platz_1k.hdr",dawn:"kiara_1_dawn_1k.hdr",forest:"forest_slope_1k.hdr",lobby:"st_fagans_interior_1k.hdr",night:"dikhololo_night_1k.hdr",park:"rooitou_park_1k.hdr",studio:"studio_small_03_1k.hdr",sunset:"venice_sunset_1k.hdr",warehouse:"empty_warehouse_01_1k.hdr"},ea="https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/",eo=e=>Array.isArray(e),es=["/px.png","/nx.png","/py.png","/ny.png","/pz.png","/nz.png"];function el({files:e=es,path:t="",preset:r,colorSpace:n,extensions:i}={}){r&&(ef(r),e=ei[r],t=ea);let l=eo(e),{extension:u,isCubemap:c}=ed(e),f=eh(u);if(!f)throw Error("useEnvironment: Unrecognized file extension: "+e);let d=(0,o.D)(e=>e.gl);(0,a.useLayoutEffect)(()=>{("webp"===u||"jpg"===u||"jpeg"===u)&&d.domElement.addEventListener("webglcontextlost",function(){o.H.clear(f,l?[e]:e)},{once:!0})},[e,d.domElement]);let h=(0,o.H)(f,l?[e]:e,e=>{("webp"===u||"jpg"===u||"jpeg"===u)&&e.setRenderer(d),null==e.setPath||e.setPath(t),i&&i(e)}),p=l?h[0]:h;if("jpg"===u||"jpeg"===u||"webp"===u){var m;p=null==(m=p.renderTarget)?void 0:m.texture}return p.mapping=c?s.hy7:s.wfO,p.colorSpace=null!=n?n:c?"srgb":"srgb-linear",p}let eu={files:es,path:"",preset:void 0,extensions:void 0};el.preload=e=>{let t={...eu,...e},{files:r,path:n=""}=t,{preset:i,extensions:a}=t;i&&(ef(i),r=ei[i],n=ea);let{extension:s}=ed(r);if("webp"===s||"jpg"===s||"jpeg"===s)throw Error("useEnvironment: Preloading gainmaps is not supported");let l=eh(s);if(!l)throw Error("useEnvironment: Unrecognized file extension: "+r);o.H.preload(l,eo(r)?[r]:r,e=>{null==e.setPath||e.setPath(n),a&&a(e)})};let ec={files:es,preset:void 0};function ef(e){if(!(e in ei))throw Error("Preset must be one of: "+Object.keys(ei).join(", "))}function ed(e){var t;let r=eo(e)&&6===e.length,n=eo(e)&&3===e.length&&e.some(e=>e.endsWith("json")),i=eo(e)?e[0]:e;return{extension:r?"cube":n?"webp":i.startsWith("data:application/exr")?"exr":i.startsWith("data:application/hdr")?"hdr":i.startsWith("data:image/jpeg")?"jpg":null==(t=i.split(".").pop())||null==(t=t.split("?"))||null==(t=t.shift())?void 0:t.toLowerCase(),isCubemap:r,isGainmap:n}}function eh(e){return"cube"===e?s.ScU:"hdr"===e?f:"exr"===e?N:"jpg"===e||"jpeg"===e?en:"webp"===e?er:null}function ep(e,t,r,n,i={}){var a,s,l,u;let c,f;i={backgroundBlurriness:0,backgroundIntensity:1,backgroundRotation:[0,0,0],environmentIntensity:1,environmentRotation:[0,0,0],...i};let d=(f=c=t||r).current&&f.current.isScene?c.current:c,h=d.background,p=d.environment,m={backgroundBlurriness:d.backgroundBlurriness,backgroundIntensity:d.backgroundIntensity,backgroundRotation:null!=(a=null==(s=d.backgroundRotation)||null==s.clone?void 0:s.clone())?a:[0,0,0],environmentIntensity:d.environmentIntensity,environmentRotation:null!=(l=null==(u=d.environmentRotation)||null==u.clone?void 0:u.clone())?l:[0,0,0]};return"only"!==e&&(d.environment=n),e&&(d.background=n),(0,o.v)(d,i),()=>{"only"!==e&&(d.environment=p),e&&(d.background=h),(0,o.v)(d,m)}}function em({scene:e,background:t=!1,map:r,...n}){let i=(0,o.D)(e=>e.scene);return a.useLayoutEffect(()=>{if(r)return ep(t,e,i,r,n)}),null}function ev({background:e=!1,scene:t,blur:r,backgroundBlurriness:n,backgroundIntensity:i,backgroundRotation:s,environmentIntensity:l,environmentRotation:u,...c}){let f=el(c),d=(0,o.D)(e=>e.scene);return a.useLayoutEffect(()=>ep(e,t,d,f,{backgroundBlurriness:null!=r?r:n,backgroundIntensity:i,backgroundRotation:s,environmentIntensity:l,environmentRotation:u})),a.useEffect(()=>()=>{f.dispose()},[f]),null}function eg({children:e,near:t=.1,far:r=1e3,resolution:n=256,frames:i=1,map:u,background:c=!1,blur:f,backgroundBlurriness:d,backgroundIntensity:h,backgroundRotation:p,environmentIntensity:m,environmentRotation:v,scene:g,files:y,path:w,preset:b,extensions:x}){let S=(0,o.D)(e=>e.gl),E=(0,o.D)(e=>e.scene),_=a.useRef(null),[M]=a.useState(()=>new s.Z58),A=a.useMemo(()=>{let e=new l.WebGLCubeRenderTarget(n);return e.texture.type=s.ix0,e},[n]);a.useEffect(()=>()=>{A.dispose()},[A]),a.useLayoutEffect(()=>{if(1===i){let e=S.autoClear;S.autoClear=!0,_.current.update(S,M),S.autoClear=e}return ep(c,g,E,A.texture,{backgroundBlurriness:null!=f?f:d,backgroundIntensity:h,backgroundRotation:p,environmentIntensity:m,environmentRotation:v})},[e,M,A.texture,g,E,c,i,S]);let U=1;return(0,o.F)(()=>{if(i===1/0||U<i){let e=S.autoClear;S.autoClear=!0,_.current.update(S,M),S.autoClear=e,U++}}),a.createElement(a.Fragment,null,(0,o.q)(a.createElement(a.Fragment,null,e,a.createElement("cubeCamera",{ref:_,args:[t,r,A]}),y||b?a.createElement(ev,{background:!0,files:y,preset:b,path:w,extensions:x}):u?a.createElement(em,{background:!0,map:u,extensions:x}):null),M))}function ey(e){var t,r,n,s;let l=el(e),u=e.map||l;a.useMemo(()=>(0,o.e)({GroundProjectedEnvImpl:c}),[]),a.useEffect(()=>()=>{l.dispose()},[l]);let f=a.useMemo(()=>[u],[u]),d=null==(t=e.ground)?void 0:t.height,h=null==(r=e.ground)?void 0:r.radius,p=null!=(n=null==(s=e.ground)?void 0:s.scale)?n:1e3;return a.createElement(a.Fragment,null,a.createElement(em,(0,i.A)({},e,{map:u})),a.createElement("groundProjectedEnvImpl",{args:f,scale:p,height:d,radius:h}))}function ew(e){return e.ground?a.createElement(ey,e):e.map?a.createElement(em,e):e.children?a.createElement(eg,e):a.createElement(ev,e)}el.clear=e=>{let t={...ec,...e},{files:r}=t,{preset:n}=t;n&&(ef(n),r=ei[n]);let{extension:i}=ed(r),a=eh(i);if(!a)throw Error("useEnvironment: Unrecognized file extension: "+r);o.H.clear(a,eo(r)?[r]:r)}},8828:(e,t,r)=>{e.exports=r(3654)},8945:(e,t,r)=>{r.d(t,{A:()=>n});function n(){return(n=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)({}).hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(null,arguments)}},9897:(e,t,r)=>{r.d(t,{b:()=>o});var n=r(8945),i=r(2115),a=r(5339);let o=i.forwardRef(function({args:[e=1,t=1,r=1]=[],radius:a=.05,steps:o=1,smoothness:l=4,bevelSegments:u=4,creaseAngle:c=.4,children:f,...d},h){return i.createElement("mesh",(0,n.A)({ref:h},d),i.createElement(s,{args:[e,t,r],radius:a,steps:o,smoothness:l,bevelSegments:u,creaseAngle:c}),f)}),s=i.forwardRef(function({args:[e=1,t=1,r=1]=[],radius:o=.05,steps:s=1,smoothness:l=4,bevelSegments:u=4,creaseAngle:c=.4,...f},d){let h=i.useMemo(()=>(function(e,t,r){let n=new a.ypk,i=r-1e-5;return n.absarc(1e-5,1e-5,1e-5,-Math.PI/2,-Math.PI,!0),n.absarc(1e-5,t-2*i,1e-5,Math.PI,Math.PI/2,!0),n.absarc(e-2*i,t-2*i,1e-5,Math.PI/2,0,!0),n.absarc(e-2*i,1e-5,1e-5,0,-Math.PI/2,!0),n})(e,t,o),[e,t,o]),p=i.useMemo(()=>({depth:r-2*o,bevelEnabled:!0,bevelSegments:2*u,steps:s,bevelSize:o-1e-5,bevelThickness:o,curveSegments:l}),[r,o,l,u,s]),m=i.useRef(null);return i.useLayoutEffect(()=>{m.current&&(m.current.center(),function(e,t=Math.PI/3){let r=Math.cos(t),n=(1+1e-10)*100,i=[new a.Pq0,new a.Pq0,new a.Pq0],o=new a.Pq0,s=new a.Pq0,l=new a.Pq0,u=new a.Pq0;function c(e){let t=~~(e.x*n),r=~~(e.y*n),i=~~(e.z*n);return`${t},${r},${i}`}let f=e.index?e.toNonIndexed():e,d=f.attributes.position,h={};for(let e=0,t=d.count/3;e<t;e++){let t=3*e,r=i[0].fromBufferAttribute(d,t+0),n=i[1].fromBufferAttribute(d,t+1),l=i[2].fromBufferAttribute(d,t+2);o.subVectors(l,n),s.subVectors(r,n);let u=new a.Pq0().crossVectors(o,s).normalize();for(let e=0;e<3;e++){let t=c(i[e]);t in h||(h[t]=[]),h[t].push(u)}}let p=new Float32Array(3*d.count),m=new a.THS(p,3,!1);for(let e=0,t=d.count/3;e<t;e++){let t=3*e,n=i[0].fromBufferAttribute(d,t+0),a=i[1].fromBufferAttribute(d,t+1),f=i[2].fromBufferAttribute(d,t+2);o.subVectors(f,a),s.subVectors(n,a),l.crossVectors(o,s).normalize();for(let e=0;e<3;e++){let n=h[c(i[e])];u.set(0,0,0);for(let e=0,t=n.length;e<t;e++){let t=n[e];l.dot(t)>r&&u.add(t)}u.normalize(),m.setXYZ(t+e,u.x,u.y,u.z)}}f.setAttribute("normal",m)}(m.current,c))},[h,p,c]),i.useImperativeHandle(d,()=>m.current),i.createElement("extrudeGeometry",(0,n.A)({ref:m,args:[h,p]},f))})},9914:(e,t,r)=>{e.exports=r(6451)}}]);