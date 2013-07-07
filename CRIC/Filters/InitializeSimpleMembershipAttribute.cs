using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading;
using System.Web.Mvc;
using WebMatrix.WebData;
using CRIC.Models;
using System.Web.Security;

namespace CRIC.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public sealed class InitializeSimpleMembershipAttribute : ActionFilterAttribute
    {
        private static SimpleMembershipInitializer _initializer;
        private static object _initializerLock = new object();
        private static bool _isInitialized;

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            LazyInitializer.EnsureInitialized(ref _initializer, ref _isInitialized, ref _initializerLock);
        }

        private class SimpleMembershipInitializer
        {
            public SimpleMembershipInitializer()
            {
                Database.SetInitializer<UsersContext>(null);

                try
                {
                    using (var context = new UsersContext())
                    {
                        if (!context.Database.Exists())
                        {
                            ((IObjectContextAdapter)context).ObjectContext.CreateDatabase();
                            WebSecurity.InitializeDatabaseConnection("DefaultConnection", "UserProfile", "UserId", "UserName", autoCreateTables: true);
                        }
                    }

                    const string adminRole = "Administrator";
                    const string adminName = "administrator";

                    const string userRole = "User";
                    string userName = "user";

                    if (!Roles.RoleExists(adminRole))
                    {
                        Roles.CreateRole(adminRole);
                    }

                    if (!Roles.RoleExists(userRole))
                    {
                        Roles.CreateRole(userRole);
                    }

                    if (!WebSecurity.UserExists(adminName))
                    {
                        WebSecurity.CreateUserAndAccount(adminName, "password", new { 
                            Email = "admin@gmail.com"
                        });
                        Roles.AddUserToRole(adminName, adminRole);
                    }

                    if (!WebSecurity.UserExists(userName))
                    {
                        WebSecurity.CreateUserAndAccount(userName, "password", new {
                            Email = string.Format("{0}@gmail.com", userName)
                        });
                        Roles.AddUserToRole(userName, userRole);
                    }

                    for (int i = 0; i < 20; i++)
                    {
                        userName = string.Format("user{0}", i);
                        if (!WebSecurity.UserExists(userName))
                        {
                            WebSecurity.CreateUserAndAccount(userName, "password", new {
                                Email = string.Format("{0}@gmail.com", userName)
                            });
                            Roles.AddUserToRole(userName, userRole);
                        }
                    }
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException("The ASP.NET Simple Membership database could not be initialized. For more information, please see http://go.microsoft.com/fwlink/?LinkId=256588", ex);
                }
            }
        }
    }
}
