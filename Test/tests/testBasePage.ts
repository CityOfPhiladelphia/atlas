import BasePage from "../pages/BasePage";

//require("dotenv").config();

fixture`page landing verification`.page(`http://localhost:8080`);

test("page landing verification", async (t: TestController) => {
  let basePage = new BasePage();
  await basePage.verifyPageFunctionality(t);
});
