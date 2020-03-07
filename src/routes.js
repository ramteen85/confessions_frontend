import Login from './components/Home/Login.vue';
import Register from './components/Register/Register.vue';
import Member from './components/Member/Member.vue';
import Inbox from './components/Inbox/Inbox.vue';
import GMap from './components/layout/GMaps.vue';
import NewConfession from './components/NewConfession/NewConfession.vue';
import ShowConfession from './components/ShowConfession/ShowConfession.vue';
import Latest from './components/Latest/Latest.vue';
import Popular from './components/Popular/Popular.vue';
import Hated from './components/Hated/Hated.vue';
import Conversations from './components/Conversations/Conversations.vue';

export const routes = [
  { path: '/', component: Login },
  { path: '/register', component: Register },
  { path: '/members/closest', component: Member },
  { path: '/members/latest', component: Latest },
  { path: '/members/popular', component: Popular },
  { path: '/members/hated', component: Hated },
  { path: '/confessions/new', component: NewConfession },
  { path: '/confessions/show/:id', component: ShowConfession },
  { path: '/inbox/conversations', component: Conversations },
  { path: '/inbox/:id', component: Inbox },
  { path: '/admin/gmap', component: GMap }
];