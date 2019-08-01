import Basepage from '../pages/Basepage';

require('dotenv');

fixture`Search Function Tests`.page(`${process.env.TEST_URL}`);

let basepage = new Basepage();

test('search results contain search string', async (t: TestController) => {
   
let basepage = new Basepage();
    await basepage.verifypageFunctionality(t);
});