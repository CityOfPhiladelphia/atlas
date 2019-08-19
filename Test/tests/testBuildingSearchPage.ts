import BuildingSearchPage from "../pages/BuildingSearchPage";

require("dotenv").config();

fixture`Building search page verification`.page(`http://localhost:8080`);

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
