**Pre-requisites**
- Ensure that Node.js and npm are installed on your computer before running testcafe in commandline, then install Testcafe.(https://devexpress.github.io/testcafe/documentation/getting-started/)

**Environment setup**
- Download project to your local machine.
- Open terminal on your machine and ensure that you are in the directory of the project you want to work with. Use "cd <project file path>" for navigating to the directory. 

**Running Tests Locally**
- testcafe.rc.json file has the environment setup to run the tests locally
- Using commandline make sure you are in the Test root directory then type 'testcafe' it will run your tests.


**Running Tests using Docker** 
- For this project you can run the tests using awscloud9 account
- docker-compose.yml has the docker testcafe image and using .env file providing environment details to docker-compose.yml
- Make sure you are in the Test root directory then tpye "docker-compose up --force-recreate" (--force-recreate :parameter used to kill the previous containers and start the newone)
 
