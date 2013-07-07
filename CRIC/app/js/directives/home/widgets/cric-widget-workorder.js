(function (ng, app) {

    "use strict";

    app.directive('cricWidgetWorkOrder',
    ["$q", "_", "UserService", "WorkOrderService",
    function ($q, _, UserService, WorkOrderService) {
        return {
            restrict: "A",
            scope: true,
            templateUrl: "app/partials/home/dashboard/widgets/workorder.html",
            link: function (scope, element, attrs) {
                scope.isLoading = true;
                scope.isDataAvailable = false;
                scope.pageIndex = 1;
                scope.orders = null;
                scope.selectedOrder = null;
                scope.statuses = [];
                scope.types = [];
                scope.areas = [];
                scope.colors = {};
                scope.selectedStatuses = scope.options[attrs.widgetid].statuses;
                scope.selectedTypes = scope.options[attrs.widgetid].types;
                scope.selectedAreas = scope.options[attrs.widgetid].areas;
                scope.dateRange = {
                    start:
                        Date.parse(scope.options[attrs.widgetid].startDate) ||
                        Date.today().addYears(-1),
                    end:
                        Date.parse(scope.options[attrs.widgetid].endDate) ||
                        Date.today()
                };
                scope.table = {
                    size: 6,
                    sortby: "assetnum",
                    sortdesc: false
                };

                function getFileName(url) {
                    return url.substr(url.lastIndexOf('/') + 1)
                };

                function getSearchParams() {
                    return [
                        {
                            name: "Status",
                            values: scope.selectedStatuses
                        },
                        {
                            name: "Type",
                            values: scope.selectedTypes
                        },
                        {
                            name: "Area",
                            values: scope.selectedAreas
                        },
                        {
                            isdate: true,
                            name: "EndDate",
                            values: [scope.dateRange.start.toString("MMddyyyy"),
                                     scope.dateRange.end.toString("MMddyyyy")]
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
                    scope.orders = paginateRemoteData(response, scope.table.size);
                    scope.selectedOrder = scope.orders[0][0];
                }

                function loadDictionaries() {
                    scope.statuses = [];
                    scope.selectedStatuses = [];
                    scope.areas = [];

                    return $q.all([
                        WorkOrderService.getStatuses().then(function (response) {
                            scope.statuses = response;
                            if (!scope.selectedStatuses.length) {
                                scope.selectedStatuses = _.keys(scope.statuses);
                            }
                        }),
                        WorkOrderService.getAreas().then(function (response) {
                            scope.areas = response;
                            if (!scope.selectedAreas.length) {
                                scope.selectedAreas = _.keys(scope.areas);
                            }
                        }),
                        WorkOrderService.getTypes().then(function (response) {
                            scope.types = response;
                            if (!scope.selectedTypes.length) {
                                scope.selectedTypes = _.keys(scope.types);
                            }
                        }),
                        UserService.getUserProfile().then(function (response) {
                            scope.colors = response.colors;
                        })
                    ]);
                }

                function loadWorkOrders() {
                    scope.isLoading = true;
                    scope.isDataAvailable = false;
                    scope.pageIndex = 1;
                    scope.orders = null;
                    scope.selectedOrder = null;

                    WorkOrderService.getWorkOrders(getSearchParams(), {
                        sortby: scope.table.sortby,
                        sortdesc: scope.table.sortdesc
                    }).then(
                            function (response) {
                                applyRemoteData(response);
                                scope.isDataAvailable = response.length > 0;
                                scope.isLoading = false;
                            },
                            function () {
                                scope.isLoading = false;
                                scope.openModalWindow("error", "For some reason we couldn't get work orders information. Try refreshing your browser.");
                            }
                    );
                }

                function loadRemoteData() {
                    scope.isLoading = true;
                    scope.isDataAvailable = false;

                    loadDictionaries().then(
                            function (response) {
                                loadWorkOrders();
                            },
                            function () {
                                scope.isLoading = false;
                                scope.openModalWindow("error", "For some reason we couldn't load dictionaries. Try refreshing your browser.");
                            }
                    );
                }

                scope.onPageSizeChanged = function () {
                    loadWorkOrders();
                }

                scope.onSlide = function (direction) {
                    if (direction == "prev") {
                        scope.pageIndex = scope.pageIndex == 1 ? scope.orders.length : scope.pageIndex - 1;
                    } else {
                        scope.pageIndex = scope.pageIndex == scope.orders.length ? 1 : scope.pageIndex + 1;
                    }
                }

                scope.onSelectWorkOrder = function (data) {
                    scope.selectedOrder = data;
                }

                scope.onSearchClick = function () {
                    loadWorkOrders();
                }

                scope.onResetClick = function () {
                    scope.table.assetnum = "";
                    scope.table.wonum = "";

                    loadDictionaries();
                }

                scope.sortBy = function (sortby) {
                    if (scope.table.sortby == sortby) {
                        scope.table.sortdesc = !scope.table.sortdesc;
                    } else {
                        scope.table.sortby = sortby;
                        scope.table.sortdesc = false;
                    }
                    loadWorkOrders();
                }

                scope.isSortBy = function (sortby) {
                    if (sortby == scope.table.sortby) {
                        return scope.table.sortdesc ? "sorting_desc" : "sorting_asc";
                    } else {
                        return "sorting";
                    }
                }

                scope.formatDate = function (value) {
                    var date = Date.parse(value);
                    return date ? date.toString("MM/dd/yyyy") : "n//a";
                }

                scope.isOverdue = function (order) {
                    var endDate = Date.parse(order.EndDate);
                    var overdue = Date.now() > endDate && ["ACT", "PEN"].indexOf(order.Status) > -1;
                    return overdue;
                }

                loadRemoteData();
            }
        };
    }]);

})(angular, Cric);