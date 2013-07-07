(function (ng, app) {

    "use strict";
    app.directive('cricColorpickerInline', ["$timeout",
        function ($timeout) {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    var picker;

                    function setProp(obj, desc, val) {
                        var arr = desc.split(".");
                        while (arr.length > 1) {
                            obj = obj[arr.shift()];
                        }
                        obj[arr.shift()] = val;
                    }
                    
                    function getProp(obj, desc) {
                        var arr = desc.split(".");
                        while (arr.length && (obj = obj[arr.shift()])) { }
                        return obj;
                    }

                    scope.$on('destroy', function () {
                        if (picker) {
                            picker.simplecolorpicker('destroy');
                        }
                    });

                    $timeout(function () {
                        picker = element.simplecolorpicker()
                        //picker = element.simplecolorpicker(
                        //    'selectColor', getProp(scope, attrs.model))
                        .on("change", function () {
                            setProp(scope, attrs.model, element.val());
                        });
                    }, 0);

                    //scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                    //    element.simplecolorpicker();
                    //    element.simplecolorpicker('selectColor', getProp(scope, attrs.color));
                    //    .on("change", function () {
                    //            setProp(scope, attrs.model, element.val());
                    //        });
                    //});
                }
            };
        }]);

})(angular, CricBase);