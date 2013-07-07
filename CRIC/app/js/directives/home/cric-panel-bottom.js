(function (ng, app) {

    "use strict";

    app.directive('cricPanelBottom', ["$rootScope",
        function ($rootScope) {
            return {
                restrict: "A",
                transclude: true,
                scope: {
                    pageheight: "="
                },
                template: '<div class="theme panel-bottom-link" title="Click to open pane">' +
                              '<i class="panel-bottom-link-arrow-up icon-chevron-up icon-white"></i>' +
                          '</div>' +
                          '<div style="width: 100%; background-color: #ffffff;" class="panel-container bottom" ng-transclude>' +
                              '<i title="Click to close pane" class="panel-bottom-link-arrow-down icon-chevron-down icon-white"></i>' +
                          '</div>',
                link: function (scope, element, attrs) {
                    scope.$on('$destroy', function () {
                        scope.queryContextChangedHandler();
                        $(window).unbind("resize", on_window_resize);
                    });

                    element.find(".panel-bottom-link-arrow-down").click(function () {
                        scope.$apply(function () {
                            hide_panel(element, attrs.iframe);
                        });
                    });

                    $(".panel-bottom-link").click(function () {
                        scope.$apply(function () {
                            show_panel(element, attrs.iframe);
                        });
                    });

                    function on_window_resize() {
                        element.find(".panel-container.bottom").css("width", $(".home").width());
                        if (!$("#" + attrs.iframe).hasClass("panel-bottom-link-iframe")) {
                            $("#" + attrs.iframe).css("height", $(".home").height());
                        }
                    }

                    $(window).bind("resize", on_window_resize);

                    function init_panel(element, iframe) {
                        element.find(".panel-container.bottom")
                            .css("bottom", "-10000px")
                            .css("height", scope.pageheight);

                        if (iframe != undefined && iframe != "") {
                            $("#" + iframe).removeClass().addClass("panel-bottom-link-iframe");
                        }
                    }

                    function show_panel(element, iframe) {
                        if (iframe != undefined && iframe != "") {
                            $("#" + iframe).removeClass().
                                attr("style", attrs.style).
                                addClass("panel-bottom-iframe").
                                css("bottom", 0);
                        }
                        element.find(".panel-container.bottom").css("bottom", "0px");
                    }

                    function hide_panel(element, iframe) {
                        var panel_container = element.find(".panel-container.bottom");
                        if (iframe != undefined && iframe != "") {
                            $("#" + iframe).css("bottom", -parseInt(panel_container.css("height"))).
                                removeClass().removeAttr("style").addClass("panel-bottom-link-iframe");
                        }
                        element.find(".panel-container.bottom").css("bottom", "-10000px");
                    }

                    init_panel(element, attrs.iframe);

                    scope.queryContextChangedHandler = $rootScope.$on("queryContextChanged", function (event, args) {
                        if (typeof args.results != 'undefined' && args.results.features.length > 0) {
                            show_panel(element, attrs.iframe);
                        }
                    });

                    scope.$watch("pageheight", function (newValue, oldValue) {
                        if (newValue) {
                            element.find(".panel-container.bottom").css("height", newValue);
                            element.find(".panel-container.bottom").trigger('heightChange')
                        }
                    }, true);
                }
            }
    }]);

})(angular, Cric);

