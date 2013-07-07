(function (ng, app) {

    "use strict";

    app.directive('cricWidgetReports', [function () {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/reports.html"
        };
    }]);

})(angular, Cric);