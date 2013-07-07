using CRIC.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CRIC.Controllers
{
    public class NotificationSourceDTO
    {
        public int SourceId { get; set; }
        public string SourceName { get; set; }
        public IDictionary<int, string> Events { get; set; }
        public IDictionary<string, string> Attributes { get; set; }
    }

    public class NotificationMessageDTO
    {
        public int? MessageId { get; set; }
        public int SourceId { get; set; }
        public int EventId { get; set; }
        public string MessageBody { get; set; }
        public string EventName { get; set; }
        public string SourceName { get; set; }
    }

    public class NotificationsController : ApiController
    {
        private readonly INotificationRepository repository;

        public NotificationsController(INotificationRepository repository)
        {
            if (repository == null)
            {
                throw new ArgumentNullException("repository");
            }

            this.repository = repository;
        }

        // GET api/notifications
        public IEnumerable<NotificationMessageDTO> Get()
        {
            return from message in repository.GetMessages()
                   select new NotificationMessageDTO
                   {
                       MessageId = message.MessageId,
                       SourceId = message.Event.SourceId,
                       EventId = message.Event.EventId,
                       EventName = message.Event.EventName,
                       SourceName = message.Event.Source.SourceName,
                       MessageBody = message.MessageBody,
                   };
        }

        // GET api/notifications/sources
        [ActionName("sources")]
        public IEnumerable<NotificationSourceDTO> GetSources()
        {
            return from s in repository.GetSources()
                   select new NotificationSourceDTO
                   {
                       SourceId = s.SourceId,
                       SourceName = s.SourceName,
                       Events = (from e in s.Events
                                select new 
                                {
                                    e.EventId,
                                    e.EventName
                                }).ToDictionary(e => e.EventId, e => e.EventName),
                       Attributes = (from p in Type.GetType(s.SourceType).GetAttributedProperties<VisibleAttribute>()
                                     select new 
                                     { 
                                         p.PropertyName, 
                                         p.Attribute.Label 
                                     }).ToDictionary(p => p.PropertyName, p => p.Label)
                   };
        }

        // GET api/notifications/events
        [ActionName("events")]
        public IEnumerable<NotificationEvent> GetEvents()
        {
            return repository.GetEvents();
        }

        // POST api/notifications
        public NotificationMessageDTO Post(NotificationMessageDTO value)
        {
            var message = repository.CreateMessage(
                new NotificationMessage()
                {
                    EventId = value.EventId,
                    MessageBody = value.MessageBody
                });

            if (message == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return new NotificationMessageDTO
            {
                MessageId = message.MessageId,
                SourceId = message.Event.SourceId,
                EventId = message.Event.EventId,
                EventName = message.Event.EventName,
                SourceName = message.Event.Source.SourceName,
                MessageBody = message.MessageBody,
            };
        }

        // PUT api/notifications
        public void Put(int id, NotificationMessageDTO value)
        {
            if (!repository.UpdateMessage(id,
                new NotificationMessage()
                {
                    MessageBody = value.MessageBody
                }))
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
        }

        // DELETE api/notifications/5
        public void Delete(int id)
        {
            if (!repository.RemoveMessage(id))
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
        }
    }
}
