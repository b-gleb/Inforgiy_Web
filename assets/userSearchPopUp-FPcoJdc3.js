const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/userProfile-CFPaighn.js","assets/index-Bk3Ar8EO.js","assets/index-DOjXjPma.css","assets/userEditForm-ZFdy_U7l.js"])))=>i.map(i=>d[i]);
import{r as t,j as e,m as y,u as A,_ as m}from"./index-Bk3Ar8EO.js";import{f as b}from"./fetchAllUsers-CrMeDmcq.js";const E=t.lazy(()=>m(()=>import("./userProfile-CFPaighn.js"),__vite__mapDeps([0,1,2,3]))),j=t.lazy(()=>m(()=>import("./userEditForm-ZFdy_U7l.js"),__vite__mapDeps([3,1,2])));function B({mode:o,branch:a,initDataUnsafe:c,date:f,timeRange:h,onClose:i,setRotaData:x,handleUpdateCell:w}){const[p,_]=t.useState([]),[k,u]=t.useState([]),[d,g]=t.useState(""),[r,n]=t.useState(null);return t.useEffect(()=>(window.Telegram.WebApp.BackButton.onClick(i),window.Telegram.WebApp.BackButton.show(),()=>{window.Telegram.WebApp.BackButton.offClick(),window.Telegram.WebApp.BackButton.hide()}),[i]),t.useEffect(()=>{(()=>{b(a,c).then(l=>{_(l),u(l)}).catch(()=>{})})()},[a,c]),t.useEffect(()=>{const s=p.filter(l=>l.nick.toLowerCase().includes(d.toLowerCase()));u(s)},[d,p]),e.jsx("div",{className:"popup",children:r?(r==null?void 0:r.id)!==null?e.jsx(t.Suspense,{fallback:null,children:e.jsx(E,{branch:a,editingUser:r,setEditingUser:n,initDataUnsafe:c})}):e.jsx(t.Suspense,{fallback:null,children:e.jsx(j,{branch:a,editingUser:r,setEditingUser:n,initDataUnsafe:c})}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-center mb-4",children:[e.jsx("input",{type:"text",placeholder:"Поиск...",value:d,onChange:s=>g(s.target.value),className:"input-field mr-2"}),e.jsx("button",{onClick:()=>i(),className:"p-2 text-[#007aff] text-xl",children:"✕"})]}),o==="user_management"&&e.jsx("button",{className:"button-primary",onClick:()=>{n({id:null,username:"@",color:0}),window.Telegram.WebApp.HapticFeedback.impactOccurred("medium")},children:"+ Добавить пользователя"}),e.jsx("div",{className:"search_results_container",children:k.map(s=>e.jsx(y.button,{initial:{opacity:.5,scale:.9},animate:{opacity:1,scale:1,transition:{ease:"easeOut",duration:.2}},onClick:()=>{o==="rota"?(A({type:"add",branch:a,date:f,timeRange:h,modifyUserId:s.id,initDataUnsafe:c}).then(l=>{x(l)}).catch(()=>{}),window.Telegram.WebApp.HapticFeedback.impactOccurred("light"),i()):o==="user_management"?(n(s),window.Telegram.WebApp.HapticFeedback.impactOccurred("light")):o==="rota_weekly"&&w({type:"add",branch:a,modifyUserId:s.id,initDataUnsafe:c}).then(()=>{window.Telegram.WebApp.HapticFeedback.impactOccurred("light"),i()}).catch(()=>{})},className:"search_results_button",children:s.nick},s.id))})]})})}export{B as default};
