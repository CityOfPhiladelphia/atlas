echo off

rem     Push the js/config.js file to an S3 bucket. Takes an argument for which
rem     bucket to use (dev or prod).
rem     Usage: push_config [dev|prod]

set env=%1
set dest=s3://phila-atlas-%env%/js/config.js
echo Pushing...
aws s3 cp ..\js\config.js %dest%
