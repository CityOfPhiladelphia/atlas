
class searchData{

    address: string;
    constructor(param: searchData = {} as searchData){
        let{
            address,
        } = param;
        
        this.address = address as string;
    }
}
    // enter the search data.
    export const validUser: searchData = {
        address: '1234Market',
          };

