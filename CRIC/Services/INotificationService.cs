using System;
using System.Collections.Generic;
using CRIC.Models;

namespace CRIC.Services
{
    public interface INotificationService
    {
        void SendMessage<T>(string to, IEnumerable<NotificationMessage> messages, T context);
    }
}
