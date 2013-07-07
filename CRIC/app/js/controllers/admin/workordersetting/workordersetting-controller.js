(function (ng, app) {

    "use strict";

    app.controller("admin.WorkOrderSettingCtrl",
        ["$scope", "Colors", "RequestContext", "ApplicationSettingsService",
        function ($scope, Colors, RequestContext, ApplicationSettingsService) {
            $scope.isLoading = true;
            $scope.colors = Colors;
            $scope.wocolors = {};

            function applyRemoteData(response) {
                $scope.wocolors = response;
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                ApplicationSettingsService.getSetting("colors").then(
                        function (response) {
                            $scope.isLoading = false;
                            applyRemoteData(response);
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't get work order settings. Try refreshing your browser.");
                        }
                );
            }

            $scope.onSaveClick = function () {
                ApplicationSettingsService.setSetting("colors", $scope.wocolors).then(
                    function (response) {
                        applyRemoteData(response);
                        $scope.openModalWindow("success", "Work order settings has been successfully saved.");
                    },
                    function () {
                        $scope.openModalWindow("error", "For some reason we couldn't save work order settings. Try refreshing your browser.");
                    }
                );
            }

            RequestContext.setWindowTitle("Work Order Settings");

            loadRemoteData();
        }]);

})(angular, CricAdmin);
