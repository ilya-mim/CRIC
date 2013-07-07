(function (ng, app) {

    "use strict";

    app.controller("base.AboutCtrl", ["$scope", "RequestContext",
        function ($scope, RequestContext) {
            RequestContext.setWindowTitle("About");
        }]);

})(angular, CricBase);
