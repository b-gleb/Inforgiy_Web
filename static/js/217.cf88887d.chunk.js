"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[217],{5217:(e,t,a)=>{a.r(t),a.d(t,{default:()=>o});var n=a(9950),c=a(9500),s=a(9811),i=a(3215),r=a(4414);const l=(0,n.lazy)((()=>a.e(497).then(a.bind(a,8497))));function o(e){let{mode:t,branch:a,initDataUnsafe:o,date:u,timeRange:d,onClose:p,setRotaData:m}=e;const[h,f]=(0,n.useState)([]),[b,w]=(0,n.useState)([]),[g,k]=(0,n.useState)(""),[x,A]=(0,n.useState)(null);return(0,n.useEffect)((()=>(window.Telegram.WebApp.BackButton.onClick(p),window.Telegram.WebApp.BackButton.show(),()=>{window.Telegram.WebApp.BackButton.offClick(),window.Telegram.WebApp.BackButton.hide()})),[p]),(0,n.useEffect)((()=>{(0,s.A)(a,o).then((e=>{f(e),w(e)})).catch((()=>{}))}),[a,o]),(0,n.useEffect)((()=>{const e=h.filter((e=>e.nick.toLowerCase().includes(g.toLowerCase())));w(e)}),[g,h]),(0,r.jsx)("div",{className:"popup",children:x?(0,r.jsx)(n.Suspense,{fallback:null,children:(0,r.jsx)(l,{branch:a,editingUser:x,setEditingUser:A,initDataUnsafe:o})}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:"flex items-center mb-4",children:[(0,r.jsx)("input",{type:"text",placeholder:"\u041f\u043e\u0438\u0441\u043a...",value:g,onChange:e=>k(e.target.value),className:"input-field mr-2"}),(0,r.jsx)("button",{onClick:()=>p(),className:"p-2 text-[#007aff] text-xl",children:"\u2715"})]}),"user_management"===t&&(0,r.jsx)("button",{className:"button-primary",onClick:()=>{A({id:null,username:"@",color:0}),window.Telegram.WebApp.HapticFeedback.impactOccurred("medium")},children:"+ \u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f"}),(0,r.jsx)("div",{className:"search_results_container",children:b.map((e=>(0,r.jsx)(c.P.button,{initial:{opacity:.5,scale:.9},animate:{opacity:1,scale:1,transition:{ease:"easeOut",duration:.2}},onClick:()=>{"rota"===t?((0,i.A)("add",a,u,d,e.id,o).then((e=>{m(e)})).catch((()=>{})),window.Telegram.WebApp.HapticFeedback.impactOccurred("light"),p()):"user_management"===t&&(A(e),window.Telegram.WebApp.HapticFeedback.impactOccurred("light"))},className:"search_results_button",children:e.nick},e.id)))})]})})}},9811:(e,t,a)=>{a.d(t,{A:()=>i});var n=a(9246),c=a(9492);const s="https://inforgiy-server.fly.dev";async function i(e,t){try{return(await n.A.get(`${s}/api/users`,{params:{branch:e,initDataUnsafe:t}})).data}catch(a){throw(0,c.A)(a),a}}}}]);