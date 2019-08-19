import BasePage from "../pages/BasePage";

require("dotenv").config();

fixture`page landing verification`.page(`http://127.0.0.1:8080`);

test("page landing verification", async (t: TestController) => {
  let basePage = new BasePage();
  await basePage.verifyPageFunctionality(t);
});
