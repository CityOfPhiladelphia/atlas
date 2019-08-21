import "dotenv/config";
import BasePage from "../pages/BasePage";

fixture`page landing verification`.page(`${process.env.TEST_URL}`);

test("page landing verification", async (t: TestController) => {
  const basePage = new BasePage();
  await basePage.verifyPageFunctionality(t);
});
