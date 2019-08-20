import { Selector, ClientFunction } from "testcafe";
import { pwdAddressData } from "../helpers/searchData";

export default class SearchPage {
  searchBar: Selector = Selector("input[placeholder='Search the map']");
  searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']"
  );
  propertyAssessment: Selector = Selector('a[data-topic-key="property"]');
  deeds: Selector = Selector('a[data-topic-key="deeds"]');
  licensesInspections: Selector = Selector('a[data-topic-key="li"]').with({
    visibilityCheck: true
  });
  zoning: Selector = Selector('a[data-topic-key="zoning"]');
  voting: Selector = Selector('a[data-topic-key="voting"]');
  nearby: Selector = Selector('a[data-topic-key="nearby"]');
  condominiums: Selector = Selector('a[data-topic-key="condos"]');
  table: Selector = Selector("table").with({ visibilityCheck: true });
  tableText: Selector = Selector("p:nth-child(1)");

  //Verify search functionality
  verifySearchFunctionality = async (t: TestController) => {
    await t.typeText(await this.searchBar, pwdAddressData.address);
    await t.click(await this.searchControlButton);
    await t.expect(await this.propertyAssessment.visible).ok();
    await t.expect(await this.deeds.visible).ok();
    await t.expect(await this.licensesInspections.visible).ok();
    await t.expect(await this.zoning.visible).ok();
    await t.expect(await this.voting.visible).ok();
    await t.expect(await this.nearby.visible).ok();
  };

  verifyTopicPropertyAssesment = async (t: TestController) => {
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .contains(pwdAddressData.opaAccount);
    await t
      .expect(tableSelected.textContent)
      .contains(pwdAddressData.opaAccountValue);
    await t
      .expect(tableSelected.textContent)
      .contains(pwdAddressData.opaAddress);
    await t
      .expect(tableSelected.textContent)
      .contains(pwdAddressData.opaAddressValue);
  };

  verifyTopicDeeds = async (t: TestController) => {
    await t.click(await this.deeds);
    const tableSelected = await this.table;
    await t.expect(tableSelected.textContent).contains(pwdAddressData.parcelId);
  };

  verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.click(await this.licensesInspections);
    await t.click(await this.tableText);
    const tables = await this.table.count;
    await t.expect(tables).eql(5);
  };

  verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .eql(pwdAddressData.parcelDescription);
  };

  verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    await t.click(await this.tableText);
    const votingTables = await this.table.count;
    await t.expect(votingTables).eql(2);
  };

  verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    await t.click(await this.tableText);
    const nearbyTables = await this.table.count;
    await t.expect(nearbyTables).eql(4);
  };
}
