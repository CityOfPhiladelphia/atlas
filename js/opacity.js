/*
        Leaflet.OpacityControls, a plugin for adjusting the opacity of a Leaflet map.
        (c) 2013, Jared Dominguez
        (c) 2013, LizardTech

        https://github.com/lizardtechblog/Leaflet.OpacityControls
*/

//Create a jquery-ui slider with values from 0 to 100. Match the opacity value to the slider value divided by 100.
L.Control.opacitySlider = L.Control.extend({
    options: {
        position: 'topleft',
        opacity: null,
    },
    initialize: function (options) {
      L.Util.setOptions(this, options);
      var layerName = options.layerName,
          layer = app.state.map.mapServices[layerName];
      this._layer = layer;
    },
    onAdd: function (map, options) {
      // console.warn('adding slider')
      var curOpacity = app.state.map.opacitySliders[this._layer.options.name].options.opacity,
          defaultOpacity = app.config.map.opacitySliders[this._layer.options.name].defaultOpacity;

      // check for falsy curOpacity
      if (curOpacity !== 0 && !curOpacity) {
      //if (!curOpacity) {
         app.state.map.opacitySliders[this._layer.options.name].options.opacity = defaultOpacity;
      }
      var opacity_slider_div = L.DomUtil.create('div', 'opacity_slider_control'),
          startOpacity = app.state.map.opacitySliders[this._layer.options.name].options.opacity || 0.0,
          startOpacityPercent = startOpacity * 100;

      $(opacity_slider_div).slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: startOpacityPercent,
        step: 10,
        start: function (event, ui) {
          //When moving the slider, disable panning.
          map.dragging.disable();
          map.once('mouseup', function (e) {
            map.dragging.enable();
          });
        },
        slide: function (event, ui) {
          var val = ui.value / 100;
          this._layer.setOpacity(val);
          app.state.map.opacitySliders[this._layer.options.name].options.opacity = val;
        }.bind(this)
      });

      $('.ui-slider-range').css({
        height: startOpacityPercent + '%',
      });
      $('.ui-slider-handle').css({
        height: startOpacityPercent + '%',
      });

      return opacity_slider_div;
    }
});
