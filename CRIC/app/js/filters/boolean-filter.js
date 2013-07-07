(function (ng, app) {

    "use strict";

    app.filter("boolean",
        [function () {
            return function (input) {
                return input ? 'Yes' : 'No';
            }
        }]);

})(angular, CricBase);