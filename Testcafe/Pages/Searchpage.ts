import { Selector } from 'testcafe';
import { validData } from '../helpers/searchData';

export default class SearchPage{
Searchbar: Selector = Selector("input[placeholder='Search the map']");
SearchcontrolButton: Selector = Selector("button[name='pvm-search-control-button']");
Propertyassesment: Selector = Selector('div:nth-child(1) > .topic-header');
OpaAddress: Selector = Selector('tr:nth-child(2) > td');
Deeds: Selector = Selector('div:nth-child(2) > .topic-header');
parcelAddress: Selector= Selector('tr:nth-child(2) > th');
LicensesInspections: Selector = Selector('div:nth-child(3) > .topic-header');
Zoning: Selector = Selector('div:nth-child(4) > .topic-header');
Voting: Selector = Selector('div:nth-child(5) > .topic-header');
Nearby: Selector = Selector('div:nth-child(6) > .topic-header');

//Verify search functionality
verifySearchFunctionality = async (
    t: TestController,
) => {
    await t.typeText(await this.Searchbar, validData.address);
    await t.click(await this.SearchcontrolButton);
    { timeout: 10000 }
    await t.expect(await this.Propertyassesment.visible).ok();
    await t.expect(await this.OpaAddress.visible).ok();
    await t.expect(await this.Deeds.visible).ok();
    await t.expect(await this.parcelAddress.visible).ok();
    await t.expect(await this.LicensesInspections.visible).ok();
    await t.expect(await this.Zoning.visible).ok();
    await t.expect(await this.Voting.visible).ok();
    await t.expect(await this.Nearby.visible).ok();
} 

}