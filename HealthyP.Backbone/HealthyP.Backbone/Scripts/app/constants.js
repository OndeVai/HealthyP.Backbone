var healthyP = healthyP || {};


(function ($, _, Backbone, healthyP) {

    healthyP.templates = healthyP.templates ||
    {
        patientSummary: _.template($('#tmpl-patient-summary').html()),
        messageError: _.template($('#tmpl-message-error').html()),
        messageSuccess: _.template($('#tmpl-message-success').html())
    };


})(window.jQuery, window._, window.Backbone, healthyP)