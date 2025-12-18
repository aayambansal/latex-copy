import _ from 'lodash'

const SessionManager = {
  getSessionUser(session) {
    const sessionUser = _.get(session, ['user'])
    const sessionPassportUser = _.get(session, ['passport', 'user'])
    return sessionUser || sessionPassportUser || null
  },

  setSessionUser(session, user) {
    // Set the user in the session for anonymous user creation
    if (session && user) {
      session.user = {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        isAdmin: user.isAdmin || false,
      }
    }
  },

  setInSessionUser(session, props) {
    const sessionUser = SessionManager.getSessionUser(session)
    if (!sessionUser) {
      return
    }
    for (const key in props) {
      const value = props[key]
      sessionUser[key] = value
    }
    return null
  },

  isUserLoggedIn(session) {
    const userId = SessionManager.getLoggedInUserId(session)
    return ![null, undefined, false].includes(userId)
  },

  getLoggedInUserId(session) {
    const user = SessionManager.getSessionUser(session)
    if (user) {
      return user._id
    } else {
      return null
    }
  },

  getLoggedInUserV1Id(session) {
    const user = SessionManager.getSessionUser(session)
    if (user != null && user.v1_id != null) {
      return user.v1_id
    } else {
      return null
    }
  },
}

export default SessionManager
