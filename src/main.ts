import { createApp } from 'vue'
import { Quasar } from 'quasar'
import "@quasar/extras/material-icons/material-icons.css"
import "quasar/src/css/index.sass"
import './style.css'
import "floating-vue/dist/style.css"
import App from './App.vue'
import {createRouter, createWebHistory } from 'vue-router'
import FloatingVue from 'floating-vue';

const router = createRouter({
  history:createWebHistory(),
  routes:[
    { path:`${import.meta.env.MODE == "development" ? "": ""}/Home/CFMEditor`, component: () => import('./pages/Config.vue') },
    { path:`${import.meta.env.MODE == "development" ? "": ""}/Home/TESTCFM`, component: () => import('./pages/TESTcfm.vue') },
    { path:`${import.meta.env.MODE == "development" ? "": ""}/Home/DSCFM`, component:() => import('./pages/DScfm.vue') },
    { path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/ViewPage1`, component:() => import('./pages/Config.vue') },
    // { path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/CFMEditor1`, component:() => import('./pages/TESTcfm.vue') }
    // { path:`${import.meta.env.MODE == "development" ? "": "/CFM"}/Home/CFMEditor1`, component: () => import('./pages/Config.vue') },
  ]
});


const app = createApp(App)
app.use(router)
app.use(FloatingVue)
app.use(Quasar, {
  plugins:{}
})

app.mount("#app")

