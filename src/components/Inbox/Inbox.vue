<template>
    <div class="page">
        <div class="main">
            <div class="namePanel">
                <h2 v-if="receiverOnline" class="user-heading">{{ data.receiverName }} (online)</h2>
                <h2 v-if="!receiverOnline" class="user-heading">{{ data.receiverName }} (offline)</h2>
            </div>
            <div id="messageContainer" class="messageContainer">
                <div class="msgWrapper" v-for="msg of messagesArray" :key="msg._id">

                    <div class="message them" v-if="data.senderName !== data.receiverName && data.senderName !== msg.senderName">
                        <hgroup class="speech-bubble-yellow">
                            <p>{{msg.body}}</p>
                        </hgroup>
                    </div>

                    <div class="message you" v-if="data.senderName == msg.senderName">
                        <hgroup class="speech-bubble-blue">
                            <p>{{ msg.body }}</p>
                        </hgroup>
                    </div>
                </div>
                <div class="message them typing" v-if="isTyping === true">
                        {{ this.receiverName }} is typing a message...
                </div>
            </div>

            <div class="sendMessage">
                <form class="" @submit="sendMessage($event)">
                    <input type="text" v-model="message" placeholder="Type a message..." class="messageInput" @input="sendTyping">
                    <div class="emojiwrap">
                      <button type="button" @click="emojiShow=!emojiShow" class="btn emoji">😎</button>
                      <VEmojiPicker class="emojiPicker" v-if="emojiShow" @select="selectEmoji" />
                    </div>
                    <button type="submit" class="btn send">Send Message</button>
                </form>
            </div>

        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { eventBus } from '../../main';
import _ from 'lodash';
import VEmojiPicker from 'v-emoji-picker';

export default {
    components: {
      VEmojiPicker
    },
    data() {
        return {
            message: '',
            userId: '',
            senderName: '',
            receiverName: '',
            receiverId: '',
            messagesArray: [],
            data: '',
            token: '',
            receiverOnline: false,
            isTyping: false,
            typingMessage: null,
            emojiShow: false,
            onlineUsers: []
        }
    },
    methods: {
      selectEmoji(emoji) {
        this.message += emoji.data;
      },
      sendTyping() {

        let userData = {
          senderId: this.userId,
          receiverId: this.$route.params.id,
          senderName: this.senderName,
          receiverName: this.receiverName
        };

        this.$socket.emit('istyping', {userData});

        if(this.typingMessage) {
          clearTimeout(this.typingMessage);
        }

        this.typingMessage = setTimeout(() => {
          this.$socket.emit('stoptyping', {userData});
        }, 500);
      },
      getAllMessages(senderId, receiverId) {
        axios.post(`${process.env.VUE_APP_URL_LOCAL}/messages/get/${senderId}/${receiverId}`, {
            token: localStorage.getItem("jwt")
        })
        .then(res => {
          console.log(res.data);
          this.senderName = res.data.senderName;
          this.receiverName = res.data.receiverName;
          this.data = res.data;
          this.messagesArray = res.data.messages.message;
        })
        .catch(err => {
          console.log(err);
        });
      },
      scrollToEnd(){
        var container = this.$el.querySelector("#messageContainer");
        container.scrollTop = container.scrollHeight;
      },
      checkOnline() {
        let result = _.indexOf(this.onlineUsers, this.receiverId);
        if(result > -1) {
          this.receiverOnline = true;
        } else {
          this.receiverOnline = false;
        }
      },
      sendMessage(event) {
          event.preventDefault();
          if(this.message) {
                  axios.post(`${process.env.VUE_APP_URL_LOCAL}/messages/send`,{
                  convData: {
                      senderId: this.userId,
                      receiverId: this.$route.params.id,
                      message: this.message,
                      token: localStorage.getItem("jwt")
                  }
              })
              .then(result => {
                  console.log('result: ', result);
                  this.$socket.emit('addMessage', {});
                  //this.updateScroll();
                  this.scrollToEnd();
                  this.message = '';
              })
              .catch(err => {
                  console.log(err);
              });
          }
      }
    },
    mounted() {

        // get and check token
        this.token = localStorage.getItem("jwt");
        if(!this.token) {
            this.$router.push('/');
        }

        // get params
        this.receiverId = this.$route.params.id;

        // get your user id
        this.userId = localStorage.getItem("userId");

        // get messages
        this.getAllMessages(this.userId, this.receiverId);

         // join socket chat
        let typingObject = {
          room1: this.userId,
          room2: this.$route.params.id,

        };

        console.log('socket: ', this.$socket);

        // join chat
        this.$socket.emit('joinchat', {typingObject});


      // socket listeners

        this.$socket.on('addMessage', () => {
            if(this.userId === this.data.messages.sender) {
              this.getAllMessages(this.data.messages.sender, this.data.messages.receiver);
            } else {
              this.getAllMessages(this.data.messages.receiver, this.data.messages.sender);
            }
        });

        this.$socket.on('istyping', d => {
          if(d.userData.senderId !== this.userId) {
            this.isTyping = true;
          }
        });

        this.$socket.on('stoptyping', d => {
          if(d.userData.senderId !== this.userId) {
            this.isTyping = false;
          }
        });

    },
    created() {
      eventBus.$on('usersOnline', (data) => {
        console.log('users online triggered in inbox');
        console.log(data);
        this.onlineUsers = data;
        this.checkOnline();
      })
    },
    watch: {
    '$route.params.id': function (id) {
        // get new params
        let params = id;

        // get new messages
        this.getAllMessages(this.userId, params);

         // join new socket chat
        let typingObject = {
          room1: this.userId,
          room2: this.$route.params.id,

        };

        console.log('socket: ', this.$socket);

        // join chat
        this.$socket.emit('joinchat', {typingObject});
    }

    },
    updated() {


      //scroll chat window down
      this.scrollToEnd();
    }
}
</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: auto;
        justify-content: center;
        align-items: center;
    }
    .sidebar {
        flex: 2;
        height: auto;
        min-height: 100vh;
        border-right: 2px solid grey;
        display: flex;
        flex-direction: column;
    }

    .main {
        flex: 8;
        display: flex;
        padding: 2em;
        flex-direction: column;
        max-width: 55em;
    }

    

    .block {
        text-align: center;
        color: black;
        font-size: 14px;
        padding: 10px;
    }

    .block h2 {
        color: black;
        font-size: 18px;
    }

    .conversation {
        padding: 2em;
        cursor: pointer;
    }

    .conversation:hover,
    .cselected {
        background: #434343;
        color: white;
    }

    .emojiPicker {
      position: absolute;
      right: 1em;
    }

    .user-heading {
       text-align: center;
       margin-bottom: 1em;
    }

    .message {
        margin-bottom: 1em;
    }

    .speech-bubble-blue {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #3739c0;
        border-radius: .4em;
        color: white;
        width: 50%;
    }

    .speech-bubble-blue > p,
    .speech-bubble-yellow > p {
      padding: 1em;
    }

    .speech-bubble-blue:after {
        content: '';
        position: absolute;
        right: 0;
        top: 50%;
        width: 0;
        height: 0;
        border: 0.625em solid transparent;
        border-left-color: #3739c0;
        border-right: 0;
        margin-top: -0.625em;
        margin-right: -0.625em;
    }

    .speech-bubble-yellow {
        position: relative;
        background: #b4b935;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: .4em;
        color: white;
        width: 50%;
    }

    .speech-bubble-yellow:after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        width: 0;
        height: 0;
        border: 0.625em solid transparent;
        border-right-color: #b4b935;
        border-left: 0;
        margin-top: -0.625em;
        margin-left: -0.625em;
    }

    .namePanel {
        flex: 1;
        max-height: 5em;
    }

    .messageContainer {
        flex: 9;
        max-height: 20em;
        min-height: 20em;
        padding: 2em;
        border: 1px solid black;
        overflow: auto;
    }

    .sendMessage {
        border: 1px solid black;
    }

    .sendMessage,
    .sendMessage form {
        flex: 1;
        padding: .5em;
        display: inline-flex;
    }

    .btn {
        background: #760a52;
        color: white;
        font-size: 14px;
    }

    .sendMessage > form > input {
        flex: 4;
        margin-right: 1em;
        padding: 1em;
        font-size: 14px;
    }
    .sendMessage > form > button {
        flex: 2;
        border: none;
        cursor: pointer;
    }

    .message.them {
        display: flex;
        justify-content: flex-start;
    }

    .message.them.typing {
      color: #9a9a9a;
    }

    .message.you {
        display: flex;
        justify-content: flex-end;
    }

    .messageInput {
        flex: 6;
    }

    .emojiwrap {
      flex: 1;
      margin-right: 1em;
      position: relative;
    }

    .emoji {
        cursor: pointer;
        margin-right: 1em;
        height: 100%;
        width: 100%;
        max-width: 3em;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .send {
        flex: 2;
    }

</style>