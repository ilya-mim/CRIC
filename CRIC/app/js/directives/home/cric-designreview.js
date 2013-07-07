(function (ng, app) {

    "use strict";
    
    app.directive('cricDesignReview', ["$rootScope", "$timeout", "_",
            function ($rootScope, $timeout, _) {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    scope.$on("destroy", function () {
                        if (ECompViewer) {
                            ADViewer.Viewer.ExecuteCommand("EXIT");
                            delete window["ECompViewer"];
                            ADViewer.detachEvent("OnUpdateUiItem", OnUpdateUiItem);
                        }
                        $(window).unbind("resize", on_window_resize);
                    });

                    function on_window_resize() {
                        element.width($(window).width());
                    }

                    function createAndIsolateSelectionSet(propertyName, propertyValues) {
                        window["userCollection"] = ECompViewer.Section.Content.CreateUserCollection();
                        window["emptyCollection"] = ECompViewer.Section.Content.CreateUserCollection();

                        var objects = ECompViewer.Section.Content.Objects(0);
                        for (i = 1; (i <= objects.Count) ; i++) {
                            var props = objects(i).Properties;
                            for (p = 1; (p <= props.Count) ; p++) {
                                prop = props(p);
                                if ((prop.Name == propertyName) && (propertyValues.indexOf(prop.Value) > -1)) {
                                    window["userCollection"].AddItem(objects(i));
                                }
                            }
                        }

                        eval("window['ECompViewer'].Section.Content.Objects(1) = window['userCollection']");
                        ADViewer.ExecuteCommand('SHOWALL');
                        ADViewer.ExecuteCommand('ISOLATE');
                        eval("window['ECompViewer'].Section.Content.Objects(1) = window['emptyCollection']");

                        delete window["userCollection"];
                        delete window["emptyCollection"];

                        //extentCollection(userCollection);
                    }

                    function extentCollection(collection) {
                        var extent = ECompViewer.Section.Content.Extents(userCollection);
                        var camera = ECompViewer.Section.Camera;
                        camera.Field.Set(extent.Left + 25, extent.Top + 25);
                        ECompViewer.Section.Camera = camera;
                    }

                    function refresh_element() {
                        element
                            .width($(window).width() - 1)
                            .width($(window).width() + 1);
                    }

                    function OnUpdateUiItem(type, state, data) {
                        if (type == "OBJECTPROPERTIES") {
                            refresh_element();
                            var props = data;
                            if (props) {
                                for (i = 1; i <= props.Count; i++) {
                                    var prop = props.Item(i);
                                    if (prop && prop.Name == attrs.assetnumfield) {
                                        $rootScope.$broadcast("designreview:objectproperties", prop.Value);
                                    }
                                }
                            }
                        }
                    }

                    $rootScope.$on("designreview:isolateSelected", function (event, args) {
                        if (ECompViewer) {
                            createAndIsolateSelectionSet("Id", _.pluck(args, "assetnum"));
                            refresh_element();
                        }
                    });

                    $(window).bind("resize", on_window_resize);

                    var ADViewer = element.width(element.width() - 1).get(0);
                    var ECompViewer = ADViewer.ECompositeViewer;
                    window["ECompViewer"] = ECompViewer;
                    if (ECompViewer) {
                        $timeout(function () {
                            ADViewer.attachEvent("OnUpdateUiItem", OnUpdateUiItem);
                            ECompViewer.NavigateToURL(scope.fileUrl);
                            ADViewer.Viewer.WaitForPageLoaded();

                            refresh_element();

                            var commands = ECompViewer.Commands;
                            commands("SHOWALL").Enabled = true;
                            commands("ISOLATE").Enabled = true;

                            commands("SEARCHBAND").Toggled = true;
                            commands("MODELBAND").Toggled = true;

                            ADViewer.ExecuteCommand('SHOWALL');
                        }, 1000);
                    } else {
                        element.append(
                            $("<param name='dwffilename'></param>").val(scope.fileUrl)
                        );
                    }
                }
            }
    }]);

})(angular, Cric);

