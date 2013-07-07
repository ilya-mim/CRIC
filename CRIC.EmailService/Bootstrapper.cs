using Microsoft.Practices.Unity;
using CRIC.Models;
using CRIC.Services;

namespace CRIC.EmailService
{
    public sealed class Bootstrapper
    {
        private static IUnityContainer container = null;
        
        public static T Resolve<T>()
        {
            if (container == null)
            {
                container = BuildUnityContainer();
            }

            return container.Resolve<T>();
        }

        private static IUnityContainer BuildUnityContainer()
        {
            var container = new UnityContainer();
            container.RegisterType<IApplicationSettingsRepository, ApplicationSettingsRepository>();
            return container;
        }
    }
}