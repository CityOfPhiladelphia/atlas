export default {
  pwd: {
    multipleAllowed: false,
    geocodeFailAttemptParcel: null,
    clearStateOnError: false,
    wipeOutOtherParcelsOnReverseGeocodeOnly: true,
    geocodeField: 'PARCELID',
    parcelIdInGeocoder: 'pwd_parcel_id',
    getByLatLngIfIdFails: false
  },
  dor: {
    multipleAllowed: true,
    geocodeFailAttemptParcel: 'pwd',
    clearStateOnError: true,
    wipeOutOtherParcelsOnReverseGeocodeOnly: false,
    geocodeField: 'MAPREG',
    parcelIdInGeocoder: 'dor_parcel_id',
    getByLatLngIfIdFails: true
  }
}
