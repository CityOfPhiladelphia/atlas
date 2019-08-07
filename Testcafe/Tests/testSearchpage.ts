import Searchpage from '../Pages/Searchpage';


fixture`search page verification`.page `https://atlas.phila.gov/`;

let searchpage = new Searchpage();

test('search page verification', async (t: TestController) => {
   
    await searchpage.verifySearchFunctionality(t);
});