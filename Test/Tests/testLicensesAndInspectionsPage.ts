import BasePage from "../Pages/BasePage";
import LicensesAndInspectionsPage from "../Pages/LicensesAndInspectionsPage";

require("dotenv").config();

fixture`License page verification`.page(`${process.env.TEST_URL}`);

test("License page verification", async (t: TestController) => {
  let basePage = new BasePage();
  let licensesAndInspectionsPage = new LicensesAndInspectionsPage();

  await basePage.verifyBuildingSearchFunctionality(t);
  await licensesAndInspectionsPage.verifyTopicLicensesAndInspection(t);
});
