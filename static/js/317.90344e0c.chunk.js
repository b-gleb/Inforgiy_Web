"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[317],{7333:(e,t,n)=>{n.d(t,{A:()=>a});const a=n(2810).zl0.withParams({browserColorScheme:"dark",backgroundColor:"#1f2836",columnBorder:!0,fontFamily:"inherit",fontSize:10,foregroundColor:"#D6D6D6",headerFontSize:10,headerFontWeight:700,iconSize:12,oddRowBackgroundColor:"#1F2836",spacing:5,wrapperBorderRadius:0},"dark").withParams({browserColorScheme:"light",columnBorder:!0,fontFamily:"inherit",fontSize:10,headerFontSize:10,headerFontWeight:700,iconSize:12,oddRowBackgroundColor:"#F9F9F9",spacing:5,wrapperBorderRadius:0},"light")},9317:(e,t,n)=>{n.r(t),n.d(t,{default:()=>y});var a=n(9950),r=n(7450),l=n(5888),s=n(9246),o=n(3291),i=n(9500),d=n(1446),c=n(9492),u=n(3691),h=n(7333),p=n(2810),m=n(4414);p.syG.registerModules([p.ihh,p.y66,p.Q90,p.JZ0,p.Iws]);const f="https://inforgiy-server.fly.dev";function g(e){return`${e.toString().padStart(2,"0")}:00 - ${(e+1).toString().padStart(2,"0")}:00`}function y(e){let{branch:t,initDataUnsafe:n,setShowWeekly:o}=e;const[i,p]=(0,a.useState)(!0),[y,x]=(0,a.useState)(null),[b,j]=(0,a.useState)([]),[k,v]=(0,a.useState)(null),[D]=(0,a.useState)({sortable:!1,suppressMovable:!0,width:.2*window.innerWidth,cellRenderer:e=>{const n=e.value;if(!Array.isArray(n)||0===n.length)return n;const r=n.map((e=>{var n;const a=null!==(n=null===e||void 0===e?void 0:e.nick.split(" ")[0])&&void 0!==n?n:e.username;return"gp"===t&&1===e.color?(0,m.jsx)("span",{className:"gp-green",children:a},e.id):a}));return(0,m.jsx)(m.Fragment,{children:r.map(((e,t)=>(0,m.jsxs)(a.Fragment,{children:[t>0&&", ",e]},t)))})},cellClass:e=>{const a=e.value;return Array.isArray(a)?0===a.length?"gp"===t?"empty gp":"empty":a.some((e=>e.id===n.user.id))?"my-duty":void 0:""},autoHeight:!0,wrapText:!0});(0,a.useEffect)((()=>(window.Telegram.WebApp.BackButton.onClick((()=>{o(!1)})),window.Telegram.WebApp.BackButton.show(),document.body.dataset.agThemeMode=window.Telegram.WebApp.colorScheme,()=>{window.Telegram.WebApp.BackButton.offClick(),window.Telegram.WebApp.BackButton.hide()})),[o]),(0,a.useEffect)((()=>{(async()=>{const e=[],n=(()=>{const e=[],t=new Date,n=t.getDay(),a=new Date(t);a.setDate(t.getDate()-(n+6)%7);for(let r=0;r<25;r++){const t=new Date(a);t.setDate(a.getDate()+r),e.push(t)}return e})();for(const l of n)try{const n=await s.A.get(`${f}/api/rota`,{params:{branch:t,date:(0,r.GP)(l,"yyyy-MM-dd")}});e.push(n.data)}catch(d){(0,c.A)(d),e.push({})}const a=n.map((e=>({field:(0,r.GP)(e,"yyyy-MM-dd"),headerName:(0,r.GP)(e,"dd.MM EEEEEE",{locale:l.ru})})));j([{field:"index",pinned:"left",headerName:"",valueGetter:e=>g(e.node.rowIndex),cellRenderer:null,cellStyle:null,cellClass:null},...a]);const o=[];for(const t of e)o.push(t.map((e=>e.users)));const i=function(e,t){const n=e.map((e=>e.field));return t[0].map(((e,a)=>{const r={};return n.forEach(((e,n)=>{const l=t[n][a];r[e]=l})),r}))}(a,o);v(i)})()}),[t]);return(0,m.jsxs)(m.Fragment,{children:[i&&(0,m.jsx)(d.A,{}),k&&(0,m.jsx)("div",{className:"w-full h-full fixed inset-0",children:(0,m.jsx)(u.W6,{onGridReady:e=>{e.api.ensureColumnVisible((0,r.GP)(new Date,"yyyy-MM-dd"),"start"),p(!1)},rowData:k,columnDefs:b,defaultColDef:D,className:"w-full h-full",getRowHeight:()=>13,onCellClicked:e=>{var t;"index"===e.colDef.field?o(!1):x({users:null!==(t=null===e||void 0===e?void 0:e.value)&&void 0!==t?t:[],date:new Date(e.colDef.field),rowIndex:e.rowIndex})},gridOptions:{theme:h.A}})}),(0,m.jsx)(w,{selectedCellData:y,closePopup:()=>{x(null)}})]})}function w(e){let{selectedCellData:t,closePopup:n}=e;return(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(o.N,{children:t&&(0,m.jsx)(i.P.div,{className:"fixed inset-0 bg-black",initial:{opacity:0},animate:{opacity:.5},exit:{opacity:0},onClick:n})}),(0,m.jsx)(o.N,{children:t&&(0,m.jsxs)(i.P.div,{className:"pop-up",initial:{y:"100%"},animate:{y:0},exit:{y:"100%"},transition:{type:"spring",stiffness:300,damping:30},children:[(0,m.jsxs)("div",{className:"flex justify-between items-center",children:[(0,m.jsx)("h2",{className:"text-xl font-bold dark:text-white",children:"\u0414\u0435\u0436\u0443\u0440\u043d\u044b\u0435"}),(0,m.jsx)("button",{className:"text-red-500 text-lg font-bold",onClick:n,children:"\u2715"})]}),(0,m.jsxs)("h3",{className:"text-sm font-medium mb-2 text-gray-500",children:[(0,r.GP)(t.date,"EEEE dd.MM",{locale:l.ru}),", ",g(t.rowIndex)]}),(0,m.jsx)("div",{children:Object.values(t.users).length>0?Object.values(t.users).map(((e,t)=>(0,m.jsx)("div",{className:"flex items-center justify-between p-4 mb-2 bg-gray-100 dark:bg-neutral-700 dark:text-gray-400 rounded-lg",children:(0,m.jsx)("span",{className:"font-medium",children:e.nick})},t))):(0,m.jsx)("p",{className:"text-center text-gray-500",children:"\u0412 \u044d\u0442\u043e \u0432\u0440\u0435\u043c\u044f \u043d\u0435\u0442 \u0434\u0435\u0436\u0443\u0440\u043d\u044b\u0445"})})]})})]})}}}]);