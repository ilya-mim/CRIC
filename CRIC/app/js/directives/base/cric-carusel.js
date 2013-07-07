(function (ng, app) {

    "use strict";

    app.directive('cricCarusel',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    element.carousel({
                        interval: false
                    });
                }
            };
        });

})(angular, CricBase);