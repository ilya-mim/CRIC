(function (ng, app) {

    "use strict";
    app.directive('cricPasswordValidator', [
        function () {
            return {
                restrict: "A",
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    var widget = element.inheritedData('$formController')
                            [attrs.cricPasswordValidator];

                    ctrl.$parsers.push(function (value) {
                        if (value === widget.$viewValue) {
                            ctrl.$setValidity('match', true);
                            return value;
                        }
                        ctrl.$setValidity('match', false);
                    });

                    widget.$parsers.push(function (value) {
                        ctrl.$setValidity('match', value === ctrl.$viewValue);
                        return value;
                    });
                }
            };
        }]);

})(angular, CricBase);