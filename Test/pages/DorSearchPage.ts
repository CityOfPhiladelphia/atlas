import { Selector, ClientFunction } from "testcafe";
import { dorAddressData } from "../helpers/searchData";

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
  table: Selector = Selector("table").with({ visibilityCheck: true });
  verifyTopicDeeds = async (t: TestController) => {
    await t.typeText(await this.searchBar, dorAddressData.address);
    await t.click(await this.searchControlButton);
    await t.click(await this.deeds);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .contains(dorAddressData.opaAccount);
    await t
      .expect(tableSelected.textContent)
      .contains(dorAddressData.opaAccountValue);
    await t
      .expect(tableSelected.textContent)
      .contains(dorAddressData.opaAddress);
    await t
      .expect(tableSelected.textContent)
      .contains(dorAddressData.opaAddressValue);
      await t
      .expect(tableSelected.textContent)
      .contains(dorAddressData.parcelId);
  };
 
  verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.click(await this.licensesInspections);
    await t.expect(this.table.exists).ok();
    const tables = await this.table.count;
    await t.expect(tables).eql(5);
  };

  verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    await t.expect(this.table.exists).ok();
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .eql(dorAddressData.parcelDescription);
  };

  verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    await t.expect(this.table.exists).ok();
    const votingTables = await this.table.count;
    await t.expect(votingTables).eql(2);
  };
  
  verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    await t.expect(this.table.exists).ok();
    const nearbyTables = await this.table.count;
    await t.expect(nearbyTables).eql(4);
  };
}

