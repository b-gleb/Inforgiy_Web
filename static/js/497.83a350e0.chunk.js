/*! For license information please see 497.83a350e0.chunk.js.LICENSE.txt */
"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[497],{8497:(e,a,t)=>{t.r(a),t.d(a,{default:()=>o});const s=(0,t(7101).A)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);var n=t(9246),c=t(6174),l=t(9492),i=t(4414);const r="https://inforgiy-server.fly.dev";function o(e){let{branch:a,editingUser:t,setEditingUser:o,initDataUnsafe:d}=e;const u=e=>{const{name:a,value:t}=e.target;"color"===a&&window.Telegram.WebApp.HapticFeedback.selectionChanged(),o((e=>({...e,[a]:t})))};return(0,i.jsx)(i.Fragment,{children:(0,i.jsxs)("form",{onSubmit:async e=>{e.preventDefault();const s={branch:a,userObj:t,initDataUnsafe:d};try{200===(await n.A.post(`${r}/api/updateUser`,s)).status&&(o(null),window.Telegram.WebApp.HapticFeedback.notificationOccurred("success"),c.oR.success("\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d!"))}catch(i){i.response&&404===i.response.status?(c.oR.warn("\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d!"),window.Telegram.WebApp.HapticFeedback.notificationOccurred("error")):(0,l.A)(i)}},className:"space-y-4",children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("label",{htmlFor:"username",className:"form-label",children:"Telegram"}),(0,i.jsx)("input",{type:"text",id:"username",name:"username",value:t.username,onChange:u,required:!0,readOnly:null!==t.id,autoComplete:"off",className:"input-field"})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("label",{htmlFor:"nick",className:"form-label",children:"\u041d\u0438\u043a"}),(0,i.jsx)("input",{type:"text",id:"nick",name:"nick",value:t.nick,onChange:u,required:!0,autoComplete:"off",className:"input-field"})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("label",{htmlFor:"color",className:"form-label",children:"\u0426\u0432\u0435\u0442"}),(0,i.jsx)("select",{id:"color",name:"color",value:t.color,onChange:u,className:"input-field",children:Object.entries({0:"\u0421\u0438\u043d\u0438\u0439",1:"\u0417\u0435\u043b\u0451\u043d\u044b\u0439",2:"\u041a\u0440\u0430\u0441\u043d\u044b\u0439",3:"\u0427\u0451\u0440\u043d\u044b\u0439",4:"\u0424\u0438\u043e\u043b\u0435\u0442\u043e\u0432\u044b\u0439",5:"\u041e\u0440\u0430\u043d\u0436\u0435\u0432\u044b\u0439",6:"\u0416\u0451\u043b\u0442\u044b\u0439"}).map((e=>{let[a,t]=e;return(0,i.jsx)("option",{value:a,children:t},a)}))})]}),(0,i.jsxs)("div",{className:"flex space-x-2",children:[null!==t.id&&(0,i.jsx)("button",{type:"button",className:"button-secondary w-auto",onClick:()=>{(async(e,a,t)=>{try{200===(await n.A.post(`${r}/api/removeUser`,{branch:e,modifyUserId:a,initDataUnsafe:t})).status&&(window.Telegram.WebApp.HapticFeedback.notificationOccurred("success"),c.oR.success("\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0443\u0434\u0430\u043b\u0435\u043d"))}catch(s){(0,l.A)(s)}})(a,t.id,d),o(null)},children:(0,i.jsx)(s,{color:"red",size:25})}),(0,i.jsx)("button",{type:"button",onClick:()=>{o(null),window.Telegram.WebApp.HapticFeedback.impactOccurred("light")},className:"button-secondary w-full",children:"\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c"}),(0,i.jsx)("button",{type:"submit",className:"button-primary",children:"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c"})]})]})})}}}]);