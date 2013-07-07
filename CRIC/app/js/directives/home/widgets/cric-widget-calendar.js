(function (ng, app) {

    "use strict";

    app.directive('cricWidgetCalendar', [function () {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/widgets/calendar.html",
            link: function (scope, element, attrs) {
                scope.startDate = Date.today().addYears(-1);
                scope.endDate = Date.today();
            }
        };
    }]);

})(angular, Cric);