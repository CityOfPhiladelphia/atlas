import { ClientFunction, Selector } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

const getTopicData = ClientFunction(() => {
  return document.querySelector("table").textContent;
});

// code might be useful in the future

// const getTopicsTablesData = ClientFunction(() => {
//   return Array.from(document.querySelectorAll("table")).map(
//     table => table.textContent
//   );
// });

// const getTopicsTablesData = async () => {
//   var topicsTablePromise: Selector = Selector("table").with({ visibilityCheck: true });
//   var topicsTableCount = await topicsTablePromise.count;

//   let tablesContent = [];

//   for (let i = 0; i < topicsTableCount; i++) {
//     const elementSelector = topicsTablePromise.nth(i);
//     const element = await elementSelector();
//     console.log(element);
//     tablesContent.push(element.textContent);
//   }
//   return tablesContent;
// };

export default class SearchPage {
  public searchBar: Selector = Selector("input[placeholder='Search the map']");
  public searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']" );
  public propertyAssessment: Selector = Selector(
    'a[data-topic-key="property"]');
  public deeds: Selector = Selector('a[data-topic-key="deeds"]');
  public licensesInspections: Selector = Selector('a[data-topic-key="li"]');
  public zoning: Selector = Selector('a[data-topic-key="zoning"]');
  public voting: Selector = Selector('a[data-topic-key="voting"]');
  public nearby: Selector = Selector('a[data-topic-key="nearby"]');
  public condominiums: Selector = Selector('a[data-topic-key="condos"]');
  public table: Selector = Selector("table").with({ visibilityCheck: true });
  public tableText: Selector = Selector("p:nth-child(1)");

  // Verify search functionality
  public verifySearchFunctionality = async (t: TestController) => {
    await t.typeText(await this.searchBar, buildingAddressData.address);
    await t.click(await this.searchControlButton);
    await t.expect(await this.propertyAssessment.visible).ok();
    await t.expect(await this.deeds.visible).ok();
    await t.expect(await this.licensesInspections.visible).ok();
    await await t.expect(await this.zoning.visible).ok();
    await t.expect(await this.voting.visible).ok();
    await t.expect(await this.nearby.visible).ok();
  }

  public verifyTopicPropertyAssesment = async (t: TestController) => {
    const tableSelected = await this.table.with({ visibilityCheck: true });
    await t
      .expect(tableSelected.textContent)
      .contains(buildingAddressData.opaAccount);
    await t
      .expect(tableSelected.textContent)
      .contains(buildingAddressData.opaAccountValue);
    await t
      .expect(tableSelected.textContent)
      .contains(buildingAddressData.opaAddress);
    await t
      .expect(tableSelected.textContent)
      .contains(buildingAddressData.opaAddressValue);
  }

  public verifyTopicDeeds = async (t: TestController) => {
    await t.click(await this.deeds);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .contains(buildingAddressData.parcelId);
  }

  public verifyTopicLicensesAndInspection = async (t: TestController) => {
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
      .eql(buildingAddressData.parcelDescription);
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
