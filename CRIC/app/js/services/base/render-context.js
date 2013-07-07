(function (ng, app) {

    "use strict";

    app.value("RenderContext",
        function (RequestContext, actionPrefix, paramNames) {
            function getNextSection() {
                return (
                    RequestContext.getNextSection(actionPrefix)
                );
            }
            function isChangeLocal() {
                return (
                    RequestContext.startsWith(actionPrefix)
                );
            }
            function isChangeRelevant() {
                if (!RequestContext.startsWith(actionPrefix)) {
                    return (false);
                }
                if (RequestContext.hasActionChanged()) {
                    return (true);
                }
                return (
                    paramNames.length &&
                    RequestContext.haveParamsChanged(paramNames)
                );
            }
            return ({
                getNextSection: getNextSection,
                isChangeLocal: isChangeLocal,
                isChangeRelevant: isChangeRelevant
            });
        }
    );

})(angular, CricBase);