@echo off
rem http://downloads.warzone.gg/IW4M/MW2.zip
rem http://downloads.warzone.gg/IW4M/iw4x_files.zip
rem http://downloads.warzone.gg/IW4M/iw4x_dlc.zip
rem thank god for WarZone <3
set workdir=%cd%
set installMW2=Yes
set installIW4x=Yes
set installDLC=Yes

if not exist "%workdir%/installerData" goto errorNoDirectory

:print
set "input="
cls
echo.
echo Welcome to the IW4x Installer!
echo ##############################
echo Type the number in front of the setting to toggle it, type "go" to start installing:
echo.
echo 1. Install the MW2 Basegame: %installMW2%
echo 2. Install the IW4x Client: %installIW4x%
echo 3. Install the IW4x DLCs: %installDLC%
echo.
echo The files will be installed to where this file is! Make sure it's in the correct folder!
echo.
set /p input="Enter 1, 2, 3 or go: "

if "%input%"=="1" (
    if "%installMW2%"=="Yes" (
        set installMW2=No
    ) else (
        set installMW2=Yes
    )
    goto print
) else (
    if "%input%"=="2" (
        if "%installIW4x%"=="Yes" (
            set installIW4x=No
        ) else (
            set installIW4x=Yes
        )
        goto print
    ) else (
        if "%input%"=="3" (
            if "%installDLC%"=="Yes" (
                set installDLC=No
            ) else (
                set installDLC=Yes
            )
            goto print
        ) else (
            goto start
        )
    )
)

:start
if "%installMW2%"=="No" if "%installIW4x%"=="No" if "%installDLC%"=="No" goto errorNoInstallsSelected

cls
cscript //Nologo "%workdir%/installerData/proceedWarning.vbs" "%workdir%"
if %ERRORLEVEL% == 2 exit
echo.
echo By continuing, you confirm that this installer is going to install the files into the correct folder.
echo.
pause

if not exist "%workdir%/installerData/temp" (
    mkdir "%workdir%/installerData/temp"
)

if "%installMW2%"=="Yes" (
    goto installMW2
)
:jump1
if "%installIW4x%"=="Yes" (
    goto installIW4x
)
:jump2
if "%installDLC%"=="Yes" (
    goto installDLC
)
:jump3
cls
echo.
echo All files installed!
echo.
echo Big thanks to WarZone for hosting the files!
echo.
pause
exit

:installMW2
cls
echo.
echo Downloading MW2...
echo.
installerData\wget\wget.exe --directory-prefix=installerData/temp http://downloads.warzone.gg/IW4M/MW2.zip -q --show-progress
echo.
echo Installing MW2...
installerData\7zip\7za.exe x -y .\installerData\temp\MW2.zip
move .\MW2\* .\
move .\MW2\main .\
move .\MW2\miles .\
move .\MW2\Redist .\
move .\MW2\zone .\
echo.
echo Cleaning up...
del installerData\temp\MW2.zip
rmdir /S /Q MW2
goto jump1

:installIW4x
cls
echo.
echo Downloading IW4x...
echo.
installerData\wget\wget.exe --directory-prefix=installerData/temp http://downloads.warzone.gg/IW4M/iw4x_files.zip -q --show-progress
echo.
echo Installing IW4x...
installerData\7zip\7za.exe x -y .\installerData\temp\iw4x_files.zip
echo.
echo Cleaning up...
del installerData\temp\iw4x_files.zip
del crash-helper.exe
goto jump2

:installDLC
cls
echo.
echo Downloading DLCs...
echo.
installerData\wget\wget.exe --directory-prefix=installerData/temp http://downloads.warzone.gg/IW4M/iw4x_dlc.zip -q --show-progress
echo.
echo Installing DLCs...
installerData\7zip\7za.exe x -y .\installerData\temp\iw4x_dlc.zip
echo.
echo Cleaning up...
del installerData\temp\iw4x_dlc.zip
del README!!.txt
goto jump3

:errorNoInstallsSelected
echo.
echo Error: You didn't select anything to be installed! Please set at least one of the three options to Yes!
echo.
pause
goto print

:errorNoDirectory
echo.
echo Error: Couldn't find the folder "/installerData/" in current folder, make sure you extract both the folder and this file into your MW2 game folder!
echo.
pause
exit
