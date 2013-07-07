(function (ng, app) {

    "use strict";

    app.controller("admin.UserCtrl",
        ["$scope", "$q", "_", "RequestContext", "UserService",
        function ($scope, $q, _, RequestContext, UserService) {
            $scope.isLoading = true;
            $scope.isDataAvailable = false;
            $scope.pageIndex = 1;
            $scope.users = null;
            $scope.selectedUser = null;
            $scope.roles = [];
            $scope.selectedRoles = [];
            $scope.table = {
                sizes: [5, 10, 15],
                size: 5,
                isSelectAll: false,
                selectedCount: 0,
                hasSelected: false,
                sortby: "username",
                sortdesc: false,
                username: "",
                fullname: "",
                email: ""
            };

            function getSearchParams() {
                return [
                    {
                        name: "roles",
                        values: $scope.selectedRoles
                    },
                    {
                        name: "username",
                        values: ($scope.table.username == "" ? [] :
                                 $scope.table.username.split(","))
                    },
                    {
                        name: "fullname",
                        values: ($scope.table.fullname == "" ? [] :
                                 $scope.table.fullname.split(","))
                    },
                    {
                        name: "email",
                        values: ($scope.table.email == "" ? [] :
                                 $scope.table.email.split(","))
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
                $scope.users = paginateRemoteData(response, $scope.table.size);
                $scope.selectedUser = ng.copy($scope.users[0][0]);
            }

            function loadDictionaries() {
                $scope.roles = [];
                $scope.selectedRoles = [];

                return $q.all([
                    UserService.getRoles().then(function (response) {
                        $scope.roles = response;
                        $scope.selectedRoles = _.keys($scope.roles);
                    })
                ]);
            }

            function loadUsers(cache) {
                $scope.isDataAvailable = false;
                $scope.pageIndex = 1;
                $scope.users = null;
                $scope.selectedUser = null;
                $scope.table.isSelectAll = false;

                UserService.getUsers(getSearchParams(), {
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
                            $scope.openModalWindow("error", "For some reason we couldn't get users information. Try refreshing your browser.");
                        }
                );
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                $scope.isDataAvailable = false;

                loadDictionaries().then(
                        function (response) {
                            loadUsers();
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load dictionaries. Try refreshing your browser.");
                        }
                );
            }

            $scope.onPageSizeChanged = function () {
                loadUsers(true);
            }

            $scope.onSlide = function (direction) {
                if (direction == "prev") {
                    $scope.pageIndex = $scope.pageIndex == 1 ? $scope.users.length : $scope.pageIndex - 1;
                } else {
                    $scope.pageIndex = $scope.pageIndex == $scope.users.length ? 1 : $scope.pageIndex + 1;
                }
            }

            $scope.onSelectUser = function (data) {
                $scope.selectedUser = ng.copy(data);
            }

            $scope.onCheckAll = function () {
                $scope.table.selectedCount = 0;
                _.forEach($scope.users, function (page) {
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
                loadUsers();
            }

            $scope.onResetClick = function () {
                $scope.table.username = "";
                $scope.table.fullname = "";
                $scope.table.email = "";

                loadDictionaries();
            }

            $scope.sortBy = function (sortby) {
                if ($scope.table.sortby == sortby) {
                    $scope.table.sortdesc = !$scope.table.sortdesc;
                } else {
                    $scope.table.sortby = sortby;
                    $scope.table.sortdesc = false;
                }
                loadUsers(true);
            }

            $scope.isSortBy = function (sortby) {
                if (sortby == $scope.table.sortby) {
                    return $scope.table.sortdesc ? "sorting_desc" : "sorting_asc";
                } else {
                    return "sorting";
                }
            }

            $scope.onSaveClick = function () {
                UserService.saveUser($scope.selectedUser).then(
                    function (response) {
                        if ($scope.selectedUser.userid) {
                            for (var i = 0; i < $scope.users[$scope.pageIndex - 1].length; i++) {
                                if ($scope.users[$scope.pageIndex - 1][i].userid == $scope.selectedUser.userid) {
                                    $scope.users[$scope.pageIndex - 1][i] = ng.copy($scope.selectedUser);
                                    break;
                                }
                            }
                        } else {
                            loadUsers(true);
                        }
                        $scope.openModalWindow("success", "The user has been successfully saved.");
                    },
                    function (response) {
                        if (response.status == 406) {
                            $scope.openModalWindow("error", "User name is not avaliable. Try to enter another name.");
                        } else {
                            $scope.openModalWindow("error", "For some reason we couldn't save the user. Try refreshing your browser.");
                        }
                    }
                );
            }

            $scope.onCreateUserClick = function () {
                $scope.selectedUser = {
                    roles: ["User"]
                };
            }

            $scope.onResetPasswordClick = function () {
                UserService.resetPassword($scope.selectedUser).then(
                    function (response) {
                        loadUsers(true);
                        $scope.openModalWindow("success", "The password has been successfully reset.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't reset the password. Try refreshing your browser.");
                    }
                );
            }

            $scope.onDeleteClick = function () {
                UserService.deleteUser($scope.selectedUser).then(
                    function (response) {
                        loadUsers(true);
                        $scope.openModalWindow("success", "The user has been successfully deleted.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't delete the user. Try refreshing your browser.");
                    }
                );
            }

            RequestContext.setWindowTitle("Administrative - Users");

            loadRemoteData();
        }]);

})(angular, CricAdmin);
