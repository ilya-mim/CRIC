(function (ng, app) {

    "use strict";

    app.controller("base.NavCtrl", ["$scope", "_", "$location", "UserService",
        function ($scope, _, $location, UserService) {
            function getUserProfile() {
                UserService.getUserProfile().then(
					function (response) {
					    $scope.username = response.username;
					},
                    function () {
                        $location.path("/logoff");
                    });
            }
            $scope.isActive = function (pages) {
                var pages = pages.split(",");
                var parts = $location.path().split("/");
                for (var i = 0; i < pages.length; i++) {
                    if (parts.indexOf(pages[i]) > -1) {
                        return "active";
                    }
                }
                return "";
            };
            getUserProfile();
        }]);

})(angular, CricBase);

