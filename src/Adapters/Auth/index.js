import loadAdapter from '../AdapterLoader';

const facebook = require('./facebook');
const facebookaccountkit = require('./facebookaccountkit');
const instagram = require('./instagram');
const linkedin = require('./linkedin');
const meetup = require('./meetup');
const google = require('./google');
const github = require('./github');
const twitter = require('./twitter');
const spotify = require('./spotify');
const digits = require('./twitter'); // digits tokens are validated by twitter
const janrainengage = require('./janrainengage');
const janraincapture = require('./janraincapture');
const vkontakte = require('./vkontakte');
const qq = require('./qq');
const wechat = require('./wechat');
const weapp = require('./weapp');
const weibo = require('./weibo');
const oauth2 = require('./oauth2');

const anonymous = {
  validateAuthData: () => {
    return Promise.resolve();
  },
  validateAppId: () => {
    return Promise.resolve();
  },
};

const providers = {
  facebook,
  facebookaccountkit,
  instagram,
  linkedin,
  meetup,
  google,
  github,
  twitter,
  spotify,
  anonymous,
  digits,
  janrainengage,
  janraincapture,
  vkontakte,
  qq,
  wechat,
  weapp,
  weibo,
};

function authDataValidator(adapter, appIds, options) {
  return function(authData) {
    return adapter.validateAuthData(authData, options).then(() => {
      if (appIds) {
        return adapter.validateAppId(appIds, authData, options);
      }
      return Promise.resolve();
    });
  };
}

function loadAuthAdapter(provider, authOptions) {
  let defaultAdapter = providers[provider];
  const providerOptions = authOptions[provider];
  if (
    providerOptions &&
    providerOptions.hasOwnProperty('oauth2') &&
    providerOptions['oauth2'] === true
  ) {
    defaultAdapter = oauth2;
  }

  if (!defaultAdapter && !providerOptions) {
    return;
  }

  const adapter = Object.assign({}, defaultAdapter);
  const appIds = providerOptions ? providerOptions.appIds : undefined;

  // Try the configuration methods
  if (providerOptions) {
    const optionalAdapter = loadAdapter(
      providerOptions,
      undefined,
      providerOptions
    );
    if (optionalAdapter) {
      ['validateAuthData', 'validateAppId'].forEach(key => {
        if (optionalAdapter[key]) {
          adapter[key] = optionalAdapter[key];
        }
      });
    }
  }

  // TODO: create a new module from validateAdapter() in
  // src/Controllers/AdaptableController.js so we can use it here for adapter
  // validation based on the src/Adapters/Auth/AuthAdapter.js expected class
  // signature.
  if (!adapter.validateAuthData || !adapter.validateAppId) {
    return;
  }

  return { adapter, appIds, providerOptions };
}

module.exports = function(authOptions = {}, enableAnonymousUsers = true) {
  let _enableAnonymousUsers = enableAnonymousUsers;
  const setEnableAnonymousUsers = function(enable) {
    _enableAnonymousUsers = enable;
  };
  // To handle the test cases on configuration
  const getValidatorForProvider = function(provider) {
    if (provider === 'anonymous' && !_enableAnonymousUsers) {
      return;
    }

    const { adapter, appIds, providerOptions } = loadAuthAdapter(
      provider,
      authOptions
    );

    return authDataValidator(adapter, appIds, providerOptions);
  };

  return Object.freeze({
    getValidatorForProvider,
    setEnableAnonymousUsers,
  });
};

module.exports.loadAuthAdapter = loadAuthAdapter;
