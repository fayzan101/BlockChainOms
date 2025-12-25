# PowerShell script to delete all .ts files in backend subfolders except server.ts
$folders = @('config', 'controllers', 'middleware', 'models', 'routes')
foreach ($folder in $folders) {
    $path = "f:/Desktop/Projects/BlockChain Oms/backend/$folder/*.ts"
    Remove-Item -Path $path -Force -ErrorAction SilentlyContinue
}
