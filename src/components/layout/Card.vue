<template>
    <!-- gets information from confession in confessions -->
     <div class="card">
        <div class="cardbody">
            <div class="linkto" @click="() => showConfession(confession._id)">
                <div class="card-image-container">
                    <img class="card-img" :src="confession.imageUrl" alt="">
                </div>
                <div class="timestamp">
                    {{ timeAgo(confession.createdAt) }}
                </div>
                <div class="card-title">
                    <!-- needs to have a character limit of 208 -->
                    <p>{{confession.subject}}</p>
                </div>
            </div>
            <!-- <div v-if="confession.creator._id != userId" class="card-button">
            <button class="btn" @click="() => messageUser(confession.creator._id)">Message User</button>
            </div> -->
        </div>
        <div class="card-panel">
            <div class="nickname">
                {{ confession.creator.nickname }}
            </div>
            <div class="reacts">
                <div class="reactbox" @click="() => {heartPost(confession._id)}">
                    <div class="love"><font-awesome-icon icon="heart"/></div>
                    <span>{{ confession.totalHearts }}</span>
                </div>
                <div class="reactbox" @click="() => {hatePost(confession._id)}">
                    <div class="hate"><font-awesome-icon icon="hand-middle-finger"/></div>
                    <span>{{ confession.totalHates }} </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import moment from 'moment';
import axios from 'axios';

export default {
    props: ['confession'],
    data() {
        return {

        }
    },
    methods: {
        timeAgo(date) {
            return moment(String(date)).startOf('hour').fromNow();
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
                this.$socket.emit('refresh');
            })
            .catch(err => {
                console.log(err);
            });
        },
        heartPost(id) {
            // use id to add to a posts hearts

            axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/heartPost`, {
                confData: {
                    token: localStorage.getItem("jwt"),
                    id: id
                }
            })
            .then(res => {
                
                const confession = this.confession;

                confession.totalHearts = res.data.hearts;
                confession.totalHates = res.data.hates;
                this.$socket.emit('refresh');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}
</script>

<style scoped>
    .card {
        -webkit-box-shadow: 5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        -moz-box-shadow:    5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        box-shadow:         5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        height: 17em;
        width: 10em;
        box-shadow: #cccccc;
        margin: 0 0 1em 1em;
        border: 1px solid purple;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-bottom: 1em;
    }

    .cardbody {
        display: flex;
        flex-direction: column;
        flex: 6;
        width: 100%;
        margin: 0;
        justify-content: flex-start;
    }

    .linkto {
        cursor: pointer;
        flex: 8;
        word-break: break-all;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .card-image-container {
        flex: 1;
    }

    .card-img {
        width: 100%;
        height: 100%;
        min-height: 9em;
        max-height: 9em;
    }

    .timestamp {
        flex: 1;
        text-align: center;
    }

    .card-title {
        text-align: center;
        flex-wrap: wrap;
        flex: 4;
        padding: 1em;
        font-size: 12px;
        word-break: break-word;
    }

    .card-panel {
        flex: 4;
        display: flex;
        flex-direction: row;
        font-size: 8px;
        width: 100%;
        justify-content: flex-start;
        align-items: center;
        padding-top: 1em;
        padding-bottom: 1em;
        max-height: 3em;
    }

    .card-button {
        flex: 1;
        display: flex;
        justify-content: center;
        flex-direction: column;
        padding-bottom: 1em;
        padding-top: 1em;
    }

    .card:hover {
        border: 3px solid green;
    }

    .nickname {
        flex: 1;
        text-align: center;
    }

    .reacts {
        flex: 1;
        display: inline-flex;
        align-items: flex-start;
        justify-content: center;
    }

    .reactbox {
        flex: 1;
        padding-top: 2em;
        padding-bottom: 2em;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .love {
        color: red;
    }

    .hate {
        color: brown;
    }

    .love,
    .hate {
        font-size: 12px;
        cursor: pointer;
    }

    .love:hover,
    .hate:hover {
        font-size: 14px;
        position: relative;
    }



</style>