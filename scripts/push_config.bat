echo off

rem     Push the js/config.js file to an S3 bucket. Takes an argument for which
rem     bucket to use (dev or prod). Requires the AWS CLI to be installed.
rem     Usage: push_config [dev|prod]

set dest=

IF %1==prod (
  echo Pushing To Prod...
  set dest=s3://atlas.phila.gov/js/config.js
)
IF %1==dev (
  echo Pushing To Dev...
  set dest=s3://atlas-%env%.phila.gov/js/config.js
)
IF EXIST %dest% (
  aws s3 cp ..\js\config.js %dest%
) ELSE (
  echo Must Provide Environment
  exit 1
)
