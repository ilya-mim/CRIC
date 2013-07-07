using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace CRIC.Controllers
{
    public class ExportModel
    {
        public string Csv { get; set; }

    }

    public class MapController : ApiController
    {
        private string MapConfigVirtualPath = ConfigurationManager.AppSettings["MapConfigVirtualPath"];
        private string AttachmentsVirtualPath = ConfigurationManager.AppSettings["AttachmentsVirtualPath"];

        [ActionName("export")]
        public HttpResponseMessage PostExportResults(ExportModel model)
        {
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            result.Content = new StringContent(model.Csv);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            result.Content.Headers.ContentDisposition.FileName = Path.ChangeExtension(Path.GetRandomFileName(), ".csv");
            return result;
        }

        [ActionName("config")]
        public HttpResponseMessage GetConfig()
        {
            return this.CreateResponseMessageFromFile(MapConfigVirtualPath);
        }
        
        [ActionName("attachments")]
        public HttpResponseMessage GetAttachments()
        {
            return this.CreateResponseMessageFromFile(AttachmentsVirtualPath);
        }
    }
}
