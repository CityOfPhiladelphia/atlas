export default {
  GATEKEEPER_KEY: '82fe014b6575b8c38b44235580bc8b11',
  ZONING_CODE_MAP: {
    'RSD-1': 'Residential Single Family Detached-1',
    'RSD-2': 'Residential Single Family Detached-2',
    'RSD-3': 'Residential Single Family Detached-3',
    'RSA-1': 'Residential Single Family Attached-1',
    'RSA-2': 'Residential Single Family Attached-2',
    'RSA-3': 'Residential Single Family Attached-3',
    'RSA-4': 'Residential Single Family Attached-4',
    'RSA-5': 'Residential Single Family Attached-5',
    'RTA-1': 'Residential Two-Family Attached-1',
    'RM-1': 'Residential Multi-Family-1',
    'RM-2': 'Residential Multi-Family-2',
    'RM-3': 'Residential Multi-Family-3',
    'RM-4': 'Residential Multi-Family-4',
    'RMX-1': 'Residential Mixed-Use-1',
    'RMX-2': 'Residential Mixed-Use-2',
    'RMX-3': 'Residential (Center City) Mixed-Use-3',
    'CA-1': 'Auto-Oriented Commercial-1',
    'CA-2': 'Auto-Oriented Commercial-2',
    'CMX-1': 'Neighborhood Commercial Mixed-Use-1',
    'CMX-2': 'Neighborhood Commercial Mixed-Use-2',
    'CMX-2.5': 'Neighborhood Commercial Mixed-Use-2.5',
    'CMX-3': 'Community Commercial Mixed-Use',
    'CMX-4': 'Center City Commercial Mixed-Use',
    'CMX-5': 'Center City Core Commercial Mixed-Use',
    'I-1': 'Light Industrial',
    'I-2': 'Medium Industrial',
    'I-3': 'Heavy Industrial',
    'IP': 'Port Industrial',
    'ICMX': 'Industrial Commercial Mixed-Use',
    'IRMX': 'Industrial Residential Mixed-Use',
    'SPENT': 'Commercial Entertainment (Casinos)',
    'SPAIR': 'Airport',
    'SPINS': 'Institutional Development',
    'SPSTA': 'Stadium',
    'SPPOA': 'Recreation',
    'SP-PO-A': 'Recreation',
    'SPPOP': 'Recreation',
  },

  cleanDorAttribute(attr) {
    // console.log('cleanDorAttribute is running with attr', attr);
    // trim leading and trailing whitespace
    var cleanAttr = attr ? String(attr) : '';
    cleanAttr = cleanAttr.replace(/\s+/g, '');

    // return null for zeros and empty strings
    // if (['', '0'].indexOf(cleanAttr) > -1) {
    //   return null;
    // }

    // return empty for zeros and null
    if ([null, '0'].indexOf(cleanAttr) > -1) {
      return '';
    }

    // console.log('cleanDorAttribute cleanAttr result:', cleanAttr);
    return cleanAttr;
  },

  // TODO put this in base config transforms
  concatDorAddress(parcel, includeUnit) {
    includeUnit = !!includeUnit;
    var STREET_FIELDS = ['STDIR', 'STNAM', 'STDES', 'STDESSUF'];
    var props = parcel.properties;

    // handle house num
    var addressLow = this.cleanDorAttribute(props.HOUSE);
    var addressHigh = this.cleanDorAttribute(props.STEX);
    // maybe should be props.SUF below (it said props.SUFFIX)
    var addressSuffix = this.cleanDorAttribute(props.SUF);
    var address = addressLow;
    address = address + (addressHigh ? '-' + addressHigh : '');
    address = address + (addressSuffix || '');

    // handle unit
    var unit = this.cleanDorAttribute(props.UNIT);
    if (unit) unit = '# ' + unit;

    // clean up attributes
    var comps = STREET_FIELDS.map(function(streetField) {
      return props[streetField];
    });
    comps = comps.map(this.cleanDorAttribute);
        // TODO handle individual address comps (like mapping stex=2 => 1/2)
        // addressLow = comps.HOUSE,
        // addressHigh = comps.STEX,
        // streetPredir = comps.STDIR,
        // streetName = comps.STNAM,
        // streetSuffix = comps.STDES,
        // streetPostdir = comps.STDESSUF,

    // add address to front
    comps = [address].concat(comps);

    // add unit to end
    if (includeUnit) comps = comps.concat([unit]);

    // remove nulls and concat
    address = comps.filter(Boolean).join(' ');

    // console.log('concatDorAddress address result:', address);
    if (address === '') {
      address = 'Parcel has no address';
    }
    return address;
  },

  getVacancyText(state) {
    var land = state.sources.vacantLand.data
    var building = state.sources.vacantBuilding.data
    if (land.length === 0 && building.length === 0) {
      return 'Not Likely Vacant'
    } else if (land.length > 0) {
      return 'Likely Vacant Land'
    } else if (building.length > 0) {
      return 'Likely Vacant Building'
    }
  }
}
