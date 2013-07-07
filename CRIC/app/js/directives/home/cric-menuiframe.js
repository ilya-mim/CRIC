(function (ng, app) {

    "use strict";

    app.directive('cricMenuIframe',
        function () {
            return {
                restrict: "A",
                template: '<iframe src="javascript:false;" frameBorder="0" scrolling="no" allowtransparency="true"></iframe>',
                replace: true,
                link: function (scope, element, attrs) {
                    scope.$on('$destroy', function () {
                        $(".nav > .dropdown > a.dropdown-toggle").unbind("click", on_dropdown_menu_toggle);
                    });

                    $(".nav > .dropdown > a.dropdown-toggle").bind("click", on_dropdown_menu_toggle);

                    function on_dropdown_menu_toggle() {
                        var menu = $('.dropdown-menu', $(this).parent());
                        if (!menu.is(":visible")) {
                            setTimeout(function () {
                                (function () {
                                    element.css({
                                        "left": menu != undefined ? menu.offset().left : 0,
                                        "width": menu != undefined ? menu.get(0).offsetWidth : 0,
                                        "height": menu != undefined ? menu.get(0).offsetHeight : 0,
                                        "display": menu != undefined ? menu.css("display") : "none"
                                    });
                                })();
                            }, 10);
                        }
                    }
                }
            }
    });

})(angular, Cric);
