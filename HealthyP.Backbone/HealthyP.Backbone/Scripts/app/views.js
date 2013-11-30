var healthyP = healthyP || {};
healthyP.views = healthyP.views || {};

(function($, _, Backbone, healthyP) {

    healthyP.views.BaseView = Backbone.View.extend({
        _setTemplateFuncs: function(options, optionNames) {

            options = options || {};
            optionNames = optionNames || ['template'];

            for (var i = 0; i < optionNames.length; i++) {

                var optionName = optionNames[i];
                var templateVal = options[optionName];
                if (!templateVal) {
                    throw new Error(optionName + ' must be passed as an option');
                }

                this[optionName] = templateVal;
            }


        }
    });

    healthyP.views.PatientSummary = healthyP.views.BaseView.extend({
        events: {
            
        },
        initialize: function(options) {

            this._setTemplateFuncs(options);
        },
        render: function() {

            var modelJson = this.model.toJSON();
            this.$el.html(this.template(modelJson));

            return this;
        }
    });

    healthyP.views.PatientDetail = healthyP.views.PatientSummary.extend({
        
    });


    healthyP.views.PatientSummaries = healthyP.views.BaseView.extend({
        events: {
            
        },
        initialize: function(options) {

            if (this.collection) {
                this.listenTo(this.collection, 'refresh');
            }

            this._setTemplateFuncs(options, ['template', 'templateItem']);

            _.bindAll(this, 'render', '_renderPaging', '_renderItem');
        },
        render: function() {

            this.$el.html(this.template({}));
            this.$elList = this.$('.patient-summaries');


            this.collection.each(this._renderItem);
            this._renderPaging();

            return this;
        },

        _renderItem: function(patient) {

            var summaryView = new healthyP.views.PatientSummary({ model: patient, template: this.templateItem });
            this.$elList.append(summaryView.render().$el);
        },

        _renderPaging: function() {

            var paging = this.collection.getPagerLinks();

            var $paging = this.$('.pager'),
                $pagePrev = $paging.find('.previous'),
                $pageNext = $paging.find('.next');

            $pagePrev.enabled(paging.prev);
            $pageNext.enabled(paging.next);

            $pagePrev.find('a').attr('href', '#' + paging.prev);
            $pageNext.find('a').attr('href', '#' + paging.next);
        },
        
        _refresh: function() {
           
        }
    });


})(window.jQuery, window._, window.Backbone, healthyP);