import PwdSearchPage from "../pages/PwdSearchPage";
//require("dotenv").config();

fixture`PwdNoDor search page verification`.page(`http://localhost:8080`);

test("PwdNoDor search page verification", async (t: TestController) => {
  let pwdSearchPage = new PwdSearchPage();

  await pwdSearchPage.verifySearchFunctionality(t);
  await pwdSearchPage.verifyTopicPropertyAssesment(t);
  await pwdSearchPage.verifyTopicDeeds(t);
  await pwdSearchPage.verifyTopicLicensesAndInspection(t);
  await pwdSearchPage.verifyTopicZoning(t);
  await pwdSearchPage.verifyTopicVoting(t);
  await pwdSearchPage.verifyTopicNearby(t);
});
