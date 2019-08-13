import BasePage from "../Pages/BasePage";
import VotingPage from "../Pages/VotingPage";

require("dotenv").config();

fixture`Voting page verification`.page(`${process.env.TEST_URL}`);

test("Voting page verification", async (t: TestController) => {
  let basePage = new BasePage();
  let votingPage = new VotingPage();

  await basePage.verifyBuildingSearchFunctionality(t);
  await votingPage.verifyTopicVoting(t);
});
