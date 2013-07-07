(function (ng, app) {

    "use strict";

    app.controller("home.map.tools.QueryCtrl",
        ["$scope", "$location", "_", "RequestContext", "MapService",
        function ($scope, $location, _, RequestContext, MapService) {
            $scope.isLoading = false;
            $scope.types = [
                { id: "attributes", name: "By attributes", route: "/home/map/tools/query/attributes" },
                { id: "location", name: "By location", route: "/home/map/tools/query/location" }
            ];

            $scope.$on(
				"requestContextChanged",
				function () {
				    if (!renderContext.isChangeRelevant()) {
				        return;
				    }
				    $scope.subview = renderContext.getNextSection();
				    $scope.type = _.findWithProperty($scope.types, "id", $scope.subview);
				}
			);

            $scope.onQueryTypeChanged = function (type) {
                $location.path(type.route);
            }

            $scope.$on('$destroy', function () {
                RequestContext.setActionContext("home.map.tools.query", {
                    type: $scope.type
                });
            });

            var renderContext = RequestContext.getRenderContext("home.map.tools.query");
            $scope.actionContext = RequestContext.getActionContext("home.map.tools.query");

            if ($scope.actionContext.type) {
                $scope.subview = $scope.actionContext.type.id;
            } else {
                $scope.subview = renderContext.getNextSection();
            }

            $scope.type = _.findWithProperty($scope.types, "id", $scope.subview);
        }]);

})(angular, Cric);
