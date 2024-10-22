import React from 'react'
import PropTypes from 'prop-types'

import contactData from './contact.json'

import Profile from './UserProfile'

const ProfileScreen = (props) => <Profile {...props} {...contactData} />

ProfileScreen.navigationOptions = () => ({
  header: null,
})

ProfileScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
}

export default ProfileScreen