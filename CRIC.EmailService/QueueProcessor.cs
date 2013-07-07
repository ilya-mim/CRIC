using CRIC.Services;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Messaging;
using System.Text;
using System.Threading.Tasks;
using log4net;

namespace CRIC.EmailService
{
    public class QueueProcessor
    {
        private static MessageQueue queue = null;
        private static object lockObject = new object();
        private static MailService mailService = null;
        private static string QueuePath = ConfigurationManager.AppSettings["QueuePath"];

        public static void StartProcessing(MailService service)
        {
            mailService = service;

            QueueService.InsureQueueExists(QueuePath);

            queue = new MessageQueue(QueuePath);
            queue.Formatter = new BinaryMessageFormatter();
            queue.MessageReadPropertyFilter.SetAll();
            queue.ReceiveCompleted += new ReceiveCompletedEventHandler(queueReceiveCompleted);
            queue.BeginReceive();
        }
        static void queueReceiveCompleted(object sender, ReceiveCompletedEventArgs e)
        {
            lock (lockObject)
            {
                mailService.SendMessage((EmailMessage)e.Message.Body);
            }

            queue.BeginReceive();
        }
        public static void StopProcessing()
        {
            queue.Close();
        }
    }
}
