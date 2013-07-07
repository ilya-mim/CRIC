(function (ng, app) {

    "use strict";

    app.directive('cricAlert',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$on("showAlert", function (event, args) {
                        var style = args.type == "error" ? "alert-error" : ""
                        element.append('<div class="alert alert-block ' + style + ' fade in">' +
                                            '<button type="button" class="close" data-dismiss="alert">×</button>' +
                                            '<strong>' + args.title + '</strong> ' + args.message +
                                        '</div>');
                        element.find(".alert").alert().delay(attrs.delay || 1000).fadeOut('slow');
                    });
                }
            };
        });

})(angular, CricBase);