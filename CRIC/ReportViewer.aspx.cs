using Microsoft.Reporting.WebForms;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CRIC.Reports
{
    public partial class Reports : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                string reportFile = string.IsNullOrEmpty(Request.Params["report"]) ?
                    ConfigurationManager.AppSettings["DefaultReport"] : Request.Params["report"];

                ServerReport serverReport = report.ServerReport;
                serverReport.ReportServerUrl = new Uri(ConfigurationManager.AppSettings["ReportServer"]);
                serverReport.ReportPath = ConfigurationManager.AppSettings["ReportPath"];
                serverReport.ReportPath += "/" + reportFile;
                serverReport.SetParameters(new ReportParameter[] { });
            }
        }
    }
}