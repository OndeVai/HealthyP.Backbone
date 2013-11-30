describe("PatientDetail", function () {

    var patentDetail;

    beforeEach(function () {
        patentDetail = new healthyP.PatientDetail({ id: 11 });
    });

    it("should be able to generate correct url", function () {
        var actual = patentDetail.url();
        expect(actual).toEqual(patentDetail.urlRoot + '/' + patentDetail.id + '/detail');
    });


});

describe("PatientSummaries", function () {

    var patentSummaries, serverData;

    beforeEach(function () {
        patentSummaries = new healthyP.PatientSummaries([]);
        
        serverData = {
            links: {
                next: { href: '?page=2' },
                prev: { href: '?page=1' }
            },
            items: [
                { dummy1: 'one' },
                { dummy1: 'two' }
            ]
        };
    });

    it("should be able to generate correct url", function () {
        var actual = patentSummaries.url;
        expect(actual).toBe('/api/patients/summaries');
    });


    describe("when parsing server data", function () {

        it("should populate self", function () {

            var actual = patentSummaries.parse(serverData);

            expect(actual).toEqual(serverData.items);

        });

        it("should populate link info", function () {
            
            patentSummaries.parse(serverData);

            expect(patentSummaries._links).toEqual(serverData.links);

        });
        
        it("should handle info", function () {
            
            patentSummaries.parse(serverData);

            expect(patentSummaries._links).toEqual(serverData.links);

        });
       

    });
    
    describe("when returning paging info", function () {

        it("should have prev and next populated", function () {
            
            patentSummaries.parse(serverData);
            var paging = patentSummaries.getPagerLinks();
            expect(paging.prev).toEqual(serverData.links['prev']);
            expect(paging.next).toEqual(serverData.links['next']);

        });
        
    });
});

