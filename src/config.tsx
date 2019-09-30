const envVarPrefix = 'REACT_APP_BOOGH';

const config = {
    apiOrigin: (
        process.env[`${envVarPrefix}_API_URL`]
        || ''
    ),
    googleMapsApiKey: (
        process.env[`${envVarPrefix}_GOOGLE_MAPS_API_KEY`]
        || ''
    ),
    apiURL: (
        process.env[`${envVarPrefix}_API_URL`]
        || ''
    ),
    cloudFrontUrl: (
        process.env[`${envVarPrefix}_CLOUD_FRONT_URL`]
        || ''
    ),
    socialLoginRedirect: (
        process.env[`${envVarPrefix}_SOCIAL_LOGIN_REDIRECT`]
        || ''
    ),
    telegramBotName: (
        process.env[`${envVarPrefix}_TELEGRAM_BOT_NAME`]
        || ''
    ),
    googleClientId: (
        process.env[`${envVarPrefix}_GOOGLE_CLIENT_ID`]
        || ''
    )
};

export default config;
