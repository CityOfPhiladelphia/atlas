class SearchData {
  public address: string;
  public opaAddress: string;
  public opaAccount: string;
  public opaAddressValue: string;
  public opaAccountValue: string;
  public parcelId: string;
  public parcelDescription: string;

  constructor(parameters: SearchData = {} as SearchData) {
    const {
      address,
      opaAddress,
      opaAccount,
      opaAccountValue,
      opaAddressValue,
      parcelId,
      parcelDescription,
    } = parameters;

    this.address = address as string;
    this.opaAddress = opaAddress as string;
    this.opaAccount = opaAccount as string;
    this.opaAccountValue = opaAccountValue as string;
    this.opaAddressValue = opaAddressValue as string;
    this.parcelId = parcelId as string;
    this.parcelDescription = parcelDescription as string;
  }
}

// enter the search data of Market Address.
export const buildingAddressData: SearchData = {
  address: "1234Market",
  opaAddress: "OPA Address",
  opaAccount: "OPA Account #",
  opaAccountValue: "883309050",
  opaAddressValue: "1234 MARKET ST",
  parcelId: "001S070144",
  parcelDescription:
    "CMX-5CMX-5Center City Core Commercial Mixed-UseCenter City Core Commercial Mixed-Use",
};

// enter the search data of condominium Address.
export const condoAddressData: SearchData = {
  address: "220 W WASHINGTON SQ",
  opaAddress: "Address",
  opaAccount: "OPA Account #",
  opaAccountValue: "888057400",
  opaAddressValue: "220 W WASHINGTON SQ APT 100220 W WASHINGTON SQ APT 100",
  parcelId: "002S100096",
  parcelDescription:
    "RM-4RM-4Residential Multi-Family-4Residential Multi-Family-4",
    // "CMX-4CMX-4Center City Commercial Mixed-UseCenter City Commercial Mixed-Use",
};

// enter the search data of PwdNoDor Address.
export const pwdAddressData: SearchData = {
  address: "5036 HAWTHORNE ST",
  opaAddress: "Address",
  opaAccount: "OPA Account #",
  opaAccountValue: "622250305",
  opaAddressValue: "5032-36 HAWTHORNE ST",
  parcelId: "089N040106",
  parcelDescription:
    "RSA-5RSA-5Residential Single Family Attached-5Residential Single Family Attached-5",
};

// enter the search data of DorNoPwd Address.
export const dorAddressData: SearchData = {
  address: "5669 chestnut st",
  opaAddress: "Parcel Address",
  opaAccount: "Map Registry #",
  opaAccountValue: "018S030074",
  opaAddressValue: "5627-99 CHESTNUT ST",
  parcelId: "018S030074",
  parcelDescription:
    "CA-2CA-2Auto-Oriented Commercial-2Auto-Oriented Commercial-2",
};
