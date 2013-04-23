/*
* all stuff for blog template
*/

// converts titles into slugs
App.generateSlug = function(title){
    return title.replace(/\s/g, '-')
}

App.getFirstParagraph = function(post){
    return $('<div>'+post['html']+'</div>').find('p:first').text();
}

App.prettyDate = function(datestr){
    return new Date(datestr).toString('MMMM d, yyyy')
}

App.findPostBySlug = function(slug){
    var post = _.find(App.posts, function(post){
        return slug==post.slug; 
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

App.getPosts = function(start, count){
    return App.posts.slice(start, start+count)
}

App.loadMorePosts = function(){
    posts = App.getPosts(App.loadedPostsOffset, 1);
    html = Handlebars.templates.postlist({posts: posts});
    $('#postlist').append(html)
    App.loadedPostsOffset += 1;
    if(App.loadedPostsOffset>=App.posts.length){
        $('#loadmore').attr('disabled','disabled');
        $('#loadmore').text('No more posts');
    }
}

App.router = Backbone.Router.extend({
    routes: {
        "": "mainview",
        ":slug": "post"
    },

    mainview: function(){
        $('#main').html(Handlebars.templates.mainview());
        App.loadedPostsOffset = 0;
        App.loadMorePosts();

        $('#sidebar').html(Handlebars.templates.sidebar({posts: App.getPosts(0, 5)}));
    },

    post: function(slug){
        var post = App.findPostBySlug(slug)

        if(post!=undefined){
            post['html'] = post['html'] || marked(post['content']);
            $('#main').html(Handlebars.templates.singlepost( post ))
        } else {
            $('#main').html(Handlebars.templates.error({ error: 'Post was not found' }));
        }

        $('#sidebar').html(Handlebars.templates.sidebar({ posts: App.getPosts(0, 5) }));
    }

})


// sort posts (latest first)
App.posts.sort(function(a,b){
    return (new Date(a._created)) < (new Date(b._created) )
});

// preprocess posts a little bit
App.posts = _.map(App.posts, function(post){
    post['html'] = marked(post['content']);
    post['excerpt'] = App.getFirstParagraph(post);
    post['slug'] = App.generateSlug(post['title']);
    post['timeago'] = post['timeago'] || jQuery.timeago(post['_created']);
    post['prev'] = App.findOffsetPost(post, +1);
    post['next'] = App.findOffsetPost(post, -1)
    post['isCurrent'] = function(){
        return post['slug'] == Backbone.history.fragment;
    }
    return post
});

// init the app
new App.router();
Backbone.history.start({pushState: true, root: ''}); 