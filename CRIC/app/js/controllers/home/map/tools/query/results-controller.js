(function (ng, app) {

    "use strict";

    app.controller("home.map.tools.query.ResultsCtrl",
        ["$scope", "$rootScope", "$location", "_", "MapService",
        function ($scope, $rootScope, $location, _, MapService) {
            $scope.isLoading = false;
            $scope.pageIndex = 1;
            $scope.selectedFeature = null;
            $scope.results = {
                csv: "",
                columns: [],
                pages: []
            };

            $scope.page = {
                sizes: [
                    { height: "225px", rows: 5 },
                    { height: "370px", rows: 10 },
                    { height: "515px", rows: 15 }
                ],
                size: null
            };

            function applyQueryData() {
                $scope.pageIndex = 1;
                var queryContext = MapService.getQueryContext();
                if (queryContext.results) {
                    $scope.results.columns = getColumns(queryContext);
                    $scope.results.pages = getPages(queryContext, $scope.page.size.rows);
                    $scope.results.csv = getCSV(queryContext);
                }
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
                            applyQueryData();
                            $scope.isLoading = false;
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load layers information. Try refreshing your browser.");
                        });
            }

            function getColumns(queryContext) {
                var columns = [{
                    name: "#",
                    alias: "#"
                }];
                for (var i = 0; i < queryContext.layer.fields.length; i++) {
                    var field = queryContext.layer.fields[i];
                    columns.push({
                        name: field.name,
                        alias: field.alias
                    });
                }
                return columns;
            }

            function getPages(queryContext, pageSize) {
                var pages = [];
                var rows = [];
                for (var i = 0; i < queryContext.results.features.length; i++) {
                    var feature = queryContext.results.features[i];
                    if (rows.length >= pageSize) {
                        pages.push(rows);
                        rows = [];
                    }
                    var row = [];
                    row.push(i + 1);
                    for (var j = 0; j < queryContext.layer.fields.length; j++) {
                        var field = queryContext.layer.fields[j];
                        row.push(feature.attributes[field.name]);
                    }
                    rows.push(row);
                }
                if (rows.length <= pageSize) {
                    pages.push(rows);
                }
                return pages;
            }

            function getCSV(queryContext) {
                var csv = "#,";
                for (var i = 0; i < queryContext.layer.fields.length; i++) {
                    var field = queryContext.layer.fields[i];
                    csv = csv + field.alias;
                    if (i < queryContext.layer.fields.length - 1) {
                        csv = csv + ",";
                    }
                }
                csv = csv + "\n";
                for (i = 0; i < queryContext.results.features.length; i++) {
                    var feature = queryContext.results.features[i];
                    csv = csv + (i + 1) + ",";
                    for (var j = 0; j < queryContext.layer.fields.length; j++) {
                        var field = queryContext.layer.fields[j];
                        csv = csv + feature.attributes[field.name];
                        if (j < queryContext.layer.fields.length - 1) {
                            csv = csv + ",";
                        }
                    }
                    csv = csv + "\n";
                }
                return csv;
            }

            function hasQueryResults() {
                var queryContext = MapService.getQueryContext();
                return (typeof queryContext.results != 'undefined' && queryContext.results.features.length > 0);
            }

            $scope.hasQueryResults = function () {
                return hasQueryResults();
            };

            $scope.hasQueryGraphics = function () {
                return hasQueryResults() || MapService.hasGraphics(["query", "highlight"]);
            };

            $scope.onClearResults = function () {
                MapService.clearQueryContext();
                $scope.results = {
                    csv: "",
                    columns: [],
                    pages: []
                };
            }

            $scope.onExportResults = function () {
                $('#export-results-form').submit();
            }

            $scope.onSlide = function (direction) {
                if (direction == "prev") {
                    $scope.pageIndex = $scope.pageIndex == 1 ? $scope.results.pages.length : $scope.pageIndex - 1;
                } else {
                    $scope.pageIndex = $scope.pageIndex == $scope.results.pages.length ? 1 : $scope.pageIndex + 1;
                }
            }

            $scope.highlightFeature = function (data) {
                $scope.selectedFeature = data;
                MapService.clearGraphics(["highlight"]);
                var queryContext = MapService.getQueryContext();
                var feature = queryContext.results.features[$scope.selectedFeature[0] - 1];

                var markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 30, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 1), new dojo.Color([255, 0, 0, 0.8]));
                var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255, 0, 0]), 1);
                var polygonSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([58, 135, 173, 0.25]));

                var map = MapService.getMap();
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
                _.extend(feature, { type: "highlight" });
                map.graphics.add(feature);

                var extent = esri.graphicsExtent([feature]);
                if (!extent) {
                    var point = feature.geometry;
                    extent = new esri.geometry.Extent(point.x - 1, point.y - 1, point.x + 1, point.y + 1, point.spatialReference);
                }
                if (extent) {
                    map.setExtent(extent.expand(1.12));
                }
            }

            $scope.onShowAll = function () {
                var queryContext = MapService.getQueryContext();
                MapService.getMap().setExtent(queryContext.results.extent);
            }

            $scope.$on('$destroy', function () {
                $scope.queryContextChangedHandler();
            });

            $scope.onPageSizeChanged = function () {
                applyQueryData();
            }

            $scope.queryContextChangedHandler = $rootScope.$on("queryContextChanged",
                function () {
                    applyQueryData();
                });

            loadRemoteData();
        }]);

})(angular, Cric);
