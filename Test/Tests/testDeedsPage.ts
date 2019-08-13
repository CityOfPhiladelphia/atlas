import BasePage from "../Pages/BasePage";
import DeedsPage from "../Pages/DeedsPage";

require("dotenv").config();

fixture`Deeds page verification`.page(`${process.env.TEST_URL}`);

test("Deeds page verification", async (t: TestController) => {
  let basePage = new BasePage();
  let deedsPage = new DeedsPage();

  await basePage.verifyBuildingSearchFunctionality(t);
  await deedsPage.verifyTopicDeeds(t);
});
