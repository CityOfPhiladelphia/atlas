APP = (function () {
    var map;
    
    return {
        init: function () {
            var CITY_HALL = [39.952388, -75.163596];
            map = L.map('map', {
               zoomControl: false,
            //   measureControl: true,
            });
            map.setView(CITY_HALL, 16);
            
            // Basemaps
            var baseMapLight = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer"
                // url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer"
            });
            var baseMapDark = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer"
            });
            var baseMapImagery2015 = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer"
            });
            baseMapLight.addTo(map);
            
            // Overlays
            var overlayZoning = L.esri.tiledMapLayer({
                url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer'
            });
            var overlayPwdParcels = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0'
            });
            
            var baseLayers = {
                'Light':        baseMapLight,
                'Dark':         baseMapDark,
                'Imagery 2015': baseMapImagery2015,
            };
            var overlays = {
                'Zoning':       overlayZoning,
                'PWD Parcels':  overlayPwdParcels,
                // 'Land Use': landUse,
            };
            
            // Controls
            L.control.layers(baseLayers, overlays, {position: 'topright'}).addTo(map);
            var measureControl = new L.Control.Measure({position: 'topright'});
            measureControl.addTo(map);
            new L.Control.Zoom({position: 'topright'}).addTo(map);
            
            // TEMP: just for mockup. Listen for clicks on data row link.
            $('.data-row-link').click(function (e) {
                e.preventDefault()
                $dataRow = $(this).next();
                $('.data-row:visible').slideUp(350)
                if (!$dataRow.is(':visible')) $(this).next().slideDown(350)
            });
            
            // Make ext links open in new window
            $('a').each(function() {
               var a = new RegExp('/' + window.location.host + '/');
               if(!a.test(this.href)) {
                   $(this).click(function(event) {
                       event.preventDefault();
                       event.stopPropagation();
                       window.open(this.href, '_blank');
                   });
               }
            });
        },
    };
})();

$(function () {
    APP.init();
});


// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw