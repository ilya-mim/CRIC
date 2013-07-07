(function (ng, app) {

    "use strict";

    app.controller("home.dashboard.GridCtrl",
        ["$scope", "RequestContext", "UserService", 
        function ($scope, RequestContext, UserService) {
            $scope.isLoading = true;
            $scope.widgets = [];

            function applyRemoteData(response) {
                $scope.widgets = response.widgets;
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                UserService.getUserProfile().then(
                    function (response) {
                        $scope.isLoading = false;
                        applyRemoteData(response)
                    },
                    function () {
                        $scope.isLoading = false;
                        errorCallback("For some reason we couldn't load the dashboard configuration. Try refreshing your browser.");
                    }
				);
            }

            $scope.$on("$destroy", function () {
                UserService.getUserProfile().then(
                    function (response) {
                        var user = response;
                        user.widgets = $scope.widgets;
                        return UserService.setUserProfile(user);
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't get user profile. Try refreshing your browser.");
                    }
                );
            });

            RequestContext.setWindowTitle("Dashboard");

            loadRemoteData();
        }]);

})(angular, Cric);

