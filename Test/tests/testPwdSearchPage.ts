import "dotenv/config";
import PwdSearchPage from "../pages/PwdSearchPage";

fixture`PwdNoDor search page verification`.page(`${process.env.TEST_URL}`);

test("PwdNoDor search page verification", async (t: TestController) => {
  const pwdSearchPage = new PwdSearchPage();

  await pwdSearchPage.verifySearchFunctionality(t);
  await pwdSearchPage.verifyTopicPropertyAssesment(t);
 // await pwdSearchPage.verifyTopicDeeds(t);
  await pwdSearchPage.verifyTopicLicensesAndInspection(t);
  await pwdSearchPage.verifyTopicZoning(t);
  await pwdSearchPage.verifyTopicVoting(t);
  await pwdSearchPage.verifyTopicNearby(t);
});
