import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template:{ 
        transformAssetUrls,
       // compilerOptions:{
       //   isCustomElement:(tag) => tag.includes("-")
       // }
      }
    }),
    quasar({
      sassVariables:"src/quasar-variables.sass"
    })
  ],
  build:{
    manifest:true,
    rollupOptions:{
      input:"./src/main.ts",
    },
    outDir:"../cfm/CFM/ts/vue/dist"
  },
  server:{
    proxy:{
      "*":{
        target:"http://localhost:60135/Home/NCFM",
        changeOrigin:true
      }
    },
    hmr:{
      protocol:"ws"
    }
  }
})
