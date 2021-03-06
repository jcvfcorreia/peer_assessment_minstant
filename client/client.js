
  // set up the main template the the router will use to build pages
  Meteor.subscribe("users");
  Meteor.subscribe("chats");
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });
  // specify the top level route, the page users see when they arrive at the site
  Router.route('/', function () {
    console.log("rendering root /");
    this.render("navbar", {to:"header"});
    this.render("lobby_page", {to:"main"});
  });

  // specify a route that allows the current user to chat to another users
  Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to
    // the id sent in after /chat/...
    if (Meteor.userId()){
      var otherUserId = this.params._id;
      // find a chat that has two users that match current user id
      // and the requested user id
      var filter = {$or:[
                  {user1Id:Meteor.userId(), user2Id:otherUserId},
                  {user2Id:Meteor.userId(), user1Id:otherUserId}
                  ]};
      var chat = Chats.findOne(filter);
      if (!chat){// no chat matching the filter - need to insert a new one
        chatId = Chats.insert({user1Id:Meteor.userId(), user2Id:otherUserId});
      }
      else {// there is a chat going already - use that.
        chatId = chat._id;
      }
      if (chatId){// looking good, save the id to the session
        Session.set("chatId",chatId);
      }
      this.render("navbar", {to:"header"});
      this.render("chat_page", {to:"main"});
    }else{
      //alert("You must login first!!!");
      Router.go("/");
    }
  });

  accountsUIBootstrap3.logoutCallback = function(error) {
    if(error) console.log("Error:" + error);
    Router.go('/');
  }
  ///
  // helper functions
  ///
  Template.available_user_list.helpers({
    users:function(){
      return Meteor.users.find();
    }
  })
 Template.available_user.helpers({
    getUsername:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.username;
    },
    isMyUser:function(userId){
      if (userId == Meteor.userId()){
        return true;
      }
      else {
        return false;
      }
    }
  })


  Template.chat_page.helpers({
    messages:function(){
      console.log(Meteor.userId());
      var chat = Chats.findOne({_id:Session.get("chatId")});
      return chat.messages;
    },
    other_user:function(){
      return ""
    },

  })
 Template.chat_page.events({
  // this event fires when the user sends a message on the chat page
  'submit .js-send-chat':function(event){
    // stop the form from triggering a page reload
    event.preventDefault();
    // see if we can find a chat object in the database
    // to which we'll add the message
    var chat = Chats.findOne({_id:Session.get("chatId")});
    if (chat){// ok - we have a chat to use
      var msgs = chat.messages; // pull the messages property
      if (!msgs){// no messages yet, create a new array
        msgs = [];
      }
      // is a good idea to insert data straight from the form
      // (i.e. the user) into the database?? certainly not.
      // push adds the message to the end of the array
      var avatar = Meteor.users.findOne({_id:Meteor.userId()});
      console.log(avatar.profile.username);
      console.log(avatar.profile.avatar);
      msgs.push({text: event.target.chat.value, avatar: avatar.profile.avatar, user: avatar.profile.username});
      // reset the form
      event.target.chat.value = "";
      // put the messages array onto the chat object
      chat.messages = msgs;
      // update the chat object in the database.
      Chats.update(chat._id, chat);
    }
  }
 })

 /*Template.chat_message.helpers({
   avatar:function(userId){
     var avatar = Meteor.users.findOne({_id:userId});
     console.log(avatar.profile.avatar);
     return avatar.profile.avatar;
   }
 });*/


// start up script that creates some users for testing
// users have the username 'user1@test.com' .. 'user8@test.com'
// and the password test123
