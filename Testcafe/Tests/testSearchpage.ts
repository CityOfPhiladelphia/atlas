import Searchpage from '../Pages/Searchpage';


fixture`search page verification`.page `https://atlas.phila.gov/`;

let searchpage = new Searchpage();

test('search page verification', async (t: TestController) => {

    await searchpage.verifySearchFunctionality(t);
    await searchpage.verifytopicPropertyAssesmentFunctionality(t);
    await searchpage.verifytopicDeedsFuctionality(t);
    await searchpage.verifytopicLicensesandInspectionFuctionality(t)
    await searchpage.verifyZoningFuctionality(t);
    await searchpage.verifyVotingFuctionality(t);
    await searchpage.verifyNearbyFuctionality(t);
});