using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace CRIC.Models
{
    [Table("NotificationSource")]
    public class NotificationSource
    {
        [Key]
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int SourceId { get; set; }
        public string SourceName { get; set; }
        public string SourceType { get; set; }

        public ICollection<NotificationEvent> Events { get; set; }
    }

    [Table("NotificationEvent")]
    public class NotificationEvent
    {
        [Key]
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int EventId { get; set; }
        public int SourceId { get; set; }
        public string EventName { get; set; }

        public NotificationSource Source { get; set; }
        public ICollection<NotificationMessage> Messages { get; set; }
    }

    [Table("NotificationMessage")]
    public class NotificationMessage
    {
        [Key]
        [DatabaseGeneratedAttribute(DatabaseGeneratedOption.Identity)]
        public int MessageId { get; set; }
        public int EventId { get; set; }
        public string MessageBody { get; set; }

        public NotificationEvent Event { get; set; }
    }

    public class NotificationsContext : DbContext
    {
        public NotificationsContext()
            : base("DefaultConnection")
        {
        }

        public DbSet<NotificationSource> NotificationSources { get; set; }
        public DbSet<NotificationEvent> NotificationEvents { get; set; }
        public DbSet<NotificationMessage> NotificationMessages { get; set; }
    }

    public class NotificationContextInizializer : IDatabaseInitializer<NotificationsContext>
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

        public void InitializeDatabase(NotificationsContext context)
        {
            Database.SetInitializer<ApplicationSettingsContext>(null);

            try
            {
                var objectContext = ((IObjectContextAdapter)context).ObjectContext;

                if (!context.Database.Exists())
                {
                    objectContext.CreateDatabase();
                }

                if (isTableExist("dbo", "NotificationSource", context))
                    return;

                objectContext.ExecuteStoreCommand(objectContext.CreateDatabaseScript());

                var source = new NotificationSource()
                {
                    SourceName = "User",
                    SourceType = "CRIC.Controllers.UserProfileDTO"
                };

                context.NotificationSources.Add(source);

                var events = new List<NotificationEvent>()
                {
                    new NotificationEvent() 
                    {
                        EventName = "Create account",
                        Source = source
                    },
                    new NotificationEvent() 
                    {  
                        EventName = "Change password",
                        Source = source
                    },
                    new NotificationEvent() 
                    {  
                        EventName = "Remove account",
                        Source = source
                    },
                };

                events.ForEach(delegate(NotificationEvent e)
                {
                    context.NotificationEvents.Add(e);
                });

                var messages = new List<NotificationMessage>()
                {
                    new NotificationMessage() 
                    {
                        MessageBody = "Account has been sucessfully created",
                        Event = events[0]
                    },
                    new NotificationMessage() 
                    {  
                        MessageBody = "Password has been sucessfully changed",
                        Event = events[1]
                    },
                    new NotificationMessage() 
                    {  
                        MessageBody = "Account has been sucessfully removed",
                        Event = events[2]
                    }
                };

                messages.ForEach(delegate(NotificationMessage m)
                {
                    context.NotificationMessages.Add(m);
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