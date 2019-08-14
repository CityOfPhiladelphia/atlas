import { Selector, ClientFunction } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";


export default class DeedsPage {
  deeds: Selector = Selector("div:nth-child(2) > .topic-header");
  table: Selector = Selector("table").with({ visibilityCheck: true });

  verifyTopicDeeds = async (t: TestController) => {
    const tableSelected = await this.table;
    await t.click(await this.deeds);
    await t.expect(tableSelected.textContent).contains(buildingAddressData.parcelId);
  };
}
