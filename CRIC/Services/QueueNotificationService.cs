using System;
using System.Messaging;

namespace CRIC.Services
{
    public class QueueNotificationService : BaseNotificationService
    {
        protected override void Run(EmailMessage message)
        {
            Message msg = new Message();
            msg.Body = new EmailMessage()
            {
                Subject = message.Subject,
                Body = message.Body,
                To = message.To
            };
            msg.Recoverable = true;
            msg.Formatter = new BinaryMessageFormatter();

            string queuePath = @".\private$\CricEmails";

            if (!MessageQueue.Exists(queuePath))
            {
                MessageQueue.Create(queuePath);
            }

            MessageQueue queue = new MessageQueue(queuePath);
            queue.Formatter = new BinaryMessageFormatter();
            queue.Send(msg);
        }
    }
}