var healthyP = healthyP || {};


(function ($, _, Backbone, healthyP) {

    healthyP.templates = healthyP.templates ||
    {
        patientSummary: _.template($('#tmpl-patient-summary').html())
    };


})(window.jQuery, window._, window.Backbone, healthyP)