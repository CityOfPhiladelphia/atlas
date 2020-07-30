export default {
  // water: {
  //   options: {
  //     topics: [ 'water' ],
  //     showWithBaseMapOnly: false,
  //   },
  //   // TODO give these an id instead of using the label as a key
  //   data: {
  //     'Roof': {
  //       'background-color': '#FEFF7F',
  //     },
  //     'Other Impervious Surface': {
  //       'background-color': '#F2DCFF',
  //     },
  //   },
  // },
  deeds: {
    options: {
      topics: [ 'deeds', 'zoning' ],
      showWithBaseMapOnly: true,
      marginBottom: '0px',
      marginRight: '40px',
    },
    data: {
      // TODO give these an id instead of using the label as a key
      'Easements': {
        'border-color': 'rgb(255, 0, 197)',
        'border-style': 'solid',
        'border-weight': '1px',
        'width': '12px',
        'height': '12px',
        'font-size': '10px',
      },
      'Trans Parcels': {
        'border-color': 'rgb(0, 168, 132)',
        'border-style': 'solid',
        'border-weight': '1px',
        'width': '12px',
        'height': '12px',
        'font-size': '10px',
      },
      'Rights of Way': {
        'border-color': 'rgb(249, 147, 0)',
        'border-style': 'solid',
        'border-weight': '1px',
        'width': '12px',
        'height': '12px',
        'font-size': '10px',
      },
    },
  },
};
