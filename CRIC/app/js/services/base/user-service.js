(function (ng, app) {

    "use strict";

    app.service("UserService",
        ["$http", "$q", "_", "ApplicationSettingsService",
        function ($http, $q, _, ApplicationSettingsService) {
            var mapper = {
                UserId: "userid",
                UserName: "username",
                FullName: "fullname",
                Email: "email",
                Widgets: "widgets",
                Colors: "colors",
                Bookmarks: "bookmarks",
                Roles: "roles",
                Password: "password",
                Disabled: "disabled"
            };

            function searchUsers(users, searchParams, sortParams) {
                var filteredUsers = _.filter(users, function (user) {
                    var found = true;
                    for (var i = 0; i < searchParams.length; i++) {
                        var searchParam = searchParams[i];
                        if (searchParam.values.length > 0) {
                            if (_.isArray(user[searchParam.name])) {
                                found = found && _.intersection(searchParam.values, user[searchParam.name]).length > 0;
                            } else {
                                found = found && _.contains(searchParam.values, user[searchParam.name]);
                            }
                        }
                        if (!found) {
                            break;
                        }
                    }
                    return found;
                });

                if (sortParams.sortdesc) {
                    return _.sortBy(filteredUsers, sortParams.sortby).reverse();
                } else {
                    return _.sortBy(filteredUsers, sortParams.sortby);
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
                if (["colors", "widgets", "bookmarks"].indexOf(key) > -1) {
                    return ng.fromJson(value || []);
                }
                return value;
            }

            function toJson(key, value) {
                if (["Colors", "Widgets", "Bookmarks"].indexOf(key) > -1) {
                    return value ? ng.toJson(value) : value;
                }
                return value;
            }

            function getUsers(searchParams, sortParams, cache) {
                var deferred = $q.defer();
                if (users && cache) {
                    deferred.resolve(ng.copy(searchUsers(users, searchParams, sortParams)));
                } else {
                    $http.get('api/users').then(
                        function (response) {
                            users = map(response.data, mapper, fromJson);
                            deferred.resolve(ng.copy(searchUsers(users, searchParams, sortParams)));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function saveUser(user) {
                if (user.userid) {
                    return updateUser(user);
                } else {
                    return createUser(user);
                }
            }

            function updateUser(user) {
                var deferred = $q.defer();
                $http.put('api/users/' + user.userid, map([user], _.invert(mapper), toJson)[0]).then(
                    function (response) {
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function createUser(user) {
                var deferred = $q.defer();
                $http.post('api/users', map([user], _.invert(mapper), toJson)[0]).then(
                    function (response) {
                        users.push(map([response.data], mapper, fromJson)[0]);
                        deferred.resolve();
                    },
                    function (response) {
                        deferred.reject(response);
                    });

                return (deferred.promise);
            }

            function resetPassword(user) {
                var deferred = $q.defer();
                $http.get('api/users/' + user.userid + '/resetpassword').then(
                    function (response) {
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function deleteUser(user) {
                var deferred = $q.defer();
                $http['delete']('api/users/' + user.userid).then(
                    function (response) {
                        users = _.without(users, _.findWithProperty(users, "userid", user.userid));
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function getRoles() {
                var deferred = $q.defer();
                if (roles) {
                    deferred.resolve(ng.copy(roles));
                } else {
                    $http.get('api/users/roles').then(
                        function (response) {
                            roles = {};
                            for (var i = 0; i < response.data.length; ++i) {
                                roles[response.data[i]] = response.data[i];
                            }
                            deferred.resolve(ng.copy(roles));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function setUserProfile(user) {
                var deferred = $q.defer();
                $http.put('api/users/current', map([user], _.invert(mapper), toJson)[0]).then(
                    function (response) {
                        profile = ng.copy(user);
                        deferred.resolve(profile);
                    },
                    function () {
                        deferred.reject();
                    });

                return (deferred.promise);
            }

            function getUserProfile() {
                var deferred = $q.defer();
                if (profile) {
                    deferred.resolve(ng.copy(profile));
                } else {
                    ApplicationSettingsService.getSetting("colors").then(
                            function (response) {
                                var colors = response;
                                $http.get('api/users/current').then(
                                    function (response) {
                                        if (response.data) {
                                            profile = map([response.data], mapper, fromJson)[0];
                                            if (!profile.colors || profile.colors.length == 0) {
                                                profile.colors = colors;
                                            }
                                            deferred.resolve(ng.copy(profile));
                                        } else {
                                            deferred.reject();
                                        }
                                    },
                                    function () {
                                        deferred.reject();
                                    });
                            },
                            function () {
                                console.log("We couldn't load the application settings.");
                            }
                        );
                }

                return (deferred.promise);
            }

            var profile;
            var users;
            var roles ;

            return ({
                getUserProfile: getUserProfile,
                setUserProfile: setUserProfile,
                getUsers: getUsers,
                saveUser: saveUser,
                resetPassword: resetPassword,
                deleteUser: deleteUser,
                getRoles: getRoles
        });
    }]);

})(angular, CricBase);