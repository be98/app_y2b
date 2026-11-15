# deploy.ps1 — 빌드해서 올리고 바로 반영한다. 실행하면 사용자에게 보이는 화면이 바뀐다.
#
#   .\deploy.ps1                    app_y2b 빌드 → 업로드 → 반영
#   .\deploy.ps1 -SkipBuild         이미 만든 dist 를 그대로 올려 반영
#
# 반영은 이 스크립트가 직접 하지 않는다. 서버의 deploy_front.yml 을 ssh 로 부를 뿐이다.
# 반영 경로는 그 플레이북 하나로 유지된다 — Semaphore 로 눌러도 같은 것이 돈다.
#
# 롤백은 릴리스를 지정해 같은 플레이북을 부르는 것이다. 맨 아래 안내 참고.
#
# rsync 를 쓰지 않는다 — 로컬 Git Bash 에 없다. tar + scp 로 같은 일을 한다.
#
# 이 파일은 aca·app_trade 의 것과 같게 유지한다. 다른 것은 $App 기본값 하나뿐이라
# 프로젝트 사이 diff 가 그대로 남는다. 서버 쪽 deploy/*.yml 의 원본은 aca 저장소에 있다.

[CmdletBinding()]
param(
  [string]$App  = 'app_y2b',
  [string]$Key  = 'C:\Users\be98\Desktop\source\perm\tensweb\tensweb.pem',
  [string]$RemoteHost = 'ubuntu@tensweb.com',
  [string]$DeployDir  = '/home/www/html/deploy',
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# 앱 루트는 ..\aca\deploy\vars\apps.yml 과 같아야 한다. 앱이 늘면 여기도 한 줄 는다.
# 로컬 폴더명과 서버 앱 이름이 다른 것들이 있다: aca→app_aca · app_p2p→app_quiz
$roots = @{
  'app'         = '/home/www/html/fa_app/app'
  'app_post'    = '/home/www/html/fa_app/app_post'
  'app_trade'   = '/home/www/html/fa_app/app_trade'
  'app_block'   = '/home/www/html/fa_app/app_block'
  'app_alba'    = '/home/www/html/fa_app/app_alba'
  'app_y2b'     = '/home/www/html/fa_app/app_y2b'
  'app_aca'     = '/home/www/html/fa_w/app_aca'
  'app_quiz'    = '/home/www/html/fa_w/app_quiz'
  'app_coding'  = '/home/www/html/fa_w/app_coding'
  'app_exam'    = '/home/www/html/fa_w/app_exam'
}
if (-not $roots.ContainsKey($App)) { throw "프런트 배포 대상이 아니다: $App" }
if (-not (Test-Path $Key))         { throw "ssh 키가 없다: $Key" }

# 빌드는 이 폴더에서 한다. $App 이 이 폴더의 앱과 다르면 남의 앱 자리에 이 앱의 dist 를 올리게 된다.
# 다만 package.json 의 name 이 서버 앱 이름과 다른 앱이 있어, 그것만 여기서 맞춰 본다.
$pkgOf = @{
  'app_aca'     = 'aca'
  'app_quiz'    = 'app_p2p'
  'app_block'   = 'hello'
}
$expect  = if ($pkgOf.ContainsKey($App)) { $pkgOf[$App] } else { $App }
$pkgName = (Get-Content package.json -Raw | ConvertFrom-Json).name
if ($expect -ne $pkgName) {
  throw "여기는 $pkgName 이다. -App $App 은 그 프로젝트의 deploy.ps1 에서 실행해라."
}

$root = $roots[$App]
$rel  = Get-Date -Format 'yyyyMMdd-HHmm'
$dest = "$root/releases/front/$rel"

# 네이티브 exe 는 $? 가 아니라 종료코드로 판단한다.
function Invoke-Step($what) {
  if ($LASTEXITCODE -ne 0) { throw "$what 실패 (exit $LASTEXITCODE)" }
}

# 반영 준비는 빌드 전에 확인한다. 반영이 불가능한 상태라면 몇 분짜리 빌드를 하기 전에 멈추는 게 낫다.
ssh -i $Key $RemoteHost "test -f '$DeployDir/deploy_front.yml' && command -v ansible-playbook >/dev/null"
if ($LASTEXITCODE -ne 0) {
  Write-Host "반영할 수 없습니다. 서버에 다음 둘이 있어야 합니다." -ForegroundColor Red
  Write-Host "  · $DeployDir/deploy_front.yml"
  Write-Host "      ssh -i `"$Key`" $RemoteHost `"mkdir -p $DeployDir`""
  Write-Host "      scp -i `"$Key`" -r ..\aca\deploy\* ${RemoteHost}:$DeployDir/   ← 플레이북 원본은 aca 에 있다"
  Write-Host "  · ansible-playbook  (서버에서:  sudo apt install -y ansible)"
  throw "반영 준비가 안 되어 있다"
}

if (-not $SkipBuild) {
  Write-Host "[1/5] 빌드" -ForegroundColor Cyan
  npm run build
  Invoke-Step 'npm run build'
}

# dist 안에 assets·pages·public 셋이 다 있어야 deploy_front.yml 이 붙일 수 있다.
foreach ($d in 'assets','pages','public') {
  if (-not (Test-Path "dist\$d")) { throw "dist\$d 가 없다. 빌드가 온전하지 않다." }
}

$tar   = Join-Path $env:TEMP "front-$App-$rel.tar.gz"
$rtar  = "/tmp/front-$App-$rel.tar.gz"

Write-Host "[2/5] 묶기 → $tar" -ForegroundColor Cyan
tar -czf $tar -C dist .
Invoke-Step 'tar'

Write-Host "[3/5] 전송 → ${RemoteHost}:$dest" -ForegroundColor Cyan
scp -i $Key $tar "${RemoteHost}:$rtar"
Invoke-Step 'scp'

# 새 릴리스 디렉터리에만 푼다. 서비스에 붙어 있는 wwwroot 는 건드리지 않는다.
Write-Host "[4/5] 풀기" -ForegroundColor Cyan
ssh -i $Key $RemoteHost "set -e; mkdir -p '$dest'; tar xzf '$rtar' -C '$dest'; rm -f '$rtar'; ls -1 '$dest'"
Invoke-Step 'ssh (원격 전개)'

Remove-Item $tar -Force

# 여기서부터가 반영이다. 방금 올린 릴리스를 명시한다 — '최신' 에 맡기면
# 다른 사람이 그 사이에 올린 릴리스가 붙을 수 있다.
Write-Host ""
Write-Host "[5/5] 반영 → deploy_front.yml (release=$rel)" -ForegroundColor Cyan
ssh -i $Key $RemoteHost "bash -lc 'cd $DeployDir && ansible-playbook deploy_front.yml -e app_name=$App -e release=$rel'"
Invoke-Step 'ansible-playbook deploy_front.yml'

Write-Host ""
Write-Host "반영 완료 : $App ← $rel" -ForegroundColor Green
Write-Host "되돌리려면:  ssh -i `"$Key`" $RemoteHost `"cd $DeployDir && ansible-playbook deploy_front.yml -e app_name=$App -e release=<이전 릴리스>`""
