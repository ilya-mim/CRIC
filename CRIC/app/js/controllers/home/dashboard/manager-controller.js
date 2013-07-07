(function (ng, app) {

    "use strict";

    app.controller("home.dashboard.ManagerCtrl",
        ["$scope", "$q", "_", "RequestContext", "WorkOrderService", "UserService",
        function ($scope, $q, _, RequestContext, WorkOrderService, UserService) {
            $scope.isLoading = true;
            $scope.widgets = [];
            $scope.statuses = [];
            $scope.selectedStatuses = [];
            $scope.areas = [];
            $scope.selectedAreas = [];
            $scope.types = [];
            $scope.selectedTypes = [];
            $scope.templates = [
                {
                    title: "Work Orders",
                    directive: "cric-widget-work-order",
                    size_x: 3,
                    size_y: 2,
                    options: {
                        startDate: Date.today().addDays(-1),
                        endDate: Date.today(),
                        statuses: [],
                        types: [],
                        areas: []
                    }
                },
                {
                    title: "Map",
                    directive: "cric-widget-map",
                    size_x: 3,
                    size_y: 3
                },
                {
                    title: "Calendar",
                    directive: "cric-widget-calendar",
                    size_x: 3,
                    size_y: 2
                },
                {
                    title: "Alerts",
                    directive: "cric-widget-alerts",
                    size_x: 3,
                    size_y: 2
                },
                //{
                //    title: "SCADA",
                //    directive: "cric-widget-scada",
                //    size_x: 3,
                //    size_y: 2
                //},
                //{
                //    title: "BAS",
                //    directive: "cric-widget-bas",
                //    size_x: 3,
                //    size_y: 2
                //},
                //{
                //    title: "Criticality",
                //    directive: "cric-widget-criticality",
                //    size_x: 3,
                //    size_y: 2
                //},
                {
                    title: "Emergency and Corrective Work",
                    directive: "cric-widget-emergency",
                    size_x: 4,
                    size_y: 2
                },
                {
                    title: "Weekly KPM",
                    directive: "cric-widget-kpm",
                    size_x: 3,
                    size_y: 2
                },
                {
                    title: "Chart",
                    directive: "cric-widget-chart",
                    size_x: 3,
                    size_y: 3,
                    options: {
                        id: "openwosbytrade"
                    }
                },
                {
                    title: "Weather",
                    directive: "cric-widget-weather",
                    size_x: 2,
                    size_y: 1,
                    options: {
                        locations: ['2499253'],
                        woeid: true,
                        link: false,
                        unit: 'f'
                    }
                },
                {
                    title: "Reports",
                    directive: "cric-widget-reports",
                    size_x: 2,
                    size_y: 2
                }
            ];

            $scope.statistics = {
                "openwosbytrade": "Open WO's by Trade",
                "emergencycallsbytrade": "Emergency calls by Trade",
                "avghrsonclosedwos": "Avg. Hrs Charged on Closed WO's by Trade",
                "toohottoocold": "Too Hot / Too Сold Calls",
                "closedwosbytrade": "Closed WO's by Trade"
            };

            function loadDictionaries() {
                $scope.statuses = [];
                $scope.selectedStatuses = [];
                $scope.areas = [];
                $scope.selectedAreas = [];

                return $q.all([
                    WorkOrderService.getStatuses().then(function (response) {
                        $scope.statuses = response;
                        _.findWithProperty($scope.templates, "directive", "cric-widget-work-order")
                            .options.statuses = _.keys($scope.statuses);
                    }),
                    WorkOrderService.getAreas().then(function (response) {
                        $scope.areas = response;
                        _.findWithProperty($scope.templates, "directive", "cric-widget-work-order")
                            .options.areas = _.keys($scope.areas);
                    }),
                    WorkOrderService.getTypes().then(function (response) {
                        $scope.types = response;
                        _.findWithProperty($scope.templates, "directive", "cric-widget-work-order")
                            .options.types = _.keys($scope.types);
                    })
                ]);
            }


            function applyRemoteData(response) {
                $scope.widgets = response;
                $scope.template = $scope.templates[0];
                $scope.widget = ng.copy($scope.template);
            }

            function loadRemoteData() {
                $scope.isLoading = true;
                loadDictionaries().then(
                        function (response) {
                            return UserService.getUserProfile();
                        },
                        function () {
                            $scope.isLoading = false;
                            $scope.openModalWindow("error", "For some reason we couldn't load dictionaries. Try refreshing your browser.");
                        }
                ).then(
                    function (response) {
                        applyRemoteData(response.widgets)
                        $scope.isLoading = false;
                    },
                    function () {
                        $scope.isLoading = false;
                        errorCallback("For some reason we couldn't load the user profile. Try refreshing your browser.");
                    }
                );
            }

            $scope.onTemplateChange = function (template) {
                $scope.widget = ng.copy(template);
            }

            $scope.onAddWidgetClick = function (widget) {
                UserService.getUserProfile().then(
                        function (response) {
                            var user = response;
                            user.widgets.push(_.extend(widget, { id: (user.widgets.length + 1) }));
                            return UserService.setUserProfile(user);
                        },
                        function () {
                            $scope.openModalWindow("error", "For some reason we couldn't get user profile. Try refreshing your browser.");
                        }
                ).then(
                        function (response) {
                            $scope.widgets.push(ng.copy(widget));
                            $scope.openModalWindow("success", "The user profile has been successfully saved.");
                        },
                        function () {
                            $scope.openModalWindow("error", "For some reason we couldn't save user profile. Try refreshing your browser.");
                        }
                );
            }

            $scope.removeWidget = function (widget) {
                UserService.getUserProfile().then(
                        function (response) {
                            var user = response;
                            user.widgets = _.without(user.widgets,
                                _.findWithProperty(user.widgets, "id", widget.id));
                            return UserService.setUserProfile(user);
                        },
                        function () {
                            $scope.openModalWindow("error", "For some reason we couldn't get user profile. Try refreshing your browser.");
                        }
                ).then(
                        function (response) {
                            $scope.widgets = _.without($scope.widgets,
                                _.findWithProperty($scope.widgets, "id", widget.id));
                            $scope.openModalWindow("success", "The user profile has been successfully saved.");
                        },
                        function () {
                            $scope.openModalWindow("error", "For some reason we couldn't save user profile. Try refreshing your browser.");
                        }
                );
            }

            RequestContext.setWindowTitle("Dashboard - Management");

            loadRemoteData();

        }]);

})(angular, Cric);

