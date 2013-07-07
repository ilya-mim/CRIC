(function (ng, app) {

    "use strict";
    app.directive('cricPopoverError', [
        function () {
            return {
                restrict: "A",
                require: 'ngModel',
                link: function (scope, element, attrs, ctrl) {
                    scope.$on("$destroy", function () {
                        element.popover('destroy');
                    });

                    scope.$watch(attrs['ngModel'], function (newValue) {
                        if (ctrl.$dirty && ctrl.$invalid) {
                            element.popover('show')
                        } else {
                            element.popover('hide')
                        }
                    });

                    element.popover({
                        title: attrs['errorTitle'],
                        html: true,
                        content: element.next("." + attrs.cricPopoverError).html(),
                        placement: attrs['errorPosition'],
                        trigger: 'manual'
                    });
                }
            };
        }]);

})(angular, CricBase);