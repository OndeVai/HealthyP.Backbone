var genPatients = function (seed, limit) {

    var items = [];

    for (var i = seed; i < limit; i++) {

        var firstName = 'fname ' + i;
        var lastName = 'lname ' + i;
        var email = 'email' + i + '@test.com';
        var name = firstName + ' ' + lastName;

        items.push({
            id: i,
            title: name,
            firstName: firstName,
            lastName: lastName,
            email: email,
            imageUrl: 'http://icons-search.com/img/yellowicon/game_star_lin.zip/Linux-Pacman_64x64.png-64x64.png',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac pharetra velit, a dictum massa. Fusce fermentum urna at ligula porta, tristique ornare augue adipiscing. Sed ac ornare tortor. Donec non tortor facilisis, lobortis sapien et, ultrices erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor, turpis eu sodales elementum, nisi odio congue arcu, iaculis aliquam est lacus in nibh. Etiam tortor elit, vehicula a mi in, dictum auctor erat. In vulputate vehicula velit eu pretium. Sed vehicula pulvinar enim eu sagittis. Cras vulputate est libero, in blandit lacus fringilla eget. Phasellus pulvinar, dolor eget venenatis vulputate, urna eros luctus lorem, nec fermentum enim ipsum nec turpis. Sed vulputate elit purus, vitae tempor nunc fringilla id.',
            payors: [
                { id: 2, name: 'payor1', notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing', date:'12/12/2001' },
                { id: 4, name: 'payor2', notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing', date: '12/12/2002' },
                { id: 5, name: 'payo3', notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing', date: '12/12/2003' },
                { id: 6, name: 'payor4', notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing', date: '12/12/2004' }
            ]
        });
    }

    return items;
};


var serverData1 = {
    paging: {
        next: 2,
        prev: null
    },
    items: genPatients(1, 10)
};

var serverData2 = {
    paging: {
        next: null,
        prev: 1
    },
    items: genPatients(11, 18)
};

$.mockjax({
    url: '/api/patients/summaries',
    responseTime: 150,
    responseText: serverData1
});

$.mockjax({
    url: '/api/patients/summaries?page=1',
    responseTime: 150,
    responseText: serverData1
});

$.mockjax({
    url: '/api/patients/summaries?page=2',
    responseTime: 150,
    responseText: serverData2
});

$.mockjax({
    url: /^\/api\/patients\/([\d]+)$/,
    responseTime: 150,
    type: 'GET',
    urlParams: ['id'],
    response: function (settings) {
        var id = settings.urlParams.id;

        var both = serverData1.items.concat(serverData2.items);
        var item = _.find(both, function (itm) { return itm.id == id; });

        this.responseText = item;
    }
});

$.mockjax({
    url: '/api/patients',
    responseTime: 150,
    type: 'POST',
    response: function (settings) {

        var item = JSON.parse(settings.data);
        item.title = item.firstName + ' ' + item.lastName;

        var both = serverData1.items.concat(serverData2.items);
        var maxId = _.max(both, function (itm) { return itm.id; }).id;
        item.id = maxId + 1;
        serverData1.items.unshift(item);

        this.responseText = item;

    }
});

$.mockjax({
    url: /^\/api\/patients\/([\d]+)$/,
    responseTime: 150,
    type: 'PUT',
    response: function (settings) {

        var item = JSON.parse(settings.data);
        item.title = item.firstName + ' ' + item.lastName;

        //this is junkola test code
        for (var i = 0; i < serverData1.items.length; i++) {
            var itm = serverData1.items[i];
            if (itm.id == item.id) {
                serverData1.items[i] = item;
                break;
            }
        }

        for (i = 0; i < serverData2.items.length; i++) {
            var itm2 = serverData2.items[i];
            if (itm2.id == item.id) {
                serverData2.items[i] = item;
                break;
            }
        }

        this.responseText = item;

    }
});