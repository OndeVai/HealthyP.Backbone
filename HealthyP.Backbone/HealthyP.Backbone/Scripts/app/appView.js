var healthyP = healthyP || {};
(function ($, _, Backbone, healthyP) {

    var channel = healthyP.channel;
    var errorViewPath = 'views/a_shared/alertErrorUnhandled';
    var successViewPath = 'views/a_shared/alertSuccess';

    healthyP.views.MessageError = Backbone.View.extend({
        tagName: 'section',
        className: 'error-gen',
        template: healthyP.templates.messageError,

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });


    healthyP.views.MessageSuccess = Backbone.View.extend({
        tagName: 'section',
        className: 'alert alert-success success-gen',
        template: healthyP.templates.messageSuccess,

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
            this.listenTo(channel, 'app:comm:success', this._clearError);
            this.listenTo(channel, 'app:comm:err:unauthorized', this._handleAuth);
            this.listenTo(channel, 'app:comm:err:notFound', this._renderNotFound);
            this.listenTo(channel, 'app:ui:success:custom', this._renderSuccessMessage);

        },

        render: function (view) {

            this._clearError();


            var newPanelEnd = '1';
            var oldPanelEnd = '0';

            var newPanel = $('<div class="row cbody"></div>').panelTransition(oldPanelEnd);

            this._setMainElements(view, newPanel);

            var oldPanel = this.activePanel;
            this.activePanel = newPanel;

            this._updatePanels(oldPanel, newPanel, oldPanelEnd, newPanelEnd, view);
            this._clearModal();

        },

        _updatePanels: function (oldPanel, newPanel, oldPanelEnd, newPanelEnd, view) {
            var self = this;
            window.setTimeout(function () {
                oldPanel.panelTransition(oldPanelEnd);
                newPanel.panelTransition(newPanelEnd);
                self._cleanupViews(view, newPanel, oldPanel);

            }, 0);
        },
        _renderMessage: function (MessageView, model, template, callback) {

            _.extend(model, { lead: (model.lead || 'Whoops!') });
            var errorModel = new Backbone.Model(model);
            var errorView = new MessageView({ model: errorModel }).render().$el;
            self.$el.prepend(errorView);

            callback && callback();

        },
        _renderError: function (err) {

            var self = this;
            this._clearError();
            this._clearSuccess();
            var initial = this.$('#initial');
            if (initial.length) initial.remove();

            this._renderMessage(healthyP.MessageError, err, errorViewPath, function () {
                self._clearModal();
                self._scrollTop();
            });

            $('.loading').setLoadingState(false);
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
            this._renderMessage(healthyP.MessageError, msg, successViewPath);
        },
        _clearError: function () {
            this.$('.error-gen').remove();
        },
        _clearSuccess: function () {
            this.$('.success-gen').remove();
        },
        _setMainElements: function (view, newPanel) {

            //set content
            this.$el.append(newPanel);
            view.$el.addClass('col-md-12');
            newPanel.html(view.el);

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
        }
    });


})(window.jQuery, window._, window.Backbone, healthyP);