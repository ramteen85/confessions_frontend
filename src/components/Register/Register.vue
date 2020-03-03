<template>
    <div class="container">
        <h1 class="register-title">Welcome</h1>
        <form class="register">
            <input type="email" class="register-input" :class="{invalidbox: $v.userData.email.$error}" placeholder="Email address" @input="$v.userData.email.$touch()" v-model="userData.email">
            <span class="errortext" v-if="!$v.userData.email.email && $v.userData.email.$dirty">* Please enter a valid Email.</span>
            <span class="errortext" v-if="!$v.userData.email.required && $v.userData.email.$dirty">* Email cannot be blank</span>
            <input type="text" class="register-input" name="nickname" placeholder="Enter a nickname (optional)" v-model="userData.nickname">
            <div class="register-switch">

                <h3>Gender</h3>

                <input type="radio" name="gender" value="" id="other" v-model="userData.gender" class="register-switch-input">
                <label for="sex_f" class="register-switch-label">Other</label>

                <input type="text" name="othervalue" v-if="userData.gender!=='male' && userData.gender!=='female'" placeholder="Enter your gender..." class="register-input" :class="{invalidbox: $v.userData.gender.$error}" @input="$v.userData.gender.$touch()" v-model="userData.gender">
                <span class="errortext" v-if="!$v.userData.gender.required && $v.userData.gender.$dirty">* Please enter your gender</span>

                <br><br>

                <input type="radio" name="gender" value="female" id="female" v-model="userData.gender" class="register-switch-input">
                <label for="sex_f" class="register-switch-label">Female</label>

                <input type="radio" name="gender" value="male" id="male" v-model="userData.gender" class="register-switch-input" checked>
                <label for="sex_m" class="register-switch-label">Male</label>

                <br><br>

            </div>
            <h3>Date of Birth</h3>
            <input type="date" class="register-input" :class="{invalidbox: $v.userData.dob.$error}" @input="$v.userData.dob.$touch()" placeholder="Date of Birth" v-model="userData.dob">
            <span class="errortext" v-if="!$v.userData.dob.required && $v.userData.dob.$dirty">* Please enter your date of birth</span>
            <input type="password" class="register-input" placeholder="Password" :class="{invalidbox: $v.userData.password.$error}" @input="$v.userData.password.$touch()" v-model="userData.password">
            <span class="errortext" v-if="!$v.userData.password.required && $v.userData.password.$dirty">* Please enter your password</span>
            <input type="password" class="register-input" placeholder="Confirm Password" :class="{invalidbox: $v.userData.confirmPassword.$error}" @input="$v.userData.confirmPassword.$touch()" v-model="userData.confirmPassword">
            <span style="margin-bottom: 0em; display: block;" class="errortext" v-if="!$v.userData.confirmPassword.required && $v.userData.confirmPassword.$dirty">* Please confirm your password.</span>
            <span class="errortext" v-if="!$v.userData.confirmPassword.sameAs && $v.userData.confirmPassword.$dirty">* Your Passwords must match!</span>
            <button type="submit" class="register-button" @click.prevent="submitForm">Register</button>
            <span style="display: flex; justify-content: center; margin-top: 1.6em;" class="errortext" v-if="submitted == true">{{errorMsg}}</span>
        </form>
    </div>
</template>

<script>
import {eventBus} from '../../main';
import { required, email, sameAs } from 'vuelidate/lib/validators';
import axios from 'axios';
export default {
    name: 'Register',
    data() {
        return {
            submitted: false,
            errorMsg: '',
            userData: {
                email: '',
                nickname: '',
                gender: 'male',
                dob: '',
                password: '',
                confirmPassword: ''
            }
        }
    },
    validations: {
        userData: {
            email: {
                required,
                email
            },
            gender: {
                required
            },
            dob: {
                required
            },
            password: {
                required
            },
            confirmPassword: {
                required,
                sameAs: sameAs('password')
            }
        }
    },
    mounted() {
        if(localStorage.getItem("jwt")) {
            this.$router.push('/members/closest');
        }
    },
    methods: {
        submitForm: function() {

            this.submitted = true;

            let result = {
                email: this.userData.email,
                nickname: this.userData.nickname,
                password: this.userData.password,
                gender: this.userData.gender,
                dob: this.userData.dob
            }

            // validation
            if(this.$v.$invalid) {
                //do nothing
                console.log('Invalid form. Cannot Submit...');
            } else {
                //send signal

                axios.put(`${process.env.VUE_APP_URL}/auth/register`, {
                    result
                })
                .then(res => {

                    // set token and userID in local storage
                    localStorage.setItem('jwt', res.data.token);
                    localStorage.setItem('userId', res.data.userId);

                    // emit logged in event
                    eventBus.$emit('userloggedin');

                    // redirect to members page
                    this.$router.push('/members/closest');
                })
                .catch(err => {
                    console.log("error");
                    // print error message
                    this.errorMsg = err.response.data.data[0].msg;
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

    .register-title {
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

    .register {
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

    .register-input {
        display: block;
        width: 100%;
        height: 38px;
        margin-top: 2px;
        font-weight: 500;
        background: none;
        border: 0;
        border-bottom: 1px solid #d8d8d8;
    }

    .register-switch-label {
        margin-right: 1em;
    }

    .register-switch-input {
        margin-right: 1em;
    }

    .register-switch > h3 {
        margin-bottom: 1em;
        margin-top: 1em;
    }

    .register-button {
        padding: 1.3em;
        display: flex;
        margin: 2em auto 0 auto;
        background: rgb(174, 23, 216);
        color: white;
        font-weight: bold;
        font-size: 14px;
        letter-spacing: 0.8px;
    }

    .register-button:hover {
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
</style>