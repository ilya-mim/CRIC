(function (ng, app) {

    "use strict";

    app.controller("home.ReportCtrl", ["$scope", "RequestContext",
        function ($scope, RequestContext) {
            RequestContext.setWindowTitle("Reports");
        }]);

})(angular, Cric);

