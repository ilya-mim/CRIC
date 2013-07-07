(function (ng, app) {

    "use strict";

    app.directive('cricToc', [function () {
            return {
                restrict: "A",
                template: "<div id='{{tocid}}'></div>",
                link: function (scope, element, attrs) {
                    scope.tocid = attrs.id + "_" + new Date().getMilliseconds();
                    scope.$on('$destroy', function () {
                        $(window).unbind("resize", on_window_resize);
                        dijit.byId(scope.tocid).destroyRecursive();
                    });
                    function on_window_resize() {
                        var panel_container = element.closest(".panel-container")
                        var panel_content_container = element.closest(".panel-content-container")
                        var height = panel_container.height()
                                - panel_content_container.position().top
                                - parseInt(panel_content_container.css('padding-top'))
                                - parseInt(panel_content_container.css('padding-bottom'));
                        element.parent().css("height", height);
                    }
                    $(window).bind("resize", on_window_resize);
                    on_window_resize();
                }
            };
    }]);

})(angular, Cric);