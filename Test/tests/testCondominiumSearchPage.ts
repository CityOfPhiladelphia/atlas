import "dotenv/config";
import CondominiumSearchPage from "../pages/CondominiumSearchPage";

fixture`Condominiums search page verification`.page(`${process.env.TEST_URL}`);

test("Condominiums search page verification", async (t: TestController) => {
  const condominiumSearchPage = new CondominiumSearchPage();

  await condominiumSearchPage.verifyTopicCondominiums(t);
  //await condominiumSearchPage.verifyTopicDeeds(t);
  await condominiumSearchPage.verifyTopicLicensesAndInspection(t);
  await condominiumSearchPage.verifyTopicZoning(t);
  await condominiumSearchPage.verifyTopicVoting(t);
  await condominiumSearchPage.verifyTopicNearby(t);

});
