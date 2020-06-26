<template>
    <div class="page">
        <div class="sidebar">
            <div class="block">
                <button @click="newConfession" class="btn">Make a Confession</button>
            </div>
            <div class="block">
                <h2>Find Confessions: </h2>
                <p>Within:</p>
                <input type="number" name="distance" class="distance" v-model="distance"> <br>
                <span class="distance-text">Kms</span> <br>
                <button class="btn" @click="saveDistance">Search</button>
            </div>
        </div>
        <div class="main">
            <h2>Confessions Near You...</h2>
             <div v-if="loading==false" class="pagination">
                <div v-if="this.page !== 1" class="left" >
                    <div class="arrow" @click="prevPage">
                        &lt;-- Prev
                    </div>
                </div>
                <div v-if="this.page === 1" class="left" >
                    <div class="">
                        
                    </div>
                </div>
                <div v-if="confessions.length<6" class="right" >
                    <div class="">
                        
                    </div>
                </div>
                <div v-if="confessions.length>=6" class="right">
                    <div class="arrow" @click="nextPage">
                        Next --&gt;
                    </div>
                </div>
            </div>
            <div v-if="loading==true" class="loadingScreen">
                <img :src="loadingPath" alt="">
            </div>
            <div v-if="loading==false" class="deck">

                <card v-for="confession in confessions" :key="confession._id" :confession="confession"/>
                
                <div v-if="confessions.length === 0" class="wide-card">
                    <h2>No Nearby Confessions...</h2>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            confessions: [],
            lat: '',
            lng: '',
            country: '',
            countryCode: '',
            postcode: '',
            state: '',
            suburb: '',
            trueLoc: false,
            loadConfessions: false,
            loading: true,
            distance: 50,
            token: '',
            userId: '',
            page: 1
        }
    },
    methods: {
        nextPage() {
            this.loading = true;
            if(this.confessions.length < 8) {
                // do nothing
            } else if(this.confessions.length === 0) {
                this.prevPage();
            }
            else {
                this.page += 1;
            }
            this.getConfessions();
        },
        prevPage(){
            this.loading = true;
            if(this.page == 1) {
                this.page = 1;
            } else {
                this.page -= 1;
            }
            this.getConfessions();
        },
        messageUser(id) {
            this.$router.push('/inbox/' + id);
        },
        showConfession(id){
            this.$router.push('/confessions/show/' + id);
        },
        newConfession() {
            if(localStorage.getItem("jwt")) {
                this.$router.push('/confessions/new');
            } else {
                this.$router.push('/');
            }
        },
        getConfessions() {
            axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/closest`, {
                confData: {
                    token: this.token,
                    page: this.page
                }
            })
            .then(res => {
                console.log('confessions: ', res);
                this.confessions = res.data.confessions;
                this.distance = res.data.distance;
                this.confessions.forEach(conf => {
                    if(conf.subject.length > 95) {
                        conf.subject = conf.subject.substr(0, 92) + '...';
                    }
                });
                this.loading = false;
            })
            .catch(err => {
                console.log(err);
            });
        },
        saveDistance() {
            this.loading = true;
            this.page = 1;
            axios.post(`${process.env.VUE_APP_URL_LOCAL}/confessions/closest/sd`, {
                token: this.token,
                distance: this.distance
            })
            .then(res => {
                console.log(res);
                this.getConfessions();
            })
            .catch(err => {
                console.log(err);
            });
        },
        saveTrueLoc() {
            // send lat and lng to server with token
            axios.post(`${process.env.VUE_APP_URL_LOCAL}/auth/saveTrueUserLoc`, {
                data: {
                    token: localStorage.getItem("jwt"),
                    lat: this.lat,
                    lng: this.lng
                }
            })
            .then(res => {
                this.country = res.data.user.country;
                this.countryCode = res.data.user.countryCode;
                this.suburb = res.data.user.suburb;
                this.state = res.data.user.state;
                this.postcode = res.data.user.postcode;
                this.trueLoc = res.data.user.trueLoc;

                return;
            })
            .then(() => {
                // Print confessions
                this.getConfessions();
            })
            .catch((err) => {
                // true loc didnt work
                console.log(err);
            });
        },
        saveRoughLoc() {
            // get rough location if true location isnt already known
            console.log('saving rough loc...');
            console.log(process.env.VUE_APP_GEOSITE);
            // get ip address

            axios.get(process.env.VUE_APP_GEOSITE)
            .then(res => {
                // got users ip address
                console.log('got rough ip!');
                console.log(res);
                return res;
            })
            .then(res => {
                console.log('ip: ', res.data);
                // send user ip to server
                axios.post(`${process.env.VUE_APP_URL_LOCAL}/auth/saveRoughUserLoc`,{
                    data: {
                        token: localStorage.getItem("jwt"),
                        ip: res.data
                    }
                })
                .then((res) => {
                    console.log(res);
                    this.lat = res.data.user.location[1];
                    this.lng = res.data.user.location[0];
                    this.state = res.data.user.state;
                    this.suburb = res.data.user.suburb;
                    this.country = res.data.user.country;
                    console.log('loading confessions...');
                    // load confessions

                    return;
                })
                .then(() => {
                    this.getConfessions();
                })
                .catch(err => {
                    // couldnt get location at all. page cannot load until user permits
                    console.log(err);
                    this.unloadable = true;
                });
            })
            .catch(err => {
                // let user know that page cannot load until they allow geolocation
                console.log('geolocation failed');
                console.log(err);
            });

        }
    },
    computed : {
        loadingPath(){
            return "img/loading.gif";
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


        // socket listeners
        this.$socket.on('refresh', () => {
            this.getConfessions();
        });

        this.loading = true;

        // check for location
        axios.post(`${process.env.VUE_APP_URL_LOCAL}/auth/getUserLoc`, {
            data: {
                token: localStorage.getItem("jwt")
            }
        })
        .then(res => {
            // received data
            // save data to state
            // console.log(res.data.locInfo);
            this.lat = res.data.locInfo.lat;
            this.lng = res.data.locInfo.lng;
            this.country = res.data.locInfo.country;
            this.countryCode = res.data.locInfo.countryCode;
            this.state = res.data.locInfo.state;
            this.suburb = res.data.locInfo.suburb;
            this.trueLoc = res.data.locInfo.trueLoc;
            this.postcode = res.data.locInfo.postcode;


            // check data received
            if(this.lat !== '' && this.lng !== '' && this.country !== '' && this.state != '' && this.trueLoc === true) {
                // location exists, data received - true location (can only be updated if user says so)

                // print confessions now
                this.getConfessions();
            }
            else {
                // no location, get location
                // // options to get geolocation for user
                const options = {
                    enableHighAccuracy:false, //defaults to false
                    timeout: Infinity, //defaults to Infinity
                    maximumAge: 0 //defaults to 0
                };

                this.$getLocation(options)
                .then(coordinates => {
                    // got coordinates. save in state
                    this.lat = coordinates.lat;
                    this.lng = coordinates.lng;

                    // continue
                    return;
                })
                .then(() => {
                    // save true location and receive state info / confessions
                    this.saveTrueLoc();
                })
                .catch(err => {
                    // user declined so we have to get location from their ip address
                    console.warn(err);
                    // save rough location and receive state info / confessions
                    this.saveRoughLoc();
                });
            }
        })
        .catch(err => {
            // backend failed
            console.log('');
            console.log(err);
        });
    }
}
</script>

<style scoped>
    .page {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 100%;
        flex-wrap: wrap;
    }
    .sidebar {
        flex: 1;
        height: auto;
        background-color: #a4a1a1;
        display: flex;
        flex-direction: column;
    }
    .main {
        flex: 8;
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .main h2 {
        flex: 1;
        margin-top: 2em;
        max-height: 2em;
        margin-bottom: .5em;
    }

    .block {
        text-align: center;
        color: white;
        font-size: 14px;
        padding: 1em;
    }

    .block input {
        text-align: center;
    }

    .distance-text {
        display: block;
        margin-top: 1em;
    }

    .distance {
        width: 100%;
        margin-right: .5em;
        padding: .4em;
    }

    .block h2 {
        color: white;
        font-size: 18px;
        margin-bottom: 1em;
    }

    .block p {
        margin-bottom: .5em;
    }
    .main h2 {
        text-align: center;
        margin-bottom: 0;
    }

    .deck {
        flex: 7;
        width: 100%;
        max-height: 20em;
        height: auto;
        margin: 0 auto;
        display: flex;
        max-width: 50em;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 0;
    }

    .loadingScreen {
        flex: 8;
        width: 100%;
        height: auto;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
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

    .wide-card {
        -webkit-box-shadow: 5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        -moz-box-shadow:    5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        box-shadow:         5px 7px 6px 0px rgba(50, 50, 50, 0.65);
        height: 10em;
        width: 50em;
        box-shadow: #cccccc;
        margin: 0 0 10em 1em;
        border: 1px solid purple;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding-bottom: 1em;
    }

    .card-title {
        text-align: center;
        flex-wrap: wrap;
        flex: 4;
        padding: 1em;
        font-size: 12px;
        word-break: break-word;
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

    .timestamp {
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

    .btn {
        padding: 10px;
        cursor: pointer;
        color: white;
        background-color: #3a38a9;
    }
    .mar-btn {
        margin-top: 1em;
        margin-left: 1em;
    }

    .btn:hover {
        background-color: #429d58;
    }

    .pagination {
        flex: 1;
        display: inline-flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        max-height: 3em;
    }

    .left,
    .right {
        flex: 1;
        margin-top: 0;
    }

    .left {
        text-align: left;
        margin-left: 10em;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .right {
        text-align: right;
        margin-right: 10em;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }

    .arrow {
        max-width: 5em;
        padding: .4em;
        border: none;
        cursor: pointer;
    }

    .arrow:hover {
        background-color: #429d58;
        color: white;
    }


@media (max-width: 640px) {
  .sidebar {
    min-height: unset;
    padding-bottom: 1em;
    padding-top: 1em;
  }
}

</style>