using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web;

namespace CRIC.Models
{
    [Table("ApplicationSettings")]
    public class ApplicationSetting
    {
        [Key]
        public string Id { get; set; }
        public string Value { get; set; }
    }

    public class ApplicationSettingsContext : DbContext
    {
        public ApplicationSettingsContext()
            : base("DefaultConnection")
        {
        }

        public DbSet<ApplicationSetting> ApplicationSettings { get; set; }
    }

    public class ApplicationSettingsContextInitializer : IDatabaseInitializer<ApplicationSettingsContext>
    {
        private bool isTableExist(string schema, string table, DbContext context)
        {
            bool exists = context.Database.SqlQuery<int?>(@"
                         SELECT 1 FROM sys.tables AS T
                         INNER JOIN sys.schemas AS S ON T.schema_id = S.schema_id
                         WHERE S.Name = '" + schema + "' AND T.Name = '" + table + "'")
                                                              .SingleOrDefault() != null;

            return exists;
        }

        public void InitializeDatabase(ApplicationSettingsContext context)
        {
            Database.SetInitializer<ApplicationSettingsContext>(null);

            try
            {
                var objectContext = ((IObjectContextAdapter)context).ObjectContext;

                if (!context.Database.Exists())
                {
                    objectContext.CreateDatabase();
                }

                if (isTableExist("dbo", "ApplicationSettings", context))
                    return;

                objectContext.ExecuteStoreCommand(objectContext.CreateDatabaseScript());

                var settings = new List<ApplicationSetting>()            
                    {
                        new ApplicationSetting() 
                        { 
                            Id = "colors", 
                            Value = "{\"ACT\":\"#7bd148\",\"PEN\":\"#ffb878\",\"CMP\":\"#fbd75b\",\"CAN\":\"#ffb878\"}" 
                        },
                        new ApplicationSetting() 
                        { 
                            Id = "smtp", 
                            Value = "" 
                        }
                    };

                settings.ForEach(delegate(ApplicationSetting s)
                {
                    if (context.ApplicationSettings.Find(s.Id) == null)
                    {
                        context.ApplicationSettings.Add(s);
                    }
                });

                context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("", ex);
            }
        }
    }
}