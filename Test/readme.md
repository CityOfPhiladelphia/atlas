**Pre-requisites**

- Ensure that Node.js and npm are installed on your computer before running testcafe in commandline, then install Testcafe.(https://devexpress.github.io/testcafe/documentation/getting-started/)

**Environment setup**

- Download project to your local machine.
- Open terminal on your machine and ensure that you are in the directory of the project you want to work with. Use "cd <project file path>" for navigating to the directory.

**Running Tests Locally**

- testcafe.rc.json file has the environment setup to run the tests locally, for project availability run "npm run serve-production"
- tests are running with travis CI, It doesn't require proxy setup so while running locally we need proxy to add in command line.
- Using commandline make sure you are in the Test root directory then type 'npm run test-local' it will run your tests.

**Running Tests using Docker**

- For this project you can run the tests using awscloud9 account
- docker-compose.yml has the docker testcafe image and using .env file providing environment details to docker-compose.yml
- Make sure you are in the Test root directory then tpye "npm run docker-test"

**Notes**

- screen shots are visible only when you run it in local environment. Which are mentioned in the testcafe.rc.json 
- reports are useful for local and travis CI. after the build finished if you expand the $cat command line to see the reports.
