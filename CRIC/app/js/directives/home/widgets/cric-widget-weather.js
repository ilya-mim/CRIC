(function (ng, app) {

    "use strict";

    app.directive('cricWidgetWeather', [function () {
        return {
            restrict: "A",
            scope: true,
            link: function (scope, element, attrs) {
                element.weatherfeed(
                    scope.options[attrs.widgetid].locations,
                    scope.options[attrs.widgetid]);
            }
        };
    }]);

})(angular, Cric);