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

            this.collPayors = new Backbone.Collection(modelJson.payors);
            var payorView = new healthyP.views.PayorSummaries({ collection: this.collPayors });
            this.$elForm
                .find('.insuranceAfter')
                .after(payorView.render().el);


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
            var $elForm = this.$elForm,
                firstNameVal = $elForm.find('#firstName').val(),
                lastNameVal = $elForm.find('#lastName').val(),
                emailVal = $elForm.find('#email').val(),
                imgUrlVal = $elForm.find('#imageUrl').val();

            var model = this.model;
            model.set('firstName', firstNameVal);
            model.set('lastName', lastNameVal);
            model.set('email', emailVal);
            model.set('imageUrl', imgUrlVal);

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

    healthyP.views.PayorSummary = healthyP.views.BaseView.extend({

        tagName: 'tr',
        events: {
            "click .edit": "_edit",
        },
        template: _.template($('#tmpl-payor-summary').html()),
        initialize: function (options) {

            _.bindAll(this, 'render', '_edit');
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

    healthyP.views.PayorSummaries = healthyP.views.BaseView.extend({

        className: 'table-responsive',
        events: {
            "click [data-col]": "_sort",
        },
        template: _.template($('#tmpl-payor-summaries').html()),
        initialize: function (options) {

            this.sorting = {
                templateUp: '<i class="glyphicon glyphicon-arrow-up"></i>',
                templateDown: '<i class="glyphicon glyphicon-arrow-down"></i>',
                dataColSelector: '[data-col]'
            };

            _.bindAll(this, 'render', '_renderItem', '_renderItems');

            this.listenTo(this.collection, 'sort', this._renderItems);
        },
        render: function () {

            this.$el.html(this.template({}));
            this.$elList = this.$('.payors').find('tbody');

            this.$elColls = this.$(this.sorting.dataColSelector);
            this._renderItems();



            return this;
        },

        _renderItem: function (payor) {

            var payorView = new healthyP.views.PayorSummary({ model: payor });
            this.$elList.append(payorView.render().el);
        },

        _renderItems: function () {

            this.$elList.empty();
            this.collection.each(this._renderItem);
        },


        _sort: function (e) {
            e.preventDefault();
            var $elCol = $(e.target).closest(this.sorting.dataColSelector);
            this.$elColls.find('.glyphicon').remove();

            var isDesc = false;
            var currentCol = $elCol.data('col');
            var collection = this.collection;
            var collSorting = collection.sorting;
            if (collSorting && collSorting.col === currentCol) {
                isDesc = !collSorting.desc;
            }

            collection.sorting = { col: currentCol, desc: isDesc };

            var template = isDesc ? this.sorting.templateUp : this.sorting.templateDown;
            $elCol.append(template);

            var comparison1 = isDesc ? 1 : -1;
            var comparison2 = isDesc ? -1 : 1;

            collection.comparator = function (payorA, payorB) {
                if (payorA.get(currentCol) > payorB.get(currentCol)) return comparison1; // before
                if (payorB.get(currentCol) > payorA.get(currentCol)) return comparison2; // after
                return 0; // equal

            };
            collection.sort();
        }

    });

    healthyP.views.PayorDetail = healthyP.views.BaseView.extend({

        className: 'modal fadein',

        initialize: function () {

            _.bindAll(this, '_save');
            this.listenTo(this.model, 'change:imageUrl', this._renderPreview);
        },
        events: {

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

            return this;
        },


        _setModelFromUI: function () {
            //var $elForm = this.$elForm,
            //    firstNameVal = $elForm.find('#firstName').val(),
            //    lastNameVal = $elForm.find('#lastName').val(),
            //    emailVal = $elForm.find('#email').val(),
            //    imgUrlVal = $elForm.find('#imageUrl').val();

            //var model = this.model;
            //model.set('firstName', firstNameVal);
            //model.set('lastName', lastNameVal);
            //model.set('email', emailVal);
            //model.set('imageUrl', imgUrlVal);

        },
        //todo image updates when field changes (model event)
        _save: function () {

            var wasNew = this.model.isNew();
            this._setModelFromUI();
            this.model.save().done(function () {

                var message = 'Payor was ' + (wasNew ? 'created' : 'updated') + '.';
                healthyP.channel.trigger('app:ui:success:custom:pending', {
                    lead: 'Success!',
                    message: message
                });

            });

            this.$el.modal('hide');
            return false;

        }
    });

}(window.jQuery, window._, window.Backbone, healthyP));