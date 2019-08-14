import CondominiumSearchPage from "../pages/CondominiumSearchPage";

require("dotenv").config();

fixture`Condominiums search page verification`.page(`${process.env.TEST_URL}`);

test("Condominiums search page verification", async (t: TestController) => {
  let condominiumSearchPage = new CondominiumSearchPage();

  await condominiumSearchPage.verifyTopicCondominiums(t);
});
