using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Diagnostics;
using System.Net;
using System.Net.Mail;
using System.Web;
using CRIC.Models;
using log4net;
using System.Text;

namespace CRIC.Services
{
    public class MailService
    {
        private static int mailCounter = 1;
        private static readonly object syncObject = new object();
        private static string EmailListener = ConfigurationManager.AppSettings["EmailListener"];
        private readonly IApplicationSettingsRepository repository;
        private static readonly ILog log = LogManager.GetLogger(typeof(MailService));

        public MailService(IApplicationSettingsRepository repository)
        {
            if (repository == null)
            {
                throw new ArgumentNullException("repository");
            }

            this.repository = repository;
        }

        public void SendMessage(EmailMessage message)
        {
            MailMessage msg = new MailMessage()
            {
                Subject = message.Subject,
                Body = message.Body,
                BodyEncoding = System.Text.Encoding.Unicode,
                IsBodyHtml = true
            };

            msg.To.Add(message.To);

            try
            {
                CreateSmtpClient().SendAsync(msg, msg);
            }
            catch (Exception ex)
            {
                log.Error(ex.GetFullMessage());
            }
        }

        private SmtpClient CreateSmtpClient()
        {
            SmtpClient smtpMail = new SmtpClient();

            if (smtpMail.DeliveryMethod != SmtpDeliveryMethod.SpecifiedPickupDirectory)
            {
                Dictionary<string, string> settings =
                    JsonConvert.DeserializeObject<Dictionary<string, string>>(repository.Get("smtp").Value);
                if (settings != null)
                {
                    smtpMail = new SmtpClient()
                    {
                        Host = settings["hostname"],
                        Port = int.Parse(settings["port"]),
                        EnableSsl = Convert.ToBoolean(settings["ssl"]),
                        Credentials = new NetworkCredential(settings["username"], settings["password"]),
                        DeliveryMethod = SmtpDeliveryMethod.Network
                    };
                }
                else
                {
                    smtpMail.DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory;
                }
            }

            smtpMail.SendCompleted += new SendCompletedEventHandler(SendMessage_OnCompleted);

            return smtpMail;
        }

        private static void SendMessage_OnCompleted(object sender, AsyncCompletedEventArgs e)
        {
            lock (syncObject)
            {
                MailMessage mail = (MailMessage)e.UserState;
                using (TextWriterTraceListener tl = new TextWriterTraceListener(EmailListener))
                {
                    string status = string.Empty;

                    if (e.Cancelled)
                        status = "Cancelled";
                    if (e.Error != null)
                        status = e.Error.GetFullMessage();

                    tl.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6} {7}",
                            DateTime.Now.Date.ToShortDateString(), DateTime.Now.ToMilitaryTimeString(), System.Net.Dns.GetHostName(), mailCounter++, mail.From, mail.To, mail.Subject, status));

                    tl.Flush();
                }
            }
        }
    }
}