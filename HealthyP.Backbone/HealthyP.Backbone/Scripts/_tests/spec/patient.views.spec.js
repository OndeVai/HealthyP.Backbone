describe("views.BaseView", function () {

    var testTemplate;

    beforeEach(function () {
        testTemplate = function () {
            return 'test  template!';
        };
    });


    describe("when setting template", function () {

        it("should cache template (no options defined)", function () {

            var sut = new healthyP.views.BaseView();
            sut._setTemplateFuncs({ template: testTemplate });
            expect(sut.template).toBeTruthy();

        });

        it("should enforce that template is specified  (no options defined)", function () {

            var sut = new healthyP.views.BaseView();
            var setter = function () {
                sut._setTemplateFuncs({});
            };
            expect(setter).toThrow();

        });

        it("should cache template (options defined)", function () {

            var sut = new healthyP.views.BaseView();
            sut._setTemplateFuncs({ template: testTemplate, nada: 'xxx', template1: testTemplate }, ['template', 'template1']);

            expect(sut.template).toBeTruthy();
            expect(sut.template1).toBeTruthy();
            expect(sut.nada).toBeFalsy();

        });

        it("should enforce that template is specified  (options defined)", function () {

            var sut = new healthyP.views.BaseView();
            var setter = function () {
                sut._setTemplateFuncs({ template: testTemplate, nada: 'xxx' }, ['template', 'template1']);
            };
            expect(setter).toThrow();
        });
    });


});

describe("views.PatientSummary", function () {

    var testTemplate;

    beforeEach(function () {
        testTemplate = function () {
            return 'test  template!';
        };
    });

    it("should extend base view", function () {

        var sut = new healthyP.views.PatientDetail({
            template: function () {
            }
        });
        expect(sut instanceof healthyP.views.BaseView).toBeTruthy();

    });

    describe("when initialized", function () {

        it("should cache template", function () {

            var sut = new healthyP.views.PatientSummary({ template: testTemplate });
            var spy = spyOn(sut, '_setTemplateFuncs');

            sut.initialize({ template: testTemplate });
            expect(spy).toHaveBeenCalled();

        });

    });

    describe("when rendering", function () {

        var sut;
        var testTemplate;
        var testModel;

        beforeEach(function () {
            testTemplate = function (json) {
                return 'test ' + json.dummy1 + '  template!';
            };

            testModel = new Backbone.Model();
            testModel.set('dummy1', 'yaya');

            sut = new healthyP.views.PatientSummary({ template: testTemplate, model: testModel });
        });

        it("should push model through template", function () {

            sut.render();
            expect(sut.$el.html()).toBe(testTemplate(testModel.toJSON()));
        });

        it("should return itself", function () {

            var actual = sut.render();
            expect(actual).toBe(sut);

        });
    });
});

describe("views.PatientDetail", function () {

    it("should extend summary view", function () {

        var sut = new healthyP.views.PatientDetail({
            template: function () {
            }
        });
        expect(sut instanceof healthyP.views.PatientSummary).toBeTruthy();

    });

});

describe("views.PatientSummaries", function () {

    var testTemplate;

    beforeEach(function () {
        testTemplate = function () {
            return 'test  template!';
        };
    });

    it("should extend base view", function () {

        var sut = new healthyP.views.PatientSummaries({ template: testTemplate, templateItem: testTemplate });
        expect(sut instanceof healthyP.views.BaseView).toBeTruthy();

    });

    describe("when initialized", function () {

        it("should cache templates", function () {

            var opts = { template: testTemplate, templateItem: testTemplate };
            var sut = new healthyP.views.PatientSummaries(opts);
            var spy = spyOn(sut, '_setTemplateFuncs');


            sut.initialize(opts);
            expect(spy).toHaveBeenCalledWith(opts, ['template', 'templateItem']);

        });

    });

    describe("when rendering", function () {

        var sut;
        var testTemplate, testTemplateItem;
        var testPatients;

        beforeEach(function () {
            testTemplate = function () {
                return '<div><ul class="patient-summaries"></ul><ul class="pager"><li class="previous"><a href="#">Previous</a></li><li class="next"><a href="#">Next</a></li></ul></div>';
            };
            testTemplateItem = function (item) {
                return '<li>' + item.dummy1 + '</ul>';
            };

            var testData = [{ dummy1: 'one' }, { dummy1: 'two' }];

            testPatients = new Backbone.Collection(testData);
            testPatients.getPaging = function () {
                return {
                    next: 'n',
                    prev: 'p'
                };
            };


            sut = new healthyP.views.PatientSummaries({ template: testTemplate, templateItem: testTemplateItem, collection: testPatients });

          

        });

        it("should push collection through template", function () {

            var testOutput = function () {

                var $el = $(testTemplate());
                var $elList = $el.find('.patient-summaries');

                testPatients.each(function (patient) {
                    var summaryView = new healthyP.views.PatientSummary({ model: patient, template: testTemplateItem });
                    $elList.append(summaryView.render().$el);
                });

                return $elList.html();
            };

            sut.render();

            expect(sut.$el.find('.patient-summaries').html()).toBe(testOutput());
        });


        it("should return itself", function () {

            var actual = sut.render();
            expect(actual).toBe(sut);

        });


        describe("paging", function () {

            var testPaging;

            beforeEach(function() {

                testPaging = function(prev, next) {
                    sut.render();
                    var $prev = sut.$el.find('.previous');
                    var $next = sut.$el.find('.next');
                    
                    expect($prev.hasClass('disabled')).toBe(prev);
                    expect($next.hasClass('disabled')).toBe(next);

                    expect($prev.find('a').attr('href')).toBe('#' + testPatients.getPaging().prev);
                    expect($next.find('a').attr('href')).toBe('#' + testPatients.getPaging().next);

                };

            });


            it("should have correct paging (both enabled)", function () {
                testPaging(false, false);
            });

            it("should have correct paging (no prev)", function () {


                testPatients.getPaging = function () {
                    return {
                        next: 'n',
                        prev: null
                    };
                };
                testPaging(true, false);
            });

            it("should have correct paging (no next)", function () {

                testPatients.getPaging = function () {
                    return {
                        next: null,
                        prev: 'p'
                    };
                };

                testPaging(false, true);
            });
        });
    });
});