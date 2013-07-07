using System.Collections;
using System.Web;
using System.Web.Optimization;
using System.Web.Security;

namespace CRIC
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/app/css/css-main").Include(
                    "~/app/css/bootstrap/bootstrap.css",
                    "~/app/css/bootstrap/prettify.css",
                    "~/app/css/bootstrap/datetimepicker.css",
                    "~/app/css/bootstrap/bootstrap-multiselect.css",
                    "~/app/css/bootstrap/daterangepicker.css",
                    "~/app/css/bootstrap/bootstrap-wysihtml5.css",
                    "~/app/css/bootstrap/prettify.css",
                    "~/app/css/wysiwyg/wysiwyg-color.css",
                    "~/app/css/jquery/jquery.gridster.css",
                    "~/app/css/app.css"));


            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/app/lib/modernizr/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                    "~/app/lib/jquery/jquery-{version}.js",
                    "~/app/lib/jquery/jquery.gridster.js",
                    "~/app/lib/jquery/jquery.mousewheel.js",
                    "~/app/lib/jquery/jquery.zweatherfeed.js",
                    "~/app/lib/jquery/jquery.placeholder.js",
                    "~/app/lib/highcharts/highcharts.js",
                    "~/app/lib/wysihtml5/prettify.js",
                    "~/app/lib/wysihtml5/wysihtml5-0.3.0.js",
                    "~/app/lib/bootstrap/bootstrap.customize.js",
                    "~/app/lib/bootstrap/bootstrap-multiselect.js",
                    "~/app/lib/bootstrap/date.js",
                    "~/app/lib/bootstrap/daterangepicker.js",
                    "~/app/lib/bootstrap/bootstrap-wysihtml5.js",
                    "~/app/lib/lodash/lodash.js",
                    "~/app/lib/angular/angular.js",
                    "~/app/js/app.js"));
        }
    }
}