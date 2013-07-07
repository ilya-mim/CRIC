(function (ng, app) {

    "use strict";

    app.controller("admin.SmtpCtrl",
        ["$scope", "RequestContext", "ApplicationSettingsService",
        function ($scope, RequestContext, ApplicationSettingsService) {
            $scope.isLoading = true;
            $scope.smtp = {};

            function applyRemoteData(response) {
                $scope.smtp = {
                    hostname: response.hostname,
                    port: response.port,
                    username: response.username,
                    password: response.password,
                    ssl: response.ssl
                };
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                ApplicationSettingsService.getSetting("smtp").then(
                        function (response) {
                            $scope.isLoading = false;
                            applyRemoteData(response);
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get smtp settings. Try refreshing your browser.");
                        }
                );
            }

            $scope.onSaveClick = function () {
                ApplicationSettingsService.setSetting("smtp", $scope.smtp).then(
                    function (response) {
                        applyRemoteData(response);
                        $scope.openModalWindow("success", "SMTP settings has been successfully saved.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't save smtp settings. Try refreshing your browser.");
                    }
                );
            }

            RequestContext.setWindowTitle("SMTP Settings");

            loadRemoteData();
        }]);

})(angular, CricAdmin);
