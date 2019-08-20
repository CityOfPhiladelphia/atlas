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
  yearSelect: Selector = Selector("#year-select");
  picoMetry: Selector = Selector("#pictometry-ipa");
  timeTravelToggle: Selector = Selector(".timetravelToggle");

  //Verify page landing
  verifyPageFunctionality = async (t: TestController) => {
    await t.expect(this.pageTitle.visible).ok();
    await t.expect(this.feedbackButton.visible).ok();
    await t.expect(this.pageGreetings.visible).ok();
    await t.click(this.stateImageButton);
    await t.expect(this.yearSelect.visible).ok();
    await t.expect(this.leafLetImageButton.visible).ok();
    await t.expect(this.cycloMediaImageButton.visible).ok();
  };
}
