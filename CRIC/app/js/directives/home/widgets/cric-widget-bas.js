(function (ng, app) {

    "use strict";

    app.directive('cricWidgetBas', [function () {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/bas.html"
        };
    }]);

})(angular, Cric);