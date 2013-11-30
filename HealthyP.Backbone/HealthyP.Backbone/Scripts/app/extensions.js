(function($, _, Backbone) {


    //*****jquery plugins*******//

    var disabled = 'disabled';

    $.fn.enabled = function (enabled) {

        return this.each(function () {

            var $this = $(this);
            if (enabled) {

                $this.removeClass(disabled);
                $this.prop(disabled, false);
            } else {
                $this.addClass(disabled);
                $this.prop(disabled, true);
            }

        });
    };

})(window.jQuery, window._, window.Backbone);