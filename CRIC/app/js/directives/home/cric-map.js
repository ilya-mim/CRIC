(function (ng, app) {

    "use strict";

    app.directive('cricMap', ["MapService",
        function (MapService) {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$on('$destroy', function () {
                        MapService.getMap().destroy();
                    });

                    function createMap() {
                        element.attr("id", "mapDiv_" + new Date().getMilliseconds())
                        //scope.tocid = attrs.id + "_" + new Date().getMilliseconds();

                        var map = new esri.Map(element.attr("id"), scope.options);
                        map.addLayer(scope.basemap);

                        dojo.connect(map, "onLayersAddResult", function (results) {
                            var scalebar = new esri.dijit.Scalebar({
                                map: map,
                                scalebarUnit: "english"
                            });
                            dojo.connect(map, "onClick", function (evt) {
                                scope.$emit("onClick", evt);
                            });
                            scope.$emit("onLayersAddResult");
                        });

                        if (attrs.tooltip) {
                            var tooltip = dojo.create("div", {
                                "class": "tooltip",
                                "innerHTML": attrs.tooltip
                            }, map.container);
                            dojo.style(tooltip, "position", "fixed");
                            dojo.style(tooltip, "display", "none");

                            dojo.connect(map, "onMouseMove", function (evt) {
                                var px, py;
                                if (evt.clientX || evt.pageY) {
                                    px = evt.clientX;
                                    py = evt.clientY;
                                } else {
                                    px = evt.clientX + dojo.body().scrollLeft - dojo.body().clientLeft;
                                    py = evt.clientY + dojo.body().scrollTop - dojo.body().clientTop;
                                }

                                tooltip.style.display = "none";
                                dojo.style(tooltip, { left: (px + 15) + "px", top: (py) + "px" });
                                tooltip.style.display = "";
                            });

                            dojo.connect(map, "onMouseOut", function (evt) {
                                tooltip.style.display = "none";
                            });
                        }

                        map.addLayers(scope.layers);

                        MapService.setMap(map);
                    }

                    scope.$watch("isLoading", function (newValue, oldValue) {
                        if (newValue === false) {
                            createMap();
                        }
                    });
                }
            }
    }]);

})(angular, Cric);