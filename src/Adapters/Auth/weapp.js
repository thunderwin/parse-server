function validateAuthData (data) {
  if (!data.access_token || !data.id) {
    
    throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "weapp not blone this user");
  }
  return Promise.resolve();
}

function validateAppId () {
  return Promise.resolve();
}

module.exports = {
  validateAppId,
  validateAuthData
}
