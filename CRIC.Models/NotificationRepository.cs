using System;
using System.Collections.Generic;
using System.Linq;

namespace CRIC.Models
{
    public enum NotificationEvents
    {
        All = 0,
        AccountCreated = 1,
        AccountPasswordChanged = 2,
        AccountRemoved = 3
    }

    public interface INotificationRepository
    {
        IEnumerable<NotificationSource> GetSources();
        IEnumerable<NotificationEvent> GetEvents();
        IEnumerable<NotificationMessage> GetMessages(NotificationEvents eventid = NotificationEvents.All);
        bool UpdateMessage(int id, NotificationMessage message);
        NotificationMessage CreateMessage(NotificationMessage message);
        bool RemoveMessage(int id);
    }

    public class NotificationRepository : INotificationRepository
    {
        public IEnumerable<NotificationSource> GetSources()
        {
            using (var db = new NotificationsContext())
            {
                return db.NotificationSources.Include("Events").ToArray();
            }
        }

        public IEnumerable<NotificationEvent> GetEvents()
        {
            using (var db = new NotificationsContext())
            {
                return db.NotificationEvents.Include("Source").ToArray();
            }
        }

        public IEnumerable<NotificationMessage> GetMessages(NotificationEvents eventid = NotificationEvents.All)
        {
            using (var db = new NotificationsContext())
            {
                if (eventid == NotificationEvents.All)
                {
                    return db.NotificationMessages.Include("Event.Source").ToArray();
                }
                else
                {
                    return db.NotificationMessages.Include("Event.Source")
                        .Where(m => m.EventId == (int)eventid).ToArray();
                }
            }
        }

        public bool UpdateMessage(int id, NotificationMessage message)
        {
            if (message == null)
            {
                throw new ArgumentNullException("message");
            }

            if (id <= 0)
            {
                throw new ArgumentNullException("id");
            }

            using (var db = new NotificationsContext())
            {
                var original = db.NotificationMessages.Find(id);
                if (original != null)
                {
                    db.Entry(original).CurrentValues.SetValues(Update(original, message));
                    db.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        public NotificationMessage CreateMessage(NotificationMessage message)
        {
            if (message == null)
            {
                throw new ArgumentNullException("message");
            }

            using (var db = new NotificationsContext())
            {
                var notificationEvent = db.NotificationEvents
                    .Include("Source")
                    .FirstOrDefault(e => e.EventId == message.EventId);

                if (notificationEvent != null)
                {
                    message.Event = notificationEvent;
                    db.NotificationMessages.Add(message);
                    db.SaveChanges();
                    return message;
                }
                return null;
            }
        }

        private NotificationMessage Update(NotificationMessage original, NotificationMessage current)
        {
            original.MessageBody = current.MessageBody;
            return original;
        }

        public bool RemoveMessage(int id)
        {
            if (id == 0)
            {
                throw new ArgumentNullException("id");
            }
            
            using (var db = new NotificationsContext())
            {
                NotificationMessage message = db.NotificationMessages.Find(id);
                if (message != null)
                {
                    db.NotificationMessages.Remove(message);
                    db.SaveChanges();
                    return true;
                }
            }

            return false;
        }
    }
}