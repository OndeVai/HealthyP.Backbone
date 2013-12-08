var healthyP = healthyP || {};
(function ($, _, Backbone, healthyP) {

    healthyP.PatientDetail = Backbone.Model.extend({

        urlRoot: '/api/patients',
        defaults: {
            id: null,
            firstName: null,
            lastName: null,
            email: null,
            imageUrl: null,
            desc: null
        }

    });

    healthyP.PatientSummary = Backbone.Model.extend({


    });

    healthyP.PatientSummaries = Backbone.Collection.extend({
        urlRoot: '/api/patients/summaries',
        url: function () {
            return this.page ? this.urlRoot + '?page=' + this.page : this.urlRoot;

        },

        initialize: function (models, options) {

            options = options || {};
            if (options.page)
                this.page = options.page;
        },

        model: healthyP.PatientSummary,

        getPaging: function () {
            var paging = this._paging;
            return { prev: paging['prev'], next: paging['next'] };
        },

        parse: function (data) {

            this._paging = data.paging;
            return data.items;
        }
    });


})(window.jQuery, window._, window.Backbone, healthyP)