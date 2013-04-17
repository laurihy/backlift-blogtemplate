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

App.router = Backbone.Router.extend({
	routes: {
		"": "mainview",
		"all": "all",
		":slug": "post"
	},

	mainview: function(){
		postcount = Math.min(App.posts.length, 4)
		if(postcount>0){
			var template = _.template($('#mainview').html(), {posts: App.posts, postcount: postcount});
			$('#main').html(template);
		} else {
			template = _.template($('#error').html(),{error:'No posts (yet?)'});
			$('#main').html(template);
		}
	},

	all: function(){
		if(App.posts.length>0){
			var template = _.template($('#all').html(), {posts: App.posts});
			$('#main').html(template);
		} else {
			template = _.template($('#error').html(),{error:'No posts (yet?)'});
			$('#main').html(template);
		}
	},

	post: function(slug){
		var post = _.find(App.posts, function(post) { return slug==App.generateSlug(post.title) });
		if(post!=undefined){
			template = _.template($('#post').html(), {post: post});
			$('#main').html(template);
		} else {
			template = _.template($('#error').html(),{error:'Post was not found'});
			$('#main').html(template);
		}
	}

})

// init the app
new App.router();
Backbone.history.start({pushState: true, root: ''}); 