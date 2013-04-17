// router

App.router = Backbone.Router.extend({
    routes: {
        "": "rootHandler",
        "posts": "postsHandler",
        "posts/:post": "postsPostHandler",
        "newpost": "addNewPostHandler",
        "users": "usersHandler",
        "users/:user": "usersUserHandler",
    },

    rootHandler: function() {
        var self = this;
        self.navigate("posts", {trigger: true, replace: true});
    },

    postsHandler: function(){
      App.helpers.toggleNav("#nav-posts");
      App.posts.renderLayout();
    },

    postsPostHandler: function(post){
      App.helpers.toggleNav("#nav-posts");
      App.posts.renderLayout(post)
    },

    addNewPostHandler: function(){
      App.helpers.toggleNav("#nav-newpost");
      App.posts.renderLayout('addnew');
    },

    usersHandler: function(){
      App.helpers.toggleNav("#nav-users");
      App.users.renderLayout();
    }

});