import BasePage from "../Pages/BasePage";
import ZoningPage from "../Pages/ZoningPage";

require("dotenv").config();

fixture`Zoning page verification`.page(`${process.env.TEST_URL}`);

test("Zoning page verification", async (t: TestController) => {
  let basePage = new BasePage();
  let zoningPage = new ZoningPage();

  await basePage.verifyBuildingSearchFunctionality(t);
  await zoningPage.verifyTopicZoning(t);
});
