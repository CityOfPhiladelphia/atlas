import { Selector, ClientFunction } from "testcafe";
import { condoAddressData } from "../helpers/searchData";


// const getTopicsTablesData = ClientFunction(() => {
//   return Array.from(document.querySelectorAll("table")).map(
//     table => table.textContent
//   );
// });
export default class CondominiumsPage {

  searchBar: Selector = Selector("input[placeholder='Search the map']");
  searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']"
  );
  deeds: Selector = Selector('a[data-topic-key="deeds"]')
  licensesInspections: Selector = Selector('a[data-topic-key="li"]')
  zoning: Selector = Selector('a[data-topic-key="zoning"]')
  voting: Selector = Selector('a[data-topic-key="voting"]')
  nearby: Selector = Selector('a[data-topic-key="nearby"]')
  condominiums: Selector = Selector('a[data-topic-key="condos"]')
  table: Selector = Selector("table").with({ visibilityCheck: true });
  verifyTopicCondominiums = async (t: TestController) => {
    await t.typeText(await this.searchBar, condoAddressData.address);
    await t.click(await this.searchControlButton);
    await t.click(await this.condominiums);
    const tableSelected = await Selector("table");
    await t
      .expect(tableSelected.textContent)
      .contains(condoAddressData.opaAccount);
    await t
      .expect(tableSelected.textContent)
      .contains(condoAddressData.opaAccountValue);
    await t
      .expect(tableSelected.textContent)
      .contains(condoAddressData.opaAddress);
    await t
      .expect(tableSelected.textContent)
      .contains(condoAddressData.opaAddressValue);
  };
  verifyTopicDeeds = async (t: TestController) => {
    await t.click(await this.deeds);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .contains(condoAddressData.parcelId);
  };

  verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.click(await this.licensesInspections);
    const tables = await this.table.count;
    await t.expect(tables).eql(5);
  };

  verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .eql(condoAddressData.parcelDescription);
  };

  verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    const votingTables = await this.table.count;
    await t.expect(votingTables).eql(2);
  };
  
  verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    const nearbyTables = await this.table.count;
    await t.expect(nearbyTables).eql(4);
  };
}


