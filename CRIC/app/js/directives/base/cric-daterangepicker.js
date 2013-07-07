(function (ng, app) {

    "use strict";

    app.directive('cricDateRangePicker',
        function () {
            return {
                restrict: "A",
                scope: {
                    start: "=",
                    end: "=",
                    format: "@"
                },
                template: '<div id="daterange" class="daterange pull-right btn btn-group">' +
                            '<i class="icon-calendar icon-large"></i>' +
                            '<span title="Start Date">{{ start.toString(format) }} - {{ end.toString(format) }}</span><b class="caret"></b>' +
                          '</div>',
                link: function (scope, element, attrs) {
                    element.find('.daterange').daterangepicker({
                            ranges: {
                                'Today': ['today', 'today'],
                                'Yesterday': ['yesterday', 'yesterday'],
                                'Last 7 Days': [Date.today().add({ days: -6 }), 'today'],
                                'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
                                'Last Year': [Date.today().addYears(-1), Date.today()]
                            },
                            startDate: scope.start,
                            endDate: scope.end
                        },
                        function (start, end) {
                            element.find('.daterange span')
                                .html(start.toString(attrs.format) + ' - ' + end.toString(attrs.format));
                            scope.$apply(function () {
                                scope.start = start;
                                scope.end = end;
                            });
                        }
                    );
                }
            };
        });

})(angular, CricBase);