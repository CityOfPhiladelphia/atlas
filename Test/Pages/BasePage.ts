import { Selector } from "testcafe";
import { condoAddressData, buildingAddressData } from "../helpers/searchData";

export default class BasePage {
  pageTitle: Selector = Selector(".page-title");
  feedbackButton: Selector = Selector(".inline-list a");
  pageGreetings: Selector = Selector(".greeting");
  stateImageButton: Selector = Selector(".state-unnamed-state > .button-image");
  leafLetImageButton: Selector = Selector(
    ".leaflet-bar:nth-child(2) .button-image"
  );
  cycloMediaImageButton: Selector = Selector(
    ".cyclomedia-button .button-image"
  );
  searchBar: Selector = Selector("input[placeholder='Search the map']");
  searchControlButton: Selector = Selector(
    "button[name='pvm-search-control-button']"
  );

  //Verify page landing
  verifyPageFunctionality = async (t: TestController) => {
    await t.expect(this.pageTitle.visible).ok();
    await t.expect(this.feedbackButton.visible).ok();
    await t.expect(this.pageGreetings.visible).ok();
    await t.expect(this.stateImageButton.visible).ok();
    await t.expect(this.leafLetImageButton.visible).ok();
    await t.expect(this.cycloMediaImageButton.visible).ok();
  };
  verifyBuildingSearchFunctionality = async (t: TestController) => {
    await t.typeText(await this.searchBar, buildingAddressData.address);
    await t.click(await this.searchControlButton);
  };
  verifyCondoSearchFunctionality = async (t: TestController) => {
    await t.typeText(await this.searchBar, condoAddressData.address);
    await t.click(await this.searchControlButton);
  };
}
