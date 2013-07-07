(function (ng, app) {

    "use strict";

    app.controller("home.map.TocCtrl", ["$scope", "$timeout", "RequestContext", "MapService",
        function ($scope, $timeout, RequestContext, MapService) {
            $scope.isLoading = true;

            function getLayers(map, config) {
                var layers = [];
                for (var i = 0; i < config.layers.length; i++) {
                    layers.push({
                        layer: map.getLayer(config.layers[i].id),
                        title: config.layers[i].title
                    });
                }
                return layers;
            }

            function applyRemoteData(config) {
                $timeout(function () {
                    var toc = new agsjs.dijit.TOC({
                        map: MapService.getMap(),
                        layerInfos: getLayers(MapService.getMap(), config)
                    }, $scope.tocid);
                    toc.startup();
                }, 0);
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
                            applyRemoteData(response);
                            $scope.isLoading = false;
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load layers information. Try refreshing your browser.");
                        }
                    );
            }

            RequestContext.setWindowTitle("Map - Layers");

            loadRemoteData();
        }]);

})(angular, Cric);
