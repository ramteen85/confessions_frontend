<template>
    <div class="page">
        <div class="main">
            <div class="section heading">
                <h1>{{ this.subject }}</h1>
            </div>
            <div class="section small">
                <img :src="imageUrl" alt="" />
            </div>
            <div class="section post">
                <div>{{ post }}</div>
            </div>
            <div class="section small">
                <div class="catwrapper">
                    <p class="categories" placeholder="Please add categories separated by a comma">{{ categories }}</p>
                </div>
            </div>
            <div class="section panel-section">
                <div class="post-panel">
                    <p>Poster: {{ this.creator }}</p>
                </div>
                <div class="post-panel">
                    <div class="reactbtn" @click="() => {heartPost(this.id)}">
                        <div class="love"><font-awesome-icon icon="heart"/></div>
                        <span>{{ this.totalHearts }}</span>
                    </div>
                </div>
                <div class="post-panel">
                    <div class="reactbtn" @click="() => {hatePost(this.id)}">
                        <div class="hate"><font-awesome-icon icon="hand-middle-finger"/></div>
                        <span>{{ this.totalHates }}</span>
                    </div>
                </div>
            </div>
            <div v-if="this.userId == this.creatorId" class="section panel-section">
                <div class="post-panel">
                    <div class="deleteBtn">
                        <button @click="deleteConfession" class="btn delete">Delete Confession</button>
                    </div>
                </div>
            </div>
            <div v-if="this.userId !== this.creatorId" class="section panel-section">
                <div class="post-panel">
                    <div class="deleteBtn">
                        <button @click="messageUser" class="btn delete">Message {{ this.creator }}</button>
                    </div>
                </div>
                <div class="post-panel">
                    <p style="font-style: italic;">Distance from you: {{ distance }} km</p>
                </div>
            </div>
            <!-- <div class="section large">
                <textarea class="post_comment" name="post_comment" id="post_comment" placeholder="Share your thoughts on this confession..."></textarea>
                <button class="btn">Post Comment</button>
            </div> -->
        </div>
    </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import axios from 'axios';

export default {
    data() {
        return {
            imageUrl: '',
            categories: 'Anonymous, Private Thoughts',
            subject: '',
            post: '',
            creator: 'nickname',
            totalHearts: 0,
            totalHates: 0,
            token: '',
            userId: '',
            creatorId: '',
            id: '',
            distance: 0
        }
    },
    validations: {
        post: {
            required
        },
        subject: {
            required
        }
    },
    methods: {
        deleteConfession() {
            if(confirm("Do you really want to delete?")){
                axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/delete`, {
                confData: {
                    token: this.token,
                    id: this.id
                }
                })
                .then(response => {
                    console.log(response);
                    this.$router.push('/');
                })
                .catch(err => {
                    console.log(err);
                });
            }
        },
        heartPost(id) {
            // use id to add to a posts hearts
            console.log(id);

            axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/heartPost`, {
                confData: {
                    token: this.token,
                    id: id
                }
            })
            .then(res => {
                console.log(res);
                this.totalHearts = res.data.confession.totalHearts;
                this.totalHates = res.data.confession.totalHates;
            })
            .catch(err => {
                console.log(err);
            });
        },
         messageUser() {
            this.$router.push('/inbox/' + this.creatorId);
        },
        hatePost(id) {
            // use id to add to a posts hates

            axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/hatePost`, {
                confData: {
                    token: localStorage.getItem("jwt"),
                    id: id
                }
            })
            .then(res => {
                console.log(res);
                this.totalHates = res.data.confession.totalHates;
                this.totalHearts = res.data.confession.totalHearts;
            })
            .catch(err => {
                console.log(err);
            });
        },
        getConfession() {
            axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/post`, {
                confData: {
                    token: this.token,
                    id: this.$route.params.id
                }
            })
            .then(res => {
                console.log(res);
                this.subject = res.data.confession.subject;
                this.categories = res.data.confession.categories[0];
                this.post = res.data.confession.content;
                this.creator = res.data.confession.creator.nickname;
                this.totalHearts = res.data.confession.totalHearts;
                this.totalHates = res.data.confession.totalHates;
                this.id = res.data.confession._id;
                this.creatorId = res.data.confession.creator._id;
                this.distance = parseInt(res.data.distance);
                this.imageUrl = res.data.confession.imageUrl;
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

        // get the confession
        this.getConfession();
    }
}
</script>

<style scoped>

    .resize-none {
        resize: none;
    }

    .love {
        color: red;
    }

    .hate {
        color: brown;
    }

    .page {
        display: flex;
        flex-direction: row;
        flex: 1;
        justify-content: center;
        align-items: flex-start;
        flex-direction: row;
        min-height: 100vh;
        height: auto;
    }

    .main {
        -webkit-box-shadow: 5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        -moz-box-shadow:    5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        box-shadow:         5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        border: 2px solid #eeeeee;
        margin-top: 1em;
        margin-bottom: 5em;
        padding: 1em;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 40%;
        max-width: 40%;
        height: auto;
    }

    .section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: auto;
    }

    .post {
        align-items: flex-start;
        padding: 2em;
        flex-wrap: wrap;
        word-wrap: break-word;
    }

    .post > div {
        word-wrap: break-word;
        word-break: break-all;
    }

    .section > img {
        width: 100%;
        height: 100%;
        max-height: 15em;
    }

    .panel-section {
        height: 5em;
        border-top: 1px solid grey;
        flex-direction: row;
        padding: 1em;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .reactbtn {
        max-width: 2em;
        padding: 5% 10% 5% 10%;
        border: 1px solid red;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        height: 100%;
    }
    .reactbtn:hover {
        background-color: lime;
    }

    .post-panel {
        flex: 1;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .heading {
        padding: .3em;
    }

    .small {
        padding: 1em;
    }

    .large {
        padding: 2em;
    }

    .section > h1 {
        text-align: center;
        font-size: 1.5em;
    }

    .section > small {
        margin-bottom: 1em;
        flex: 1;
        display: flex;
    }

    .section > .catwrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        flex: 1;
        flex-direction: row;
        height: 2em;
    }

    input.categories {
        flex: 1;
        display: flex;
        font-size: 14px;
    }

    .section > textarea {
        padding: .3em .5em .3em .5em;
        font-size: 14px;
        width: 100%;
        height: 10em;
    }

    .section > .post {
        margin-top: 2em;
        font-size: .7em;
    }



    .btn {
        padding: 10px;
        cursor: pointer;
        color: white;
        background-color: #3a38a9;
    }

    .btn:hover {
        background-color: #429d58;
    }

    .post_comment {
        font-size: 22px;
        padding: .5em;
        resize: none;
        margin-bottom: 1em;
    }

</style>