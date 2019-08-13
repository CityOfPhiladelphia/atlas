import { Selector } from "testcafe";
import { condoAddressData } from "../helpers/searchData";

export default class CondominiumsPage {
  condominiums: Selector = Selector('div:nth-child(2) > .topic-header');
  table: Selector = Selector("#condoList").with({ visibilityCheck: true });
  verifyTopicCondominiums = async (t: TestController) => {
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
}
