jQuery(function($) {
    var app = new Vue({
        el: '#app',
        data: {
            app_id: '1836708119934106', // put your app id here
            access_token: '',
            stream_key: '',
            video_id: '',
            ready: false,
            reactions: function() {
                var reactions = {};
                ['like', 'love'].map(function (reaction) {
                    reactions[reaction] = {
                        count: 0,
                        label: 'Label of '+reaction
                    };
                });
                return reactions;
            }(), //, 'wow', 'haha', 'sad', 'angry']
            rate: 5
        },
        mounted: function () {
            window.fbAsyncInit = function() {
                FB.init({
                    appId      : app.app_id,
                    version    : 'v2.8'
                });
                FB.getLoginStatus(app.login);
            };
            (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {return;}
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        },
        methods: {
            login: function (response) {
                app.ready = true;
                if(response)
                    switch (response.status) {
                        case 'connected':
                            if(response.status == 'connected')
                                app.access_token = response.authResponse.accessToken;
                            break;
                        case 'not_authorized':

                            break;
                        default:

                            break;
                    }
                else
                    FB.login(app.login);
            },
            start: function () {
                FB.ui({
                    display: 'popup',
                    method: 'live_broadcast',
                    phase: 'create',
                }, function(response) {
                    if (!response.id) {
                        alert('dialog canceled');
                        return;
                    }
                    app.stream_key = response.stream_url.replace('rtmp://rtmp-api.facebook.com:80/rtmp/', '');
                    FB.ui({
                        display: 'popup',
                        method: 'live_broadcast',
                        phase: 'publish',
                        broadcast_data: response,
                    }, function(response) {
                        app.video_id = response.id;
                        app.fetch();
                    });
                });
            },
            fetch: function () {
                FB.api(
                    '/',
                    {
                        ids: app.video_id,
                        fields: Object.keys(app.reactions).map(function(reaction) {
                            return 'reactions.type('+reaction.toUpperCase()+').limit(0).summary(total_count).as('+reaction+')'
                        }).join(',')
                    },
                    function (response) {
                        Object.keys(app.reactions).map(function (reaction) {
                            app.reactions[reaction].count = response[app.video_id][reaction].summary.total_count;
                        });
                        setTimeout(app.fetch, app.rate * 1000);
                    }
                )
            }
        }
    })
})