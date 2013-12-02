var healthyP = healthyP || {};
(function ($, _, Backbone, healthyP) {

    healthyP.PatientDetail = Backbone.Model.extend({

        urlRoot: '/api/patients',
        url: function () {
            return this.urlRoot + '/' + this.id + '/detail';
        }
    });
    
    healthyP.PatientSummary = Backbone.Model.extend({

       
    });
    
    healthyP.PatientSummaries = Backbone.Collection.extend({

        url: '/api/patients/summaries',
        
        initialize : function(models, options) {
            options = options || {};
            if (options.url)
                this.url = options.url;
        },
        model: healthyP.PatientSummary,
        
        getPagerLinks: function () {
            var links = this._links;
            return { prev: links['prev'], next: links['next'] };
        },

        parse: function (data) {
            
            this._links = data.links;
            return data.items;
        }
    });


})(window.jQuery, window._, window.Backbone, healthyP)