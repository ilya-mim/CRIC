(function (ng, app) {

    "use strict";

    app.directive('cricChart',
        ["$timeout", "WorkOrderService",
        function ($timeout, WorkOrderService) {
        return {
            restrict: "A",
            template: "<label style='position: relative;text-align: center;'>No data available</label>",
            link: function (scope, element, attrs) {
                scope.$on('$destroy', function () {
                    $(window).unbind("resize", on_window_resize);
                });

                function createChart(id, data) {
                    if (id == "openwosbytrade" ||
                        id == "closedwosbytrade" ||
                        id == "emergencycallsbytrade" ||
                        id == "toohottoocold" ||
                        id == "avghrsonclosedwos") {
                        element.highcharts({
                            chart: {
                                type: 'pie'
                            },
                            credits: {
                                enabled: false
                            },
                            title: {
                                text: null
                            },
                            plotOptions: {
                                pie: {
                                    allowPointSelect: true,
                                    cursor: 'pointer',
                                    dataLabels: {
                                        enabled: true,
                                        formatter: function () {
                                            return '<b>' + this.point.name + '</b>: ' + Number(this.percentage).toFixed(1) + ' %';
                                        }
                                    },
                                    showInLegend: true
                                }
                            },
                            series: [{
                                type: 'pie',
                                name: id == "avghrsonclosedwos" ? "Hrs" : "WO's",
                                data: data
                            }]
                        });
                    }
                }

                function init(id) {
                    var chart = element.highcharts();
                    if (chart) {
                        chart.destroy();
                        element.append("<label style='position: relative;text-align: center;'>No data available</label>");
                    }
                    var height = element.parent().height();
                    var top = height / 2 - parseInt(element.css("line-height"));
                    element.find("label").css("top", top);
                    element.height(height);
                    WorkOrderService.getStatistic(id).then(
                        function (response) {
                            if (response.length > 0) {
                                createChart(id, response);
                            }
                        });
                }

                function on_window_resize() {
                    var height = element.parent().height();
                    var top = height / 2 - parseInt(element.css("line-height"));
                    element.find("label").css("top", top);
                    element.height(height);
                }

                $(window).bind("resize", on_window_resize);

                scope.$watch(attrs.widgetid, function (newValue, oldValue) {
                    if (newValue) {
                        init(newValue);
                    }
                });
            }
        };
    }]);

})(angular, Cric);