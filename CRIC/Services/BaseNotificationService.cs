using CRIC.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace CRIC.Services
{
    [Serializable]
    public class EmailMessage
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
    }

    public abstract class BaseNotificationService : INotificationService
    {
        public void SendMessage<T>(string to, IEnumerable<NotificationMessage> messages, T context)
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

                message.MessageBody = messageColorizer(message.MessageBody);
                
                Run(new EmailMessage
                {
                    Subject = message.Event.EventName,
                    Body = message.MessageBody,
                    To = to
                });
            }
        }

        protected abstract void Run(EmailMessage message);

        private string messageColorizer(string input)
        {
            return new Regex(@"(?<classTag>class=""wysiwyg-color-(?<colorName>[a-z]+)"")",
                RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.CultureInvariant)
                .Replace(input, @"style=""color: ${colorName};""");
        }
    }
}