using CRIC.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Security;
using WebMatrix.WebData;

namespace CRIC.Controllers
{
    public class ApplicationSettingDTO
    {
        public string Value { get; set; }
    }

    public class ApplicationSettingsController : ApiController
    {
        private readonly IApplicationSettingsRepository repository;

        public ApplicationSettingsController(IApplicationSettingsRepository repository) 
        {
            if (repository == null)
            {
                throw new ArgumentNullException("repository");
            }

            this.repository = repository;
        }

        public IEnumerable<ApplicationSetting> Get()
        {
            return repository.GetAll();
        }

        [ActionName("colors")]
        public ApplicationSetting GetColors()
        {
            return GetApplictionSetting("colors");
        }

        [ActionName("smtp")]
        public ApplicationSetting GetSmtp()
        {
            return GetApplictionSetting("smtp");
        }

        [ActionName("smtp")]
        public void PutSmtp(ApplicationSettingDTO setting)
        {
            SetApplictionSetting("smtp", setting);
        }

        [ActionName("colors")]
        public void PutColors(ApplicationSettingDTO setting)
        {
            SetApplictionSetting("colors", setting);
        }

        private void SetApplictionSetting(string key, ApplicationSettingDTO setting)
        {
            if (!repository.Set(key, setting.Value))
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
        }

        private ApplicationSetting GetApplictionSetting(string key)
        {
            ApplicationSetting setting = repository.Get(key);

            if (setting == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            return setting;
        }
    }
}
