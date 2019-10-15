export default {
  pwd: {
    multipleAllowed: false,
    geocodeFailAttemptParcel: null,
    wipeOutOtherParcelsOnReverseGeocodeOnly: true,
    geocodeField: 'PARCELID',
    parcelIdInGeocoder: 'pwd_parcel_id',
    getByLatLngIfIdFails: false,
  },
  dor: {
    multipleAllowed: true,
    geocodeFailAttemptParcel: 'pwd',
    wipeOutOtherParcelsOnReverseGeocodeOnly: false,
    geocodeField: 'MAPREG',
    parcelIdInGeocoder: 'dor_parcel_id',
    getByLatLngIfIdFails: true,
  },
};
