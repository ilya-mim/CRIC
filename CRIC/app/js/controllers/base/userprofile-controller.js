(function (ng, app) {

    "use strict";

    app.controller("base.UserProfileCtrl", ["$scope", "$q", "_", "Colors", "RequestContext", "UserService",
        function ($scope, $q, _, Colors, RequestContext, UserService) {
            $scope.isLoading = true;
            $scope.colors = Colors;
            $scope.user = {};
            $scope.confirmpassword = "";

            function applyRemoteData(response) {
                $scope.user = response;
                $scope.confirmpassword = $scope.user.password;
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                UserService.getUserProfile().then(
                        function (response) {
                            $scope.isLoading = false;
                            applyRemoteData(response);
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get a user profile. Try refreshing your browser.");
                        }
                );
            }

            $scope.onSaveClick = function () {
                UserService.setUserProfile($scope.user).then(
                    function (response) {
                        applyRemoteData(response);
                        $scope.openModalWindow("success", "The user profile has been successfully saved.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't save the user profile. Try refreshing your browser.");
                    }
                );
            }

            RequestContext.setWindowTitle("User Profile");

            loadRemoteData();
        }]);

})(angular, CricBase);
