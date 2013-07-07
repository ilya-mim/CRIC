(function (ng, app) {

    "use strict";

    app.directive('cricWidgetChart',
        ["$timeout", "WorkOrderService",
        function ($timeout, WorkOrderService) {
        return {
            restrict: "A",
            template: "<label style='position: relative;text-align: center;'>No data available</label>",
            link: function (scope, element, attrs) {
                var options = scope.options[attrs.widgetid];
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

                $timeout(function () {
                    var top = element.parent().height() / 2 - parseInt(element.css("line-height"));
                    element.find("label").css("top", top);
                    WorkOrderService.getStatistic(options.id).then(
                        function (response) {
                            if (response.length > 0) {
                                createChart(options.id, response);
                            }
                        });
                }, 0);
            }
        };
    }]);

})(angular, Cric);