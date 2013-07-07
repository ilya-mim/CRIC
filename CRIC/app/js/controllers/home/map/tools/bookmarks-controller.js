(function (ng, app) {

    "use strict";

    app.controller("home.map.tools.BookmarksCtrl",
        ["$scope", "_", "RequestContext", "MapService", "UserService",
        function ($scope, _, RequestContext, MapService, UserService) {
            $scope.isLoading = true;
            $scope.bookmark = {
                    name: ""
            };

            function applyRemoteData(response) {
                $scope.bookmarks = response.bookmarks.concat($scope.bookmarks);
            }

            function errorCallback(message) {
                $scope.isLoading = false;
                $scope.openModalWindow("error", message);
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                UserService.getUserProfile().then(
					function (response) {
					    $scope.bookmarks = response.bookmarks;
					    return MapService.getConfig();
					},
                    function () {
                        errorCallback("For some reason we couldn't load the bookmarks configuration. Try refreshing your browser.");
                    }
				).then(
                    function (response) {
                        $scope.isLoading = false;
                        applyRemoteData(response)
                    },
                    function () {
                        errorCallback("For some reason we couldn't load the map configuration. Try refreshing your browser.");
                    }
                );
            }

            $scope.setExtent = function (bookmark) {
                MapService.getMap().setExtent(
                    new esri.geometry.Extent(bookmark.extent));
            }

            $scope.deleteBookmark = function (bookmark) {
                $scope.isLoading = true;
                UserService.getUserProfile().then(
                        function (response) {
                            var user = response;
                            user.bookmarks = _.without(user.bookmarks,
                                _.findWithProperty(user.bookmarks, "id", bookmark.id));
                            return UserService.setUserProfile(user);
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get user profile. Try refreshing your browser.");
                        }
                ).then(
                        function (response) {
                            $scope.bookmark.name = "";
                            $scope.bookmarks = response.bookmarks;
                            return MapService.getConfig();
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't save user profile. Try refreshing your browser.");
                        }
                ).then(
                    function (response) {
                        $scope.isLoading = false;
                        applyRemoteData(response)
                    },
                    function () {
                        $scope.isLoading = false;
                        $scope.openModalWindow("error", "For some reason we couldn't load the map configuration. Try refreshing your browser.")
                    }
                );
            }

            $scope.addBookmark = function (name) {
                $scope.isLoading = true;
                UserService.getUserProfile().then(
                        function (response) {
                            var user = response;
                            user.bookmarks.push({ 
                                id: (user.bookmarks.length + 1),
                                name: name,
                                extent: MapService.getMap().extent.toJson()
                            });
                            return UserService.setUserProfile(user);
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get user profile. Try refreshing your browser.");
                        }
                ).then(
                        function (response) {
                            $scope.bookmark.name = "";
                            $scope.bookmarks = response.bookmarks;
                            return MapService.getConfig();
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't save user profile. Try refreshing your browser.");
                        }
                ).then(
                    function (response) {
                        $scope.isLoading = false;
                        applyRemoteData(response)
                    },
                    function () {
                        $scope.isLoading = false;
                        $scope.openModalWindow("error", "For some reason we couldn't load the map configuration. Try refreshing your browser.")
                    }
                );
            }

            RequestContext.setWindowTitle("Map - Bookmarks");

            loadRemoteData();
        }]);

})(angular, Cric);
