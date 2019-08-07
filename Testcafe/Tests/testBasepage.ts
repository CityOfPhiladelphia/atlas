import Basepage from '../Pages/Basepage';


fixture`page landing verification`.page `https://atlas.phila.gov/`;

let basepage = new Basepage();

test('page landing verification', async (t: TestController) => {
   
let basepage = new Basepage();
    await basepage.verifypageFunctionality(t);
});