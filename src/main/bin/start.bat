@echo off & setlocal enabledelayedexpansion
title rest
cd %~dp0\..

set LIB_JARS=.

for %%i in (lib\*.jar) do set LIB_JARS=!LIB_JARS!;%%i

echo %LIB_JARS%

java -Dfile.encoding=utf-8 -server -classpath config;Turntable.jar com.yukoon.turntablegames.TurntablegamesApplication

pause