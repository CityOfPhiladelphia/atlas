import { Selector } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

export default class ZoningPage {
  zoning: Selector = Selector("div:nth-child(4) > .topic-header");
  table: Selector = Selector("table").with({ visibilityCheck: true });

  verifyTopicZoning = async (t: TestController) => {
    await t.click(await this.zoning);
    const tableSelected = await Selector("table");
    await t
      .expect(tableSelected.textContent)
      .eql(buildingAddressData.parcelDescription);
  };
}
