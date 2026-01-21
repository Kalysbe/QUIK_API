@echo off
REM ÄÀÍÍÛÉ BAT ÔÀÉË ÏÎÇÂÎËßÅÒ ÍÀÑÒÐÎÈÒÜ ÝÊÑÏÎÐÒ ËÈÌÈÒÎÂ

REM ÑÎÇÄÀÅÌ ÏÅÐÅÌÅÍÍÛÅ ÄÀÒÛ ÂÐÅÌÅÍÈ:
set D=%DATE:~0,2%
set M=%DATE:~3,2%
set Y=%DATE:~-4%
set H=%TIME:~0,2%
set MIN=%TIME:~3,2%

REM ---------------------ÍÀÑÒÐÎÉÊÈ FILLLIMITS---------------------------
REM ÇÍÀ×ÅÍÈÅ ÇÀÄÅÐÆÊÈ ÏÅÐÅÄ ÂÛÃÐÓÇÊÎÉ (Â ÑÅÊÓÍÄÀÕ):
set TIMER=300
REM ÈÌß ÔÀÉËÀ ÍÀÑÒÐÎÅÊ. ÏÎ ÓÌÎË×ÀÍÈÞ: INFO.INI.
set INI_FILE_NAME=INFO.INI

REM ---------------------ÍÀÑÒÐÎÉÊÈ PING---------------------------
REM ÂÊËÞ×ÀÅÒ PING ÄËß ÏÐÎÂÅÐÊÈ ÑÂßÇÈ ÏÅÐÅÄ ÎÒÏÐÀÂÊÎÉ (1-âëþ÷èòü, 0-âûêëþ÷èòü)
set DO_PING=0

REM ip ÀÄÐÅÑÑ ÑÅÐÂÅÐÀ Quik ÊÎÒÎÐÛÉ ÍÓÆÍÎ ÏÈÍÃÎÂÀÒÜ ÏÅÐÅÄ ÑÎÕÐÀÍÅÍÈÅÌ ËÈÌÈÒÎÂ:
set IP_ADDR=127.0.0.1

REM ÂÐÅÌß ÏÅÐÅÐÛÂÀ ÌÅÆÄÓ ÏÈÍÃÀÌÈ Â ÑÅÊÓÍÄÀÕ:
set IP_PING_TIME=10

REM ---------------------ÍÀÑÒÐÎÉÊÈ ÊÀÒÀËÎÃÀ È ÈÌÅÍ ÔÀÉËÎÂ---------------------------
REM ÏÀÏÊÀ Ñ ÏÐÎÃÐÀÌÌÎÉ FILLLIMITS.EXE (ÅÑËÈ ÓÊÀÇÀÒÜ %~dp0 ÒÎ ÁÓÄÅÒ ÒÅÊÓÙÈÉ ÊÀÒÀËÎÃ)
set FLIM_DIR=%~dp0

REM ÏÀÏÊÀ ÊÓÄÀ ÑÎÕÐÀÍßÒÜ ËÈÌÈÒÛ:
set LIM_DIR=%FLIM_DIR%Limits

REM ÈÌß ÔÀÉËÀ ÊÓÄÀ ÑÎÕÐÀÍßÒÜ ËÈÌÈÒÛ:
set LIM_FILE=%Y%_%M%_%D%.lim

REM ÏÎËÍÛÉ ÏÓÒÜ Ê ÔÀÉËÓ Ñ ËÎÃÀÌÈ:
set LOG_FILE="%FLIM_DIR%\%Y%_%M%_%D%.log"


REM ---------------------ÑÀÌ ÊÎÄ---------------------------
if %DO_PING%==1 (
	:BEGIN
	ping %IP_ADDR% -n 1 -w 10 > NUL
	if errorlevel 1 (
		echo %date% %time% COMPUTER %IP_ADDR% IS OFFLINE... >> %LOG_FILE%
		ping -n %IP_PING_TIME% 127.0.0.1 > NUL
		goto BEGIN
	) else (
		echo %date% %time% COMPUTER %ip_addr% IS ONLINE! >> %LOG_FILE%
		goto WORK
	)
) else (
	goto WORK
)

:WORK
mkdir "%LIM_DIR%"
echo FillLimits starting export at %date% %time% >> %LOG_FILE%
%FLIM_DIR%\FillLimits.exe /export %TIMER% "%LIM_DIR%\%LIM_FILE%" %INI_FILE_NAME% >> %LOG_FILE%

