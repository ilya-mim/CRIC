(function (ng, app, _) {

    "use strict";

    app.factory("_", function () {
		    _.findWithProperty = function (collection, name, value) {
		        var result = _.find(
					collection,
					function (item) {
					    return (item[name] === value);
					}
				);
		        return (result);
		    };

		    _.filterWithProperty = function (collection, name, value) {
		        var result = _.filter(
					collection,
					function (item) {
					    return (item[name] === value);
					}
				);
		        return (result);
		    };

		    _.endsWithProperty = function (collection, name, value) {
		        var result = _.filter(
					collection,
					function (item) {
					    return (value.match(item[name] + "$") == item[name]);
					}
				);
		        return (result);
		    };

		    return (_);
		}
	);

})(angular, CricBase, _.noConflict());
