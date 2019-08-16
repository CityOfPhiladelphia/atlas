import CondominiumSearchPage from "../pages/CondominiumSearchPage";

//require("dotenv").config();

fixture`Condominiums search page verification`.page(`http://localhost:8080`);

test("Condominiums search page verification", async (t: TestController) => {
  let condominiumSearchPage = new CondominiumSearchPage();

  await condominiumSearchPage.verifyTopicCondominiums(t);
  await condominiumSearchPage.verifyTopicDeeds(t);
  await condominiumSearchPage.verifyTopicLicensesAndInspection(t);
  await condominiumSearchPage.verifyTopicZoning(t);
  await condominiumSearchPage.verifyTopicVoting(t);
  await condominiumSearchPage.verifyTopicNearby(t);

});
