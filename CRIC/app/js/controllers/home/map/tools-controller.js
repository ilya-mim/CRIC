(function (ng, app) {

    "use strict";

    app.controller("home.map.ToolsCtrl",
        ["$scope", "$location", "_", "RequestContext",
        function ($scope, $location, _, RequestContext) {
            $scope.isLoading = false;
            $scope.tools = [
                { id: "bookmarks", name: "Bookmarks", route: "/home/map/tools/bookmarks" },
                { id: "query", name: "Query", route: "/home/map/tools/query" }
            ];

            $scope.$on(
				"requestContextChanged",
				function () {
				    if (!renderContext.isChangeRelevant()) {
				        return;
				    }
				    $scope.subview = renderContext.getNextSection();
				    $scope.tool = _.findWithProperty($scope.tools, "id", $scope.subview);
				}
			);

            $scope.onToolSelected = function (tool) {
                $location.path(tool.route);
            }

            $scope.$on('$destroy', function () {
                RequestContext.setActionContext("home.map.tools", {
                    tool: $scope.tool
                });
            });

            var renderContext = RequestContext.getRenderContext("home.map.tools");
            $scope.actionContext = RequestContext.getActionContext("home.map.tools");

            if ($scope.actionContext.tool) {
                $scope.subview = $scope.actionContext.tool.id;
                //$location.path($scope.actionContext.tool.route);
            } else {
                $scope.subview = renderContext.getNextSection();
            }

            $scope.tool = _.findWithProperty($scope.tools, "id", $scope.subview);
        }]);

})(angular, Cric);
