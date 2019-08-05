import Basepage from '../pages/Basepage';

require('dotenv').config();

fixture`page landing verification`.page(`${process.env.TEST_URL}`);

let basepage = new Basepage();

test('page landing verification', async (t: TestController) => {
   
let basepage = new Basepage();
    await basepage.verifypageFunctionality(t);
});