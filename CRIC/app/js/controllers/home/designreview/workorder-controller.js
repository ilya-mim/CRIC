(function (ng, app) {
    "use strict";

    app.controller("home.designreview.WorkOrderCtrl",
        ["$scope", "$rootScope", "$routeParams", "$q", "_", "RequestContext", "UserService", "WorkOrderService",
        function ($scope, $rootScope, $routeParams, $q, _, RequestContext, UserService, WorkOrderService) {
            $scope.isLoading = true;
            $scope.isDataAvailable = false;
            $scope.pageIndex = 1;
            $scope.orders = null;
            $scope.selectedOrder = null;
            $scope.types = [];
            $scope.systems = [];
            $scope.priorities = [];
            $scope.buildings = [];
            $scope.statuses = [];
            $scope.trades = [];
            $scope.colors = {};
            $scope.selectedTypes = [];
            $scope.selectedSystems = [];
            $scope.selectedPriorities = [];
            $scope.selectedBuildings = [];
            $scope.selectedStatuses = [];
            $scope.selectedTrades = [];
            $scope.dateRange = {
                start: Date.today().addYears(-1),
                end: Date.today()
            };
            $scope.table = {
                sizes: [5, 10, 15],
                size: 5,
                isSelectAll: false,
                selectedCount: 0,
                hasSelected: false,
                sortby: "assetnum",
                sortdesc: false,
                assetnum: "",
                wonum: ""
            };

            $scope.$watch("startDate", function () {
                console.log($scope.startDate);
            });

            function getFileName(url) {
                return url.substr(url.lastIndexOf('/') + 1)
            };

            function getSearchParams() {
                return [
                    {
                        name: "bim",
                        values: [getFileName($routeParams.fileUrl)]
                    },
                    {
                        name: "System",
                        values: $scope.selectedSystems
                    },
                    {
                        name: "Building",
                        values: $scope.selectedBuildings
                    },
                    {
                        name: "Priority",
                        values: $scope.selectedPriorities
                    },
                    {
                        name: "Type",
                        values: $scope.selectedTypes
                    },
                    {
                        name: "Status",
                        values: $scope.selectedStatuses
                    },
                    {
                        name: "assetnum",
                        values: ($scope.table.assetnum == "" ? [] :
                                 $scope.table.assetnum.split(","))
                    },
                    {
                        name: "WONUM",
                        values: ($scope.table.wonum == "" ? [] :
                                 $scope.table.wonum.split(","))
                    },
                    {
                        isdate: true,
                        name: "StartDate",
                        values: [$scope.dateRange.start.toString("MMddyyyy"),
                                 $scope.dateRange.end.toString("MMddyyyy")]
                    }
                ];
            }

            function paginateRemoteData(response, pageSize) {
                var pages = [];
                var rows = [];
                for (var i = 0; i < response.length; i++) {
                    var row = _.extend(response[i], {
                        _number: i + 1,
                        _selected: false
                    });
                    if (rows.length >= pageSize) {
                        pages.push(rows);
                        rows = [];
                    }
                    rows.push(row);
                }
                if (rows.length <= pageSize) {
                    pages.push(rows);
                }
                return pages;
            }

            function applyRemoteData(response) {
                $scope.orders = paginateRemoteData(response, $scope.table.size);
                $scope.selectedOrder = $scope.orders[0][0];
            }

            function loadDictionaries() {
                $scope.types = [];
                $scope.systems = [];
                $scope.priorities = [];
                $scope.buildings = [];
                $scope.statuses = [];
                $scope.trades = [];
                $scope.selectedTypes = [];
                $scope.selectedSystems = [];
                $scope.selectedPriorities = [];
                $scope.selectedBuildings = [];
                $scope.selectedStatuses = [];
                $scope.selectedTrades = [];

                return $q.all([
                    WorkOrderService.getTypes().then(function (response) {
                        $scope.types = response;
                        $scope.selectedTypes = _.keys($scope.types);
                    }),
                    WorkOrderService.getSystems().then(function (response) {
                        $scope.systems = response;
                        $scope.selectedSystems = _.keys($scope.systems);
                    }),
                    WorkOrderService.getPriorities().then(function (response) {
                        $scope.priorities = response;
                        $scope.selectedPriorities = _.keys($scope.priorities);
                    }),
                    WorkOrderService.getBuildings().then(function (response) {
                        $scope.buildings = response;
                        $scope.selectedBuildings = _.keys($scope.buildings);
                    }),
                    WorkOrderService.getStatuses().then(function (response) {
                        $scope.statuses = response;
                        $scope.selectedStatuses = _.keys($scope.statuses);
                    }),
                    WorkOrderService.getTrades().then(function (response) {
                        $scope.trades = response;
                        $scope.selectedTrades = _.keys($scope.trades);
                    }),
                    UserService.getUserProfile().then(function (response) {
                        $scope.colors = response.colors;
                    })
                ]);
            }

            function loadWorkOrders() {
                $scope.isLoading = true;
                $scope.isDataAvailable = false;
                $scope.pageIndex = 1;
                $scope.orders = null;
                $scope.selectedOrder = null;
                $scope.table.isSelectAll = false;

                WorkOrderService.getWorkOrders(getSearchParams(), { 
                    sortby: $scope.table.sortby, 
                    sortdesc: $scope.table.sortdesc
                }).then(
                        function (response) {
                            applyRemoteData(response);
                            $scope.isDataAvailable = response.length > 0;
                            $scope.isLoading = false;
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get work orders information. Try refreshing your browser.");
                        }
                );
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                $scope.isDataAvailable = false;

                loadDictionaries().then(
                        function (response) {
                            loadWorkOrders();
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load dictionaries. Try refreshing your browser.");
                        }
                );
            }

            $scope.onPageSizeChanged = function () {
                loadWorkOrders();
            }

            $scope.onSlide = function (direction) {
                if (direction == "prev") {
                    $scope.pageIndex = $scope.pageIndex == 1 ? $scope.orders.length : $scope.pageIndex - 1;
                } else {
                    $scope.pageIndex = $scope.pageIndex == $scope.orders.length ? 1 : $scope.pageIndex + 1;
                }
            }

            $scope.onSelectWorkOrder = function (data) {
                $scope.selectedOrder = data;
            }

            $scope.onCheckAll = function () {
                $scope.table.selectedCount = 0;
                _.forEach($scope.orders, function (page) {
                    _.forEach(page, function (row) {
                        row._selected = $scope.table.isSelectAll;
                        if (row._selected) {
                            $scope.table.selectedCount++
                        }
                    });
                });
                $scope.table.hasSelected = $scope.table.selectedCount > 0;
            }

            $scope.onCheck = function (row) {
                $scope.table.isSelectAll = false;
                row["_selected"] ? $scope.table.selectedCount++ : $scope.table.selectedCount--;
                $scope.table.hasSelected = $scope.table.selectedCount > 0;
            }

            $scope.onSearchClick = function () {
                loadWorkOrders();
            }

            $scope.onResetClick = function () {
                $scope.table.assetnum = "";
                $scope.table.wonum = "";

                loadDictionaries();
            }

            $scope.onReassignClick = function () {
                alert("Order #" + $scope.selectedOrder['WONUM'] + " has been successfully re-assgned.");
            }

            $scope.sortBy = function (sortby) {
                if ($scope.table.sortby == sortby) {
                    $scope.table.sortdesc = !$scope.table.sortdesc;
                } else {
                    $scope.table.sortby = sortby;
                    $scope.table.sortdesc = false;
                }
                loadWorkOrders();
            }

            $scope.isSortBy = function (sortby) {
                if (sortby == $scope.table.sortby) {
                    return $scope.table.sortdesc ? "sorting_desc" : "sorting_asc";
                } else {
                    return "sorting";
                }
            }

            $scope.onIsolateSelected = function () {
                var selectedWorkOrders = [];
                _.forEach($scope.orders, function (page) {
                    selectedWorkOrders = selectedWorkOrders.concat(
                        _.filterWithProperty(page, "_selected", true));

                });
                $rootScope.$broadcast("designreview:isolateSelected", selectedWorkOrders);
            }

            $scope.onExportSelected = function () {
                alert("TBD");
            }

            $scope.formatDate = function (value) {
                var date = Date.parse(value);
                return date ? date.toString("MM/dd/yyyy") : "n//a";
            }

            $scope.$on('$destroy', function () {
            });

            $rootScope.$on("designreview:objectproperties", function (event, args) {
                $scope.$apply(function () {
                    //var assetnums = [];
                    //if ($scope.table.assetnum.length > 0) {
                    //    assetnums = _.forEach($scope.table.assetnum.split(","),
                    //        function (val) {
                    //            $.trim(val);
                    //        });
                    //}
                    //assetnums.push($.trim(args));
                    //$scope.table.assetnum = assetnums.join(",");
                    $scope.table.assetnum = $.trim(args);
                    loadWorkOrders();
                });
            });

            RequestContext.setWindowTitle("Map - DesingReview");

            loadRemoteData();
        }]);

})(angular, Cric);
