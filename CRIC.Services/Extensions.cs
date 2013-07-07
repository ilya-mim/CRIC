using System;
using System.Collections.Generic;
using System.Net;
using System.Reflection;
using System.Web;
using System.Linq;

namespace CRIC
{
    public static class Extensions
    {
        public static string ToMilitaryTimeString(this DateTime dt)
        {
            return dt.ToString("HH:mm:ss");
        }

        public static string GetFullMessage(this Exception ex)
        {
            if (ex == null)
            {
                return string.Empty;
            }

            string msg = string.Format("{0} : {1}{2}{3}", ex.GetType(), ex.Message, Environment.NewLine, ex.StackTrace);
            if (ex.InnerException != null)
            {
                msg += string.Format("{0}InnerException{0}{1}", Environment.NewLine, ex.InnerException.GetFullMessage());
            }
            return msg;
        }

        public static List<AttributedProperty<T>> GetAttributedProperties<T>(this Type t)
        {
            if (t != null)
            {
                return t.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                        .Where(pi => pi.GetCustomAttributes(typeof(T), false).Count() == 1)
                        .OrderBy(pi => pi.Name)
                        .Select(pi => new AttributedProperty<T>
                        {
                            PropertyName = pi.Name,
                            Attribute = (T)pi.GetCustomAttributes(typeof(T), false)[0]
                        }).ToList();
            }

            return null;
        }
    }
}