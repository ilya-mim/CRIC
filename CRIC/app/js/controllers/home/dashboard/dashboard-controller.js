(function (ng, app) {

    "use strict";

    app.controller("home.DashboardCtrl",
        ["$scope", "RequestContext",
        function ($scope, RequestContext) {
            $scope.$on(
				"requestContextChanged",
				function () {
				    if (!renderContext.isChangeRelevant()) {
				        return;
				    }
				    $scope.subview = renderContext.getNextSection();
				}
			);

            var renderContext = RequestContext.getRenderContext("home.dashboard");
            $scope.subview = renderContext.getNextSection();
        }]);

})(angular, Cric);

