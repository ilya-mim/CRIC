(function (ng, app) {

    "use strict";

    app.directive('cricWidgetEmergency', [function () {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/emergency.html"
        };
    }]);

})(angular, Cric);