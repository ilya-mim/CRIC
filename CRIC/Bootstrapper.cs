using System.Web.Http;
using Microsoft.Practices.Unity;
using CRIC.Models;
using CRIC.Services;

namespace CRIC
{
    public static class Bootstrapper
    {
        public static void Initialise()
        {
            var container = BuildUnityContainer();
            GlobalConfiguration.Configuration.DependencyResolver = new Unity.WebApi.UnityDependencyResolver(container);
        }

        private static IUnityContainer BuildUnityContainer()
        {
            var container = new UnityContainer();
            container.RegisterType<IUserRepository, UserRepository>();
            container.RegisterType<IApplicationSettingsRepository, ApplicationSettingsRepository>();
            container.RegisterType<INotificationRepository, NotificationRepository>();
            return container;
        }
    }
}