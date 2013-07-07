'use strict';

var CricBase = angular.module('CricBase', [])
    .constant("Colors", {
        '#7bd148': 'Green',
        '#add8e6': 'LightBlue',
        '#7ae7bf': 'LightGreen',
        '#fbd75b': 'Yellow',
        '#ffb878': 'Orange',
        '#ff887c': 'Red',
        '#e1e1e1': 'Gray'
    })
    .constant("TradeColors", {
        'EL': '#4572A7',
        'HV': '#AA4643',
        'RF': '#89A54E',
        'PL': '#80699B',
        'GN': '#3D96AE'
    }).run(["ApplicationSettingsService",
        function (ApplicationSettingsService) {
            ApplicationSettingsService.getSettings().then(
                    function (response) {
                        console.log("Application settings was successfully loaded.");
                    },
                    function () {
                        console.log("We couldn't load the application settings.");
                    }
                );
        }]
    );;

var Cric = angular.module('Cric', ['CricBase'])
    .config(['$routeProvider', '$locationProvider', '$compileProvider',
        function ($routeProvider, $locationProvider, $compileProvider) {
            $routeProvider
                .when(
                    '/home/dashboard',
                    {
                        action: 'home.dashboard.grid'
                    })
                .when(
                    '/home/dashboard/manager',
                    {
                        action: 'home.dashboard.manager'
                    })
                .when(
                    '/home/map',
                    {
                        redirectTo: '/home/map/toc'
                    })
                .when(
                    '/home/map/toc',
                    {
                        action: 'home.map.toc'
                    })
                .when(
                    '/home/map/info',
                    {
                        action: 'home.map.info'
                    })
                .when(
                    '/home/map/tools',
                    {
                        redirectTo: '/home/map/tools/bookmarks'
                    })
                .when(
                    '/home/map/tools/bookmarks',
                    {
                        action: 'home.map.tools.bookmarks'
                    })
                .when(
                    '/home/map/tools/query',
                    {
                        redirectTo: '/home/map/tools/query/attributes'
                    })
                .when(
                    '/home/map/tools/query/attributes',
                    {
                        action: 'home.map.tools.query.attributes'
                    })
                .when(
                    '/home/map/tools/query/location',
                    {
                        action: 'home.map.tools.query.location'
                    })
                .when(
                    '/home/map/designreview',
                    {
                        action: 'home.designreview.workorder'
                    })
                .when(
                    '/home/map/cityengine',
                    {
                        action: 'home.cityengine'
                    })
                .when(
                    '/home/workorder',
                    {
                        action: 'home.workorder'
                    })
                .when(
                    '/home/chart',
                    {
                        action: 'home.chart'
                    })
                .when(
                    '/home/report',
                    {
                        action: 'home.report'
                    })
                .when(
                    '/home/userprofile',
                    {
                        action: 'home.userprofile'
                    })
                .when(
                    '/home/about',
                    {
                        action: 'home.about'
                    })
                .when(
                    '/logoff',
                    {
                        action: 'home.logoff'
                    })
                .otherwise(
                    {
                        redirectTo: '/home/dashboard'
                    });

            $locationProvider.html5Mode(false).hashPrefix('!');
            $compileProvider.urlSanitizationWhitelist(/^\s*(https?|javascript):/);
        }]
    ).run(["MapService",
        function (MapService) {
            MapService.getConfig().then(
                function (response) {
                    console.log("Map config was successfully loaded.");
                },
                function () {
                    console.log("We couldn't load the map configuration.");
                }
            );
        }]
    );

var CricAdmin = angular.module('CricAdmin', ['CricBase'])
    .config(['$routeProvider', '$locationProvider',
        function ($routeProvider, $locationProvider) {

            $routeProvider
                .when(
                    '/admin/users',
                    {
                        action: 'admin.user'
                    })
                .when(
                    '/admin/workordersettings',
                    {
                        action: 'admin.workordersetting'
                    })
                .when(
                    '/admin/smtp',
                    {
                        action: 'admin.smtp'
                    })
                .when(
                    '/admin/notifications',
                    {
                        action: 'admin.notification'
                    })
                .when(
                    '/admin/userprofile',
                    {
                        action: 'admin.userprofile'
                    })
                .when(
                    '/admin/about',
                    {
                        action: 'admin.about'
                    })
                .when(
                    '/logoff',
                    {
                        action: 'admin.logoff'
                    })
                .otherwise(
                    {
                        redirectTo: '/admin/users'
                    });

            $locationProvider.html5Mode(false).hashPrefix('!');
        }]
    );
