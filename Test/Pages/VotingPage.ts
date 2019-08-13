import { Selector, ClientFunction } from "testcafe";

const getTopicsTablesData = ClientFunction(() => {
  return Array.from(document.querySelectorAll("table")).map(
    table => table.textContent
  );
});

export default class VotingPage {
  voting: Selector = Selector("div:nth-child(5) > .topic-header");

  verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    const votingTables = await getTopicsTablesData();
    await t.expect(votingTables.length).eql(2);
  };
}
