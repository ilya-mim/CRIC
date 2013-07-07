(function (ng, app) {
    
    "use strict";

    app.controller("home.CityEngineCtrl", ["$scope", "$routeParams", "RequestContext",
        function ($scope, $routeParams, RequestContext) {
            RequestContext.setWindowTitle("Map - CityEngine");
            $scope.filename = $routeParams.fileUrl;
        }]);

})(angular, Cric);
