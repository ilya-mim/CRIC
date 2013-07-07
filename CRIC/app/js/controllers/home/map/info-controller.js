(function (ng, app) {

    "use strict";

    app.controller("home.map.InfoCtrl",
        ["$scope", "$rootScope", "$http", "$q", "$location", "_", "RequestContext", "MapService",
        function ($scope, $rootScope, $http, $q, $location, _, RequestContext, MapService) {
            $scope.isLoading = false;
            $scope.isDataAvailable = false;
            $scope.idResults = [];
            $scope.idResult = null;
            $scope.point = null;
            $scope.attachments = [];

            function filterByConfig(layer, layerid, fieldname) {
                var layerInfo = _.findWithProperty(layer.layerInfos, "id", layerid);
                if (layerInfo) {
                    return _.contains(layerInfo.fields, fieldname);
                }
                return true;
            }

            function paginateResults(idResults) {
                var pageSize = 10;
                var results = [];
                for (var i = 0; i < idResults.length; i++) {
                    var idResult = idResults[i];
                    var layer = _.findWithProperty($scope.config.layers, "id", idResult.mapid);
                    _.extend(idResult.feature, {
                        type: "info",
                        pages: []
                    });
                    var keys = Object.keys(idResult.feature.attributes);
                    keys.sort();
                    var page = {};
                    for (var j = 0; j < keys.length; j++) {
                        var key = keys[j];
                        if (filterByConfig(layer, idResult.layerId, key)) {
                            page[key] = idResult.feature.attributes[key];
                            if (Object.keys(page).length == pageSize) {
                                idResult.feature.pages.push(page);
                                page = {};
                            }
                        }
                    }
                    if (Object.keys(page).length > 0 && Object.keys(page).length < pageSize) {
                        idResult.feature.pages.push(page);
                    }
                    results.push(idResult);
                }
                return results;
            }

            function showFeature(idResult) {
                if (idResult) {
                    if (idResult.feature.geometry.type == "point") {
                        idResult.feature.setSymbol($scope.markerSymbol);
                    } else {
                        idResult.feature.setSymbol($scope.fillSymbol);
                    }
                    MapService.getMap().graphics.add(idResult.feature);
                }
            }

            function clearIdentifyData() {
                $scope.isDataAvailable = false;
                $scope.idResults = [];
                $scope.idResult = null;
                $scope.point = null;
                $scope.attachments = [];
            }

            function applyAttachments(files) {
                if (files) {
                    $scope.attachments = { pages: paginateAttachments(files) };
                }
            }

            function paginateAttachments(files) {
                var pages = [];
                var pageSize = 4;
                var page = [];
                for (var i = 0; i < files.length; i++) {
                    if (page.length >= pageSize) {
                        pages.push(page);
                        page = [];
                    }
                    page.push({
                        name: files[i],
                        url: getViewerUrl(files[i])
                    });
                }
                if (page.length > 0 && page.length <= pageSize) {
                    pages.push(page);
                }
                return pages;
            }

            function getViewerUrl(filename) {
                var ext = filename.split('.').pop().toLowerCase();
                if (ext == "dwf") {
                    return "#!/home/map/designreview?fileUrl=" + encodeURI(filename);
                } else if (ext == "3ws") {
                    if (window.navigator.appName == "Netscape") {
                        return "#!/home/map/cityengine?fileUrl=" + encodeURI(filename);
                    } else {
                        return "javascript:void window.open('cityengine/viewer.html?3dWebScene=../webscenes/" + encodeURI(filename) + "');";
                    }
                } else {
                    return "javascript:alert('Unsupported file type.')";
                }
            }

            function getVisibleLayers(layer, scale) {
                var visibleLayers = [];
                for (var i = 0; i < layer.visibleLayers.length; i++) {
                    var layerInfo = _.findWithProperty(layer.layerInfos, "id", layer.visibleLayers[i]);
                    var isNotGroupLayer = (layerInfo.subLayerIds == null);
                    var isVisibleAtScale =
                        (scale <= layerInfo.minScale && scale >= layerInfo.maxScale) ||
                        (layerInfo.minScale == 0 && layerInfo.maxScale == 0);
                    if (isNotGroupLayer && isVisibleAtScale) {
                        visibleLayers.push(layer.visibleLayers[i]);
                    }
                }
                return visibleLayers;
            }

            function createIdentifyTask(point, layer) {
                var map = MapService.getMap();
                var scale = map.getScale();

                var identifyParams = new esri.tasks.IdentifyParameters();
                identifyParams.tolerance = 5;
                identifyParams.returnGeometry = true;
                identifyParams.layerIds = getVisibleLayers(map.getLayer(layer.id), scale);
                identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
                identifyParams.width = map.width;
                identifyParams.height = map.height;
                identifyParams.geometry = point;
                identifyParams.mapExtent = map.extent;

                var deferred = $q.defer();
                var identifyTask = new esri.tasks.IdentifyTask(layer.url)
                identifyTask.execute(identifyParams, function (idResults) {
                    $scope.$apply(function () {
                        _.forEach(idResults, function (idResult) {
                            _.extend(idResult, {
                                mapid: layer.id
                            });
                            idResult.layerName = layer.title + " / " + idResult.layerName;
                            var layerInfo = _.findWithProperty(layer.layerInfos, "id", idResult.layerId);
                            if (layerInfo) {
                                _.extend(idResult, {
                                    resource: layerInfo.resource,
                                    keyname: layerInfo.keyname
                                });
                            }
                        });
                        deferred.resolve(idResults);
                    });
                });
                return deferred.promise;
            }

            function executeIdentify(point) {
                var promises = [];
                for (var i = 0; i < $scope.config.layers.length; i++) {
                    promises.push(createIdentifyTask(point, $scope.config.layers[i]));
                }
                return $q.all(promises);
            }

            function getFeatureAttachments(idResult) {
                return MapService.getFeatureAttachments(idResult);
            }

            function paginateFeatureData(data) {
                var pages = [];
                var pageSize = 4;
                var page = {};

                var keys = Object.keys(data);
                keys.sort();

                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    page[key] = data[key];
                    if (Object.keys(page).length == pageSize) {
                        pages.push(page);
                        page = {};
                    }
                }

                if (Object.keys(page).length > 0 && Object.keys(page).length < pageSize) {
                    pages.push(page);
                }
                return pages;
            }

            function applyFeaturesData(idResults) {
                $scope.idResults = paginateResults(idResults);
                var layerIndex = 0;
                for (var i = 0; i < $scope.idResults.length; i++) {
                    if ($scope.idResults[i].layerId == $scope.actionContext.layerid) {
                        layerIndex = i;
                        break;
                    }
                }
                $scope.idResult = $scope.idResults[layerIndex];
            }

            function getData(idResult) {
                var deferred = $q.defer();
                if (idResult.resource) {
                    $http.get(resource).then(
                        function (response) {
                            _.extend(idResult.feature.attributes,
                                _.findWithProperty(response.data, idResult.keyname,
                                    idResult.feature.attributes[idResult.keyname]));
                            deferred.resolve(idResult);
                        },
                        function () {
                            deferred.reject();
                        });
                } else {
                    deferred.resolve(idResult);
                }
                return (deferred.promise);
            }

            function getFeaturesData(idResults) {
                var promises = [];
                for (var i = 0; i < idResults.length; i++) {
                    var idResult = idResults[i];
                    for (var j = 0; j < idResult.length; j++) {
                        promises.push(getData(idResult[j]));
                    }
                }
                return $q.all(promises);
            }

            function loadRemoteData() {
                $scope.fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                $scope.markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 1), new dojo.Color([255, 0, 0, 1]));
                if ($scope.point) {
                    $scope.isLoading = true;
                    MapService.waitForLayers($scope).then(
                            function (response) {
                                return MapService.getConfig();
                            },
                            function () {
                                $scope.isLoading = false;
                                $scope.openModalWindow("error", "For some reason we couldn't get information. Try refreshing your browser.");
                            }
                        ).then(
                            function (response) {
                                $scope.config = response;
                                return executeIdentify($scope.point);
                            },
                            function () {
                                $scope.isLoading = false;
                                $scope.openModalWindow("error", "For some reason we couldn't get map config. Try refreshing your browser.");
                            }
                        ).then(
                            function (response) {
                                return getFeaturesData(response);
                            },
                            function () {
                                $scope.isLoading = false;
                                $scope.openModalWindow("error", "For some reason we couldn't get information. Try refreshing your browser.");
                            }
                        ).then(
                            function (response) {
                                applyFeaturesData(response);
                                if ($scope.idResult) {
                                    return getFeatureAttachments($scope.idResult);
                                }
                            },
                            function () {
                                $scope.isLoading = false;
                                $scope.openModalWindow("error", "For some reason we couldn't get features information. Try refreshing your browser.");
                            }
                        ).then(
                            function (response) {
                                applyAttachments(response);
                                $scope.isLoading = false;
                                if ($scope.idResult) {
                                    $scope.isDataAvailable = true;
                                    showFeature($scope.idResult);
                                }
                            },
                            function () {
                                $scope.isLoading = false;
                                $scope.openModalWindow("error", "For some reason we couldn't get files information. Try refreshing your browser.");
                            }
                        );
                }
            }

            $scope.onChangeFeature = function (idResult) {
                MapService.clearGraphics(["info"]);
                $scope.isLoading = true;
                getFeatureAttachments(idResult).then(
                        function (response) {
                            $scope.isLoading = false;
                            applyAttachments(response);
                            showFeature(idResult);
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get model's information. Try refreshing your browser.");
                        }
                    );
            }

            $scope.onLocate = function (idResult) {
                var extent = esri.graphicsExtent([idResult.feature]);
                if (!extent) {
                    var point = idResult.feature.geometry;
                    extent = new esri.geometry.Extent(point.x - 1, point.y - 1, point.x + 1, point.y + 1, point.spatialReference);
                }
                if (extent) {
                    MapService.getMap().setExtent(extent.expand(1.12));
                }
            }

            $scope.onClear = function () {
                MapService.clearGraphics(["info"]);
                clearIdentifyData();
            }

            $scope.onClickAttachment = function (file) {
                var ext = file.name.split('.').pop().toLowerCase();
                if (ext == "dwf") {
                    $location.path("/home/map/designreview?fileUrl=" + encodeURI(file.name));
                } else if (ext == "3ws") {
                    if (confirm("To view CityEngine Web Scene you will be redirected to another page.")) {
                        window.open("cityengine/viewer.html?3dWebScene=../../webscenes/" + encodeURI(file.name));
                    }
                } else {
                    alert('Unsupported file type.');
                }
                return false;
            }

            $scope.$on('$destroy', function () {
                if ($scope.isDataAvailable) {
                    RequestContext.setActionContext("home.map.info", {
                        point: $scope.point.toJson(),
                        layerid: $scope.idResult.layerId
                    });
                } else {
                    RequestContext.setActionContext("home.map.info", null);
                }
                $scope.mapOnClickHandler();
                MapService.clearGraphics(["info"]);
            });

            $scope.mapOnClickHandler = $rootScope.$on("mapOnClick", function (event, args) {
                $scope.$apply(function () {
                    $scope.onClear();
                    $scope.point = args.mapPoint;
                    loadRemoteData();
                });
            });

            $scope.actionContext = RequestContext.getActionContext("home.map.info");

            if (MapService.getOnClickEvent()) {
                $scope.point = MapService.getOnClickEvent().mapPoint;
                MapService.setOnClickEvent(null);
            } else if ($scope.actionContext.point) {
                $scope.point = new esri.geometry.Point($scope.actionContext.point);
            }

            RequestContext.setWindowTitle("Map - Information");

            loadRemoteData();
        }]);

})(angular, Cric);
