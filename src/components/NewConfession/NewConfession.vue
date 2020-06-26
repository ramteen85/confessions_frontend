<template>
    <div class="page">
        <div class="main">
            <div class="section heading">
                <h1>Create a confession</h1>
            </div>
            <form @submit.prevent="postConfession" enctype="multipart/form-data">
            <div class="section small fileSelector">
                    <small>Upload an image! this will be the image cover for your confession</small>
                    <!-- <input class="form-input" type="text" placeholder="image URL" v-model="imageUrl"> -->
                    <input class="fileInput" type="file" @change="onFileSelected" ref="fileInput" accept="image/*">
                    <div class="row">
                        <button type="button" class="filepickerBtn" @click="$refs.fileInput.click()">Select File</button>
                    </div>
            </div>
            <div class="section small">
                <img :src="imageUrl" style="width: 100%; height: 100%;" alt="">
            </div>
            <div class="section small">
                <small>Please enter any related subject categories, separated by a comma (i.e: singles, political, etc)</small>
                <input type="text" class="form-input categories" placeholder="Please add categories separated by a comma" v-model="categories">
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
                <button class="btn">Confess</button>
            </div>
            </form>
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
            imgRaw: null,
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
        async onUpload() {
            
            const formData = new FormData();
            formData.append('file', this.imgRaw);
            formData.append('token', this.token);
            console.log(formData);

            try {
                await axios({
                    method: "POST",
                    url: `${process.env.VUE_APP_URL_LOCAL}/images/upload`,
                    data: formData,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                        token: this.token
                    }
                });
                // await axios.post(`${process.env.VUE_APP_URL_LOCAL}/images/upload`, formData);
            }
            catch(err) {
                console.log(err);
            }
            // const fd = new FormData();
            // fd.append('image', this.selectedFile, this.selectedFile.name);
            // axios.post('image-upload-url', fd, {
            //     onUploadProgress: uploadEvent => {
            //         console.log('Upload Progress: ' + Math.round(uploadEvent.loaded / uploadEvent.total * 100) + '%');
            //     }
            // })
            // .then(res => {
            //     console.log(res);
            // })
            // .catch(err => {
            //     console.log(err);
            // });
            
        },
        onFileSelected(event) {
            event.preventDefault();
            //   const url =  `cloudinary://${process.env.VUE_APP_CLOUDINARY_API_KEY}:${process.env.VUE_APP_CLOUDINARY_API_SECRET}@${process.env.VUE_APP_CLOUDINARY_CLOUD_NAME}`;
            const files = this.$refs.fileInput.files[0];
            let filename = files.name;
            console.log(files);
            if(filename.lastIndexOf('.') <= 0) {
                return alert('Please add a valid file!');
            }
            const fileReader = new FileReader();
            fileReader.addEventListener('load', () => {
                this.imageUrl = fileReader.result;
            });
            this.imgRaw = files;
            fileReader.readAsDataURL(this.imgRaw);
        },
        async postConfession() {

            // form validation
            if(this.$v.$invalid) {
                //do nothing
                console.log('Invalid form. Cannot Submit...');
            } else {

                try {
                    // new formData system  
                    const formData = new FormData();
                    formData.append('file', this.imgRaw);
                    formData.append('token', this.token);
                    formData.append('categories', this.categories);
                    formData.append('subject', this.subject);
                    formData.append('post', this.post);


                    // post data to server
                    console.log('posting data to server');
                    await axios({
                        method: "POST",
                        url: `${process.env.VUE_APP_URL_LOCAL}/confessions/new`,
                        data: formData,
                        headers: {
                            'Content-Type': `multipart/form-data;`
                        }
                    });
                    this.$socket.emit('newconfession', {});
                    this.$router.push('/members/closest');
                }
                catch(err) {
                    console.log(err);
                }
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
        -webkit-box-shadow: 5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        -moz-box-shadow:    5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        box-shadow:         5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        margin-top: 5em;
        margin-bottom: 5em;
        padding: 3em;
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 40%;
        max-width: 40%;
        height: auto;
        border: 1px solid black;
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
        width: 100%;
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

    .form-input {
        width: 100%;
    }

    .fileInput {
        display: none;
    }

    .fileSelector {
        display: flex;
        flex-direction: column;
    }


    form > .fileSelector {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    form > .fileSelector > .row {
        display: flex;
        flex-direction: row;
    }

    form > .fileSelector > small {
        margin-bottom: 1em;
    }

    form > .fileSelector > .row > button {
        padding: 1em;
        cursor: pointer;
        border: 2px solid #822c87;
        background-color: #822c87;
        color: white;
        outline: none;
    }
    form > .fileSelector > .row > button:hover {
        background-color: white;
        color: #822c87;
    }
    form > .fileSelector > .row > .filepickerBtn {
        margin-right: 1em;
    }
</style>