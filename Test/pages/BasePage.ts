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

  //Verify page landing
  verifyPageFunctionality = async (t: TestController) => {
    await t.expect(this.pageTitle.visible).ok();
    await t.expect(this.feedbackButton.visible).ok();
    await t.expect(this.pageGreetings.visible).ok();
    await t.expect(this.stateImageButton.visible).ok();
    await t.expect(this.leafLetImageButton.visible).ok();
    await t.expect(this.cycloMediaImageButton.visible).ok();
  };
}
