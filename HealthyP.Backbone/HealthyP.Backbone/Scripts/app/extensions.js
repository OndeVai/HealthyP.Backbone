var healthyP = healthyP || {};

(function ($, _, Backbone, healthyP) {

    //*****jquery plugins & extensions*******//

    $.validator.setDefaults({ onfocusout: function (element) { $(element).valid(); } });

    var disabled = 'disabled';
    var loading = 'loading';

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

    $.fn.loading = function (isLoading) {


        return this.each(function () {

            var $this = $(this);
            $this.enabled(!isLoading);
            if (!isLoading)
                $this.removeClass(loading);
            else
                $this.addClass(loading);


        });
    };

    $.fn.panelTransition = function (isIn) {

        var inClass = 'in', outClass = 'out';

        return this.each(function () {

            var $that = $(this);
            if (isIn) {
                $that.removeClass(outClass)
                    .addClass(inClass);
            }
            else {
                $that.removeClass(inClass)
                    .addClass(outClass);
            }

        });
    };

    $.fn.validateForBootstrap = function (callback) {

        var clsFormGroup = '.form-group', clsError = 'has-error', clsSuccess = 'success';

        return this.each(function () {

            var $that = $(this);
            $that.validate({
                errorClass: 'text-error help-block',
                errorElement: 'span',
                highlight: function (element) {
                    $(element).closest(clsFormGroup).removeClass(clsSuccess).addClass(clsError);
                },
                success: function (element) {
                    element
                    .closest(clsFormGroup).removeClass(clsError).addClass(clsSuccess);
                },
                errorPlacement: function (error, element) {
                    error.appendTo(element.closest(clsFormGroup));
                },
                submitHandler: function () {
                    return callback();
                },
                invalidHandler: function () {
                    self.$(':submit').loading(false);
                }
            });

        });
    };

    $.parseJsonSafe = function (val) {
        try {
            var response = $.parseJSON(val);
            if (typeof response == 'object') {
                return response;
            }
            return null;
        } catch (e) {
            return null;
        }
    };



    //*****jquery ajax*******//

    healthyP.channel = _.extend({}, Backbone.Events);
    var channel = healthyP.channel;

    var parseAndTrigger = function (jqXHR, ajaxSettings, events, isUserError) {
        var responseText = jqXHR.responseText;
        var err = $.parseJsonSafe(responseText) || { message: responseText };
        err.isUserError = isUserError;
        err.url = ajaxSettings.url;
        trigger(events, err);
    };

    var trigger = function (events, message) {
        channel.trigger(events, message);
    };

    var ajaxErrExceptionMap = {};

    var ajaxHandleMap = {
        401: function (jqXHR, ajaxSettings) {
            parseAndTrigger(jqXHR, ajaxSettings, 'app:comm:err:unauthorized');
        },

        403: function (jqXHR, ajaxSettings) {
            parseAndTrigger(jqXHR, ajaxSettings, 'app:comm:err:unauthorized');
        },

        400: function (jqXHR, ajaxSettings) {
            parseAndTrigger(jqXHR, ajaxSettings, 'app:comm:err:badRequest app:comm:err', true);
        },

        404: function (jqXHR, ajaxSettings) {
            parseAndTrigger(jqXHR, ajaxSettings, 'app:comm:err:notFound');
        },

        fail: function (jqXHR, ajaxSettings) {
            parseAndTrigger(jqXHR, ajaxSettings, 'app:comm:err');
        },

        start: function () {
            trigger('app:comm:start');
        },

        success: function () {
            trigger('app:comm:success');
        },

        stop: function () {
            trigger('app:comm:stop');
        }
    };

    $(document).ajaxError(function (event, jqXHR, ajaxSettings) {

        var xhrStatus = jqXHR.status;
        var exceptionCodeUrls = ajaxErrExceptionMap[xhrStatus];
        if (exceptionCodeUrls) {
            var url = ajaxSettings.url;
            for (var i = 0; i < exceptionCodeUrls.length; i++) {
                if (url.match(exceptionCodeUrls[i])) {
                    return;
                }
            }
        }
        var handlerFunc = ajaxHandleMap[xhrStatus];
        if (!handlerFunc) handlerFunc = ajaxHandleMap.fail;
        handlerFunc(jqXHR, ajaxSettings);
    });

    $(document).ajaxStart(ajaxHandleMap.start);
    $(document).ajaxStop(ajaxHandleMap.stop);
    $(document).ajaxSuccess(ajaxHandleMap.success);

    $.ajaxSetup({
        cache: false
    });


    //*****bootstrap*******//

    //fix the pager and other controls that are disabled
    $(document).on('click touchstart', '.disabled, .disabled a', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
    });


    //*****backbone*******//

    Backbone.Collection.prototype.createDetached = function () {
        var newModel = new this.model();
        newModel.collection = this;
        return newModel;
    };


    //fix issue where change event not triggering sort if comparator set
    var oldFunc = Backbone.Collection.prototype._onModelEvent;
    Backbone.Collection.prototype._onModelEvent = function (event, model, collection, options) {

        if (event === 'change' && this.comparator) {
            this.sort();
            return;
        }

        oldFunc.apply(this, arguments);
    };

    Backbone.Collection.prototype.sortByToggle = function(options) {
        
        var fieldToSortBy = options.fieldToSortBy;

        var isDesc = false;
        var collSorting = this.sorting;
        if (collSorting && collSorting.col === fieldToSortBy) {
            isDesc = !collSorting.desc;
        }

        var comparison1 = isDesc ? 1 : -1,
            comparison2 = isDesc ? -1 : 1;

        this.sorting = { col: fieldToSortBy, desc: isDesc };
        
        this.comparator = function (modelA, modelB) {
            if (modelA.get(fieldToSortBy) > modelB.get(fieldToSortBy)) return comparison1; // before
            if (modelB.get(fieldToSortBy) > modelA.get(fieldToSortBy)) return comparison2; // after
            return 0; // equal

        };
        return this.sort();

    };


    Backbone.Router.prototype.trackPageView = function (account) {

        var ga = window._gaq || [];
        console.log(account);
        ga.push(['_setAccount', account]);
        ga.push(['_setDomainName', 'none']);
        ga.push(['_trackPageview', '/' + Backbone.history.fragment]);
    };


    Backbone.View.prototype.close = function () {

        this.undelegateEvents();

        this.unbind();
        this.remove();
        this.stopListening(this.model);
        this.stopListening(this.collection);

        if (this.onClose) {
            this.onClose();
        }
    };






})(window.jQuery, window._, window.Backbone, healthyP);