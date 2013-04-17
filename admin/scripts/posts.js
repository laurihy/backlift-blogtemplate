/*
* Handles views and logic for browsing posts
*
*/

App.posts = {};
App.posts.viewGen = new App.helpers.viewGen();

App.posts.model = Backbone.Model.extend({
  collection: App.posts.collection,
  idAttribute:'_id',

  isPrivate: function(){
    var _public_permissions = this.attributes['_public_permissions']
    if(_public_permissions!==undefined && _public_permissions.indexOf('r')<0){
      return true
    }
    return false;
  },

  slug: function(){
    return this.attributes.title.replace(/\s/g, '-')
  }
});

App.posts.collection = Backbone.Collection.extend({
  url: '/backlift/data/posts',
  model: App.posts.model,
  comparator: function(m) {
    return -(new Date(m.get('_created')).getTime());
  }
});

App.posts.listView = Backbone.View.extend({
  el: '#content',
  template: $('#posts-list'),

  initialize: function(options){
    this.collection = options.collection;
  },

  render: function(){
    this.$el.html(_.template(this.template.html(), this.collection)); 
  }
});

App.posts.postView = Backbone.View.extend({
  el: '#content',
  template: $('#post-view'),
  
  initialize: function(options){
    this.model = options.model
  },

  render: function(){
    this.$el.html(_.template(this.template.html(), {model:this.model}))
  },

  events: {
    "submit #postedit": function(e){
      e.preventDefault();
      this._update_post('#postedit')
    },
    "click #deletepost": function(){
      if(confirm('Are you sure you want to delete this post?')){
        this.model.collection.get(this.model.id).destroy();
        App.router.router.navigate('posts',{trigger:true});
      }
    },
    "click #togglepreview": function(){
      data = App.helpers.serializeForm('#postedit');
      $('#postpreview .modal-header h3').html(data['title']);
      $('#postpreview .modal-body').html(marked(data['content']));
      $('#postpreview').modal('show');
    },
    "keydown #postedit textarea": function(e){
      // enable using tab-key
      if(e.keyCode==9){
        var el = e.target
        var start = el.selectionStart;
        var end = el.selectionEnd;
        var $this = $(el);
        var value = $this.val();

        // set textarea value to: text before caret + tab + text after caret
        $this.val(value.substring(0, start)
                    + "\t"
                    + value.substring(end));
        // put caret at right position again (add one for the tab)
        el.selectionStart = el.selectionEnd = start + 1;

        // prevent the focus lose
        e.preventDefault()
      }  
    }
  },

  _update_post: function(form){
    var data = App.helpers.serializeForm(form)
    var data = this._set_isprivate(data);
    var self = this;

    var validator = new App.helpers.formValidator(form);
    validator.clearErrors();
    console.log(this.model)
    var posttitles = _.map(this.model.collection.models, function(model) { return model.attributes.title; })
    posttitles = _.filter(posttitles, function(title){ return self.model.attributes.title!=title});
    validator.clientValidate([
      {field:'title',func:App.helpers.notEmpty},
      {field:'title',func:App.helpers.notInList(posttitles)}
    ]);

    if(!validator.hasErrors){
      this.model.save(data, {
        success: function(newdata){
          self.model.set(newdata.attributes);
          self.model.collection.add(self.model);
          self.model.collection.sort()
          self.$el.prepend('<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a>Updated successfully</div>')
          App.router.router.navigate('posts/'+self.model.slug(),{trigger:true});
        },
        error: function(response) {
          alert('There was an error, please try again')
        }
      });
    }
  },

  _set_isprivate: function(data){
    if(data['isPrivate']){
      data['_public_permissions'] = ""
    } else {
      data['_public_permissions'] = "r"
    }
    delete data['isPrivate'];
    return data;
  }

})

App.posts.posts = new App.posts.collection(App.postData);

App.posts.renderLayout = function(postid){
  if(postid===undefined){
    var view = App.posts.viewGen('listview', App.posts.listView, {'collection':App.posts.posts});
    view.render();
  } else {
    var model = _.find(App.posts.posts.models,function(post){ return post.slug()==postid; })
    if(model===undefined){
      model = new App.posts.model()
      model.collection = App.posts.posts
    }
    var view = App.posts.viewGen('listview', App.posts.postView, {'model':model});
    view.render()
  }
}