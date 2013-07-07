using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using CRIC.Services;
using System.Configuration;

namespace CRIC.EmailService
{
    public partial class Service1 : ServiceBase
    {
        private static string TimerInterval = ConfigurationManager.AppSettings["TimerInterval"];
        
        Timer timer = new Timer();

        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            timer.Interval = int.Parse(TimerInterval);
            timer.Elapsed += new ElapsedEventHandler(timerElapsed);
            timer.AutoReset = true;
            timer.Enabled = true;
            timer.Start();
        }

        protected override void OnStop()
        {
            QueueProcessor.StopProcessing();
            timer.AutoReset = false;
            timer.Enabled = false;
        }

        void timerElapsed(object sender, ElapsedEventArgs e)
        {
            QueueProcessor.StartProcessing(
                Bootstrapper.Resolve<MailService>());
        }
    }
}
