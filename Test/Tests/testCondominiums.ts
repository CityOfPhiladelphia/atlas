import BasePage from "../Pages/BasePage";
import CondominiumsPage from "../Pages/CondominiumsPage";

require("dotenv").config();

fixture` Condominums Topic verification`.page(`${process.env.TEST_URL}`);
let basePage = new BasePage();
let condominiumsPage = new CondominiumsPage();

test("Condominums Topic verification", async (t: TestController) => {
  await basePage.verifyCondoSearchFunctionality(t);
  await condominiumsPage.verifyTopicCondominiums(t);
});
