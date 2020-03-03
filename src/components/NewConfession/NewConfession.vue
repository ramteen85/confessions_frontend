<template>
    <div class="page">
        <div class="main">
            <div class="section heading">
                <h1>Create a confession</h1>
            </div>
            <div class="section small">
                <small>Upload an image! this will be the image cover for your confession</small>
                <input type="text" placeholder="image URL" v-model="imageUrl">
            </div>
            <div class="section small">
                <small>Please enter any related subject categories, separated by a comma (i.e: singles, political, etc)</small>
                <input type="text" class="categories" placeholder="Please add categories separated by a comma" v-model="categories">
            </div>
            <div class="section small">
                <small>Enter a subject for your confessions</small>
                <small>This will show up on the front page to intrigue your viewers - keep it short!</small>
                <textarea @input="$v.subject.$touch()" class="subject resize-none" cols="30" rows="3" placeholder="Enter Subject" v-model="subject"></textarea>
            </div>
            <div class="section large">
                <small>Enter a subject for your confessions</small>
                <textarea @input="$v.post.$touch()" class="post resize-none" cols="90" rows="10" placeholder="Confess your sins..." v-model="post"></textarea>
            </div>
            <div class="section small">
                <button @click="postConfession" class="btn">Confess</button>
            </div>
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
            token: ''
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
        postConfession() {

            // form validation
            if(this.$v.$invalid) {
                //do nothing
                console.log('Invalid form. Cannot Submit...');
            } else {

                // post data to server
                axios.post(`${process.env.VUE_APP_URL}/confessions/new`, {
                    confData: {
                        imageUrl: this.imageUrl,
                        categories: this.categories,
                        subject: this.subject,
                        post: this.post,
                        token: this.token,
                    }
                })
                .then(res => {
                    console.log(res);
                    this.$socket.emit('newconfession', {});
                    this.$router.push('/members/closest');
                })
                .catch(err => {
                    console.log(err);
                });
            }
        }
    },
    mounted() {

        // get token
        this.token = localStorage.getItem("jwt");

        // check for token
        if(!this.token) {
            this.$router.push('/');
        }
    }
}
</script>

<style scoped>

    .resize-none {
        resize: none;
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
        border: 2px solid red;
        margin-top: 5em;
        margin-bottom: 5em;
        padding: 3em;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 60%;
        max-width: 60%;
        height: auto;
    }

    .section {
        border: 2px solid blue;
        display: flex;
        flex-direction: column;
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
    }

    .section > small {
        margin-bottom: 1em;
    }

    .section > input {
        max-width: 40em;
        padding: .5em 3em .5em 3em;
        font-size: 14px;
    }

   input.categories {
        flex: 1;
        display: flex;
        font-size: 14px;
    }

    .section > textarea {
        padding: .3em .5em .3em .5em;
        font-size: 14px;
    }

    .section > .post {
        margin-top: 2em;
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

</style>