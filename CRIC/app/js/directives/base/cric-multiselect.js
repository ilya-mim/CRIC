(function (ng, app) {

    "use strict";

    app.directive('cricMultiselect', ["_",
        function (_) {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$watch(attrs.ngModel, function () {
                        element.multiselect('rebuild');
                    });

                    function getProp(obj, desc) {
                        var arr = desc.split(".");
                        while (arr.length && (obj = obj[arr.shift()])) { }
                        return obj;
                    }

                    function createMultiselect() {
                        element.multiselect({
                            buttonClass: attrs.buttonClass,
                            buttonWidth: 'auto',
                            buttonText: function (options) {
                                if (options.length == 0) {
                                    return attrs.buttonText + ' <b class="caret"></b>';
                                } else if (options.length > 5) {
                                    return options.length + ' selected  <b class="caret"></b>';
                                } else {
                                    var selected = '';
                                    options.each(function () {
                                        selected += $(this).text() + ', ';
                                    });
                                    return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
                                }
                            },
                            onChange: function (element, checked) {
                                scope.$apply(function () {
                                    if (checked) {
                                        getProp(scope, attrs.ngModel).push($(element).val());
                                        //scope[attrs.ngModel].push($(element).val());
                                    } else {
                                        var index = getProp(scope, attrs.ngModel).indexOf($(element).val());
                                        getProp(scope, attrs.ngModel).splice(index, 1);
                                        //var index = scope[attrs.ngModel].indexOf($(element).val());
                                        //scope[attrs.ngModel].splice(index, 1);
                                    }
                                });
                            }
                        }).next().find("button.multiselect").attr("title", attrs.title);
                    }

                    createMultiselect();
                }
            };
        }]);

})(angular, CricBase);