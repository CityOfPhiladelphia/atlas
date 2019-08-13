import BasePage from "../Pages/BasePage";
import PropertyAssessmentPage from "../Pages/PropertyAssessmentPage";

require("dotenv").config();

fixture` Property Page verification`.page(`${process.env.TEST_URL}`);
let basePage = new BasePage();
let propertyAssessmentPage = new PropertyAssessmentPage();

test("Property page verification", async (t: TestController) => {
  await basePage.verifyBuildingSearchFunctionality(t);
  await propertyAssessmentPage.verifyTopicPropertyAssesment(t);
});
