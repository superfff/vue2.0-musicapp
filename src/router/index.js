import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

import recommend from 'components/recommend/recommend';
import singer from 'components/singer/singer';
import rank from 'components/rank/rank';
import search from 'components/search/search';
import singerDetail from 'components/singer-detail/singer-detail';

export default new Router({
  routes: [
    {
    	path: '/',
    	redirect: '/recommend'
    },
    {
		path: '/recommend',
		component: recommend,
    },
    {
		path: '/singer',
		component: singer,
        children: [
            {
                path: ':id',
                component: singerDetail
            }
        ]
    },
    {
		path: '/rank',
		component: rank,
    },
    {
		path: '/search',
		component: search,
    },
  ]
})
