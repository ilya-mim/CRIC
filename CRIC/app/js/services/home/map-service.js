(function (ng, app) {

    "use strict";

    app.service("MapService",
        ["$rootScope", "$http", "$q", "$timeout", "_",
        function ($rootScope, $http, $q, $timeout, _) {
            function getConfig() {
                var deferred = $q.defer();
                if (config) {
                    deferred.resolve(ng.copy(config));
                } else {
                    $http.get('api/map/config').then(
                        function (response) {
                            config = response.data;
                            deferred.resolve(ng.copy(config));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function findFeatureAttachments(result) {
                var layer = _.find(files, function (file) {
                    return file.mapid == result.mapid && file.layerid == result.layerId;
                });
                if (layer) {
                    var feature = _.findWithProperty(layer.features,
                                "id", result.feature.attributes[layer.fieldname]) || {};
                    return feature.files || [];
                }
                return [];
            }

            function getFeaturesData(results, layer) {
                var deferred = $q.defer();
                var params = [];
                _.forEach(results.features, function (feature) {
                    params.push(feature.attributes[layer.keyname]);
                });
                if (layer.resource) {
                    $http.get(layer.resource).then(
                        function (response) {
                            if (response.data && response.data.length > 0) {
                                var layerInfo =
                                    _.findWithProperty(
                                        _.findWithProperty(
                                            config.layers, "id", layer.mapid).layerInfos, "id", layer.layerid);
                                var keys = Object.keys(response.data[0]);
                                _.forEach(keys, function (key) {
                                    if (key != layer.keyname && _.contains(layerInfo.fields, key)) {
                                        layer.fields.push(new esri.layers.Field({
                                            name: key,
                                            alias: key,
                                            length: 256,
                                            type: "esriFieldTypeString"
                                        }));
                                    }
                                });
                                layer.fields = _.sortBy(layer.fields, "alias");
                                _.forEach(results.features, function (feature) {
                                    _.extend(feature.attributes,
                                        _.findWithProperty(response.data, layer.keyname,
                                            feature.attributes[layer.keyname]));

                                });
                            }
                            deferred.resolve({ 
                                results: results,
                                layer: layer
                            });
                        },
                        function () {
                            deferred.reject();
                        });
                } else {
                    $timeout(function () {
                        deferred.resolve({
                            results: results,
                            layer: layer
                        });
                    }, 0);
                }
                return (deferred.promise);
            }

            function getFeatureAttachments(feature) {
                var deferred = $q.defer();
                if (files) {
                    deferred.resolve(ng.copy(findFeatureAttachments(feature)));
                } else {
                    $http.get('api/map/attachments').then(
                        function (response) {
                            files = response.data;
                            deferred.resolve(ng.copy(findFeatureAttachments(feature)));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }


            function getLayers(url, mapid) {
                var deferred = $q.defer();
                if (layers[url]) {
                    deferred.resolve(ng.copy(layers[url]));
                } else {
                    url = url + "/layers"
                    if (esri.config.defaults.io.alwaysUseProxy) {
                        url = esri.config.defaults.io.proxyUrl + "?" + url;
                    }
                    $http.get(url + "?f=json").then(
                        function (response) {
                            _.extend(response, { mapid: mapid });
                            layers[url] = response;
                            deferred.resolve(ng.copy(layers[url]));
                        }, 
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function waitForLayers(scope) {
                var deferred = $q.defer();
                if (map) {
                    if (map.loaded) {
                        deferred.resolve();
                    } else {
                        var handler = dojo.connect(map, 'onLayersAddResult', function (results) {
                            scope.$apply(function () {
                                dojo.disconnect(handler);
                                deferred.resolve();
                            });
                        });
                    }
                } else {
                    deferred.reject();
                }
                return deferred.promise;
            }

            function clearGraphics(types) {
                if (map && map.graphics) {
                    var graphics = _.filter(map.graphics.graphics, function (graphic) {
                        return _.indexOf(types, graphic.type) > -1;
                    });
                    _.forEach(graphics, function (graphic) {
                        map.graphics.remove(graphic);
                    });
                }
            }

            function hasGraphics(types) {
                if (map && map.graphics) {
                    var graphics = _.filter(map.graphics.graphics, function (graphic) {
                        return _.indexOf(types, graphic.type) > -1;
                    });
                    return graphics.length > 0;
                }
                return false;
            }

            function setQueryContext(results, layer, extent) {
                var previousQuery = getQueryContext();
                if (previousQuery.results) {
                    query.results.features = previousQuery.results.features.concat(results.features);
                    if (previousQuery.results.extent) {
                        query.results.extent = previousQuery.results.extent.union(extent);
                    } else {
                        query.results.extent = extent;
                    }
                } else {
                    query = {
                        layer: layer,
                        results: {
                            features: results.features,
                            fieldAliases: results.fieldAliases,
                            fields: results.fields,
                            extent: extent
                        }
                    };
                }
                $rootScope.$broadcast("queryContextChanged", getQueryContext());
            }

            function getQueryContext() {
                return query || {};
            }

            function clearQueryContext() {
                clearGraphics(["query", "highlight"]);
                if (query) {
                    query = null;
                }
            }

            function setMap(value) {
                map = value;
            }

            function getMap() {
                return map;
            }

            function enableOnClick() {
                onClickEnabled = true;
            }

            function disableOnClick() {
                onClickEnabled = false;
            }

            function isOnClick() {
                return onClickEnabled;
            }

            function getOnClickEvent() {
                return onClickEvent;
            }

            function setOnClickEvent(value) {
                onClickEvent = value;
            }

            var map = null;
            var config = null;
            var files = null;
            var layers = {};
            var query = null;
            var onClickEvent = null;
            var onClickEnabled = true;

            return ({
                setMap: setMap,
                getMap: getMap,
                enableOnClick: enableOnClick,
                disableOnClick: disableOnClick,
                isOnClick: isOnClick,
                setOnClickEvent: setOnClickEvent,
                getOnClickEvent: getOnClickEvent,
                getConfig: getConfig,
                getLayers: getLayers,
                waitForLayers: waitForLayers,
                clearGraphics: clearGraphics,
                hasGraphics: hasGraphics,
                setQueryContext: setQueryContext,
                getQueryContext: getQueryContext,
                clearQueryContext: clearQueryContext,
                getFeatureAttachments: getFeatureAttachments,
                getFeaturesData: getFeaturesData
            });
    }]);

})(angular, Cric);