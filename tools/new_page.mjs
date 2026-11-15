// 페이지 뼈대 생성: node tools/new_page.mjs user/watch "영상 제목" [admin]
// public/pages/<경로>/index.html + src/pages/<경로>/{index.js, App.vue} 를 만든다. comIndex.vue 는 직접 작성.
// 이미 있는 파일은 건드리지 않는다. 서버 쪽 페이지 컨트롤러는 서버 shell/y2b_page_controllers.py 의 PAGES 에 추가.
import fs from 'fs'
import path from 'path'

const [page, title = 'y2b', kind = 'user'] = process.argv.slice(2)
if (!page) { console.log('사용법: node tools/new_page.mjs user/watch "제목" [admin]'); process.exit(1) }

const html = `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="/favicon.ico">
    <title>${title}</title>
  </head>
  <body>
    <noscript><strong>JavaScript가 필요합니다. 브라우저에서 활성화해 주세요.</strong></noscript>
    <div id="app"></div>
    <!-- 로그인 사용자 정보를 window.__USER__ 로 주입한다 (app.js load_user_info 가 읽음) -->
    <script src="/api/account/user/info/js"></script>
    <script type="module" src="/src/pages/${page}/index.js"></script>
  </body>
</html>
`
const indexJs = `import boot from '@/app/y2b/boot.js'
import App from './App.vue'

boot(App)
`
const appVue = kind === 'admin'
  ? `<template>
  <com-index />
</template>

<script>
import comIndex from './comIndex.vue'

export default { name: 'App', components: { comIndex } }
</script>
`
  : `<template>
  <com-y2b-layout>
    <com-index />
  </com-y2b-layout>
</template>

<script>
import comY2bLayout from '@/components/y2b/comY2bLayout.vue'
import comIndex from './comIndex.vue'

export default { name: 'App', components: { comY2bLayout, comIndex } }
</script>
`

function write(file, content) {
  if (fs.existsSync(file)) return console.log('skip', file)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  console.log('make', file)
}
write(`public/pages/${page}/index.html`, html)
write(`src/pages/${page}/index.js`, indexJs)
write(`src/pages/${page}/App.vue`, appVue)
