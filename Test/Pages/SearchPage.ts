import { Selector, ClientFunction } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

const getTopicData = ClientFunction(() => {
  return document.querySelector("table").textContent;
});

const getTopicsTablesData = ClientFunction(() => {
  return Array.from(document.querySelectorAll("table")).map(
    table => table.textContent
  );
});

export default class SearchPage {
  searchBar: Selector = Selector("input[placeholder='Search the map']");
  searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']"
  );
  propertyAssessment: Selector = Selector("div:nth-child(1) > .topic-header");
  deeds: Selector = Selector("div:nth-child(2) > .topic-header");
  parcelAddress: Selector = Selector("tr:nth-child(2) > th");
  licensesInspections: Selector = Selector("div:nth-child(3) > .topic-header");
  zoning: Selector = Selector("div:nth-child(4) > .topic-header");
  voting: Selector = Selector("div:nth-child(5) > .topic-header");
  nearby: Selector = Selector("div:nth-child(6) > .topic-header");

  //Verify search functionality
  verifySearchFunctionality = async (t: TestController) => {
    await t.typeText(await this.searchBar, buildingAddressData.address);
    await t.click(await this.searchControlButton);
    await t.expect(await this.propertyAssessment.visible).ok();
    await t.expect(await this.deeds.visible).ok();
    await t.expect(await this.parcelAddress.visible).ok();
    await t.expect(await this.licensesInspections.visible).ok();
    await t.expect(await this.zoning.visible).ok();
    await t.expect(await this.voting.visible).ok();
    await t.expect(await this.nearby.visible).ok();
  };

  verifyTopicPropertyAssesment = async (t: TestController) => {
    const tableString = getTopicData();
    await t.expect(tableString).contains("OPA Account #");
    await t.expect(tableString).contains("883309050");
    await t.expect(tableString).contains("OPA Address");
    await t.expect(tableString).contains("1234 MARKET ST");
  };

  verifyTopicDeeds = async (t: TestController) => {
    const parcelstring = getTopicData();
    await t.click(await this.deeds);
    await t.expect(parcelstring).contains("001S070144");
  };

  verifyTopicLicensesAndInspection = async (t: TestController) => {
    await t.click(await this.licensesInspections);
    const tables = await getTopicsTablesData();
    await t.expect(tables.length).eql(5);
  };

  verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    const parcelstring = await getTopicData();
    await t
      .expect(parcelstring)
      .eql(
        "CMX-5CMX-5Center City Core Commercial Mixed-UseCenter City Core Commercial Mixed-Use"
      );
  };

  verifyTopicVoting = async (t: TestController) => {
    await t.click(await this.voting);
    const votingstringtables = await getTopicsTablesData();
    await t.expect(votingstringtables.length).eql(2);
  };

  verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    const votingstringtables = await getTopicsTablesData();
    await t.expect(votingstringtables.length).eql(4);
  };
}
