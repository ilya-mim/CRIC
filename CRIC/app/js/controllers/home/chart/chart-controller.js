(function (ng, app) {

    "use strict";

    app.controller("home.ChartCtrl", ["$scope", "RequestContext",
        function ($scope, RequestContext) {
            $scope.statistics = {
                "openwosbytrade": "Open WO's by Trade",
                "emergencycallsbytrade": "Emergency calls by Trade",
                "avghrsonclosedwos": "Avg. Hrs Charged on Closed WO's by Trade",
                "toohottoocold": "Too Hot / Too Сold Calls",
                "closedwosbytrade": "Closed WO's by Trade"
            };
            $scope.selectedStatistic = "closedwosbytrade";

            RequestContext.setWindowTitle("Charts");
        }]);

})(angular, Cric);

