(function (ng, app) {

    "use strict";

    app.controller("admin.NotificationCtrl",
        ["$scope", "$q", "_", "RequestContext", "NotificationService", 
        function ($scope, $q, _, RequestContext, NotificationService) {
            $scope.isLoading = true;
            $scope.isDataAvailable = false;
            $scope.pageIndex = 1;
            $scope.users = null;
            $scope.selectedMessage = null;
            $scope.sources = [];
            $scope.selectedSources = [];
            $scope.selectedAttribute = null;
            $scope.table = {
                sizes: [5, 10, 15],
                size: 5,
                isSelectAll: false,
                selectedCount: 0,
                hasSelected: false,
                sortby: "sourcename",
                sortdesc: false,
                selectedAttribute: null
            };


            function getSearchParams() {
                return [
                    {
                        name: "sourceid",
                        values: $scope.selectedSources
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
                $scope.messages = paginateRemoteData(response, $scope.table.size);
                $scope.selectedMessage = ng.copy($scope.messages[0][0]);
                $scope.onSourceChanged();
            }

            function loadDictionaries() {
                $scope.sources = [];
                $scope.selectedSources = [];

                return $q.all([
                    NotificationService.getSources().then(function (response) {
                        $scope.sources = response;
                        $scope.selectedSources = _.keys($scope.sources);
                    })
                ]);
            }

            function loadMessages(cache) {
                $scope.isDataAvailable = false;
                $scope.pageIndex = 1;
                $scope.messages = null;
                $scope.selectedMessage = null;
                $scope.table.isSelectAll = false;

                NotificationService.getMessages(getSearchParams(), {
                    sortby: $scope.table.sortby,
                    sortdesc: $scope.table.sortdesc
                }, cache).then(
                        function (response) {
                            applyRemoteData(response);
                            $scope.isDataAvailable = response.length > 0;
                            $scope.isLoading = false;
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get notifications information. Try refreshing your browser.");
                        }
                );
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                $scope.isDataAvailable = false;

                loadDictionaries().then(
                        function (response) {
                            loadMessages();
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load source dictionary. Try refreshing your browser.");
                        }
                );
            }

            $scope.onPageSizeChanged = function () {
                loadMessages(true);
            }

            $scope.onSlide = function (direction) {
                if (direction == "prev") {
                    $scope.pageIndex = $scope.pageIndex == 1 ? $scope.messages.length : $scope.pageIndex - 1;
                } else {
                    $scope.pageIndex = $scope.pageIndex == $scope.messages.length ? 1 : $scope.pageIndex + 1;
                }
            }

            $scope.onSelectMessage = function (message) {
                $scope.selectedMessage = ng.copy(message);
                $scope.onSourceChanged();
            }

            $scope.onCheckAll = function () {
                $scope.table.selectedCount = 0;
                _.forEach($scope.messages, function (page) {
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
                loadMessages();
            }

            $scope.onResetClick = function () {
                loadDictionaries();
            }

            $scope.sortBy = function (sortby) {
                if ($scope.table.sortby == sortby) {
                    $scope.table.sortdesc = !$scope.table.sortdesc;
                } else {
                    $scope.table.sortby = sortby;
                    $scope.table.sortdesc = false;
                }
                loadMessages(true);
            }

            $scope.isSortBy = function (sortby) {
                if (sortby == $scope.table.sortby) {
                    return $scope.table.sortdesc ? "sorting_desc" : "sorting_asc";
                } else {
                    return "sorting";
                }
            }

            $scope.onSaveClick = function () {
                NotificationService.saveMessage($scope.selectedMessage).then(
                    function (response) {
                        if ($scope.selectedMessage.messageid) {
                            for (var i = 0; i < $scope.messages[$scope.pageIndex - 1].length; i++) {
                                if ($scope.messages[$scope.pageIndex - 1][i].messageid == $scope.selectedMessage.messageid) {
                                    $scope.messages[$scope.pageIndex - 1][i] = ng.copy($scope.selectedMessage);
                                    break;
                                }
                            }
                        } else {
                            loadMessages(true);
                        }
                        $scope.openModalWindow("success", "The message has been successfully saved.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't save the message. Try refreshing your browser.");
                    }
                );
            }

            $scope.onCreateMessageClick = function () {
                var sourceid = _.keys($scope.sources)[0];
                var eventid = _.keys($scope.sources[sourceid].events)[0];

                $scope.selectedMessage = {
                    sourceid: sourceid,
                    eventid: eventid,
                    messageid: null
                };
            }

            $scope.onDeleteClick = function () {
                NotificationService.deleteMessage($scope.selectedMessage).then(
                    function (response) {
                        loadMessages(true);
                        $scope.openModalWindow("success", "The message has been successfully deleted.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't delete the message. Try refreshing your browser.");
                    }
                );
            }

            $scope.onSourceChanged = function () {
                var attributes = $scope.sources[$scope.selectedMessage.sourceid].attributes;
                $scope.table.selectedAttribute = attributes[_.keys(attributes)[0]];
            }

            RequestContext.setWindowTitle("Administrative - Notifications");

            loadRemoteData();
        }]);

})(angular, CricAdmin);

