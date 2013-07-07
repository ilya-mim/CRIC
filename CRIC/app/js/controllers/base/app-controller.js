(function (ng, app) {

    "use strict";

    app.controller("base.AppCtrl",
        ["$scope", "$route", "$routeParams", "$location", "RequestContext", "UserService",
        function ($scope, $route, $routeParams, $location, RequestContext, UserService) {
            $scope.isLoading = true;

            function isRouteRedirect(route) {
                return (!route.current.action);
            }

            $scope.getInstanceTime = function () {
                var now = new Date();
                var timeString = now.toTimeString();
                var instanceTime = timeString.match(/\d+:\d+:\d+/i);
                return (instanceTime[0]);
            };

            $scope.openModalWindow = function (modalType) {
                //alert(arguments[1] || "Opps: Something went wrong.");
                $scope.$broadcast("showAlert", {
                    type: modalType,
                    title: arguments[2] || (modalType == "error" ? "Opps..." : "Hurray!"),
                    message: arguments[1]
                });
            };

            var renderContext = RequestContext.getRenderContext();
            $scope.subview = renderContext.getNextSection();


            $scope.$on(
                "requestContextChanged",
                function () {
                    if (!renderContext.isChangeRelevant()) {
                        return;
                    }
                    $scope.subview = renderContext.getNextSection();
                }
            );
            $scope.$on(
                "$routeChangeSuccess",
                function (event) {
                    if (isRouteRedirect($route)) {
                        return;
                    }

                    $scope.isLoading = true;

                    UserService.getUserProfile().then(
                        function (response) {
                            $scope.isLoading = false;
                            RequestContext.setContext($route.current.action, $routeParams);
                            $scope.$broadcast("requestContextChanged", RequestContext);
                        },
                        function () {
                            $scope.isLoading = false;
                            $location.path("/logoff");
                        });
                }
            );
        }]);

})(angular, CricBase);