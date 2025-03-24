const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/personalStats-BwLzem_v.js","assets/index-CkFr9f3E.js","assets/index-DOjXjPma.css"])))=>i.map(i=>d[i]);
import{c as d,r as n,j as e,A as p,m as h,_ as x}from"./index-CkFr9f3E.js";import _ from"./userEditForm-ER674F_3.js";/**
 * @license lucide-react v0.479.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],f=d("ChevronDown",j);/**
 * @license lucide-react v0.479.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],g=d("ChevronUp",y),v=n.lazy(()=>x(()=>import("./personalStats-BwLzem_v.js"),__vite__mapDeps([0,1,2]))),k=n.lazy(()=>x(()=>import("./index-CkFr9f3E.js").then(s=>s.l),__vite__mapDeps([1,2]))),l=({title:s,isOpen:t,onClick:o,children:i})=>e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:o,className:"w-full flex justify-between items-center px-1 py-3 border-b dark:border-gray-400",children:[e.jsx("span",{className:"text-lg font-semibold dark:text-gray-400",children:s}),t?e.jsx(g,{className:"icon-text"}):e.jsx(f,{className:"icon-text"})]}),e.jsx(p,{children:t&&e.jsx(h.div,{initial:!1,animate:{height:t?"auto":0,opacity:t?1:0},exit:{height:0,opacity:0},transition:{duration:.3,ease:"easeInOut"},className:"overflow-hidden mt-2",children:i})},s)]});function D({branch:s,editingUser:t,setEditingUser:o,initDataUnsafe:i}){const[a,u]=n.useState("settings"),r=c=>{u(m=>m===c?null:c)};return e.jsxs(e.Fragment,{children:[e.jsx(l,{title:"Профиль",isOpen:a==="settings",onClick:()=>r("settings"),children:e.jsx(_,{branch:s,editingUser:t,setEditingUser:o,initDataUnsafe:i})}),e.jsx(l,{title:"Смены",isOpen:a==="duties",onClick:()=>r("duties"),children:e.jsx(n.Suspense,{fallback:null,children:e.jsx(k,{branch:s,user_id:t.id,prevDays:14,nextDays:30})})}),e.jsx(l,{title:"Статистика",isOpen:a==="personal_stats",onClick:()=>r("personal_stats"),children:e.jsx(n.Suspense,{fallback:null,children:e.jsx(v,{branch:s,user_id:t.id})})})]})}export{D as default};
