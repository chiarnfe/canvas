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
      output:{
        entryFileNames:`CFM/scripts/dist/assets/[name].js`,
        chunkFileNames:`CFM/scripts/dist/assets/[name].js`,
        assetFileNames:`CFM/scripts/dist/assets/[name].[ext]`
      }
    },
    outDir:"./dist"
  },
  server:{
    proxy:{
      "*":{
        target:"http://localhost:59024/Home/CFMEditor",
        changeOrigin:true
      }
    },
    hmr:{
      protocol:"ws"
    }
  }
})
