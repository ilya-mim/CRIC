using CRIC.Filters;
using CRIC.Models;
using CRIC.Services;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Web.Http;
using System.Web.Security;
using WebMatrix.WebData;

namespace CRIC.Controllers
{
    public class UserProfileDTO
    {
        public int UserId { get; set; }
        [Visible(Label = "User Name")]
        public string UserName { get; set; }
        [Visible(Label = "Full Name")]
        public string FullName { get; set; }
        [Visible(Label = "Email")]
        public string Email { get; set; }
        public string Widgets { get; set; }
        public string Colors { get; set; }
        public string Bookmarks { get; set; }
        public string[] Roles { get; set; }
        [Visible(Label = "Password")]
        public string Password { get; set; }
        public bool? Disabled { get; set; }
    }

    public class UsersController : ApiController
    {
        private readonly IUserRepository userRepository;
        private readonly INotificationRepository notificationRepository;

        public UsersController(IUserRepository userRepository, 
            INotificationRepository notificationRepository) 
        {
            if (userRepository == null)
            {
                throw new ArgumentNullException("userRepository");
            }

            this.userRepository = userRepository;

            if (notificationRepository == null)
            {
                throw new ArgumentNullException("notificationRepository");
            }

            this.notificationRepository = notificationRepository;
        }

        // GET api/users
        public IEnumerable<UserProfileDTO> Get()
        {
            var users = (from u in userRepository.GetAll()
                         select new UserProfileDTO
                         {
                             UserId = u.UserId,
                             UserName = u.UserName,
                             FullName = u.FullName,
                             Email = u.Email,
                             Roles = Roles.GetRolesForUser(u.UserName),
                             Colors = u.Colors,
                             Widgets = u.Widgets,
                             Bookmarks = u.Bookmarks,
                             Disabled = u.Disabled
                         }).ToArray();

            return users;
        }

        // GET api/users/5
        public UserProfileDTO Get(int id)
        {
            UserProfile user = userRepository.GetById(id);
            if (user == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return new UserProfileDTO
            {
                UserId = user.UserId,
                UserName = user.UserName,
                FullName = user.FullName,
                Email = user.Email,
                Roles = Roles.GetRolesForUser(user.UserName),
                Colors = user.Colors,
                Widgets = user.Widgets,
                Bookmarks = user.Bookmarks,
                Disabled = user.Disabled
            };
        }

        // GET api/users/current
        [Authorize]
        [ActionName("current")]
        public UserProfileDTO GetCurrent()
        {
            UserProfile user = userRepository.GetByName(User.Identity.Name);
            if (user == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return new UserProfileDTO()
            {
                UserName = user.UserName,
                FullName = user.FullName,
                Email = user.Email,
                Roles = Roles.GetRolesForUser(User.Identity.Name),
                Colors = user.Colors,
                Widgets = user.Widgets,
                Bookmarks = user.Bookmarks,
                Password = generateHash(WebSecurity.GetPasswordChangedDate(User.Identity.Name).ToString()),
                Disabled = user.Disabled
            };
        }

        // PUT api/users/current
        [Authorize]
        [ActionName("current")]
        public void PutCurrent(UserProfileDTO value)
        {
            if (!userRepository.Update(User.Identity.Name,
                new UserProfile()
                {
                    Email = value.Email,
                    FullName = value.FullName,
                    Colors = value.Colors,
                    Widgets = value.Widgets,
                    Bookmarks = value.Bookmarks,
                    Disabled = value.Disabled
                }))
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            string token = generateHash(WebSecurity.GetPasswordChangedDate(User.Identity.Name).ToString());
            if (value.Password != token)
            {
                WebSecurity.ResetPassword(
                    WebSecurity.GeneratePasswordResetToken(User.Identity.Name), value.Password);
            }
        }

        // GET api/users/5/resetpassword
        [ActionName("resetpassword")]
        public void GetResetPassword(int id)
        {
            UserProfile user = userRepository.GetById(id);
            if (user == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            string token = WebSecurity.GeneratePasswordResetToken(user.UserName);
            string password = Membership.GeneratePassword(4, 0);

            WebSecurity.ResetPassword(WebSecurity.GeneratePasswordResetToken(user.UserName), 
                password);

            new QueueService().QueueMessage(user.Email,
                notificationRepository.GetMessages(NotificationEvents.AccountPasswordChanged), 
                new UserProfileDTO 
                {
                    UserName = user.UserName,
                    FullName = user.FullName,
                    Email = user.Email,
                    Password = password
                });
        }

        private string generateHash(string salt)
        {
            return Convert.ToBase64String(
                        MD5.Create().ComputeHash(
                            Encoding.UTF8.GetBytes(salt)));
        }

        // GET api/users/roles
        [ActionName("roles")]
        public IEnumerable<string> GetRoles()
        {
            return Roles.GetAllRoles();
        }

        // POST api/users
        public UserProfileDTO Post(UserProfileDTO value)
        {
            if (WebSecurity.UserExists(value.UserName))
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotAcceptable));
            }

            value.Password = Membership.GeneratePassword(4, 0);

            WebSecurity.CreateUserAndAccount(value.UserName, value.Password, new
            {
                UserName = value.UserName,
                FullName = value.FullName,
                Email = value.Email,
                Disabled = value.Disabled
            });

            foreach (var role in value.Roles)
            {
                Roles.AddUserToRole(value.UserName, role);
            }

            //var response = Request.CreateResponse<UserProfileDTO>(HttpStatusCode.Created, value);
            //response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = value.UserId }));
            //return response;

            UserProfile user = userRepository.GetByName(value.UserName);
            if (user == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            new QueueService().QueueMessage(user.Email, 
                notificationRepository.GetMessages(NotificationEvents.AccountCreated), value);

            return new UserProfileDTO()
            {
                UserId = user.UserId,
                UserName = user.UserName,
                FullName = user.FullName,
                Email = user.Email,
                Roles = Roles.GetRolesForUser(value.UserName),
                Colors = user.Colors,
                Widgets = user.Widgets,
                Bookmarks = user.Bookmarks,
                Disabled = user.Disabled
            };
        }

        // PUT api/users/5
        public void Put(int id, UserProfileDTO value)
        {
            if (!userRepository.Update(id, 
                new UserProfile()
                {
                    Email = value.Email,
                    FullName = value.FullName,
                    Colors = value.Colors,
                    Widgets = value.Widgets,
                    Bookmarks = value.Bookmarks,
                    Disabled = value.Disabled
                }))
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            Roles.RemoveUserFromRoles(value.UserName, Roles.GetRolesForUser(value.UserName));

            foreach (var role in value.Roles)
            {
                Roles.AddUserToRole(value.UserName, role);
            }
        }

        // DELETE api/users/5
        public void Delete(int id)
        {
            UserProfile user = userRepository.GetById(id);
            if (user == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            Roles.RemoveUserFromRoles(user.UserName, Roles.GetRolesForUser(user.UserName));
            Membership.DeleteUser(user.UserName);

            new QueueService().QueueMessage(user.Email,
                notificationRepository.GetMessages(NotificationEvents.AccountRemoved),
                new UserProfileDTO
                {
                    UserName = user.UserName,
                    FullName = user.FullName,
                    Email = user.Email
                });
        
        }
    }
}
