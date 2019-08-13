import { Selector, ClientFunction } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

const getTopicsTablesData = ClientFunction(() => {
  return Array.from(document.querySelectorAll("table")).map(
    table => table.textContent
  );
});

export default class NearbyPage {
  nearby: Selector = Selector("div:nth-child(6) > .topic-header");

  verifyTopicNearby = async (t: TestController) => {
    await t.click(await this.nearby);
    const nearbyTables = await getTopicsTablesData();
    await t.expect(nearbyTables.length).eql(4);
  };
}
