var healthyP = healthyP || {};
healthyP.views = healthyP.views || {};

(function($, _, Backbone, healthyP) {

    


    //todo get rid of this and just pass constants (those can be mocked)
    healthyP.views.BaseView = Backbone.View.extend({
       
    });

    healthyP.views.PatientSummary = healthyP.views.BaseView.extend({
        events: {
            
        },
        template : _.template($('#tmpl-patient-summary').html()),
       
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
        template: _.template($('#tmpl-patient-summaries').html()),
        initialize: function(options) {

            if (this.collection) {
                this.listenTo(this.collection, 'refresh');
            }

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


            this._renderPagingItem.call($pagePrev, paging.prev);
            this._renderPagingItem.call($pageNext, paging.next);
        },
        
        _renderPagingItem: function(pagerData) {
            var $that = this;
            $that.enabled(pagerData);
            if(pagerData) 
                $that.find('a').attr('href', '#patient-summaries' + pagerData.href);

                
           
        },
        
        _refresh: function() {
           
        }
    });


})(window.jQuery, window._, window.Backbone, healthyP);