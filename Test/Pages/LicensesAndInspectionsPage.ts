import { Selector, ClientFunction } from "testcafe";

const getTopicsTablesData = ClientFunction(() => {
  return Array.from(document.querySelectorAll("table")).map(
    table => table.textContent
  );
});

export default class LicensesAndInspectionsPage {
  licensesInspections: Selector = Selector("div:nth-child(3) > .topic-header");
  verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.click(await this.licensesInspections);
    const tables = await getTopicsTablesData();
    await t.expect(tables.length).eql(5);
  };
}
