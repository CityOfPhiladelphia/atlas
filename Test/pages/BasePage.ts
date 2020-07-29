import { Selector } from "testcafe";
import { buildingAddressData, condoAddressData } from "../helpers/searchData";

export default class BasePage {
  public pageTitle: Selector = Selector(".page-title");
  public feedbackButton: Selector = Selector(".inline-list a");
  public pageGreetings: Selector = Selector(".greeting");
  public stateImageButton: Selector = Selector(".top-button-1 .button-image-top");
  // public stateImageButton: Selector = Selector(".state-unnamed-state > .button-image");
  public leafLetImageButton: Selector = Selector(
    ".top-button-2 .button-image-middle"
    // ".leaflet-bar:nth-child(2) .button-image",
  );
  public cycloMediaImageButton: Selector = Selector(
    ".top-button-2 .button-image-middle"
  );
  public yearSelect: Selector = Selector("#year-select");
  public pictoMetry: Selector = Selector("#pictometry-ipa");
  public timeTravelToggle: Selector = Selector(".timetravelToggle");

  // Verify page landing
  public verifyPageFunctionality = async (t: TestController) => {
    await t.expect(this.pageTitle.visible).ok();
    await t.expect(this.feedbackButton.visible).ok();
    await t.expect(this.pageGreetings.visible).ok();
    await t.click(this.stateImageButton);
    await t.expect(this.yearSelect.visible).ok();
    await t.expect(this.leafLetImageButton.visible).ok();
    await t.expect(this.cycloMediaImageButton.visible).ok();
  }
}
