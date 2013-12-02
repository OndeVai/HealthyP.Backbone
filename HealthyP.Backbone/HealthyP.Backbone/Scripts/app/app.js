var healthyP = healthyP || {};
(function ($, _, Backbone, healthyP) {

    var appView = new healthyP.views.App();
    var router = new healthyP.AppRouter();
    Backbone.history.start({ pushState: false });


})(window.jQuery, window._, window.Backbone, healthyP);