@ECHO off
cd %~dp1
copy "C:\RightClicks\fiximages.pl" "%~dp1" /Y
perl fiximages.pl "%~n1%~x1"
del fiximages.pl