import BuildingSearchPage from "../Pages/BuildingSearchPage";

require("dotenv").config();

fixture`Building search page verification`.page(`${process.env.TEST_URL}`);

test("Building search page verification", async (t: TestController) => {
  let buildingSearchPage = new BuildingSearchPage();

  await buildingSearchPage.verifySearchFunctionality(t);
  await buildingSearchPage.verifyTopicPropertyAssesment(t);
  await buildingSearchPage.verifyTopicDeeds(t);
  await buildingSearchPage.verifyTopicLicensesAndInspection(t);
  await buildingSearchPage.verifyTopicZoning(t);
  await buildingSearchPage.verifyTopicVoting(t);
  await buildingSearchPage.verifyTopicNearby(t);
});
