<template>
    <div class="page">
        <div class="heading">
            <h1>My Conversations</h1>
        </div>
        <div class="panel">
            <div class="conversations-container">
                 <div v-for="chat of chatList" :key="chat._id" class="conversation">
                    <div class="col flex-1">
                        <input type="checkbox" class="checkbox">
                    </div>
                    <div class="col flex-2-mob">
                        <router-link class="username-label" :to="userId !== chat.message[chat.message.length-1].receiverId ? '/inbox/' + chat.message[chat.message.length-1].receiverId : '/inbox/' + chat.message[chat.message.length-1].senderId">
                            <p v-if="userId !== chat.message[chat.message.length-1].senderId">{{ chat.message[chat.message.length-1].senderName }}</p>
                            <p v-if="userId === chat.message[chat.message.length-1].senderId">{{ chat.message[chat.message.length-1].receiverName }}</p>
                        </router-link>
                    </div>
                    <div class="col flex-5">
                        <router-link class="message-body" :to="userId !== chat.message[chat.message.length-1].receiverId ? '/inbox/' + chat.message[chat.message.length-1].receiverId : '/inbox/' + chat.message[chat.message.length-1].senderId"><p>{{ chat.message[chat.message.length-1].body }}</p></router-link>
                    </div>
                    <div class="col flex-2">
                        <p class="date-label">{{ timeAgo(chat.message[chat.message.length-1].createdAt) }}</p>
                    </div>
                </div>
            </div>
            <div class="button-panel">
                <div class="col">
                    <button class="btn-red">Delete</button>
                </div>
                 <div class="col">
                    <button class="btn-blue">Mark Unread</button>
                </div>
                <div class="col">
                    <button class="btn-red">Block User</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
    data() {
        return {
            chatList: [],
            token: '',
            userId: ''
        }
    },
    methods: {
        timeAgo(date) {
            return moment(String(date)).startOf('hour').fromNow();
        },
        getChatList() {
            axios.post(`${process.env.VUE_APP_URL_LOCAL}/auth/getChatList`, {
                data: {
                    token: this.token,
                    id: this.userId
                }
            })
            .then(conversations => {
                console.log(conversations);
                this.chatList = conversations.data.conversations;
            })
            .catch(err => {
                console.log(err);
            });
        }
    },
    mounted() {
        // token
        this.token = localStorage.getItem("jwt");

        // get user id
        this.userId = localStorage.getItem("userId");

        // check for token
        if(!this.token) {
            this.$router.push('/');
        }

        this.getChatList();
    }
}
</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: auto;
        justify-content: center;
        align-items: center;
    }

    .page > .heading {
        width: 75%;
        display: flex;
        flex-direction: column;
        text-align: center;
        justify-content: center;
        align-items: center;
        padding: 1em;
        margin-top: 1em;
        background-color: rgba(80, 69, 69, 0.2);
        color: white;
    }

    .page > .heading > h1 {
        display: block;
        flex: 1;
    }

    .page > .panel {
        padding: 2%;
        flex: 5;
        background-color: rgba(80, 69, 69, 0.2);
        height: auto;
        min-height: 50vh;
        max-height: 50vh;
        width: 75%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow: auto;
        margin: 4em auto 1em auto;
    }

    .page > .panel > .button-panel {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background-color: white;
    }



    .page > .panel > .conversations-container {
        min-height: 30vh;
        max-height: 30vh;
        overflow: scroll;
        display: flex;
        align-items: center;
        flex-direction: column;
        padding-top: 1em;
        padding-bottom: 1em;
        margin-bottom: 1em;

    }

    .page > .panel > .conversations-container > .conversation {
        background-color: white;
        display: flex;
        width: 98%;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-bottom: .6em;
        border: 1px solid transparent;
    }

   .page > .panel > .conversations-container > .conversation:hover {
        border: 1px solid red;
    }

    .col {
        display: flex;
        margin-left: .5em;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 100%;
        flex: 1;
        padding: 1em;
    }

    .checkbox {
        appearance: none;
        -webkit-appearance: none;
        background-color: #fafafa;
        border: 1px solid #cacece;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0px -15px 10px -12px rgba(0,0,0,0.05);
        padding: 9px;
        border-radius: 3px;
        display: inline-block;
        position: relative;
        outline: none;
    }

    .checkbox:active, .checkbox:checked:active {
        box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0px 1px 3px rgba(0,0,0,0.1);
        outline: none;
    }

    .checkbox:checked {
        background-color: #e9ecee;
        border: 1px solid #cd23be;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0px -15px 10px -12px rgba(0,0,0,0.05), inset 15px 10px -12px rgba(255,255,255,0.1);
        color: #99a1a7;
        outline: none;
    }

    .checkbox:checked:after {
        content: '\2714';
        font-size: 14px;
        position: absolute;
        top: 0px;
        left: 3px;
        color: #cd23be;
    }

    .btn-red {
        padding: 1em;
        border: 3px solid transparent;
        background-color: red;
        color: white;
        font-weight: bold;
        font-size: 1em;
        cursor: pointer;
    }

    .btn-blue {
        padding: 1em;
        border: 3px solid transparent;
        background-color: blue;
        color: white;
        font-weight: bold;
        font-size: 1em;
        cursor: pointer;
    }

    .btn-red:hover {
        background-color: white;
        border: 3px solid red;
        color: red;
    }

    .btn-blue:hover {
        background-color: white;
        border: 3px solid blue;
        color: blue;
    }

    .flex-1 {
        flex: 1;
    }

    .flex-2 {
        flex: 2;
    }

    .flex-5 {
        flex: 5;
    }

    .message-body,
    .username-label {
        text-decoration: none;
    }

    .username-label:hover,
    .message-body:hover {
        color: blue;
        cursor: pointer;
    }

    @media (max-width: 860px) {
        .page > .panel,
        .page > .heading {
            width: 100%;
        }

        .page > .panel {
            min-height: unset;
            max-height: unset;
            height: auto;
        }

        .page > .panel > .conversations-container {
            min-height: 40vh;
            max-height: 40vh;
        }

        .flex-5 {
            flex: 8;
        }

        .flex-2 {
            flex: 1;
        }

        .flex-2-mob {
            flex: 1;
        }

        .button-panel {
            flex-wrap: wrap;
        }

        .btn-blue,
        .btn-red {
            min-width: 5em;
        }

    }

    @media (max-width: 470px) {
        .flex-5 {
            display: none;
        }

        .flex-2-mob {
            flex: 2;
        }

        .page > .panel > .button-panel {
            flex-direction: column;
        }

        .btn-blue,
        .btn-red {
            max-width: 16em;
            font-size: .8em;
            padding: .5em;
        }
    }
</style>