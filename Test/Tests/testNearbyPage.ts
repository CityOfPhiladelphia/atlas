import BasePage from "../Pages/BasePage";
import NearbyPage from "../Pages/NearbyPage";

require("dotenv").config();

fixture`Nearby page verification`.page(`${process.env.TEST_URL}`);

test("Nearby page verification", async (t: TestController) => {
  let basePage = new BasePage();
  let nearbyPage = new NearbyPage();

  await basePage.verifyBuildingSearchFunctionality(t);
  await nearbyPage.verifyTopicNearby(t);
});
