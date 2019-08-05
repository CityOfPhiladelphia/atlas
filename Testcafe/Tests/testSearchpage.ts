import Searchpage from '../pages/Searchpage';

require('dotenv').config();

fixture`search page verification`.page(`${process.env.TEST_URL}`);

let searchpage = new Searchpage();

test('search page verification', async (t: TestController) => {
   
    await searchpage.verifySearchFunctionality(t);
});