<template>
    <div>
        <nav class="navbar nav-color">
            <div class="container">
                <a href="" class="brand">Confessions</a>
                <ul class="menu">
                    <li v-if="!loggedin" class="menu__item"><router-link to="/register">Register</router-link></li>
                    <li v-if="!loggedin" class="menu__item"><router-link to="/">Login</router-link></li>

                    <!-- add inbox to navbar later -->



                    <!-- Add Notifications Later -->

                    <!-- <li @click="toggleNotificationMenu" v-if="loggedin" class="menu__item mar-top">
                        <font-awesome-icon icon="globe-americas"/><span class="badge">2</span>
                        <ul v-if="notificationMenuShow" class="dropdown-menu notifications">
                            <li v-if="loggedin" class="dropdown-menu__item"><router-link to="/">Notification message</router-link></li>
                        </ul>
                    </li> -->


                    <li v-if="loggedin" @click="toggleMessagesMenu" class="menu__item mar-top">
                        <font-awesome-icon icon="envelope"/>
                        <span v-if="msgNumber > 0" class="badge">{{msgNumber}}</span>
                        <div style="position: relative">
                        <ul v-if="messageMenuShow" class="messages-menu">
                            <li v-if="loggedin" class="dropdown-menu__item messages-item">
                                <router-link to="#">Go To Inbox</router-link>
                            </li>
                            <li v-if="loggedin" class="dropdown-menu__item messages-item">
                                <a class="btn" @click="markAllMessages">Mark All As Read</a>
                            </li>
                            <hr>
                            <li v-for="chat of chatList" :key="chat._id" class="dropdown-menu__item messages-item">
                                <div class="messageItem" @click="markMessages(chat.message[chat.message.length-1].senderId, chat.message[chat.message.length-1].receiverId, userId)">
                                <router-link v-if="loggedin" :to="userId !== chat.message[chat.message.length-1].receiverId ? '/inbox/' + chat.message[chat.message.length-1].receiverId : '/inbox/' + chat.message[chat.message.length-1].senderId">
                                <div class="messageColumn">
                                    <img class="avatar" src="http://placehold.it/50x50" alt="">
                                </div>
                                <div class="messsageColumn">
                                    <span class="nickname" v-if="userId !== chat.message[chat.message.length-1].senderId">{{ chat.message[chat.message.length-1].senderName }}</span>
                                    <span class="nickname" v-if="userId === chat.message[chat.message.length-1].senderId">{{ chat.message[chat.message.length-1].receiverName }}</span>
                                    <span class="messageText">{{ chat.message[chat.message.length-1].body }}</span>
                                </div>
                                <div class="messsageColumn">
                                    <span class="date">{{ timeAgo(chat.message[chat.message.length-1].createdAt) }}</span>
                                    <font-awesome-icon v-if="!chat.message[chat.message.length-1].isRead && chat.message[chat.message.length-1].receiverId === userId" icon="book-medical" />
                                    <font-awesome-icon v-if="!chat.message[chat.message.length-1].isRead && chat.message[chat.message.length-1].senderId === userId" icon="envelope-open" />
                                    <font-awesome-icon v-if="chat.message[chat.message.length-1].isRead" icon="envelope-open" />
                                </div>
                            </router-link>
                            </div>
                            </li>
                        </ul>
                        </div>
                    </li>

                    <li v-if="loggedin" @click="toggleMainMenu" class="menu__item mar-top">
                        <font-awesome-icon icon="bars"/>
                        <div style="position: relative">
                        <ul v-if="mainMenuShow" class="dropdown-menu">
                            <li v-if="loggedin" class="dropdown-menu__item"><router-link to="/members/closest">Nearby</router-link></li>
                            <li v-if="loggedin" class="dropdown-menu__item"><router-link to="/members/latest">Latest</router-link></li>
                            <li v-if="loggedin" class="dropdown-menu__item"><router-link to="/members/popular">Popular</router-link></li>
                            <li v-if="loggedin" class="dropdown-menu__item"><router-link to="/members/hated">Hated</router-link></li>
                            <li v-if="loggedin" class="dropdown-menu__item" @click="logout">Logout</li>
                        </ul>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
import {eventBus} from '../../main';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
export default {
    name: 'Navbar',
    data() {
        return {
            loggedin: false,
            mainMenuShow: false,
            messageMenuShow: false,
            notificationMenuShow: false,
            chatList: [],
            onlineUsers: [],
            userId: '',
            msgNumber: 0,
            insideInbox: false,
            token: ''
        }
    },
    methods: {
        markMessages(senderId, receiverId, checkSenderId) {
            if(this.userId === checkSenderId) {
                axios.post(`${process.env.VUE_APP_URL}/messages/markread`, {
                    data: {
                        token: this.token,
                        senderId: senderId,
                        receiverId: receiverId
                    }
                })
                .then(result => {
                    this.$socket.emit('refresh', {});
                    console.log('messages marked');
                    console.log(result);
                })
                .catch(error => {
                    console.log(error)
                });
            }
        },
        markAllMessages(event) {
            event.preventDefault();
            axios.post(`${process.env.VUE_APP_URL}/messages/markallread`, {
                data: {
                    token: this.token,
                    senderId: this.userId
                }
            })
            .then((result) => {
                console.log(result);
                this.$socket.emit('refresh', {});
                this.msgNumber = 0;
            })
            .catch(err => {
                console.log(err);
            });
        },
        getChatList() {
            axios.post(`${process.env.VUE_APP_URL}/auth/getChatList`, {
                data: {
                    token: this.token,
                    id: this.userId
                }
            })
            .then(conversations => {
                console.log(conversations);
                this.chatList = conversations.data.conversations;
                this.checkIfRead(conversations);
            })
            .catch(err => {
                console.log(err);
            });
        },
        logout() {
            localStorage.removeItem("jwt");
            localStorage.removeItem("userId");
            this.loggedin = false;
            this.chatList = [];
            this.$router.push('/');
        },
        closeAllDropdowns() {
            this.mainMenuShow = false;
            this.notificationMenuShow = false;
            this.messageMenuShow = false;
        },
        toggleNotificationMenu() {
            this.mainMenuShow = false;
            this.messageMenuShow = false;
            this.notificationMenuShow = !this.notificationMenuShow;
        },
        timeAgo(date) {
            return moment(String(date)).startOf('hour').fromNow();
        },
        checkIfRead(arr) {
            const checkArr = [];
            try {
            console.log(this.$router.app._route.path);
            for(let i = 0; i < arr.data.conversations.length; i++) {
                const lastMessage = arr.data.conversations[i].message[arr.data.conversations[i].message.length-1];
                if(!this.insideInbox) {
                    if(lastMessage.isRead === false && lastMessage.receiverId === this.userId) {
                        checkArr.push(1);
                        this.msgNumber = _.sum(checkArr);
                    }
                }
            }
            }
            catch(err)
            {
                console.log(err);
            }
        },
        toggleMainMenu() {
            this.notificationMenuShow = false;
            this.messageMenuShow = false;
            this.mainMenuShow = !this.mainMenuShow;
        },
        toggleMessagesMenu() {
            this.notificationMenuShow = false;
            this.mainMenuShow = false;
            this.messageMenuShow = !this.messageMenuShow;
        }
    },
    watch: {
        onlineUsers: {
            handler: function() {
                eventBus.$emit('usersOnline', this.onlineUsers);
            }
        },
        '$route': function () {
            if(localStorage.getItem("jwt")) {
                this.loggedin = true;
            }

            if(this.loggedin) {
                // get token
                this.token = localStorage.getItem("jwt");

                // get user id
                this.userId = localStorage.getItem("userId");



                // refresh chat list
                this.getChatList();

                // check for inbox
                this.insideInbox = this.$router.app._route.path.startsWith(`/inbox/${this.userId}`) || this.$router.app._route.path.startsWith(`/inbox/${this.$route.params.id}`);

                // user is online
                this.$socket.emit('online', { room: 'global', userId: this.userId });
            }
        }
    },
    created() {
        eventBus.$on('userloggedin', () => {
            this.loggedin = true;
        });
    },
    mounted() {
        if(localStorage.getItem("jwt")) {
            this.loggedin = true;
        }

        if(this.loggedin) {
            // get token
            this.token = localStorage.getItem("jwt");

            // get user id
            this.userId = localStorage.getItem("userId");

            // get chat list
            this.getChatList();

            // socket listeners
            this.$socket.on('refresh', () => {
                this.getChatList();
            });

            this.$socket.on('usersOnline', data => {
                this.onlineUsers = data;
                console.log(this.onlineUsers);
                eventBus.$emit('usersOnline', data);
            });

            // check for inbox
            this.insideInbox = this.$router.app._route.path.startsWith(`/inbox/${this.userId}`) || this.$router.app._route.path.startsWith(`/inbox/${this.$route.params.id}`);

            // user is online
            this.$socket.emit('online', { room: 'global', userId: this.userId });
        }

    }
}
</script>

<style scoped>

.navbar {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: rgb(174, 23, 216);
}

.badge {
    width: auto;
    height: auto;
    border-radius: 100%;
    background-color: red;
    color: white;
    display: inline-block;
    text-align: center;
    position: relative;
    top: 10px;
    right: 0px;
    font-size: 13px;
    padding: 4px 8px;
}

.container {
    display: flex;
    flex-direction: row;
}

.brand {
    text-decoration: none;
    font-weight: bold;
    font-size: 20px;
    flex: 1;
    color: white;
    padding: .9em .4em .9em 3em;
    max-width: 250px;
}

.menu {
    display: inline-flex;
    list-style: none;
    flex-direction: row;
    flex: 1;
    align-items: flex-end;
    justify-content: flex-end;
    padding-right: 3em;

}

.menu > li,
.menu > li a {
    margin-right: 1em;
    text-decoration: none;
    color: white;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto 0;
}

.menu > li:hover,
.menu > li a:hover {
    color: lime;
}

.menu__item {
    min-width: 50px;
    max-width: 100px;
}

.menu__item a {
    display: inline-block;
    width: 100%;
}

.mar-top {
    margin-top: -1em;
}

.dropdown-menu {
    position: absolute;
    z-index: 1;
    /* display: flex; */
    /* flex-direction: column; */
    /* justify-content: center; */
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    background-color: blueviolet;
    /* margin-top: 9.3em; */
    width: 7.5em;
    list-style: none;
    padding: 0;
    right: -3em;
    text-align: center;
    margin-top: 1em;
}


.dropdown-menu__item {
    padding: 1em;
    /* flex: 1; */
}

.dropdown-menu__item:hover {
    background-color: green;
}

.dropdown-menu__item > a {
    text-decoration: none;
}

.notifications {
    right: 6em;
}

.messages-item {
    display: flex;
    flex-direction: column;
}

/* messages dropdown */

.messages-menu {
    top: 1em;
    z-index: 1;
    position: absolute;
    right: -2em;
    background: blueviolet;
    color: white;
    padding: .3em;
    width: 20em;
    max-height: 20em;
    overflow: auto;
}

/* all columns */

#app > div > nav > div > ul > li > div > ul > li > div > a > div {
    display: flex;
    flex-direction: column;
}

/* first column */
#app > div:nth-child(1) > nav > div > ul > li:nth-child(1) > div > ul > li > div > a > div.messageColumn {
    flex: 1;
    margin-right: 1em;
    justify-content: center;
    align-items: center;
}

/* second column */
#app > div:nth-child(1) > nav > div > ul > li:nth-child(1) > div > ul > li > div > a > div:nth-child(2) {
    flex: 5;
    margin-right: .5em;
    justify-content: flex-start;
    align-items: flex-start;
}

/* third column */
#app > div:nth-child(1) > nav > div > ul > li:nth-child(1) > div > ul > li > div > a > div:nth-child(3) {
    flex: 2;
    margin-right: unset;
    justify-content: center;
    align-items: center;
}

/* date */
#app > div:nth-child(1) > nav > div > ul > li:nth-child(1) > div > ul > li > a > div:nth-child(3) > span {
    margin-bottom: 1em;
    font-size: 8px;
}

.nickname {
    margin-bottom: 1em;
}

@media(max-width: 320px) {
    .brand {
        display: none;
    }
    .navbar {
        padding: 1em;
        width: 100%;
    }
}

</style>