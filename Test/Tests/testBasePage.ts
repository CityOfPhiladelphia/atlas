import BasePage from "../Pages/BasePage";

require("dotenv").config();

fixture`page landing verification`.page(`${process.env.TEST_URL}`);

test("page landing verification", async (t: TestController) => {
  let basePage = new BasePage();
  await basePage.verifyPageFunctionality(t);
});
