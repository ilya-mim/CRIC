(function (ng, app) {

    "use strict";

    app.service("NotificationService",
        ["$http", "$q", "_",
        function ($http, $q, _) {
            var mapper = {
                MessageId: "messageid",
                SourceId: "sourceid",
                EventId: "eventid",
                MessageBody: "messagebody",
                EventName: "eventname",
                SourceName: "sourcename"
            };

            function searchMessages(messages, searchParams, sortParams) {
                var filteredMessages = _.filter(messages, function (message) {
                    var found = true;
                    for (var i = 0; i < searchParams.length; i++) {
                        var searchParam = searchParams[i];
                        if (searchParam.values.length > 0) {
                            found = found && _.contains(searchParam.values, message[searchParam.name]);
                        }
                        if (!found) {
                            break;
                        }
                    }
                    return found;
                });

                if (sortParams.sortdesc) {
                    return _.sortBy(filteredMessages, sortParams.sortby).reverse();
                } else {
                    return _.sortBy(filteredMessages, sortParams.sortby);
                }
            }

            function map(items, mapper, converter) {
                return _.map(items, function (item) {
                    var mapped = {};
                    _.each(item, function (value, key) {
                        key = mapper[key];
                        if (key) {
                            mapped[key] = converter ? converter(key, value) : value;
                        }
                    });
                    return mapped;
                });
            }

            function fromJson(key, value) {
                if (["messageid", "eventid", "sourceid"].indexOf(key) > -1) {
                    return value.toString();
                }
                return value;
            }

            function toJson(key, value) {
                if (["messageid", "eventid", "sourceid"].indexOf(key) > -1) {
                    return parseInt(value) || null;
                }
                return value;
            }

            function getMessages(searchParams, sortParams, cache) {
                var deferred = $q.defer();
                if (messages && cache) {
                    deferred.resolve(ng.copy(searchMessages(messages, searchParams, sortParams)));
                } else {
                    $http.get('api/notifications').then(
                        function (response) {
                            messages = map(response.data, mapper, fromJson);
                            deferred.resolve(ng.copy(searchMessages(messages, searchParams, sortParams)));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function saveMessage(message) {
                if (message.messageid) {
                    return updateMessage(message);
                } else {
                    return createMessage(message);
                }
            }

            function updateMessage(message) {
                var deferred = $q.defer();
                $http.put('api/notifications/' + message.messageid, map([message], _.invert(mapper), toJson)[0]).then(
                    function (response) {
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function createMessage(message) {
                var deferred = $q.defer();
                $http.post('api/notifications', map([message], _.invert(mapper), toJson)[0]).then(
                    function (response) {
                        messages.push(map([response.data], mapper, fromJson)[0]);
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function deleteMessage(message) {
                var deferred = $q.defer();
                $http['delete']('api/notifications/' + message.messageid).then(
                    function (response) {
                        messages = _.without(messages, _.findWithProperty(messages, "messageid", message.messageid));
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function getSources() {
                var deferred = $q.defer();
                if (sources) {
                    deferred.resolve(ng.copy(sources));
                } else {
                    $http.get('api/notifications/sources').then(
                        function (response) {
                            sources = {};
                            for (var i = 0; i < response.data.length; ++i) {
                                var sourceid = response.data[i].SourceId;
                                sources[sourceid] = {
                                    sourcename: response.data[i].SourceName,
                                    events: _.omit(response.data[i].Events, "$id"),
                                    attributes: _.omit(response.data[i].Attributes, "$id")
                                };
                            }
                            deferred.resolve(ng.copy(sources));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            var messages;
            var sources;

            return ({
                getMessages: getMessages,
                saveMessage: saveMessage,
                deleteMessage: deleteMessage,
                getSources: getSources
            });
        }]);

})(angular, CricAdmin);