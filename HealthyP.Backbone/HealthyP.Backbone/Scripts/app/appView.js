var healthyP = healthyP || {};
healthyP.views = healthyP.views || {};
(function ($, _, Backbone, healthyP) {

    var channel = healthyP.channel;
  

    healthyP.views.MessageError = Backbone.View.extend({
        tagName: 'section',
        className: 'error-gen',
        template: _.template($('#tmpl-message-error').html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    healthyP.views.MessageSuccess = Backbone.View.extend({
        tagName: 'section',
        className: 'alert alert-success success-gen',
        template: _.template($('#tmpl-message-success').html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    healthyP.views.App = Backbone.View.extend({

        el: $('#wrapper'),

        initialize: function () {

            this.activePanel = this.$el.find('.cbody');

            this.currentView = null;

            _.bindAll(this, 'render', '_renderError', '_clearError', '_handleAuth', '_updatePanels');

            this.listenTo(channel, 'app:ui:view:changed', this.render);
            this.listenTo(channel, 'app:comm:err', this._renderError);
            this.listenTo(channel, 'app:comm:start', this._renderProgress);
            this.listenTo(channel, 'app:comm:stop', this._clearProgress);
            this.listenTo(channel, 'app:comm:success', this._clearError);
            this.listenTo(channel, 'app:comm:err:unauthorized', this._handleAuth);
            this.listenTo(channel, 'app:comm:err:notFound', this._renderNotFound);
            this.listenTo(channel, 'app:ui:success:custom', this._renderSuccessMessage);

        },

        render: function (view) {

            this._clearError();
            this._clearProgress();

            var newPanelEnd = true;
            var oldPanelEnd = false;

            var newPanel = view.render().$el
                          .addClass('cbody new')
                          .panelTransition(oldPanelEnd)
                          .appendTo(this.$el);


            this._setMainElements(view, newPanel);

            var oldPanel = this.activePanel;
            this.activePanel = newPanel;

            this._updatePanels(oldPanel, newPanel, oldPanelEnd, newPanelEnd, view);
            this._clearModal();
            this._scrollTop();
        },

        _renderProgress: function () {


            this._clearError();
            this._clearSuccess();
            $('body').addClass('loading-main');
            this.$el.find('[data-loader="true"]').loading(true);
        },

        _clearProgress: function () {

            $('.loading').loading(false);
            $('body').removeClass('loading-main');

        },

        _setMainElements: function (view, newPanel) {

            //todo breadcrumb and doc title

        },

        _updatePanels: function (oldPanel, newPanel, oldPanelEnd, newPanelEnd, view) {
            var self = this;
            window.setTimeout(function () {
                oldPanel.panelTransition(oldPanelEnd);
                newPanel.panelTransition(newPanelEnd);
                console.log(Modernizr);

                self._cleanupViews(view, newPanel, oldPanel);



            }, 0);
        },
        _renderMessage: function (MessageView, model,  callback) {

            _.extend(model, { lead: (model.lead || 'Whoops!') });
            var errorModel = new Backbone.Model(model);
            var errorView = new MessageView({ model: errorModel }).render().$el;
            this.$el.prepend(errorView);

            callback && callback();

        },
        _renderError: function (err) {

            var self = this;
            this._clearError();
            this._clearSuccess();
            var initial = this.$('#initial');
            if (initial.length) initial.remove();

            this._renderMessage(healthyP.views.MessageError, err,  function () {
                self._clearModal();
                self._scrollTop();
            });

            this._clearProgress();
        },

        _clearModal: function () {
            var modal = $('#modal');
            if (modal.length) {
                modal.modal('hide');
            }
        },
        _renderNotFound: function (err) {

            this._clearSuccess();
            this._closeCurrentView();
            this._renderError(err);

        },
        _renderSuccessMessage: function (msg) {

            this._clearSuccess();
            this._renderMessage(healthyP.views.MessageSuccess, msg);
        },
        _clearError: function () {
            this.$('.error-gen').remove();
        },
        _clearSuccess: function () {
            this.$('.success-gen').remove();
        },

        _closeCurrentView: function () {
            if (this.currentView) {
                this.currentView.stopListening(channel);
                this.currentView.close();
            }
        },
        _cleanupViews: function (view, newPanel, oldPanel) {

            this._closeCurrentView();

            newPanel.removeClass('new');
            oldPanel.remove();

            this.currentView = view;
        },

        _handleAuth: function () {
            document.location = '/login';
        },

        _scrollTop: function () {
            $("html, body").animate({ scrollTop: 0 }, 200);

        }
    });


})(window.jQuery, window._, window.Backbone, healthyP);