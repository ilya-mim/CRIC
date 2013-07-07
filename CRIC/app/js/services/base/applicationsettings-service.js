(function (ng, app) {

    "use strict";

    app.service("ApplicationSettingsService", ["$http", "$q", "_", function ($http, $q, _) {

        function setSetting(id, value) {
            var deferred = $q.defer();
            $http.put('api/applicationsettings/' + id, {
                Value: ng.toJson(value)
            }).then(
                function (response) {
                    cache[id] = ng.copy(value);
                    deferred.resolve(ng.copy(cache[id]));
                },
                function () {
                    deferred.reject();
                });

            return (deferred.promise);
        }

        function getSetting(id) {
            var deferred = $q.defer();
            if (cache[id]) {
                deferred.resolve(ng.copy(cache[id]));
            } else {
                $http.get('api/applicationsettings/' + id).then(
                    function (response) {
                        if (response.data) {
                            cache[id] = ng.fromJson(response.data.Value);
                            deferred.resolve(ng.copy(cache[id]));
                        } else {
                            deferred.reject();
                        }
                    },
                    function () {
                        deferred.reject();
                    });
            }

            return (deferred.promise);
        }

        function getSettings() {
            var deferred = $q.defer();
            if (Object.keys(cache).length > 0) {
                deferred.resolve(ng.copy(cache));
            } else {
                $http.get('api/applicationsettings').then(
                    function (response) {
                        if (response.data) {
                            _.forEach(response.data, function (item) {
                                cache[item.Id] = ng.fromJson(item.Value || "{}");
                            });
                            deferred.resolve(ng.copy(cache));
                        } else {
                            deferred.reject();
                        }
                    },
                    function () {
                        deferred.reject();
                    });
            }

            return (deferred.promise);
        }

        var cache = {};

        return ({
            getSetting: getSetting,
            getSettings: getSettings,
            setSetting: setSetting
        });
    }]);

})(angular, CricBase);