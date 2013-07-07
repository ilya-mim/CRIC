(function (ng, app) {

    "use strict";

    app.controller("home.designreview.DesignReviewCtrl", [
        "$scope", "$routeParams", "RequestContext",
        function ($scope, $routeParams, RequestContext) {

            //$scope.fileUrl = window.location.protocol + "//" +
            //                       window.location.hostname +
            //                       window.location.pathname +
            //                       "/webscenes/" + $routeParams.file;

            $scope.fileUrl = $routeParams.fileUrl;

            var renderContext = RequestContext.getRenderContext("home.designreview");
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

})(angular, Cric);
