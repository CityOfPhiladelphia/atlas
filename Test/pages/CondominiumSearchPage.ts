import { Selector, ClientFunction } from "testcafe";
import { condoAddressData } from "../helpers/searchData";


const getTopicsTablesData = ClientFunction(() => {
  return Array.from(document.querySelectorAll("table")).map(
    table => table.textContent
  );
});
export default class CondominiumsPage {

  searchBar: Selector = Selector("input[placeholder='Search the map']");
  searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']"
  );
  deeds: Selector = Selector("div:nth-child(2) > .topic-header");
  licensesInspections: Selector = Selector("div:nth-child(3) > .topic-header");
  zoning: Selector = Selector("div:nth-child(4) > .topic-header");
  voting: Selector = Selector("div:nth-child(5) > .topic-header");
  nearby: Selector = Selector("div:nth-child(6) > .topic-header");
  condominiums: Selector = Selector("div:nth-child(2) > .topic-header");
  table: Selector = Selector("#condoList").with({ visibilityCheck: true });
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
    const tableSelected = await this.table;
    await t.click(await this.deeds);
    await t
      .expect(tableSelected.textContent)
      .contains(condoAddressData.parcelId);
  };

  verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.click(await this.licensesInspections);
    const tables = await getTopicsTablesData();
    await t.expect(tables.length).eql(5);
  };

  verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    const tableSelected = await Selector("table");
    await t
      .expect(tableSelected.textContent)
      .eql(condoAddressData.parcelDescription);
  };

  verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    const votingTables = await getTopicsTablesData();
    await t.expect(votingTables.length).eql(2);
  };
  
  verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    const nearbyTables = await getTopicsTablesData();
    await t.expect(nearbyTables.length).eql(4);
  };
}


