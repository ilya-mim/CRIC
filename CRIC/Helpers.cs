using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CRIC
{
    [System.AttributeUsage(System.AttributeTargets.Property)]
    public class VisibleAttribute : System.Attribute
    {
        public string Label { get; set; }
        public string Description { get; set; }
    }

    public class AttributedProperty<T>
    {
        public string PropertyName { get; set; }
        public T Attribute { get; set; }
    }
}