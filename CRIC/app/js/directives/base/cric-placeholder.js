(function (ng, app) {

    "use strict";

    app.directive('cricPlaceholder',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    element.placeholder();
                }
            };
        });

})(angular, CricBase);