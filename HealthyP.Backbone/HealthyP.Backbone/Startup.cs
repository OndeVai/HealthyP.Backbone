using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(HealthyP.Backbone.Startup))]
namespace HealthyP.Backbone
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
