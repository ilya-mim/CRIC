(function (ng, app) {

    "use strict";

    app.directive('cricResetStateOn',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$watch(attrs.cricResetStateOn, function (newValue, oldValue) {
                        if (newValue) {
                            element.removeClass("active");
                        }
                    });
                }
            };
        });

})(angular, Cric);