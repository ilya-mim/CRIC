using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web;
using System.Web.Http;
using System.Linq;

namespace CRIC
{
    public static class Extensions
    {
        public static HttpResponseMessage CreateResponseMessageFromFile(this ApiController controller, string virtualPath)
        {
            string physicalPath = HttpContext.Current.Server.MapPath(virtualPath);

            if (!System.IO.File.Exists(physicalPath))
            {
                throw new HttpResponseException(controller.Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return new HttpResponseMessage()
            {
                Content = new StringContent(System.IO.File.ReadAllText(physicalPath))
            };
        }
    }
}