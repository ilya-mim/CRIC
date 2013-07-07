(function (ng, app) {

    "use strict";

    app.directive('cricPanelRight', ["$rootScope",
        function ($rootScope) {
            return {
                restrict: "A",
                transclude: true,
                template: '<div class="theme panel-right-link" title="Click to open pane">' +
                              '<i class="panel-right-link-arrow-left icon-chevron-left icon-white"></i>' +
                          '</div>' +
                          '<div class="panel-container right" ng-transclude>' +
                              '<i title="Click to close pane" class="panel-right-link-arrow-right icon-chevron-right icon-white"></i>' +
                          '</div>',
                link: function (scope, element, attrs) {
                    init_panel(element, attrs.iframe);

                    scope.$on('$destroy', function () {
                        scope.mapOnClickHandler();
                        $(window).unbind("resize", on_window_resize);
                    });

                    element.find(".panel-right-link-arrow-right").click(function () {
                        hide_panel(element, attrs.iframe);
                    });

                    $(".panel-right-link").click(function () {
                        show_panel(element, attrs.iframe);
                    });

                    function on_window_resize() {
                        element.find(".panel-container.right").css("height", $(".home").height());
                        if (!$("#" + attrs.iframe).hasClass("panel-right-link-iframe")) {
                            $("#" + attrs.iframe).css("height", $(".home").height());
                        }
                    }

                    $(window).bind("resize", on_window_resize);

                    function init_panel(element, iframe) {
                        element.find(".panel-container.right").
                            attr("style", attrs.style).
                            css('right', -parseInt(element.css("width"))).
                            css('display', 'block').
                            css('height', $(".home").height());

                        if (iframe != undefined && iframe != "") {
                            $("#" + iframe).removeClass().addClass("panel-right-link-iframe");
                        }
                    }

                    function show_panel(element, iframe) {
                        if (iframe != undefined && iframe != "") {
                            $("#" + iframe).removeClass().
                                attr("style", attrs.style).
                                addClass("panel-right-iframe").
                                css("right", "0");
                        }
                        element.find(".panel-container.right").css("right", "0");
                    }

                    function hide_panel(element, iframe) {
                        var panel_container = element.find(".panel-container.right");
                        if (iframe != undefined && iframe != "") {
                            $("#" + iframe).css("right", -parseInt(panel_container.css("width"))).
                                removeClass().removeAttr("style").addClass("panel-right-link-iframe");
                        }
                        panel_container.css("right", -parseInt(panel_container.css("width")));
                    }

                    if (attrs.show) {
                        show_panel(element, attrs.iframe);
                    }

                    scope.mapOnClickHandler = $rootScope.$on("mapOnClick", function () {
                        show_panel(element, attrs.iframe);
                    });
                }
            }
    }]);

})(angular, Cric);

