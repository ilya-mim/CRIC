using System;
using System.Collections.Generic;
using System.Linq;

namespace CRIC.Models
{
    public interface IUserRepository
    {
        IEnumerable<UserProfile> GetAll();
        UserProfile GetById(int id);
        UserProfile GetByName(string username);
        bool Update(int id, UserProfile user);
        bool Update(string username, UserProfile user);
    }

    public class UserRepository : IUserRepository
    {
        public IEnumerable<UserProfile> GetAll()
        {
            using (var db = new UsersContext())
            {
                return db.UserProfiles.ToArray();
            }
        }

        public UserProfile GetById(int id)
        {
            using (var db = new UsersContext())
            {
                return db.UserProfiles.Find(id);
            }
        }

        public UserProfile GetByName(string username)
        {
            using (UsersContext db = new UsersContext())
            {
                return db.UserProfiles.First(
                    u => u.UserName.ToLower() == username.ToLower());
            }
        }

        public bool Update(string username, UserProfile user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (string.IsNullOrEmpty(username))
            {
                throw new ArgumentNullException("username");
            }

            using (var db = new UsersContext())
            {
                var original = db.UserProfiles.First(u => u.UserName.ToLower() == username.ToLower());
                if (original != null)
                {
                    db.Entry(original).CurrentValues.SetValues(Update(original, user));
                    db.SaveChanges();
                    return true;
                }
                
                return false;
            }
        }

        public bool Update(int id, UserProfile user)
        {
            if (user == null)
            {
                throw new ArgumentNullException("user");
            }

            if (id <= 0)
            {
                throw new ArgumentNullException("id");
            }

            using (var db = new UsersContext())
            {
                var original = db.UserProfiles.Find(id);
                if (original != null)
                {
                    db.Entry(original).CurrentValues.SetValues(Update(original, user));
                    db.SaveChanges();
                    return true;
                }
                return false;
            }
        }

        private UserProfile Update(UserProfile original, UserProfile current)
        {
            original.FullName = current.FullName;
            original.Email = current.Email;
            original.Disabled = current.Disabled;
            original.Bookmarks = current.Bookmarks;
            original.Colors = current.Colors;
            original.Widgets = current.Widgets;
            return original;
        }
    }
}