(function (ng, app) {

    "use strict";

    app.directive('cricWidgetAlerts', [function () {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/alerts.html"
        };
    }]);

})(angular, Cric);