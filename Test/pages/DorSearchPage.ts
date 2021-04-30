import { ClientFunction, Selector } from "testcafe";
import { dorAddressData } from "../helpers/searchData";

export default class CondominiumsPage {
  public searchBar: Selector = Selector("input[placeholder='Search the map']");
  public searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']",
  );
  public deeds: Selector = Selector('a[data-topic-key="deeds"]');
  public licensesInspections: Selector = Selector('a[data-topic-key="li"]');
  public zoning: Selector = Selector('a[data-topic-key="zoning"]');
  public voting: Selector = Selector('a[data-topic-key="voting"]');
  public nearby: Selector = Selector('a[data-topic-key="nearby"]');
  public table: Selector = Selector("table").with({ visibilityCheck: true });
  public tableText: Selector = Selector("p:nth-child(1)");
  public verifyTopicDeeds = async (t: TestController) => {
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
    await t.expect(tableSelected.textContent).contains(dorAddressData.parcelId);
  }

  public verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.typeText(await this.searchBar, dorAddressData.address);
    await t.click(await this.searchControlButton)
    await t.click(await this.licensesInspections);
    await t.click(await this.tableText);
    const tables = await this.table.count;
    await t.expect(tables).eql(5);
  }

  public verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .eql(dorAddressData.parcelDescription);
  }

  public verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    await t.click(await this.tableText);
    const votingTables = await this.table.count;
    await t.expect(votingTables).eql(3);
  }

  public verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    await t.click(await this.tableText);
    const nearbyTables = await this.table.count;
    await t.expect(nearbyTables).eql(4);
  }
}
