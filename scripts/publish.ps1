$ErrorActionPreference='Stop'
$repo=Split-Path $PSScriptRoot -Parent
$pages=Join-Path $repo '_pages'
$output=Join-Path $repo '_site'
$remote='https://github.com/alexandermarkovdev/viva-brok-demo.git'
if ((& git -C $repo remote get-url origin) -ne $remote) {throw 'Unexpected repository destination.'}
& python (Join-Path $PSScriptRoot 'build-pages.py')
if ($LASTEXITCODE -ne 0){throw 'Pages build failed.'}
& git -C $repo -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -u origin main
if ($LASTEXITCODE -ne 0){throw 'Source push failed.'}
if (!(Test-Path -LiteralPath (Join-Path $pages '.git'))){
 & git clone --no-checkout --local $repo $pages
 if ($LASTEXITCODE -ne 0){throw 'Pages checkout failed.'}
 & git -C $pages symbolic-ref HEAD refs/heads/gh-pages
 & git -C $pages remote set-url origin $remote
 & git -C $pages config user.name alexandermarkovdev
 & git -C $pages config user.email 326458832+alexandermarkovdev@users.noreply.github.com
}
if ((& git -C $pages remote get-url origin) -ne $remote){throw 'Unexpected Pages destination.'}
$resolved=[IO.Path]::GetFullPath($pages)
if($resolved -ne [IO.Path]::GetFullPath((Join-Path $repo '_pages'))){throw 'Unsafe Pages directory.'}
$gitDirectory=(Join-Path $resolved '.git')+[IO.Path]::DirectorySeparatorChar
foreach($file in Get-ChildItem -LiteralPath $pages -Recurse -File -Force){
 if($file.FullName.StartsWith($gitDirectory,[StringComparison]::OrdinalIgnoreCase)){continue}
 $relative=$file.FullName.Substring($resolved.Length+1)
 if(!(Test-Path -LiteralPath (Join-Path $output $relative) -PathType Leaf)){Remove-Item -LiteralPath $file.FullName}
}
foreach($file in Get-ChildItem -LiteralPath $output -Recurse -File -Force){
 $relative=$file.FullName.Substring(([IO.Path]::GetFullPath($output)).Length+1)
 $target=Join-Path $pages $relative
 New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force|Out-Null
 Copy-Item -LiteralPath $file.FullName -Destination $target -Force
}
& git -C $pages add --all
& git -C $pages diff --cached --quiet
if($LASTEXITCODE -eq 1){
 & git -C $pages commit -m 'Publish website preview'
 if($LASTEXITCODE -ne 0){throw 'Pages commit failed.'}
}elseif($LASTEXITCODE -ne 0){throw 'Pages comparison failed.'}
& git -C $pages -c credential.helper= -c 'credential.helper=!gh auth git-credential' push origin gh-pages
if($LASTEXITCODE -ne 0){throw 'Pages push failed.'}
