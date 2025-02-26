@echo off
echo Adding hosts entry for Neon database...

REM Run as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo This script requires administrator privileges.
  echo Right-click and select "Run as administrator"
  pause
  exit /b 1
)

REM Add the entry to hosts file
echo 3.0.109.33 ep-steep-tree-a1ofdls5-pooler.ap-southeast-1.aws.neon.tech >> %windir%\System32\drivers\etc\hosts

echo Added host entry. Try running your migrations now!
pause
