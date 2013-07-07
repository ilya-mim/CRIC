using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRIC.Models
{
    public interface IApplicationSettingsRepository
    {
        ApplicationSetting Get(string id);
        IEnumerable<ApplicationSetting> GetAll();
        bool Set(string id, string value);
    }

    public class ApplicationSettingsRepository : IApplicationSettingsRepository
    {
        public ApplicationSetting Get(string id)
        {
            using (var db = new ApplicationSettingsContext())
            {
                return db.ApplicationSettings.Find(id.ToLower());
            }
        }

        public IEnumerable<ApplicationSetting> GetAll()
        {
            using (var db = new ApplicationSettingsContext())
            {
                return db.ApplicationSettings.ToArray();
            }
        }

        public bool Set(string id, string value)
        {
            if (id == null)
            {
                throw new ArgumentNullException("id");
            }

            using (var db = new ApplicationSettingsContext())
            {
                var original = db.ApplicationSettings.Find(id);
                if (original != null)
                {
                    db.Entry(original).CurrentValues.SetValues(new ApplicationSetting() 
                    {
                        Id = id,
                        Value = value
                    });
                    db.SaveChanges();
                    return true;
                }
                return false;
            }
        }
    }
}