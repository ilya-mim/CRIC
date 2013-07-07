(function (ng, app) {

    "use strict";

    app.directive('cricHtmlContent', [
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$watch(attrs.ngModel, function (newValue) {
                        if (newValue) {
                            element.append(newValue);
                        }
                    })
                }
            };
        }]);

})(angular, CricAdmin);