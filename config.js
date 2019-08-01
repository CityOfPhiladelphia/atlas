const createTestCafe = require('testcafe');
let testcafe = null;

require('dotenv').config();;

createTestCafe('localhost', 1337, 1338)
    .then(tc => {
        testcafe = tc;
        const runner = testcafe.createRunner();
        if (process.env.RUN_LOCALLY === 'true') {
            runner.startApp(
              
            );
        }
        return runner
            .src([
                './testcafe/tests/testBasepage.ts',
                
            ])
            .browsers(process.env.BROWSER)
            .reporter(process.env.REPORTER)
            .run({
                selectorTimeout: 10000,
                skipJsErrors: true
            });
    })
    .then(failedCount => {
        console.log('Tests failed: ' + failedCount);
        testcafe.close();
    });