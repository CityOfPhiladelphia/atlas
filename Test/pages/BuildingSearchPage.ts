import { Selector, ClientFunction } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

const getTopicData = ClientFunction(() => {
  return document.querySelector("table").textContent;
});

//code might be useful in the future

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
  searchBar: Selector = Selector("input[placeholder='Search the map']");
  searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']"
  );
  propertyAssessment: Selector = Selector('a[data-topic-key="property"]')
  deeds: Selector = Selector('a[data-topic-key="deeds"]')
  licensesInspections: Selector = Selector('a[data-topic-key="li"]')
  zoning: Selector = Selector('a[data-topic-key="zoning"]')
  voting: Selector = Selector('a[data-topic-key="voting"]')
  nearby: Selector = Selector('a[data-topic-key="nearby"]')
  condominiums: Selector = Selector('a[data-topic-key="condos"]')
  table: Selector = Selector("table").with({ visibilityCheck: true });

  //Verify search functionality
  verifySearchFunctionality = async (t: TestController) => {
    await t.typeText(await this.searchBar, buildingAddressData.address);
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
  };

  verifyTopicDeeds = async (t: TestController) => {
    await t.click(await this.deeds);
    const tableSelected = await this.table;
    await t
      .expect(tableSelected.textContent)
      .contains(buildingAddressData.parcelId);
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
      .eql(buildingAddressData.parcelDescription);
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
