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
      sassVariables:"src/quasar-variables.sass",
      extras:["roboto-font", "DFKai-sb"]
    })
  ],
  build:{
    manifest:true,
    rollupOptions:{
      input:"./src/main.ts",
      output:{
        entryFileNames:`scripts/dist/assets/[name].js`,
        chunkFileNames:`scripts/dist/assets/[name].js`,
        assetFileNames:`scripts/dist/assets/[name].[ext]`
      }
    },
    outDir:"./dist"
  },
  server:{
    proxy:{
      "*":{
        target:"http://localhost:55103/Home/ViewPage1",
        changeOrigin:true
      }
    },
    hmr:{
      protocol:"ws"
    }
  }
})
