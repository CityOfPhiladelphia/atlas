import DorSearchPage from "../pages/DorSearchPage";

//require("dotenv").config();

fixture`DorNoPwd  search page verification`.page(`http://localhost:8080`);

test("DorNoPwd search page verification", async (t: TestController) => {
  let dorSearchPage = new DorSearchPage();

  await dorSearchPage.verifyTopicDeeds(t);
  await dorSearchPage.verifyTopicLicensesAndInspection(t);
  await dorSearchPage.verifyTopicZoning(t);
  await dorSearchPage.verifyTopicVoting(t);
  await dorSearchPage.verifyTopicNearby(t);
});
