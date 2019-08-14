import { Selector } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

export default class PropertyAssessmentPage {
  table: Selector = Selector("table").with({ visibilityCheck: true });
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
}
