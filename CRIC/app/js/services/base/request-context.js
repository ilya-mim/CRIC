(function (ng, app) {

    "use strict";

    app.service("RequestContext",
        ["_", "RenderContext",
        function (_, RenderContext) {
            function getAction() {
                return (action);
            }
            function getNextSection(prefix) {
                if (!startsWith(prefix)) {
                    return (null);
                }
                if (prefix === "") {
                    return (sections[0]);
                }
                var depth = prefix.split(".").length;
                if (depth === sections.length) {
                    return (null);
                }
                return (sections[depth]);
            }
            function getParam(name, defaultValue) {
                if (ng.isUndefined(defaultValue)) {
                    defaultValue = null;
                }
                return (params[name] || defaultValue);
            }
            function getParamAsInt(name, defaultValue) {
                var valueAsInt = (this.getParam(name, defaultValue || 0) * 1);
                if (isNaN(valueAsInt)) {
                    return (defaultValue || 0);
                } else {
                    return (valueAsInt);
                }
            }
            function getRenderContext(requestActionLocation, paramNames) {
                requestActionLocation = (requestActionLocation || "");
                paramNames = (paramNames || []);
                if (!ng.isArray(paramNames)) {
                    paramNames = [paramNames];
                }
                return (
                    new RenderContext(this, requestActionLocation, paramNames)
                );
            }
            function hasActionChanged() {
                return (action !== previousAction);
            }
            function hasParamChanged(paramName, paramValue) {
                if (!ng.isUndefined(paramValue)) {
                    return (!isParam(paramName, paramValue));
                }
                if (!previousParams.hasOwnProperty(paramName) &&
                    params.hasOwnProperty(paramName)
                    ) {
                    return (true);
                } else if (previousParams.hasOwnProperty(paramName) &&
                    !params.hasOwnProperty(paramName)
                    ) {
                    return (true);
                }
                return (previousParams[paramName] !== params[paramName]);
            }
            function haveParamsChanged(paramNames) {
                for (var i = 0, length = paramNames.length ; i < length ; i++) {
                    if (hasParamChanged(paramNames[i])) {
                        return (true);
                    }
                }
                return (false);
            }
            function isParam(paramName, paramValue) {
                if (params.hasOwnProperty(paramName) &&
                    (params[paramName] == paramValue)
                    ) {
                    return (true);
                }
                return (false);
            }
            function setContext(newAction, newRouteParams) {
                previousAction = action;
                previousParams = params;
                action = newAction;
                sections = action.split(".");
                params = ng.copy(newRouteParams);
            }
            function setActionContext(requestActionLocation, newActionContext) {
                //var cookieStore = $cookieStore.get(CricBase.name) || {};
                //cookieStore[requestActionLocation] = ng.copy(newActionContext);
                //$cookieStore.put(CricBase.name, cookieStore);
                actionContext[requestActionLocation] = ng.copy(newActionContext);
            }
            function getActionContext(requestActionLocation) {
                //var cookieStore = $cookieStore.get(CricBase.name) || {};
                //return (cookieStore[requestActionLocation] || {});
                return (actionContext[requestActionLocation] || {});
            }
            function startsWith(prefix) {
                if (!prefix.length ||
                    (action === prefix) ||
                    (action.indexOf(prefix + ".") === 0)
                    ) {
                    return (true);
                }
                return (false);
            }
            function setWindowTitle(title) {
                window.document.title = "CRIC - " + title;
            }

            var action = "";
            var sections = [];
            var params = {};
            var previousAction = "";
            var previousParams = {};
            var actionContext = {};

            //$cookieStore.remove(CricBase.name);

            return ({
                getNextSection: getNextSection,
                getParam: getParam,
                getParamAsInt: getParamAsInt,
                getRenderContext: getRenderContext,
                hasActionChanged: hasActionChanged,
                hasParamChanged: hasParamChanged,
                haveParamsChanged: haveParamsChanged,
                isParam: isParam,
                setContext: setContext,
                setWindowTitle: setWindowTitle,
                setActionContext: setActionContext,
                getActionContext: getActionContext,
                startsWith: startsWith
            });
        }]);

})(angular, CricBase);