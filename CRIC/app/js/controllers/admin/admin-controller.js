(function (ng, app) {

    "use strict";

    app.controller("admin.AdminCtrl", ["$scope", "RequestContext",
        function ($scope, RequestContext) {
            var renderContext = RequestContext.getRenderContext("admin");
            $scope.subview = renderContext.getNextSection();

            $scope.$on(
				"requestContextChanged",
				function () {
				    if (!renderContext.isChangeRelevant()) {
				        return;
				    }
				    $scope.subview = renderContext.getNextSection();
				}
			);
        }]);

})(angular, CricAdmin);
