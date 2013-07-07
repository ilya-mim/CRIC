(function (ng, app) {

    "use strict";

    app.service("WorkOrderService",
        ["$http", "$q", "_", "TradeColors",
        function ($http, $q, _, TradeColors) {
            function searchWorkOrders(orders, searchParams, sortParams) {
                orders = _.filter(orders, function (workorder) {
                    var found = true;
                    for (var i = 0; i < searchParams.length; i++) {
                        var searchParam = searchParams[i];
                        if (searchParam.regexp) {
                            found = found && searchParam.regexp.test(workorder[searchParam.name]);
                        } else if (searchParam.values.length > 0) {
                            if (searchParam.isdate) {
                                var orderDate = Date.parse(workorder[searchParam.name]);
                                found = found && orderDate.between(
                                            Date.parse(searchParam.values[0]),
                                            Date.parse(searchParam.values[1])
                                         );
                            } else {
                                if (searchParam.values.length > 0) {
                                    found = found && _.contains(searchParam.values, workorder[searchParam.name]);
                                }
                            }
                        }
                        if (!found) {
                            break;
                        }
                    }
                    return found;
                });

                if (sortParams) {
                    if (sortParams.sortdesc) {
                        return _.sortBy(orders, sortParams.sortby).reverse();
                    } else {
                        return _.sortBy(orders, sortParams.sortby);
                    }
                } else {
                    return orders;
                }
            }

            function getWorkOrders(searchParams, sortParams) {
                var deferred = $q.defer();
                if (workorders) {
                    deferred.resolve(searchWorkOrders(ng.copy(workorders), searchParams, sortParams));
                } else {
                    $http.get('api/workorders').then(
                        function (response) {
                            workorders = response.data;
                            deferred.resolve(searchWorkOrders(ng.copy(workorders), searchParams, sortParams));
                        }, 
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function today() {
                //return Date.today();
                return Date.parse("05/15/2013");
            }

            function getStatistic(id) {
                if (id == "openwosbytrade") {
                    return distributeByTrade([
                        {
                            isdate: true,
                            name: "StartDate",
                            values: [today().moveToFirstDayOfMonth(),
                                     today().moveToLastDayOfMonth()]
                        },
                        {
                            name: "Status",
                            values: ["OPEN"]
                        }]);
                } else if (id == "emergencycallsbytrade") {
                    return distributeByTrade([
                        {
                            isdate: true,
                            name: "StartDate",
                            values: [today().moveToFirstDayOfMonth(),
                                     today().moveToLastDayOfMonth()]
                        },
                        {
                            name: "Type",
                            values: ["CM", "EM"]
                        }]);
                } else if (id == "avghrsonclosedwos") {
                    return distributeByCharges([
                        {
                            isdate: true,
                            name: "StartDate",
                            values: [today().clearTime().moveToFirstDayOfMonth().add(-1).months(),
                                     today().clearTime().moveToLastDayOfMonth().add(-1).months()]
                        },
                        {
                            name: "Status",
                            values: ["CLOSED"]
                        }]);
                } else if (id == "closedwosbytrade") {
                    return distributeByTrade([
                        {
                            isdate: true,
                            name: "StartDate",
                            values: [today().clearTime().moveToFirstDayOfMonth().add(-1).months(),
                                     today().clearTime().moveToLastDayOfMonth().add(-1).months()]
                        },
                        {
                            name: "Status",
                            values: ["CLOSED"]
                        }]);
                } else if (id == "toohottoocold") {
                    return distributeByTrade([
                        {
                            isdate: true,
                            name: "StartDate",
                            values: [today().moveToFirstDayOfMonth(),
                                        today().moveToLastDayOfMonth()]
                        },
                        {
                            name: "Status",
                            values: ["OPEN"]
                        },
                        {
                            regexp: /too[\s]+(cold|hot)/im,
                            name: "Description"
                        }]);
                }
            }

            function distributeByCharges(searchParams) {
                var deferred = $q.defer();
                $q.all([
                    getTrades(),
                    getWorkOrders(searchParams).then(
                        function (response) {
                            var charges = {};
                            _.each(response, function (order) {
                                var charge = charges[order["Trade"]];
                                if (charge) {
                                    charge.count++;
                                    charge.value += parseFloat(order["Labor Hrs"]) || 0;
                                } else {
                                    charges[order["Trade"]] = {
                                        count: 1,
                                        value: parseFloat(order["Labor Hrs"]) || 0
                                    };
                                }
                            });

                            var results = [];
                            _.each(_.keys(charges), function (key) {
                                results.push({
                                    name: trades[key],
                                    y: charges[key].value / charges[key].count,
                                    sliced: key == "HV",
                                    selected: key == "HV",
                                    color: TradeColors[key]
                                });
                            });
                            deferred.resolve(results);
                        },
                        function () {
                            deferred.reject();
                        })]);
                return (deferred.promise);
            }

            function distributeByTrade(searchParams) {
                var deferred = $q.defer();
                $q.all([
                    getTrades(),
                    getWorkOrders(searchParams).then(
                        function (response) {
                            var results = [];
                            _.each(_.keys(trades), function (key) {
                                var nums = _.filterWithProperty(response, "Trade", key).length;
                                if (nums > 0) {
                                    results.push({
                                        name: trades[key],
                                        y: nums,
                                        sliced: key == "HV",
                                        selected: key == "HV",
                                        color: TradeColors[key]
                                    });
                                }
                            });
                            deferred.resolve(results);
                        },
                        function () {
                            deferred.reject();
                        })]);
                return (deferred.promise);
            }

            function getBuildings() {
                var deferred = $q.defer();
                if (buildings) {
                    deferred.resolve(ng.copy(buildings));
                } else {
                    $http.get('api/workorders/buildings').then(
                        function (response) {
                            buildings = response.data;
                            deferred.resolve(ng.copy(buildings));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function getTypes() {
                var deferred = $q.defer();
                if (types) {
                    deferred.resolve(ng.copy(types));
                } else {
                    $http.get('api/workorders/types').then(
                        function (response) {
                            types = response.data;
                            deferred.resolve(ng.copy(types));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function getStatuses() {
                var deferred = $q.defer();
                if (statuses) {
                    deferred.resolve(ng.copy(statuses));
                } else {
                    $http.get('api/workorders/statuses').then(
                        function (response) {
                            statuses = response.data;
                            deferred.resolve(ng.copy(statuses));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function getSystems() {
                var deferred = $q.defer();
                if (systems) {
                    deferred.resolve(ng.copy(systems));
                } else {
                    $http.get('api/workorders/systems').then(
                        function (response) {
                            systems = response.data;
                            deferred.resolve(ng.copy(systems));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function getAreas() {
                var deferred = $q.defer();
                if (areas) {
                    deferred.resolve(ng.copy(areas));
                } else {
                    $http.get('api/workorders/areas').then(
                        function (response) {
                            areas = response.data;
                            deferred.resolve(ng.copy(areas));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function getTrades() {
                var deferred = $q.defer();
                if (trades) {
                    deferred.resolve(ng.copy(trades));
                } else {
                    $http.get('api/workorders/trades').then(
                        function (response) {
                            trades = response.data;
                            deferred.resolve(ng.copy(trades));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            function getPriorities() {
                var deferred = $q.defer();
                if (priorities) {
                    deferred.resolve(ng.copy(priorities));
                } else {
                    $http.get('api/workorders/priorities').then(
                        function (response) {
                            priorities = response.data;
                            deferred.resolve(ng.copy(priorities));
                        },
                        function () {
                            deferred.reject();
                        });
                }
                return (deferred.promise);
            }

            var workorders;
            var types;
            var systems;
            var priorities;
            var buildings;
            var statuses;
            var areas;
            var trades;
            var colors;

            return ({
                getTypes: getTypes,
                getSystems: getSystems,
                getBuildings: getBuildings,
                getPriorities: getPriorities,
                getStatuses: getStatuses,
                getAreas: getAreas,
                getTrades: getTrades,
                getWorkOrders: getWorkOrders,
                getStatistic: getStatistic
            });
        }]);
})(angular, Cric);