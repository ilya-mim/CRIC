(function (ng, app) {

    "use strict";

    app.directive('cricTooltip',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    $('body').tooltip({
                        selector: "[rel=tooltip]",
                        placement: "bottom"
                    });
                }
            };
        });

})(angular, CricBase);