(function (ng, app) {

    "use strict";

    app.controller("home.map.tools.query.LocationCtrl", 
        ["$scope", "$rootScope", "$q", "_", "RequestContext", "MapService",
        function ($scope, $rootScope, $q, _, RequestContext, MapService) {
            $scope.isLoading = false;
            $scope.drawEnd = false;

            function applyRemoteData(response) {
                $scope.layers = [];
                var config = $scope.config;
                var scale = MapService.getMap().getScale();
                for (var i = 0; i < config.layers.length; i++) {
                    var layerConfig = config.layers[i];
                    var layer = MapService.getMap().getLayer(layerConfig.id);
                    _.forEach(layer.layerInfos, function (layerInfo) {
                        var isNotGroupLayer = (layerInfo.subLayerIds == null);
                        var isVisibleAtScale =
                            (scale <= layerInfo.minScale && scale >= layerInfo.maxScale) ||
                            (layerInfo.minScale == 0 && layerInfo.maxScale == 0);
                        var layerInfoConfig = _.findWithProperty(
                                layerConfig.layerInfos, "id", layerInfo.id);
                        if (isNotGroupLayer && isVisibleAtScale && layerInfoConfig) {
                            $scope.layers.push({
                                mapid: layerConfig.id,
                                layerid: layerInfo.id,
                                resource: layerInfoConfig.resource,
                                keyname: layerInfoConfig.keyname,
                                name: layerConfig.title + " / " + layerInfo.name,
                                url: layerConfig.url + "/" + layerInfo.id,
                                fields: _.sortBy(_.filter(
                                                    _.findWithProperty(
                                                        _.findWithProperty(
                                                            response, "mapid", layerConfig.id)
                                                                .data.layers, "id", layerInfo.id).fields,
                                                                    function (field) {
                                                                        return _.contains(
                                                                            layerInfoConfig.fields, field.name);
                                                                    }), function (field) {
                                                                        return field.name;
                                                                    })
                            });
                        }
                    });
                }
                if ($scope.layers) {
                    $scope.layers = _.sortBy($scope.layers, function (layer) {
                        return layer.name;
                    });

                    var layerIndex = 0;
                    for (var i = 0; i < $scope.layers.length; i++) {
                        if ($scope.layers[i].layerid == $scope.actionContext.layerid) {
                            layerIndex = i;
                            break;
                        }
                    }
                    $scope.layer = $scope.layers[layerIndex];

                    var queryContext = MapService.getQueryContext()
                    if (queryContext.layer && queryContext.layer.url != $scope.layer.url) {
                        MapService.clearQueryContext();
                    }
                }
            }

            function getMapLayers(config) {
                var promises = [];
                for (var i = 0; i < config.layers.length; i++) {
                    var layer = config.layers[i];
                    promises.push(MapService.getLayers(layer.url, layer.id));
                }
                return $q.all(promises);
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                MapService.waitForLayers($scope).then(
					    function (response) {
					        return MapService.getConfig();
					    },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get map layers. Try refreshing your browser.");
                        }
                    ).then(
					    function (response) {
					        $scope.config = response;
					        return getMapLayers(response);
					    },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load the map configuration. Try refreshing your browser.");
                        }
                    ).then(
                        function (response) {
                            applyRemoteData(response);
                            createToolbar();
                            $scope.isLoading = false;
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load layers information. Try refreshing your browser.");
                        }
                    );
            }

            function createToolbar() {
                $scope.toolbar = new esri.toolbars.Draw(MapService.getMap(), {
                    showTooltips: true
                });
                dojo.connect($scope.toolbar, "onDrawEnd", onDrawEnd);
            }

            function addGraphicToMap(geometry) {
                $scope.toolbar.deactivate();
                $scope.drawEnd = true;

                MapService.enableOnClick();

                var map = MapService.getMap();
                map.showZoomSlider();

                switch (geometry.type) {
                    case "point":
                        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
                        break;
                    case "polyline":
                        var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
                        break;
                    case "polygon":
                        var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                        break;
                    case "extent":
                        var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                        break;
                    case "multipoint":
                        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 1), new dojo.Color([255, 255, 0, 0.5]));
                        break;
                }
                var graphic = new esri.Graphic(geometry, symbol, { type: "query" });
                map.graphics.add(_.extend(graphic, {
                    type: "query"
                }));
            }

            function applyFeaturesData(results, layer) {
                var extent = showResults(results);
                MapService.setQueryContext(results, layer, extent);
            }

            function applyQueryData(results, layer) {
                MapService.getFeaturesData(results, layer)
                    .then(
					    function (response) {
					        applyFeaturesData(response.results, response.layer);
					        $scope.isLoading = false;
					    },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load features data configuration. Try refreshing your browser.");
                        }
                    );
            }

            function executeQuery(geometry) {
                var queryTask = new esri.tasks.QueryTask($scope.layer.url);

                var query = new esri.tasks.Query();
                query.returnGeometry = true;
                query.geometry = geometry;
                query.outFields = ["*"];

                //$scope.$apply(function () {
                    $scope.isLoading = true;
                //});

                queryTask.execute(query,
                    function (results) {
                        //$scope.$apply(function () {
                            applyQueryData(results, ng.copy($scope.layer));
                        //});
                    },
                    function () {
                        //$scope.$apply(function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't execute the query. Try refreshing your browser.");
                        //});
                    });
            }

            function onDrawEnd(geometry) {
                $scope.$apply(function () {
                    addGraphicToMap(geometry);
                    executeQuery(geometry);
                });
            }

            function showResults(results) {
                var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 30, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([0, 255, 0, 0.25]));
                var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
                var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NONE, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));

                var map = MapService.getMap();

                _.forEach(results.features, function (feature) {
                    _.extend(feature, {
                        type: "query"
                    });

                    switch (feature.geometry.type) {
                        case "point":
                            feature.setSymbol(markerSymbol);
                            break;
                        case "polyline":
                            feature.setSymbol(lineSymbol);
                            break;
                        case "polygon":
                            feature.setSymbol(polygonSymbol);
                            break;
                    }
                    map.graphics.add(feature);

                });

                var extent;
                if (results.features.length > 0) {
                    var extent = esri.graphicsExtent(results.features);
                    if (!extent && results.features.length == 1) {
                        var point = results.features[0];
                        extent = new esri.geometry.Extent(point.x - 1, point.y - 1, point.x + 1, point.y + 1, point.spatialReference);
                    }
                    if (extent) {
                        extent = extent.expand(1.12);
                        map.setExtent(extent);
                    }
                }
                return extent;
            }

            function hasQueryResults() {
                var queryContext = MapService.getQueryContext();
                return (typeof queryContext.results != 'undefined' && queryContext.results.features.length > 0);
            }

            $scope.hasQueryGraphics = function () {
                return hasQueryResults() || MapService.hasGraphics(["query", "highlight"]);
            };

            $scope.hasQueryResults = function () {
                return hasQueryResults() ? "" : "disabled";
            };

            $scope.onLayerChange = function (layer) {
                var queryContext = MapService.getQueryContext()
                if (queryContext.layer && queryContext.layer.url != layer.url) {
                    MapService.clearQueryContext();
                }
            }

            $scope.onDrawToolSelected = function (tool) {
                MapService.disableOnClick();
                MapService.getMap().hideZoomSlider();
                $scope.drawEnd = false;
                $scope.toolbar.activate(tool);
            }

            $scope.onClearResults = function () {
                MapService.clearQueryContext();
            }

            $scope.$on('$destroy', function () {
                RequestContext.setActionContext("home.map.tools.query.location", {
                    layerid: $scope.layer.layerid
                });
            });

            $scope.actionContext = RequestContext.getActionContext("home.map.tools.query.location");

            RequestContext.setWindowTitle("Map - Query by Location");

            loadRemoteData();
        }]);

})(angular, Cric);
