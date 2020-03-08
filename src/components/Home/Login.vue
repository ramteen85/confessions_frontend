<template>
    <div class="container">
        <h1 class="login-title">Sign Into Your Account</h1>
        <h2 v-if="tokenExpired === true" class="expiredTokenMessage">Token Expired. Please Log in again</h2>
        <form class="login">
            <span style="display: flex; justify-content: center; margin-top: 1.6em;" class="errortext">{{errorMsg}}</span>
            <input type="email" class="login-input" placeholder="Email address" :class="{invalidbox: $v.userData.email.$error}" @blur="$v.userData.email.$touch()" v-model="userData.email">
            <span class="errortext" v-if="!$v.userData.email.required && $v.userData.email.$dirty">* Email cannot be blank</span>
            <span class="errortext" v-if="!$v.userData.email.email && $v.userData.email.$dirty">* Please enter a valid email</span>
            <input type="password" class="login-input" placeholder="Password" :class="{invalidbox: $v.userData.password.$error}" @blur="$v.userData.password.$touch()" v-model="userData.password">
            <span class="errortext" v-if="!$v.userData.password.required && $v.userData.password.$dirty">* Please enter your password</span>
            <button type="submit" class="login-button" @click="submitForm">Login</button>
        </form>
    </div>
</template>

<script>
import { eventBus } from '../../main';
import { required, email } from 'vuelidate/lib/validators';
import axios from 'axios';
export default {
    name: 'Login',
    data() {
        return {
            errorMsg: '',
            userData: {
                email: '',
                password: ''
            },
            tokenExpired: false
        }
    },
    validations: {
        userData: {
            email: {
                required,
                email
            },
            password: {
                required
            }
        }
    },
    mounted() {
        if(localStorage.getItem("jwt")) {
            this.$router.push('/members/closest');
        }

        console.log(this.$route.params.tokenExpired);

        if(this.$route.params.tokenExpired === "expired") {
            this.tokenExpired = true;
        }

        console.log(process.env.VUE_APP_URL);
    },
    methods: {
        submitForm: function(err) {
            err.preventDefault();

            let result = {
                email: this.userData.email,
                password: this.userData.password
            };

            // validation - needs to be done
            if(this.$v.$invalid) {
                // form cannot submit
                // this.$v.userData.email.$error = true;
                // this.$v.userData.password.$error = true;
                console.log('Invalid form. Cannot Submit...');

                //display error message
                this.errorMsg = "Invalid Form: Please Fill in all fields...";
            } else {
                // submit form

                axios.post(`${process.env.VUE_APP_URL}/auth/login`, {
                    result
                })
                .then(res => {
                    // set token and userID in local storage
                    localStorage.setItem('jwt', res.data.token);
                    localStorage.setItem('userId', res.data.userId);

                    console.log(res);

                    // emit logged in event
                    eventBus.$emit('userloggedin');

                    // redirect to members page
                    this.$router.push('/members/closest');
                })
                .catch(err => {
                    // //display error message and colour boxes red!
                    // this.$v.userData.email.$error = true;
                    // this.$v.userData.password.$error = true;
                    this.errorMsg = err.response.data.message;
                });
            }
        }
    }
}
</script>

<style scoped>
    .container {
        width: 100%;
        height: 100%;
        margin-bottom: 3em;
    }

    .login-title {
        width: 270px;
        line-height: 43px;
        margin: 20px auto 20px;
        font-size: 19px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.95);
        text-align: center;
        text-shadow: 0 1px rgba(0, 0, 0, 0.3);
        background: rgb(174, 23, 216);
        border-radius: 3px;
        background-image: -webkit-linear-gradient(top, rgb(174, 23, 216), rgb(174, 23, 216));
        background-image: -moz-linear-gradient(top, rgb(174, 23, 216), rgb(174, 23, 216));
        background-image: -o-linear-gradient(top, rgb(174, 23, 216), rgb(174, 23, 216));
        background-image: linear-gradient(to bottom, rgb(174, 23, 216), rgb(174, 23, 216));
        -webkit-box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3);
        box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 1px 1px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .login {
        margin: 0 auto;
        width: 230px;
        padding: 20px;
        background: #f4f4f4;
        border-radius: 3px;
        -webkit-box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    input {
        padding: 0 1em 0 1em;
        max-width: 80%;
        margin-bottom: 0;
    }

    .disabled {
        /* background: grey; */
        display: none;
    }

    .login-input {
        display: block;
        width: 100%;
        height: 38px;
        margin-top: 2px;
        font-weight: 500;
        background: none;
        border: 0;
        border-bottom: 1px solid #d8d8d8;
    }

    .login-switch-label {
        margin-right: 1em;
    }

    .login-switch-input {
        margin-right: 1em;
    }

    .login-button {
        padding: 1.3em;
        display: flex;
        margin: 2em auto 0 auto;
        background: rgb(174, 23, 216);
        color: white;
        font-weight: bold;
        font-size: 14px;
        letter-spacing: 0.8px;
    }

    .login-button:hover {
        cursor: pointer;
    }

    .errortext {
        color: red;
        display: inline-block;
        margin-top: 5px;
        margin-bottom: 10px;
        font-size: 10px;
    }

    .invalidbox {
        border: 2px solid red;
        background: pink;
        color: white;
    }

    .container > .expiredTokenMessage {
        display: block;
        text-align: center;
        width: 50%;
        padding: 1em;
        border: 2px solid rgb(174, 23, 216);
        color: rgb(174, 23, 216);
        margin: 1em auto;
    }
</style>