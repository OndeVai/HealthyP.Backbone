var healthyP = healthyP || {};
(function ($, _, Backbone, healthyP) {


    healthyP.AppRouter = Backbone.Router.extend({

        routes: {
            '': 'showPatientSummaries',
            'patient/add': 'showPatientEdit',
            'patient/edit/:id': 'showPatientEdit',
            'gallery/*url': 'showPatientSummaries'
        },

        initialize: function () {
            this.on('route', function () {
                this.trackPageView('xxxxx');
            });
        },

        showPatientSummaries: function (url) {

            var self = this;
            var patientSummaries = new healthyP.PatientSummaries({ url: url });
            patientSummaries.fetch().done(function () {
                var patientSummariesView = new healthyP.view.PatientSummaries({ collection: patientSummaries });
                self._triggerRender(patientSummariesView);
            });
        },

        showPatientEdit: function (id) {

            var patientDetail = new healthyP.PatientDetail({ id: id });

            var self = this;

            var triggerRender = function () {
                var patientDetailView = new healthyP.views.PatientDetail({ model: patientDetail });
                self._triggerRender(patientDetailView);

            };

            id ? patientDetail.fetch().done(triggerRender) : triggerRender();

        },

        _triggerRender: function (view) {
            channel.trigger('app:ui:view:changed', view);
        }


    });

});