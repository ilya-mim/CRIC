(function (ng, app) {

    "use strict";

    app.directive('cricLogoff',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    $("#logoutForm").submit();
                }
            };
        });

})(angular, CricBase);