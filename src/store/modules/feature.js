import { METHOD, URL_CAMPAIGN, URL_LOG } from '@/api/config'
import { CAMPAIGN_TYPE, CAMPAIGN_LOG_TYPE } from '@/utils/constants/campaign'
import { MESSAGE_STATUS } from '@/utils/constants/message'
import { sendRequest } from '@/api/commons'
import { reduce } from 'lodash'
import Vue from 'vue'

const state = {
  // orginialObject
  // displayList
  // defaultFilter1
  // defaultFilter2
  // defaultPage
  // defaultLimit
  // filter1
  // filter2
  // page
  // limit
  // loadingAll
  // loadingComp
}

const mutations = {
  SET_CAMPAIGN_TYPE: (state, type) => {
    state.campaignType = type
  },
  SET_CAMPAIGN_ID: (state, id) => {
    state.campaignId = id
  },
  SET_LOG_BY_CAMPAIGN_IDS: (state, data) => {
    state.campaignLogByCampaignIds = data
  },
  SET_SENDING_STATS_BY_CAMPAIGN_IDS: (state, data) => {
    state.campaignSendingStatusByIds = data
  },
  SET_CAMPAIGN_REPORT: (state, reportMessage) => {
    state.reportMessage = reportMessage
  },
  SET_CAMPAIGN_REPORT_LOADING: (state) => {
    state.loadingReportMessage = true
  },
  SET_CAMPAIGN_REPORT_LOADED: (state) => {
    state.loadingReportMessage = false
  },
  SET_CAMPAIGN_REPORT_MESSAGE_CURRENT_PAGE: (state, page) => {
    state.reportMessageCurrentPage = page
  },
  SET_CAMPAIGN_REPORT_MESSAGE_PAGE_SIZE: (state, size) => {
    state.reportMessagePageSize = size
  },
  SET_CAMPAIGN_REPORT_MESSAGE_STATUS_FILTER: (state, status) => {
    state.reportMessageStatusFilter = status
  },
  SET_CAMPAIGN_TRACK_IDS: (state, ids) => {
    state.campaignTrackByIds = ids
    Vue.ls.set('campaign/campaignTrackByIds', ids, 60 * 60 * 1000)
  }
}

const actions = {
  setCampaignTypeMail({ dispatch }) {
    dispatch('setCampaignType', CAMPAIGN_TYPE.EMAIL)
  },
  setCampaignTypeSms({ dispatch }) {
    dispatch('setCampaignType', CAMPAIGN_TYPE.SMS)
  },
  setCampaignType({ commit }, type) {
    commit('SET_CAMPAIGN_TYPE', type)
  },
  setCampaignId({ commit }, id) {
    commit('SET_CAMPAIGN_ID', id)
  },
  changeCampaignToDraftState({ commit, dispatch }, campaign) {
    const campaignId = campaign.campaignId
    commit('app/CHANGE_CAMPAIGN_STATUS_TO_DRAFT', campaignId, { root: true })
    dispatch('cancelCampaignSchedule', campaignId)
  },
  cancelCampaignSchedule({ commit }, campaignId) {
    return new Promise((resolve, reject) => {
      sendRequest(METHOD.POST, URL_CAMPAIGN.CANCEL_SCHEDULE, { campaignId }).then(response => {
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  getAllCampaignTrackOverviewInApplication({ commit, state, rootState }) {
    const applicationId = rootState.app.applicationId
    if (applicationId) {
      return new Promise((resolve, reject) => {
        sendRequest(METHOD.POST, URL_CAMPAIGN.GET_ALL_CP_TRACK_OVERVIEW, { applicationId }).then(response => {
          const tracks = response.data
          if (tracks) {
            commit('SET_CAMPAIGN_TRACK_IDS', tracks)
          }
        })
      })
    }
  },
  getAllCampaignLogInApplication({ commit, state, rootState }) {
    const applicationId = rootState.app.applicationId
    if (applicationId) {
      return new Promise((resolve, reject) => {
        sendRequest(METHOD.POST, URL_LOG.CAMPAIGN.GET_ALL, { applicationId }).then(response => {
          const logs = response.data
          if (logs) {
            const campaignLogByCampaignIds = getCampaignLogByCampaignIds(logs)
            commit('SET_LOG_BY_CAMPAIGN_IDS', campaignLogByCampaignIds)
          }
        })
      })
    }
  },
  getCampaignSendingStats({ commit }) {
    sendRequest(METHOD.POST, URL_CAMPAIGN.GET_SENDING_STATS, {}).then(response => {
      const stats = response.data
      if (stats) {
        const campaignSendingStatusByIds = getCampaignSendingStatusByIds(stats)
        commit('SET_SENDING_STATS_BY_CAMPAIGN_IDS', campaignSendingStatusByIds)
      }
    })
  },
  getCampaignReportMessage({ state, commit }) {
    const campaignId = state.campaignId
    const campaignType = state.campaignType
    if (campaignId && campaignType) {
      commit('SET_CAMPAIGN_REPORT_LOADING')
      sendRequest(METHOD.POST, URL_CAMPAIGN.GET_REPORT_MESSAGE, { campaignId, campaignType }).then(response => {
        const msgs = response.data
        if (msgs) {
          let totalSuccess = 0
          let totalFail = 0
          let totalSending = 0
          msgs.map(m => {
            if (m.status === MESSAGE_STATUS.SUCCESS) {
              totalSuccess += 1
            } else if (m.status === MESSAGE_STATUS.FAIL) {
              totalFail += 1
            } else if (m.status === MESSAGE_STATUS.SENDING) {
              totalSending += 1
            }
          })
          const report = {}
          report.listMessage = msgs
          report.total = msgs.length
          report.totalSuccess = totalSuccess
          report.totalFail = totalFail
          report.totalSending = totalSending
          report.successRate = ((totalSuccess / msgs.length) * 100).toFixed(2)
          commit('SET_CAMPAIGN_REPORT', report)
        }
      })
      setTimeout(() => {
        commit('SET_CAMPAIGN_REPORT_LOADED')
      }, 500)
    }
  },
  setCampaignReportMessageCurrentPage({ state, commit }, page) {
    commit('SET_CAMPAIGN_REPORT_LOADING')
    setTimeout(() => {
      commit('SET_CAMPAIGN_REPORT_MESSAGE_CURRENT_PAGE', page)
      commit('SET_CAMPAIGN_REPORT_LOADED')
    }, 500)
  },
  setCampaignReportMessagePageSize({ state, commit }, size) {
    commit('SET_CAMPAIGN_REPORT_LOADING')
    setTimeout(() => {
      commit('SET_CAMPAIGN_REPORT_MESSAGE_PAGE_SIZE', size)
      commit('SET_CAMPAIGN_REPORT_LOADED')
    }, 500)
  },
  setCampaignReportMessageStatusFilter({ state, commit }, status) {
    commit('SET_CAMPAIGN_REPORT_LOADING')
    setTimeout(() => {
      commit('SET_CAMPAIGN_REPORT_MESSAGE_CURRENT_PAGE', 1)
      commit('SET_CAMPAIGN_REPORT_MESSAGE_PAGE_SIZE', 10)
      commit('SET_CAMPAIGN_REPORT_MESSAGE_STATUS_FILTER', status)
      commit('SET_CAMPAIGN_REPORT_LOADED')
    }, 500)
  }
}

const getCampaignLogByCampaignIds = (logs) => {
  const campaignLogByCampaignIds = reduce(logs, function(r, log) {
    r[log.campaignId] = r[log.campaignId] || {}

    r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE] = r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE] || {}
    r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE].createdAt = r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE].createdAt || 0

    r[log.campaignId][CAMPAIGN_LOG_TYPE.SENDING] = r[log.campaignId][CAMPAIGN_LOG_TYPE.SENDING] || {}

    r[log.campaignId][CAMPAIGN_LOG_TYPE.SENT] = r[log.campaignId][CAMPAIGN_LOG_TYPE.SENT] || {}

    r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE] = r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE] || {}
    r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE].createdAt = r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE].createdAt || 0

    const message = log.message
    const createdAt = log.createdAt
    const logType = log.type

    if (logType === CAMPAIGN_LOG_TYPE.UPDATE) {
      const lastLog = r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE].createdAt
      if (createdAt > lastLog) {
        r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE].message = message
        r[log.campaignId][CAMPAIGN_LOG_TYPE.UPDATE].createdAt = createdAt
      }
    }

    if (logType === CAMPAIGN_LOG_TYPE.SENDING) {
      r[log.campaignId][CAMPAIGN_LOG_TYPE.SENDING].message = message
      r[log.campaignId][CAMPAIGN_LOG_TYPE.SENDING].createdAt = createdAt
    }

    if (logType === CAMPAIGN_LOG_TYPE.SENT) {
      r[log.campaignId][CAMPAIGN_LOG_TYPE.SENT].message = message
      r[log.campaignId][CAMPAIGN_LOG_TYPE.SENT].createdAt = createdAt
    }

    if (logType === CAMPAIGN_LOG_TYPE.SCHEDULE) {
      const lastLog = r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE].createdAt
      if (createdAt > lastLog) {
        r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE].message = message
        r[log.campaignId][CAMPAIGN_LOG_TYPE.SCHEDULE].createdAt = createdAt
      }
    }

    return r
  }, {})
  return campaignLogByCampaignIds
}

const getCampaignSendingStatusByIds = (stats) => {
  const campaignSendingStatusByIds = reduce(stats, function(r, stat) {
    r[stat.campaignId] = r[stat.campaignId] || {}
    r[stat.campaignId]['sent'] = stat.sent
    r[stat.campaignId]['total'] = stat.total
    return r
  }, {})
  return campaignSendingStatusByIds
}

const getters = {
  campaignTrackOpenOverview: (state) => (campaignId) => {
    if (state.campaignTrackByIds) {
      const { total, open } = state.campaignTrackByIds[campaignId]
      if (total && total !== null && open !== null) {
        const rate = (open / total) * 100
        const result = rate.toFixed(2)
        return result
      }
    } else {
      const stat = Vue.ls.get('campaign/campaignTrackByIds')
      if (stat !== null) {
        const { total, open } = stat[campaignId]
        if (total && total !== null && open !== null) {
          const rate = (open / total) * 100
          const result = rate.toFixed(2)
          return result
        }
      }
    }
    return 'Loading'
  },
  campaignTrackClickOverview: (state) => (campaignId) => {
    if (state.campaignTrackByIds) {
      const { total, interact } = state.campaignTrackByIds[campaignId]
      if (total && total !== null && interact !== null) {
        const rate = (interact / total) * 100
        const result = rate.toFixed(2)
        return result
      }
    }
    return 'Loading'
  },
  campaignTotalOpen: (state) => (campaignId) => {
    if (state.campaignTrackByIds) {
      const { open } = state.campaignTrackByIds[campaignId]
      if (open !== null) {
        return open
      }
    } else {
      const stat = Vue.ls.get('campaign/campaignTrackByIds')
      if (stat !== null) {
        return stat[campaignId].open || 0
      }
    }
  },
  campaignTotalInteract: (state) => (campaignId) => {
    if (state.campaignTrackByIds) {
      const { interact } = state.campaignTrackByIds[campaignId]
      if (interact !== null) {
        return interact
      }
    } else {
      const stat = Vue.ls.get('campaign/campaignTrackByIds')
      if (stat !== null) {
        return stat[campaignId].interact || 0
      }
    }
  },
  campaignReportMessageLoading: (state) => {
    const loading = state.loadingReportMessage
    return loading
  },
  campaignReportMessageListCurrentPage: (state) => {
    const pageNumber = state.reportMessageCurrentPage
    return pageNumber
  },
  campaignReportMessageListPageSize: (state) => {
    const pageSize = state.reportMessagePageSize
    return pageSize
  },
  campaignReportMessageList: (state) => {
    const listMsg = state.reportMessage.listMessage
    return listMsg
  },
  campaignReportDisplayMessageList: (state) => {
    const listMsg = state.reportMessage.listMessage
    const filterStatus = state.reportMessageStatusFilter
    let filterListMsg
    const cloneListMst = listMsg.slice(0)
    if (filterStatus === 0) {
      filterListMsg = cloneListMst
    } else {
      filterListMsg = cloneListMst.filter(m => m.status === filterStatus)
    }
    const pageNumber = state.reportMessageCurrentPage
    const pageSize = state.reportMessagePageSize
    const displayMsg = filterListMsg.slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
    return displayMsg
  },
  campaignReportMessageTotal: (state) => {
    const total = state.reportMessage.total
    if (total) {
      return total
    }
    return 0
  },
  campaignReportMessageFilterTotal: (state) => {
    const listMsg = state.reportMessage.listMessage
    const filterStatus = state.reportMessageStatusFilter
    let filterListMsg
    const cloneListMst = listMsg.slice(0)
    if (filterStatus === 0) {
      filterListMsg = cloneListMst
    } else {
      filterListMsg = cloneListMst.filter(m => m.status === filterStatus)
    }
    return filterListMsg.length || 0
  },
  campaignReportMessageTotalSuccess: (state) => {
    const success = state.reportMessage.totalSuccess
    if (success) {
      return success
    }
    return 0
  },
  campaignReportMessageTotalFail: (state) => {
    const fail = state.reportMessage.totalFail
    if (fail) {
      return fail
    }
    return 0
  },
  campaignReportMessageTotalSending: (state) => {
    const sending = state.reportMessage.totalSending
    if (sending) {
      return sending
    }
    return 0
  },
  campaignReportMessageSuccessRate: (state) => {
    const rate = state.reportMessage.successRate
    if (rate) {
      return rate
    }
    return 0
  },
  campaignReportSummaryListPanel: (state) => {
    const total = state.reportMessage.total
    const success = state.reportMessage.totalSuccess
    const fail = state.reportMessage.totalFail
    const sending = state.reportMessage.totalSending
    const listPanel = [
      {
        title: 'Tổng',
        iconClass: 'icon-people',
        icon: 'peoples',
        ctStartValue: 0,
        ctEndValue: total || 0,
        ctDuration: 2600,
        panelType: 0
      },
      {
        title: 'Thành công',
        iconClass: 'icon-people',
        icon: 'peoples',
        ctStartValue: 0,
        ctEndValue: success || 0,
        ctDuration: 2600,
        panelType: 3
      },
      {
        title: 'Thất bại',
        iconClass: 'icon-message',
        icon: 'message',
        ctStartValue: 0,
        ctEndValue: fail || 0,
        ctDuration: 2600,
        panelType: 2
      },
      {
        title: 'Đang gửi',
        iconClass: 'icon-money',
        icon: 'money',
        ctStartValue: 0,
        ctEndValue: sending || 0,
        ctDuration: 2600,
        panelType: 1
      }
    ]
    return listPanel
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
