var healthyP = healthyP || {};
healthyP.views = healthyP.views || {};

(function ($, _, Backbone, healthyP) {


    //todo get rid of this and just pass constants (those can be mocked)
    healthyP.views.BaseView = Backbone.View.extend({

    });

    healthyP.views.PatientSummary = healthyP.views.BaseView.extend({

        tagName: 'li',
        events: {

        },
        template: _.template($('#tmpl-patient-summary').html()),

        render: function () {

            var modelJson = this.model.toJSON();
            this.$el.html(this.template(modelJson));

            return this;
        }
    });

    healthyP.views.PatientDetail = healthyP.views.BaseView.extend({

        initialize: function () {

            _.bindAll(this, '_save', '_renderPreview', '_updateImageUrl');
            this.listenTo(this.model, 'change:imageUrl', this._renderPreview);
        },
        events: {
            'keyup #imageUrl': '_updateImageUrl'
        },
        template: _.template($('#tmpl-patient-detail').html()),

        render: function () {

            var modelJson = this.model.toJSON();


            modelJson.title = this.model.isNew() ? '(new patient)' : modelJson.title;
            this.$el.html(this.template(modelJson));
            this.$elForm = this.$('form');
            this.$elForm.validateForBootstrap(this._save);

            this.collPayors = new healthyP.Payors(modelJson.payors);
            var payorView = new healthyP.views.PayorSummaries({ collection: this.collPayors });
            this.$elForm
                .find('.payorsView')
                .append(payorView.render().el);


            return this;
        },

        _renderPreview: function () {

            var imageUrl = this.model.get('imageUrl');
            this.$('#profilePreview').attr('src', imageUrl);

        },

        _updateImageUrl: function () {

            var imageUrl = this.$('#imageUrl').val();
            this.model.set('imageUrl', imageUrl);
        },

        _setModelFromUI: function () {
            var $elForm = this.$elForm;

            var model = this.model;
            model.set({
                firstName: $elForm.find('#firstName').val(),
                lastname: $elForm.find('#lastName').val(),
                email: $elForm.find('#email').val(),
                imageUrl: $elForm.find('#imageUrl').val()
            });

        },
        //todo image updates when field changes (model event)
        _save: function () {

            var wasNew = this.model.isNew();
            this._setModelFromUI();
            this.model.save().done(function () {

                var message = 'Patient was ' + (wasNew ? 'created' : 'updated') + '.';
                healthyP.channel.trigger('app:ui:success:custom:pending', {
                    lead: 'Success!',
                    message: message
                });
                document.location = '#/patient-summaries'; //todo make this more of a constants lib??

            });

            return false;

        }
    });



    healthyP.views.PatientSummaries = healthyP.views.BaseView.extend({
        events: {

        },
        template: _.template($('#tmpl-patient-summaries').html()),
        initialize: function (options) {

            _.bindAll(this, 'render', '_renderPaging', '_renderItem');
        },
        render: function () {

            this.$el.html(this.template({}));
            this.$elList = this.$('.patient-summaries');


            this.collection.each(this._renderItem);
            this._renderPaging();

            return this;
        },

        _renderItem: function (patient) {

            var summaryView = new healthyP.views.PatientSummary({ model: patient, template: this.templateItem });
            this.$elList.append(summaryView.render().$el);
        },

        _renderPaging: function () {

            var paging = this.collection.getPaging();

            var $paging = this.$('.pager'),
                $pagePrev = $paging.find('.previous'),
                $pageNext = $paging.find('.next');


            this._renderPagingItem.call($pagePrev, paging.prev);
            this._renderPagingItem.call($pageNext, paging.next);
        },

        _renderPagingItem: function (pagerData) {
            var $that = this;
            $that.enabled(pagerData);
            if (pagerData)
                $that.find('a').attr('href', '#patient-summaries/page-' + pagerData);



        },

        _refresh: function () {

        }
    });

    healthyP.views.PayorSummary = healthyP.views.BaseView.extend({

        tagName: 'tr',
        events: {
            'click .edit': '_edit',
            'click .delete': '_remove'
        },
        template: _.template($('#tmpl-payor-summary').html()),
        initialize: function (options) {

            _.bindAll(this, 'render', '_edit', '_remove');
        },

        render: function () {

            var modelJson = this.model.toJSON();
            this.$el.html(this.template(modelJson));

            return this;
        },

        _edit: function (e) {
            e.preventDefault();
            var editView = new healthyP.views.PayorDetail({ model: this.model });
            editView.render();
        },

        _remove: function (e) {
            e.preventDefault();
            if (window.confirm('Are you sure you want to delete ' + this.model.name + '?')) {
                this.model.collection.remove(this.model);
            }
        }


    });

    healthyP.views.PayorSummaries = healthyP.views.BaseView.extend({

        className: 'form-group',
        events: {
            'click [data-col]': '_sort',
            'click .add': '_add'
        },
        template: _.template($('#tmpl-payor-summaries').html()),
        initialize: function (options) {

            this.sorting = {
                templateUp: '<i class="glyphicon glyphicon-arrow-up"></i>',
                templateDown: '<i class="glyphicon glyphicon-arrow-down"></i>',
                dataColSelector: '[data-col]'
            };

            _.bindAll(this, 'render', '_renderItem', '_renderItems', '_add');

            this.listenTo(this.collection, 'sort', this._renderItems); //todo consolidate
            this.listenTo(this.collection, 'remove', this._renderItems);
            this.listenTo(this.collection, 'add', this._renderItems);
            this.listenTo(this.collection, 'change', this._renderItems);
        },
        render: function () {

            this.$el.html(this.template({}));
            this.$elList = this.$('.payors').find('tbody');

            this.$elColls = this.$(this.sorting.dataColSelector);
            this._renderItems();



            return this;
        },

        _add: function (e) {

            e.preventDefault();
            var newPayor = this.collection.createDetached();
            var editView = new healthyP.views.PayorDetail({ model: newPayor });
            editView.render();
        },

        _renderItem: function (payor) {

           
            var payorView = new healthyP.views.PayorSummary({ model: payor });
            this.$elList.append(payorView.render().el);
        },

        _renderItems: function () {
            console.log('rrrr');
            this.$elList.empty();
            this.collection.each(this._renderItem);
        },


        _sort: function (e) {

            e.preventDefault();

            var sorting = this.sorting;
            var $elCol = $(e.target).closest(sorting.dataColSelector);
            this.$elColls.find('.glyphicon').remove();

            var currentCol = $elCol.data('col'),
                 collection = this.collection;

            collection.sortByToggle({ fieldToSortBy: currentCol });

            var template = collection.sorting.desc ? sorting.templateUp : sorting.templateDown;
            $elCol.append(template);

        }

    });

    healthyP.views.PayorDetail = healthyP.views.BaseView.extend({
        className: 'modal fadein',

        initialize: function () {

            _.bindAll(this, '_save', '_submit');
        },
        events: {
            'click :submit': '_submit'
        },
        template: _.template($('#tmpl-payor-detail').html()),

        render: function () {

            var modelJson = this.model.toJSON();


            modelJson.title = this.model.isNew() ? '(new payor)' : modelJson.name;
            this.$el.html(this.template(modelJson));
            this.$elForm = this.$('form');
            this.$elForm.validateForBootstrap(this._save);

            var self = this;
            this.$el
                .appendTo($('body'))
                .modal('show')
                .on('hidden.bs.modal', function () {
                    self.close();
                });

            this.$elForm.find(':input').first().focus();

            return this;
        },

        _submit: function (e) {
            e.preventDefault();
            this.$elForm.submit();
        },

        _setModelFromUI: function () {
            var $elForm = this.$elForm;

            var model = this.model;
            model.set({
                name: $elForm.find('#name').val(),
                date: $elForm.find('#date').val(),
                notes: $elForm.find('#notes').val()
            });

        },
        _save: function () {

            var wasNew = this.model.isNew();
            this._setModelFromUI();

            if (wasNew) {
                this.model.collection.add(this.model);
            }

            this.$el.modal('hide');
            return false;

        }
    });

}(window.jQuery, window._, window.Backbone, healthyP));