using System;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace CRIC.Controllers
{
    public class WorkOrdersController : ApiController
    {
        private static string BuildingsVirtualPath = ConfigurationManager.AppSettings["BuildingsVirtualPath"];
        private static string PrioritiesVirtualPath = ConfigurationManager.AppSettings["PrioritiesVirtualPath"];
        private static string StatusesVirtualPath = ConfigurationManager.AppSettings["StatusesVirtualPath"];
        private static string AreasVirtualPath = ConfigurationManager.AppSettings["AreasVirtualPath"];
        private static string SystemsVirtualPath = ConfigurationManager.AppSettings["SystemsVirtualPath"];
        private static string TypesVirtualPath = ConfigurationManager.AppSettings["TypesVirtualPath"];
        private static string WorkOrdersVirtualPath = ConfigurationManager.AppSettings["WorkOrdersVirtualPath"];
        private static string TradesVirtualPath = ConfigurationManager.AppSettings["TradesVirtualPath"];

        public HttpResponseMessage Get()
        {
            return this.CreateResponseMessageFromFile(WorkOrdersVirtualPath);
        }

        [ActionName("buildings")]
        public HttpResponseMessage GetBuildings()
        {
            return this.CreateResponseMessageFromFile(BuildingsVirtualPath);
        }

        [ActionName("priorities")]
        public HttpResponseMessage GetPriorities()
        {
            return this.CreateResponseMessageFromFile(PrioritiesVirtualPath);
        }

        [ActionName("statuses")]
        public HttpResponseMessage GetStatuses()
        {
            return this.CreateResponseMessageFromFile(StatusesVirtualPath);
        }

        [ActionName("systems")]
        public HttpResponseMessage GetSystems()
        {
            return this.CreateResponseMessageFromFile(SystemsVirtualPath);
        }

        [ActionName("areas")]
        public HttpResponseMessage GetAreas()
        {
            return this.CreateResponseMessageFromFile(AreasVirtualPath);
        }

        [ActionName("types")]
        public HttpResponseMessage GetTypes()
        {
            return this.CreateResponseMessageFromFile(TypesVirtualPath);
        }

        [ActionName("trades")]
        public HttpResponseMessage GetTrades()
        {
            return this.CreateResponseMessageFromFile(TradesVirtualPath);
        }
    }
}
