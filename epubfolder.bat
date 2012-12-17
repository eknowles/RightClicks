@ECHO off
cd %1
copy "C:\RightClicks\epubcheck.pl" %1 /Y
perl epubcheck.pl
PAUSE