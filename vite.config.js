import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar } from '@quasar/vite-plugin'
import { resolve, join } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fg from 'fast-glob'
import fs from 'fs'

const input = {}
const files = fg.sync('./public/**/index.html')
files.forEach(file => {
  const urlPath = file
    .replace('./public/', '')
    .replace('/index.html', '')
  input[urlPath] = resolve(__dirname, file)
})

// 개발 서버에서 경로 재작성 플러그인
function multiPagePlugin() {
  // URL 매핑 자동 생성
  const urlMap = {}
  files.forEach(file => {
    // './public/user/login/index.html' -> '/user/login'
    const urlPath = file
      .replace('./public/pages', '')
      .replace('/index.html', '')
    urlMap[urlPath] = file
  })
  
  return {
    name: 'multi-page-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        // [핵심 수정] URL에서 쿼리 스트링(? 뒤의 내용) 분리
        // 예: /course?id=18  ==> urlPathOnly: "/course", query: "id=18"
        const [urlPathOnly, query] = req.url.split('?')
        if (urlMap[urlPathOnly]) {
          req.url = urlMap[urlPathOnly]
        }
        next()
      })
    }
  }
}


export default defineConfig({
  publicDir: false, // public 폴더 자동 복사 비활성화
  
  plugins: [
    vue(),
    quasar(),
    multiPagePlugin(),
    viteStaticCopy({
      targets: [
        { src: 'public/favicon.ico', dest: '' },
        { src: 'public/robots.txt', dest: '' },
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@_shared': resolve(__dirname, 'src/pages/_shared')
    }
  },

  // Vue CLI define 옵션 재현
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },

  server: {
    proxy: {
      '/api':   { target: 'https://y2b.tensweb.com', changeOrigin: true },
      '/cache': { target: 'https://y2b.tensweb.com', changeOrigin: true },
      '/image': { target: 'https://y2b.tensweb.com', changeOrigin: true },
    },
  },

  build: {
    rollupOptions: {
      input,

      output: {
        entryFileNames: assetInfo => {
          // pages/user/login -> pages/user/login.[hash].js
          const name = assetInfo.name
          return name + '.[hash].js'
        },
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    },
    
    // HTML 파일을 원본 경로 구조 그대로 유지
    // public/user/login/index.html -> dist/pages/user/login/index.html
    outDir: 'dist'
  }
})
