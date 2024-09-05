import { createApp } from 'vue'
import { Quasar } from 'quasar'
import "@quasar/extras/material-icons/material-icons.css"
import "quasar/src/css/index.sass"
import './style.css'
import App from './App.vue'
import {createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history:createWebHistory(),
  routes:[
    { path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/CFMEditor`, component: () => import('./pages/Config.vue') },
    //{ path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/CFMEditor1`, component: () => import('./pages/Config.vue') },
    //{ path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/DSCFM`, component:() => import('./pages/DScfm.vue') },
    // { path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/DSCFM`, component:() => import('./pages/TESTcfm.vue') }
    // { path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/CFMEditor1`, component: () => import('./pages/Config.vue') },
  ]
});


//let app_node = document.getElementById("app");
//const shadow = app_node.attachShadow({mode:"open"});
//const div = document.createElement("div");
//div.setAttribute("id", "shadow");
//
// const materialLink = document.createElement("link");
// materialLink.setAttribute("rel", "stylesheet");
// materialLink.setAttribute("type", "text/css");
// materialLink.setAttribute("href", "../node_modules/@quasar/extras/material-icons/material-icons.css");

//
// const link = document.createElement("link");
// link.setAttribute("rel", "stylesheet");
// link.setAttribute("type", "text/css");
// link.setAttribute("href", "https://cdn.jsdelivr.net/npm/quasar@2.16.8/dist/quasar.prod.css");

// app_node!.appendChild(materialLink);
// app_node!.appendChild(link);
// app_node!.appendChild(div);
//const tailwindcss = document.createElement("script");
//tailwindcss.setAttribute("src", "https://cdn.tailwindcss.com");
//app.mount(div);
//shadow.appendChild(materialLink);
//shadow.appendChild(link);
//shadow.appendChild(tailwindcss);
//shadow.appendChild(div);
const app = createApp(App)
app.use(router)
app.use(Quasar, {
  plugins:{}
})

app.mount("#app")

//multiple page reference https://stackoverflow.com/questions/65868976/how-to-build-a-multi-pages-application-by-vite2-and-vue3   
