(function (ng, app) {

    "use strict";

    app.directive('cricDashboard', ["$compile", "_",
        function ($compile, _) {
        return {
            restrict: "A",
            templateUrl: "app/partials/home/dashboard/dashboard.html",
            link: function (scope, element, attrs) {
                var down = false;
                var scrolling = false;
                var x = 0;
                var y = 0;
                var top = 0;
                var left = 0;

                function displayScrollArrows(container) {
                    var offsetWidth = container.offsetWidth;
                    var scrollWidth = container.scrollWidth;
                    var scrollLeft = container.scrollLeft;

                    var dashboardRight = element.find(".dashboard-right");
                    var dashboardLeft = element.find(".dashboard-left");

                    if (scrollLeft == 0) {
                        dashboardRight.css("display", "none");
                        dashboardLeft.css("display", "block");
                    } else if (scrollLeft + offsetWidth == scrollWidth) {
                        dashboardLeft.css("display", "none");
                        dashboardRight.css("display", "block");
                    } else {
                        dashboardLeft.css("display", "block");
                        dashboardRight.css("display", "block");
                    }
                }

                function onMouseMove(e) {
                    if (down) {
                        var gridsterContainer = element.find(".gridster-container");
                        gridsterContainer.scrollTop(top + e.pageY - y).scrollLeft(left - e.pageX + x);
                        displayScrollArrows(gridsterContainer.get(0));
                    }
                }

                function onMouseUp(e) {
                    down = false;
                }

                function startScrolling(obj, param) {
                    obj.animate({ "scrollLeft": param }, 10, function () {
                        if (scrolling) {
                            startScrolling(obj, param);
                        } else {
                            displayScrollArrows(element.find(".gridster-container")[0]);
                        }
                    });
                }

                function updateWidgets(gridster) {
                    var widgets = gridster.serialize();
                    for (var i = 0; i < scope[attrs.widgets].length; i++) {
                        var widget = scope[attrs.widgets][i];
                        _.extend(widget, widgets[i]);
                    }
                }

                function createWidgets(widgets, gridster) {
                    if (widgets) {
                        scope.options = {};
                        for (var i = 0; i < widgets.length; i++) {
                            var widget = widgets[i];
                            scope.options[widget.id] = widget.options;
                            gridster.add_widget($("<li>")
                                .append("<div class='handle'>" + widget.title + "</div>")
                                .append($compile("<div " + widget.directive + " widgetid='" +
                                    widget.id + "'></div>")(scope)),
                                    widget.size_x, widget.size_y, widget.col, widget.row);
                        }
                    }
                }

                scope.$on("$destroy", function () {
                    $("body").unbind("mousemove", onMouseMove).unbind("mouseup", onMouseUp);
                });

                element.find(".gridster-container").mousewheel(function (event, delta) {
                    event.preventDefault();
                    this.scrollLeft -= (delta * 30);
                    displayScrollArrows(element.find(".gridster-container")[0]);
                });

                element.find(".gridster-container").mousedown(function (e) {
                    var target = e.target || e.srcElement;
                    if ($(target).hasClass("gridster-container") || $(target).is("ul")) {
                        e.preventDefault();
                        down = true;
                        x = e.pageX;
                        y = e.pageY;
                        top = $(this).scrollTop();
                        left = $(this).scrollLeft();
                    }
                });

                element.find(".dashboard-left img").mousedown(function () {
                    scrolling = true;
                    startScrolling(element.find(".gridster-container"), "+=10");
                }).mouseup(function () {
                    scrolling = false;
                });

                element.find(".dashboard-right img").mousedown(function () {
                    scrolling = true;
                    startScrolling(element.find(".gridster-container"), "-=10");
                }).mouseup(function () {
                    scrolling = false;
                });

                $("body").bind("mousemove", onMouseMove).bind("mouseup", onMouseUp);

                var gridster = element.find(".gridster ul").gridster({
                    widget_margins: [10, 10],
                    widget_base_dimensions: [140, 140],
                    draggable: {
                        handle: '.handle',
                        stop: function () {
                            updateWidgets(gridster);
                        }
                    }   
                }).data('gridster');

                scope.$watch(attrs.widgets, function (newValue, oldValue) {
                    if (newValue) {
                        createWidgets(newValue, gridster);
                        //element.find(".gridster-container").height($(window).height() - element.offset().top);
                    }
                });
            }
        };
    }]);

})(angular, Cric);