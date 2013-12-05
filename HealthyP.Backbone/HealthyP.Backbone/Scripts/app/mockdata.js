var genPatients = function (seed, limit) {

    var items = [];

    for (var i = seed; i < limit; i++) {
        items.push({
            id: i,
            name: 'p' + i,
            pic: 'http://icons-search.com/img/yellowicon/game_star_lin.zip/Linux-Pacman_64x64.png-64x64.png',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac pharetra velit, a dictum massa. Fusce fermentum urna at ligula porta, tristique ornare augue adipiscing. Sed ac ornare tortor. Donec non tortor facilisis, lobortis sapien et, ultrices erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tempor, turpis eu sodales elementum, nisi odio congue arcu, iaculis aliquam est lacus in nibh. Etiam tortor elit, vehicula a mi in, dictum auctor erat. In vulputate vehicula velit eu pretium. Sed vehicula pulvinar enim eu sagittis. Cras vulputate est libero, in blandit lacus fringilla eget. Phasellus pulvinar, dolor eget venenatis vulputate, urna eros luctus lorem, nec fermentum enim ipsum nec turpis. Sed vulputate elit purus, vitae tempor nunc fringilla id.'
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
    urlParams: ['id'],
    response: function (settings) {
        var id = settings.urlParams.id;
       
        this.responseText = {
            id: id,
            firstName: 'First',
            lastName: 'Last ' + id,
            email: 'email' + id + '@test.com',
            pic: 'http://icons-search.com/img/yellowicon/game_star_lin.zip/Linux-Pacman_64x64.png-64x64.png',

        };
    }
});