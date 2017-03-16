echo off

rem     Push the js/config.js file to an S3 bucket. Takes an argument for which
rem     bucket to use (dev or prod). Requires the AWS CLI to be installed.
rem     Usage: push_config [dev|prod]

set env=%1
rem     set dest=s3://phila-atlas-%env%/js/config.js
IF "%env%"=="prod" (set dest=s3://atlas.phila.gov/js/config.js)
ELSE (set dest=s3://atlas-%env%.phila.gov/js/config.js)
echo Pushing...
aws s3 cp ..\js\config.js %dest%
