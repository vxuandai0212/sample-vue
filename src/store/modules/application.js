const state = {
  applicationByIds: {
    'id1': {
      name: 'app name 1'
    },
    'id2': {
      name: 'app name 2'
    },
    'id3': {
      name: 'app name 3'
    },
    'id4': {
      name: 'app name 4'
    },
    'id5': {
      name: 'app name 5'
    },
    'id6': {
      name: 'app name 6'
    },
    'id7': {
      name: 'app name 7'
    },
    'id8': {
      name: 'app name 8'
    },
    'id9': {
      name: 'app name 9'
    }
  },
  displayApplicationIds: [],
  filter: {
    limit: 1,
    page: 1,
    search: ''
  },
  defaultFilter: {
    limit: 1,
    page: 1,
    search: ''
  },
  loading: {
    all: false,
    table: false
  }
}

const mutations = {
  SET_DISPLAY_APPLICATION_IDS: (state, ids) => {
    state.displayApplicationIds = ids
  },
  SET_DISPLAY_PAGE: (state, page) => {
    state.filter.page = page
  },
  SET_DISPLAY_LIMIT: (state, limit) => {
    state.filter.limit = limit
  },
  SET_SEARCH_KEYWORD: (state, keyword) => {
    state.filter.search = keyword
  },
  RESET_FILTER: (state) => {
    state.filter.limit = state.defaultFilter.limit
    state.filter.page = state.defaultFilter.page
    state.filter.search = state.defaultFilter.search
  },
  START_LOADING_TABLE: (state) => {
    state.loading.table = true
  },
  START_LOADING_ALL: (state) => {
    state.loading.all = true
  },
  END_LOADING_TABLE: (state) => {
    state.loading.table = false
  },
  END_LOADING_ALL: (state) => {
    state.loading.all = false
  }
}

const actions = {
  changePagination({ commit, dispatch }, { page, limit }) {
    commit('START_LOADING_TABLE')
    setTimeout(() => {
      commit('SET_DISPLAY_PAGE', page)
      commit('SET_DISPLAY_LIMIT', limit)
      dispatch('getDisplayApplicationIds')
      commit('END_LOADING_TABLE')
    }, 500)
  },
  searchApplication({ state, commit, dispatch }, keyword) {
    commit('START_LOADING_ALL')
    setTimeout(() => {
      commit('SET_SEARCH_KEYWORD', keyword)
      dispatch('getDisplayApplicationIds')
      commit('END_LOADING_ALL')
    }, 500)
  },
  resetFilter({ commit, dispatch }) {
    commit('START_LOADING_ALL')
    setTimeout(() => {
      commit('RESET_FILTER')
      dispatch('getDisplayApplicationIds')
      commit('END_LOADING_ALL')
    }, 500)
  },
  getDisplayApplicationIds({ state, commit }) {
    const displayIds = getDisplayIds(state)
    commit('SET_DISPLAY_APPLICATION_IDS', displayIds)
  }
}

const getters = {
  applicationByIds: (state) => () => {
    return state.applicationByIds || {}
  },
  displayApplicationIds: (state) => () => {
    return state.displayApplicationIds || []
  },
  filterLimit: (state) => () => {
    return state.filter.limit || state.defaultFilter.limit
  },
  filterPage: (state) => () => {
    return state.filter.page || state.defaultFilter.page
  },
  filterSearch: (state) => () => {
    return state.filter.search || state.defaultFilter.search
  },
  isLoadingTable: (state) => () => {
    return state.loading.table || false
  },
  isLoadingAll: (state) => () => {
    return state.loading.all || false
  }
}

const getDisplayIds = ({ filter, applicationByIds }) => {
  const { limit, page, search } = filter
  const allApps = Object.assign({}, applicationByIds)
  let filterApplications
  if (search && search.trim() !== '') {
    filterApplications = allApps.filter(application => {
      console.log(limit, page)
    })
  }
  return filterApplications
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
