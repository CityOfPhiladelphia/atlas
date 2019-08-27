import "dotenv/config";
import DorSearchPage from "../pages/DorSearchPage";

fixture`DorNoPwd  search page verification`.page(`${process.env.TEST_URL}`);

test("DorNoPwd search page verification", async (t: TestController) => {
  const dorSearchPage = new DorSearchPage();

//  / await dorSearchPage.verifyTopicDeeds(t);
  await dorSearchPage.verifyTopicLicensesAndInspection(t);
  await dorSearchPage.verifyTopicZoning(t);
  await dorSearchPage.verifyTopicVoting(t);
  await dorSearchPage.verifyTopicNearby(t);
});
