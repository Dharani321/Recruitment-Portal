using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Recruitment_Portal
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
            routes.MapRoute(
           name: "Default",
           url: "{controller}/{action}/{id}",
           defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
       );
            // Home Routes
           

            routes.MapRoute(
                name: "JobsPagination",
                url: "JobPostings/{page}/{size}",
                defaults: new { controller = "Home", action = "GetJobPostingsJson", page = 1, size = 3 }
            );

            routes.MapRoute(
                name: "About",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "About", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Contact",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Contact", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "Search",
                url: "Location/Search",
                defaults: new { controller = "Location", action = "Search" }
            );


            // Admin Routes
            routes.MapRoute(
                name: "AdminIndex",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Admin", action = "Index", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "AdminSignup",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Admin", action = "AdminSignup", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                name: "AdminLogin",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Admin", action = "AdminLogin", id = UrlParameter.Optional }
            );

            routes.MapRoute(
                    name: "AdminSettings",
                    url: "Admin/AdminSettings",
                    defaults: new { controller = "Admin", action = "AdminSettings" }
            );


            // User Routes
            routes.MapRoute(
                name: "UserDashboard",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "User", action = "UserDashboard", id = UrlParameter.Optional }
            );
        }
    }
}
