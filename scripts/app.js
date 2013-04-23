/*
* all stuff for blog template
*/

// converts titles into slugs
App.generateSlug = function(title){
    return title.replace(/\s/g, '-')
}

App.getFirstParagraph = function(post){
    return $('<div>'+marked(post.content)+'</div>').find('p:first').text();
}

App.prettyDate = function(datestr){
    return new Date(datestr).toString('MMMM d, yyyy')
}

App.renderTemplate = function(templatename, target, data){
    var template = _.template($(templatename).html(), data);
    $(target).html(template);
}

App.findPostBySlug = function(slug){
    var post = _.find(App.posts, function(post){
        return slug==App.generateSlug(post.title); 
    });
    return post;
}

App.findOffsetPost = function(post, offset){
    var index = App.posts.indexOf(post);
    if(index<0){
        return false;
    }
    var newindex = index+offset;
    if(newindex<0 || newindex>=App.posts.length){
        return false;
    }
    return App.posts[newindex]
}

App.router = Backbone.Router.extend({
    routes: {
        "": "mainview",
        ":slug": "post"
    },

    mainview: function(){
        var postcount = Math.min(App.posts.length, 5);
        var data = {
            post: undefined,
            posts: App.posts,
            postcount: postcount
        }
        App.renderTemplate('#mainview', '#main', data);
        App.renderTemplate('#sidebar-template', '#sidebar', data);

    },

    post: function(slug){
        var post = App.findPostBySlug(slug)
        var prev = App.findOffsetPost(post, +1);
        var next = App.findOffsetPost(post, -1);

        if(post!=undefined){
            App.renderTemplate('#post','#main',{post:post, prev:prev, next:next});
        } else {
            App.renderTemplate('#error','#main',{error: 'Post was not found'});
        }

        App.renderTemplate('#sidebar-template','#sidebar',{
                post: post,
                posts: App.posts,
                postcount: Math.min(App.posts.length, 5)
        });
    }

})

// init the app
new App.router();
Backbone.history.start({pushState: true, root: ''}); 