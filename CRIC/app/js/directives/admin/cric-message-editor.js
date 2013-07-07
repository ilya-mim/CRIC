(function (ng, app) {

    "use strict";

    app.directive('cricMessageEditor', [
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    var insertAttributeTemplate = {
                        html: function (locale, options) {
                            var html = "<li class='dropdown'>" +
                              "<a class='btn dropdown-toggle' data-toggle='dropdown' href='#'>" +
                              "<span>Attribute</span>&nbsp;<b class='caret'></b>" +
                              "</a>" +
                              "<ul class='dropdown-menu'>";
                            for (var key in scope.sources[scope.selectedMessage.sourceid].attributes) {
                                var value = scope.sources[scope.selectedMessage.sourceid].attributes[key];
                                html = html + "<li><a data-wysihtml5-command='insertHTML' data-wysihtml5-command-value='<b>{" + key + "}</b>' tabindex='-1'>" + value + "</a></li>";
                            } 
                            return html + "</ul>" + "</li>";
                        }
                    };

                    element.wysihtml5({
                        html: true,
                        color: true,
                        link: false,
                        image: false,
                        stylesheets: ["app/css/wysiwyg/wysiwyg-color.css"],
                        customTemplates: insertAttributeTemplate,
                        events: {
                            "blur": function () {
                                scope[attrs.message].messagebody = this.getValue();
                            },
                            "load": function () {
                                scope.$watch(attrs.ngModel, function () {
                                    element.data("wysihtml5").editor.setValue(scope[attrs.message].messagebody);
                                })
                            }
                        }
                    });
                }
            };
        }]);

})(angular, CricAdmin);