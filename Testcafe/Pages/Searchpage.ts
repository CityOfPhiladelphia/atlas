import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';
import { validData } from '../helpers/searchData';

const getTopicData = ClientFunction(() => {
    return document.querySelector('table').textContent;
});

const getTopicsTablesData = ClientFunction(() => {
   return Array.from(document.querySelectorAll('table')).map(table => table.textContent);
});


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

verifytopicPropertyAssesmentFunctionality = async (
    t: TestController,
) => {
    const tableString = getTopicData();
    await t.expect(tableString).contains("OPA Account #")
    await t.expect(tableString).contains("883309050")
    await t.expect(tableString).contains("OPA Address")
    await t.expect(tableString).contains("1234 MARKET ST")
    }

verifytopicDeedsFuctionality = async(
    t: TestController,
 ) => {
    const parcelstring = getTopicData();
    await t.click(await this.Deeds)
    await t.expect(parcelstring).contains("001S070144")
    }

verifytopicLicensesandInspectionFuctionality = async(
        t: TestController,
     ) => {
      
     await t.click(await this.LicensesInspections);
     const tables = await getTopicsTablesData();
     await t.expect(tables.length).eql(5);  
    }

verifyZoningFuctionality = async(
    t: TestController,
    ) => {  

    await t.click(await this.Zoning)
    const parcelstring = await getTopicData();
    await t
    .expect(parcelstring).eql("CMX-5CMX-5Center City Core Commercial Mixed-UseCenter City Core Commercial Mixed-Use")
    }

verifyVotingFuctionality = async(
    t: TestController,
    ) => {

    await t.click(await this.Voting)
    const votingstringtables = await getTopicsTablesData();
    await t.expect(votingstringtables.length).eql(2);     
    }
    
 verifyNearbyFuctionality = async(
    t: TestController,
    ) => {

    await t.click(await this.Nearby)
    const votingstringtables = await getTopicsTablesData();
    await t.expect(votingstringtables.length).eql(4);
    }
}
