<template>
 <div class="page">
        <div class="sidebar">
            <div class="block">
                <button @click="newConfession" class="btn">Make a Confession</button>
            </div>
        </div>
        <div class="main">
            <h2>Hated Confessions</h2>
            <div class="deck">
                <div v-for="confession in confessions" :key="confession._id" class="card">
                    <div class="cardbody">
                        <div class="linkto" @click="() => showConfession(confession._id)">
                            <div class="card-image-container">
                                <img class="card-img" src="https://www.bigstockphoto.com/blog/wp-content/uploads/2014/01/66006-bigstock-confession-concept-42406879.jpg" alt="">
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
                        <div class="timestamp">
                            {{ timeAgo(confession.createdAt) }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="pagination">
                <div class="left" >
                    <div class="arrow" @click="prevPage">
                        &lt;&lt;&lt;&lt;
                    </div>
                </div>
                <div class="right">
                    <div class="arrow" @click="nextPage">
                        &gt;&gt;&gt;&gt;
                    </div>
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
            confessions: [],
            unloadable: false,
            lat: '',
            lng: '',
            country: '',
            countryCode: '',
            postcode: '',
            state: '',
            suburb: '',
            trueLoc: false,
            loadConfessions: false,
            distance: 50,
            token: '',
            userId: '',
            page: 1
        }
    },
    methods: {
        nextPage() {
            if(this.confessions.length < 8) {
                // do nothing
            } else {
                this.page += 1;
            }
            this.getConfessions();
        },
        prevPage(){
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
        heartPost(id) {
            // use id to add to a posts hearts

            axios.post(`${process.env.VUE_APP_URL}/confessions/heartPost`, {
                confData: {
                    token: localStorage.getItem("jwt"),
                    id: id
                }
            })
            .then(() => {
                this.getConfessions();
                this.$socket.emit('refresh');
            })
            .catch(err => {
                console.log(err);
            });
        },
        hatePost(id) {
            // use id to add to a posts hates

            axios.post(`${process.env.VUE_APP_URL}/confessions/hatePost`, {
                confData: {
                    token: localStorage.getItem("jwt"),
                    id: id
                }
            })
            .then(() => {
                this.getConfessions();
                this.$socket.emit('refresh');
            })
            .catch(err => {
                console.log(err);
            });
        },
        newConfession() {
            if(localStorage.getItem("jwt")) {
                this.$router.push('/confessions/new');
            } else {
                this.$router.push('/');
            }
        },
        timeAgo(date) {
            return moment(String(date)).startOf('second').fromNow();
        },
        getConfessions() {
            axios.post(`${process.env.VUE_APP_URL}/confessions/hated`, {
                confData: {
                    token: this.token,
                    page: this.page,
                    distance: this.distance
                }
            })
            .then(res => {
                this.confessions = res.data.confessions;
            })
            .catch(err => {
                console.log(err);
            });
        },
        saveTrueLoc() {
            // send lat and lng to server with token
            axios.post(`${process.env.VUE_APP_URL}/auth/saveTrueUserLoc`, {
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
                // Print Confessions
                this.getConfessions();
            })
            .catch((err) => {
                // true loc didnt work
                console.log(err);
            });
        },
        saveRoughLoc() {
            // get rough location if true location isnt already known

            // get ip address

            axios.get(`${process.env.VUE_APP_GEOSITE}`)
            .then(res => {
                // got users ip address
                return res;
            })
            .then(res => {
                // send user ip to server
                axios.post(`${process.env.VUE_APP_URL}/auth/saveRoughUserLoc`,{
                    data: {
                        token: localStorage.getItem("jwt"),
                        ip: res.data.ip
                    }
                })
                .then((result) => {
                    // return rough data
                    this.country = result.data.user.country;
                    this.countryCode = result.data.user.countryCode;
                    this.suburb = result.data.user.suburb;
                    this.state = result.data.user.state;
                    this.lat = result.data.user.lat;
                    this.lng = result.data.user.lng;
                    this.trueLoc = result.data.user.trueLoc;
                    return;
                })
                .then(() => {
                    // Load confessions now
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
                console.log(err);
            });

        }
    },
    mounted() {

        // token
        this.token = localStorage.getItem("jwt");

        // check for token
        if(!this.token) {
            this.$router.push('/');
        }

        // socket listeners
        this.$socket.on('refresh', () => {
            this.getConfessions();
        });

        // get user id
        this.userId = localStorage.getItem("userId");

        // check for location
        axios.post(`${process.env.VUE_APP_URL}/auth/getUserLoc`, {
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

                // get latest confessions
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
        flex: 2;
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

    .distance {
        width: 3em;
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
        flex: 5;
        width: 100%;
        height: auto;
        margin: 2em auto;
        display: flex;
        max-width: 50em;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 2em;
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
        height: 20em;
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

    .card-title {
        text-align: center;
        flex-wrap: wrap;
        flex: 4;
        padding: 1em;
        font-size: 12px;
    }

    .card-image-container {
        flex: 1;
    }

    .card-img {
        width: 100%;
    }

    .card-img > img {
        width: 100%;
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
        margin-bottom: 2em;
    }

    .left,
    .right {
        flex: 1;
        margin-top: 4em;
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
        padding: 1em;
        border: 1px solid red;
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