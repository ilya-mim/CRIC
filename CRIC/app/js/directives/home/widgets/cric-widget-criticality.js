(function (ng, app) {

    "use strict";

    app.directive('cricWidgetCriticality', [function () {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/criticality.html"
        };
    }]);

})(angular, Cric);