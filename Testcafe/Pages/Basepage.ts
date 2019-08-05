import { Selector } from 'testcafe';

export default class BasePage{
Pagetitle: Selector = Selector('.page-title');
FeedbackButton: Selector = Selector('.inline-list a');
pageGreetings: Selector = Selector('.greeting');

//Verify page landing
verifypageFunctionality = async (
    t: TestController,
) => {
    await t.expect(this.Pagetitle.visible)
    .ok()
    await t.expect(this.FeedbackButton.visible)
    .ok()
    await t.expect(this.pageGreetings.visible)
    .ok()
     };
}