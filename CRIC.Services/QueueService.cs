using System;
using System.Collections.Generic;
using System.Linq;
using System.Messaging;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CRIC.Models;
using System.Configuration;

namespace CRIC.Services
{
    [Serializable]
    public class EmailMessage
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }
    
    public class QueueService
    {
        private static string QueuePath = ConfigurationManager.AppSettings["QueuePath"];

        public void QueueMessage<T>(string to, IEnumerable<NotificationMessage> messages, T context)
        {
            foreach (var message in messages)
            {
                context.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance)
                    .ToList().ForEach(p =>
                    {
                        message.MessageBody =
                            message.MessageBody.Replace(string.Format("{{{0}}}", p.Name),
                            (p.GetGetMethod().Invoke(context, null) ?? string.Empty).ToString());
                    });

                message.MessageBody = colorize(message.MessageBody);

                Message queueMessage = new Message();
                queueMessage.Body = new EmailMessage()
                {
                    Subject = message.Event.EventName,
                    Body = message.MessageBody,
                    To = to
                };
                queueMessage.Recoverable = true;
                queueMessage.Formatter = new BinaryMessageFormatter();

                InsureQueueExists(QueuePath);

                MessageQueue queue = new MessageQueue(QueuePath);
                queue.Formatter = new BinaryMessageFormatter();
                queue.Send(queueMessage);
            }
        }

        private string colorize(string input)
        {
            return new Regex(@"(?<classTag>class=""wysiwyg-color-(?<colorName>[a-z]+)"")",
                RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.CultureInvariant)
                .Replace(input, @"style=""color: ${colorName};""");
        }
        
        public static void InsureQueueExists(string queuePath)
        {
            if (!MessageQueue.Exists(queuePath))
            {
                MessageQueue.Create(queuePath);
            }
        }
    }
}