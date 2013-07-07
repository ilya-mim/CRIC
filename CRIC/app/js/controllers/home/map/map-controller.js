(function (ng, app) {

    "use strict";

    app.controller("home.MapCtrl",
        ["$scope", "$rootScope", "$location", "_", "RequestContext", "MapService",
        function ($scope, $rootScope, $location, _, RequestContext, MapService) {
            $scope.isLoading = true;

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
                $scope.basemap = new esri.layers.ArcGISTiledMapServiceLayer(config.basemap);
                $scope.layers = getLayers(config);
                $scope.options = _.merge(config.options, {
                    extent: new esri.geometry.Extent($scope.actionContext.extent || config.initialExtent),
                    scale: $scope.actionContext.scale
                });
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                MapService.getConfig().then(
					function (response) {
					    applyRemoteData(response);
					    $scope.isLoading = false;
					},
                    function () {
                        $scope.isLoading = false;
                        $scope.openModalWindow("error", "For some reason we couldn't load the map configuration. Try refreshing your browser.");
                    }
                );
            }

            function getVisibleLayers() {
                var visibleLayers = [];
                var layers = MapService.getMap().getLayersVisibleAtScale(
                        MapService.getMap().getScale());
                _.forEach(layers, function (layer) {
                    if (layer instanceof esri.layers.ArcGISDynamicMapServiceLayer) {
                        visibleLayers.push({
                            id: layer.id,
                            layers: layer.visibleLayers
                        })
                    }
                });
                return visibleLayers;
            }

            function getGraphics() {
                var graphics = [];
                _.forEach(MapService.getMap().graphics.graphics, function (graphic) {
                    if (graphic.type) {
                        graphics.push(
                            _.extend(graphic.toJson(), {
                                type: graphic.type
                            }));
                    }
                });
                return graphics;
            }

            function setVisibleLayers(visibleLayers) {
                if (visibleLayers) {
                    var layers = MapService.getMap().getLayersVisibleAtScale(
                        MapService.getMap().getScale());
                    _.forEach(layers, function (layer) {
                        var found = _.findWithProperty(visibleLayers, "id", layer.id);
                        if (found) {
                            layer.setVisibleLayers(found.layers);
                        }
                    });
                }
            }

            function setGraphics(graphics) {
                if (graphics) {
                    _.forEach(graphics, function (graphic) {
                        MapService.getMap().graphics.add(
                            _.extend(new esri.Graphic(graphic), { 
                                type: graphic.type }));
                        });
                }
            }

            $scope.$on('onLayersAddResult', function () {
                setVisibleLayers($scope.actionContext.visibleLayers)
                setGraphics($scope.actionContext.graphics);
            });

            $scope.$on('onClick', function (event, args) {
                if (MapService.isOnClick()) {
                    $scope.$apply(function () {
                        MapService.setOnClickEvent(args);
                        $location.path("/home/map/info");
                    });
                    $rootScope.$broadcast("mapOnClick", args);
                }
            });

            $scope.$on(
				"requestContextChanged",
				function () {
				    if (!renderContext.isChangeRelevant()) {
				        return;
				    }
				    $scope.subview = renderContext.getNextSection();
				}
			);

            $scope.$on('$destroy', function () {
                RequestContext.setActionContext("home.map", {
                    extent: MapService.getMap().extent.toJson(),
                    scale: MapService.getMap().getScale(),
                    visibleLayers: getVisibleLayers(),
                    graphics: getGraphics()
                });
            });

            var renderContext = RequestContext.getRenderContext("home.map");
            $scope.actionContext = RequestContext.getActionContext("home.map");
            $scope.subview = renderContext.getNextSection();
            RequestContext.setWindowTitle("Map");

            loadRemoteData();
        }]);

})(angular, Cric);
