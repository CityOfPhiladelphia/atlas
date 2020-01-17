export default {
  pwd: {
    multipleAllowed: false,
    mapregStuff: false,
    geocodeFailAttemptParcel: null,
    wipeOutOtherParcelsOnReverseGeocodeOnly: true,
    geocodeField: 'PARCELID',
    parcelIdInGeocoder: 'pwd_parcel_id',
    getByLatLngIfIdFails: false,
  },
  dor: {
    multipleAllowed: true,
    mapregStuff: true,
    geocodeFailAttemptParcel: 'pwd',
    wipeOutOtherParcelsOnReverseGeocodeOnly: false,
    geocodeField: 'MAPREG',
    parcelIdInGeocoder: 'dor_parcel_id',
    getByLatLngIfIdFails: true,
  },
};
