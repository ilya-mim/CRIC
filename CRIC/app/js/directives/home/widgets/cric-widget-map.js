(function (ng, app) {

    "use strict";

    app.directive('cricWidgetMap',
        ["$location", "_", "RequestContext", "MapService",
        function ($location, _, RequestContext, MapService) {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/map.html",
            link: function (scope, element, attrs) {
                scope.isLoading = true;

                function getLayers(config) {
                    var layers = [];
                    for (var i = 0; i < config.layers.length; i++) {
                        var layer = config.layers[i];
                        layers.push(new esri.layers.ArcGISDynamicMapServiceLayer(layer.url, {
                            id: layer.id,
                            opacity: layer.opacity
                        }));
                    }
                    return layers;
                }

                function applyRemoteData(config) {
                    scope.basemap = new esri.layers.ArcGISTiledMapServiceLayer(config.basemap);
                    scope.layers = getLayers(config);
                    scope.options = _.merge(config.options, {
                        extent: new esri.geometry.Extent(scope.actionContext.extent || config.initialExtent),
                        scale: (scope.actionContext.scale || config.options.scale)
                    });
                }

                function loadRemoteData() {
                    scope.isLoading = true;
                    MapService.getConfig().then(
                        function (response) {
                            applyRemoteData(response);
                            scope.isLoading = false;
                        }
                    );
                }

                scope.$on('onClick', function (event, args) {
                    scope.$apply(function () {
                        RequestContext.setActionContext("home.map",
                            _.extend(RequestContext.getActionContext("home.map"), {
                                extent: MapService.getMap().extent.toJson(),
                                scale: MapService.getMap().getScale()
                            }));
                    });
                    $location.path("/home/map/toc");
                    scope.$apply();
                });

                scope.$on('$destroy', function () {
                    RequestContext.setActionContext("home.dashboard.map", {
                        extent: MapService.getMap().extent.toJson(),
                        scale: MapService.getMap().getScale()
                    });
                });

                scope.actionContext = RequestContext.getActionContext("home.dashboard.map");

                loadRemoteData();
            }
        };
    }]);

})(angular, Cric);