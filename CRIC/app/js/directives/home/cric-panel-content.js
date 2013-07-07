(function (ng, app) {

    "use strict";

    app.directive('cricPanelContent',
        function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$on('$destroy', function () {
                        $(window).unbind("resize", on_window_resize);
                    });

                    function on_window_resize(event, init) {
                        var panel_content_container = element.closest(".panel-content-container");
                        var panel_container = panel_content_container.closest(".panel-container");
                        //var height = Math.max(element.height(), panel_container.height()
                        //        - element.position().top
                        //        - parseInt(panel_content_container.css('padding-top')));
                        var height = panel_container.height()
                                - element.position().top
                                - parseInt(panel_content_container.css('padding-top'));
                        if (height > 0) {
                            element.css("height", height).css("width", panel_content_container.width());
                        }

                        if (init) {
                            panel_container.bind("heightChange", on_window_resize);
                        }
                    }

                    $(window).bind("resize", on_window_resize);

                    on_window_resize(null, true);
                }
            };
        });

})(angular, Cric);